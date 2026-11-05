import { useCallback, useEffect, useRef, useState } from 'react';
import type { Level, Quiz } from '../types';
import { useApp } from '../store/store';
import { addCoins, isOwnedActive, recordBattleResult } from '../store/actions';
import { toast } from '../store/ui';
import { rankInfo, ratingOf } from '../lib/gamification';
import { nameStyleClasses } from '../lib/shop';
import {
  AI_BATTLES_PER_DAY, BATTLE_QUESTIONS, aiK, aiAccuracy, aiAccFor, aiCorrectFor, aiRatedLeft,
  aiThinkMs, battleResultOf, buildBattleQuestions, eloDelta, levelIdx, PVP_ELO_K, scoreOf, timeForQuestion,
  type BattleQuiz,
} from '../lib/battle';
import {
  answerPvp, battleAvailable, cancelChallenge, forfeitPvp, getBattle, isLegacySync, joinChallenge, listChallenges,
  notConfigured, openChallenge, submitScore, syncPvp, type BattleView, type LiveSync, type SyncResult,
} from '../lib/battleApi';
import { Button, Card, Modal, Notice, Pill, ProgressBar, Section } from '../components/ui';
import { Confetti, Mascot } from '../components/Mascot';
import { Icon } from '../components/Icon';
import { haptic, shareToTelegram } from '../lib/telegram';
import { playSfx } from '../lib/sfx';
import { A, navigate } from '../lib/router';
import { cx, fmt, uid } from '../lib/utils';

type Phase = 'lobby' | 'searching' | 'duel' | 'waiting' | 'result';

interface BattleOutcome {
  vs: 'ai' | 'player';
  opponent: string;
  you: number;
  them: number;
  result: 'win' | 'loss' | 'draw';
  delta: number; // applied rating change
  rated: boolean;
  aborted?: boolean; // connection-failure finish (zero answers) — no rating, no history entry
}

const LETTERS = ['A', 'B', 'C', 'D'];

/** Maps a matchmaking failure to a diagnosable kind for the lobby notice. */
function diagOf(e: unknown): string {
  const m = e instanceof Error ? e.message : '';
  if (m === 'unauthorized') return 'unauthorized';
  if (m === 'not_configured' || m === 'http_503') return 'not_configured';
  if (m === 'storage_error' || m === 'http_502' || m.startsWith('supabase_')) return 'storage';
  if (m === 'too_many_requests' || m === 'http_429') return 'rate';
  return 'net';
}
const WIN_COINS = 8;
const DRAW_COINS = 4;
const LOSS_COINS = 2;

/** Local page header with a custom back handler (cancel search, leave waiting, …). */
function Bar({ emoji, title, onBack }: { emoji: string; title: string; onBack?: () => void }) {
  return (
    <header className="mb-4 flex items-center gap-3">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-ink hover:bg-surface2"
          aria-label="Orqaga"
        >
          <Icon name="left" />
        </button>
      )}
      <h1 className="text-xl font-extrabold leading-tight tracking-tight sm:text-2xl">
        <span className="mr-1.5">{emoji}</span>
        {title}
      </h1>
    </header>
  );
}

export function Battle() {
  const s = useApp();
  const rating = ratingOf(s);
  const rank = rankInfo(rating);
  const ratedLeft = aiRatedLeft(s);

  const [phase, setPhase] = useState<Phase>('lobby');
  const [online, setOnline] = useState<boolean | null>(null); // null = probing
  const [questions, setQuestions] = useState<BattleQuiz[]>([]);
  const [mode, setMode] = useState<'ai' | 'pvp'>('ai');
  const [searchBattle, setSearchBattle] = useState<BattleView | null>(null);
  const [outcome, setOutcome] = useState<BattleOutcome | null>(null);
  const [waitNote, setWaitNote] = useState('');
  const [diag, setDiag] = useState<string | null>(null); // why matchmaking last failed

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const battleIdRef = useRef<string | null>(null);
  const aiSeedRef = useRef(uid('b'));
  const accRef = useRef(0.6);
  const waitRunRef = useRef(0);
  const resolvedRef = useRef(true); // false while a battle is in progress — leaving mid-battle forfeits
  const liveScoreRef = useRef({ you: 0, them: 0 }); // latest duel scores (for the forfeit record)
  const modeRef = useRef<'ai' | 'pvp'>('ai');
  const oppRatingRef = useRef<number | null>(null);
  const oppNameRef = useRef('Raqib');
  const oppIdRef = useRef<string | null>(null); // opponent's user id -> opens their public profile
  const [confirmQuit, setConfirmQuit] = useState(false);
  const [legacyPvp, setLegacyPvp] = useState(false); // pre-live battle row -> old async flow

  const myName = (s.profile?.name ?? 'O‘quvchi').trim().split(/\s+/)[0] || 'O‘quvchi';
  const myAvatar = s.shop.equipped.avatar ?? '🙂';
  const myPhoto = s.profile?.photoAvatar;
  const nameCls = nameStyleClasses(s.shop.equipped, isOwnedActive);
  const level: Level = s.profile?.estimatedLevel ?? s.profile?.selfLevel ?? 'A2';
  /** Server-stored PvP questions may lack the level tag (it is client-side only). */
  const withLevels = useCallback(
    (qs: Quiz[]): BattleQuiz[] => qs.map((q) => ({ ...q, level: (q as BattleQuiz).level ?? level })),
    [level],
  );

  useEffect(() => {
    let alive = true;
    battleAvailable().then((v) => alive && setOnline(v));
    return () => {
      alive = false;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // ===== Battle starters =====

  /** Leaving mid-battle counts as a loss (user report: quitters escaped the -rating). */
  const applyForfeit = useCallback(() => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    const vs = modeRef.current;
    const oppRating = oppRatingRef.current ?? rating;
    const { you, them } = liveScoreRef.current;
    const delta = eloDelta(rating, oppRating, 0, vs === 'ai' ? aiK(rating) : PVP_ELO_K);
    recordBattleResult({
      id: uid('bt'),
      date: new Date().toISOString(),
      vs: vs === 'ai' ? 'ai' : 'player',
      opponent: oppNameRef.current,
      you,
      them,
      total: BATTLE_QUESTIONS,
      result: 'loss',
      delta,
    });
    if (vs === 'pvp' && battleIdRef.current) void forfeitPvp(battleIdRef.current);
    toast('Jangni tark etdingiz — mag‘lubiyat hisoblandi', 'warn');
  }, [rating]);

  // Leaving the page mid-battle (bottom nav, back gesture, app close) = forfeit.
  useEffect(() => () => { applyForfeit(); }, [applyForfeit]);

  const startAi = useCallback(() => {
    const seed = uid('b');
    aiSeedRef.current = seed;
    accRef.current = aiAccuracy(s.quizHistory);
    setMode('ai');
    setQuestions(buildBattleQuestions(level, seed));
    setSearchBattle(null);
    setLegacyPvp(false);
    modeRef.current = 'ai';
    oppNameRef.current = 'Lingo (AI)';
    oppRatingRef.current = rating;
    oppIdRef.current = null;
    liveScoreRef.current = { you: 0, them: 0 };
    resolvedRef.current = false;
    setPhase('duel');
    haptic('light');
  }, [s.quizHistory, level, rating]);

  const leaveWaiting = useCallback(() => {
    waitRunRef.current++;
    setPhase('lobby');
  }, []);

  const goSearching = useCallback(async () => {
    setPhase('searching');
    setDiag(null);
    const me = { rating, name: myName, avatar: myAvatar };
    try {
      // 1) join an existing open challenge if there is one
      const list = await listChallenges();
      for (const c of list) {
        try {
          const joined = await joinChallenge(c.id, me);
          if (joined.questions?.length) {
            setSearchBattle(joined);
            setMode('pvp');
            setQuestions(withLevels(joined.questions));
            battleIdRef.current = joined.id;
            setLegacyPvp(false);
            modeRef.current = 'pvp';
            oppNameRef.current = c.name;
            oppRatingRef.current = c.rating ?? null;
            oppIdRef.current = c.uid ?? null;
            liveScoreRef.current = { you: 0, them: 0 };
            resolvedRef.current = false;
            setPhase('duel');
            haptic('success');
            return;
          }
        } catch {
          /* someone else took it — try the next one */
        }
      }
      // 2) otherwise open my own challenge and wait for a joiner
      const seed = uid('b');
      aiSeedRef.current = seed;
      accRef.current = aiAccuracy(s.quizHistory);
      const qs = buildBattleQuestions(level, seed);
      const opened = await openChallenge(qs, me);
      setSearchBattle(opened);
      battleIdRef.current = opened.id;
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        try {
          const b = await getBattle(opened.id);
          if (b?.status === 'active' && b.questions?.length) {
            if (pollRef.current) clearInterval(pollRef.current);
            setSearchBattle(b);
            setMode('pvp');
            setQuestions(withLevels(b.questions));
            setLegacyPvp(false);
            modeRef.current = 'pvp';
            oppNameRef.current = b.oppName;
            oppRatingRef.current = b.oppRating ?? null;
            oppIdRef.current = b.oppId ?? null;
            liveScoreRef.current = { you: 0, them: 0 };
            resolvedRef.current = false;
            setPhase('duel');
            haptic('success');
          }
        } catch {
          /* keep polling */
        }
      }, 3000);
    } catch (e) {
      if (pollRef.current) clearInterval(pollRef.current);
      battleIdRef.current = null;
      const kind = diagOf(e);
      if (kind === 'not_configured') setOnline(false);
      setDiag(kind); // the lobby shows the exact reason + fix
      // Never dead-end: matchmaking failed, so fall back to a Lingo AI battle.
      toast(
        kind === 'unauthorized'
          ? 'Raqib topish uchun ilovani bot ichida oching — avval Lingo AI bilan jang!'
          : 'Raqib topish hozir ishlamadi — Lingo AI bilan jang boshlanadi!',
        'warn',
      );
      startAi();
    }
  }, [rating, myName, myAvatar, s.quizHistory, level, startAi, withLevels]);

  const cancelSearch = useCallback(async () => {
    if (pollRef.current) clearInterval(pollRef.current);
    const id = battleIdRef.current;
    if (id) await cancelChallenge(id);
    setPhase('lobby');
  }, []);

  // ===== Finish paths =====

  const finish = useCallback(
    (you: number, them: number, vs: 'ai' | 'player', opponent: string, serverDelta?: number, serverWinner?: 'me' | 'opp' | 'draw' | null, aborted?: boolean) => {
      resolvedRef.current = true; // battle resolved normally — leaving now is free
      // PvP results come from the SERVER's winner field, not from the score: a 0:0 forfeit
      // loss used to render as "Durrang -44" (user report). AI battles stay score-based.
      const result: BattleOutcome['result'] =
        vs === 'player' && serverWinner ? (serverWinner === 'me' ? 'win' : serverWinner === 'opp' ? 'loss' : 'draw') : battleResultOf(you, them);
      if (aborted) {
        // The duel never really happened (nobody answered — connection died). Nothing counts:
        // no rating, no coins, no history entry — just tell the player what happened.
        setOutcome({ vs, opponent, you, them, result: 'draw', delta: 0, rated: false, aborted: true });
        setPhase('result');
        return;
      }
      const rated = vs === 'player' || ratedLeft > 0;
      const rawDelta = vs === 'ai' ? eloDelta(rating, rating, scoreOf(result), aiK(rating)) : serverDelta ?? 0;
      const delta = rated ? rawDelta : 0;
      recordBattleResult({
        id: uid('bt'),
        date: new Date().toISOString(),
        vs,
        opponent,
        you,
        them,
        total: questions.length || BATTLE_QUESTIONS,
        result,
        delta: rawDelta,
      });
      if (rated) addCoins(result === 'win' ? WIN_COINS : result === 'draw' ? DRAW_COINS : LOSS_COINS);
      haptic(result === 'win' ? 'success' : 'warning');
      setOutcome({ vs, opponent, you, them, result, delta, rated });
      setPhase('result');
    },
    [questions.length, ratedLeft, rating],
  );

  const onDuelFinish = useCallback(
    (you: number, them: number | null) => {
      if (mode === 'ai') {
        // Lingo's score was counted live, question by question, during the race.
        finish(you, them ?? 0, 'ai', 'Lingo (AI)');
        return;
      }
      // PvP: submit my score and wait for the opponent's
      const run = ++waitRunRef.current;
      setPhase('waiting');
      setWaitNote('');
      void (async () => {
        try {
          const id = battleIdRef.current;
          if (!id) throw new Error('no_battle');
          let view = await submitScore(id, you);
          const deadline = Date.now() + 120_000;
          while (view.status !== 'finished' && Date.now() < deadline) {
            if (waitRunRef.current !== run) return; // user left the waiting screen
            setWaitNote('Raqib natijasini kutyapti…');
            await new Promise((r) => setTimeout(r, 4000));
            view = (await getBattle(id)) ?? view;
          }
          if (waitRunRef.current !== run) return;
          if (view.status !== 'finished') {
            setWaitNote('Raqib hali javob bermadi. Kutishda davom etamizmi?');
            return;
          }
          finish(view.meScore ?? you, view.oppScore ?? 0, 'player', view.oppName, view.myDelta ?? 0, view.winner, view.aborted === true);
        } catch {
          if (waitRunRef.current !== run) return;
          toast('Ulanish xatosi — natija saqlanmadi', 'warn');
          setPhase('lobby');
        }
      })();
    },
    [finish, mode],
  );

  const onScoreCb = useCallback((you: number, them: number) => {
    liveScoreRef.current = { you, them };
  }, []);

  const onLiveFinish = useCallback(
    (you: number, them: number, delta: number, winner: 'me' | 'opp' | 'draw' | null, aborted: boolean) => {
      finish(you, them, 'player', oppNameRef.current, delta, winner, aborted);
    },
    [finish],
  );

  const onLegacyCb = useCallback(() => setLegacyPvp(true), []);

  const shareResult = useCallback(() => {
    if (!outcome) return;
    const text =
      outcome.result === 'win'
        ? `⚔️ Do‘stona jangda g‘alaba qozondim: ${outcome.you}:${outcome.them} (${outcome.opponent})! Reytingim oshdi 📈`
        : `⚔️ Do‘stona jang: ${outcome.you}:${outcome.them} (${outcome.opponent}). Keyingi safar g‘alaba meniki! 💪`;
    // Share the bot's Telegram deep link (opens the bot + launches the Mini App),
    // NOT window.location.href (that is the vercel.app URL which opens in a browser).
    const bot = (import.meta.env?.VITE_BOT_USERNAME as string | undefined)?.trim();
    const link = bot ? `https://t.me/${bot}?startapp=battle` : window.location.href;
    shareToTelegram(link, text);
  }, [outcome]);

  // ===== Render =====

  if (phase === 'duel') {
    return (
      <div>
        <Bar emoji="⚔️" title="Do‘stona jang" />
        {mode === 'pvp' && battleIdRef.current && !legacyPvp ? (
          <LiveDuel
            battleId={battleIdRef.current}
            me={searchBattle?.me ?? 'p1'}
            questions={questions}
            oppName={searchBattle?.oppName ?? oppNameRef.current}
            oppId={searchBattle?.oppId ?? oppIdRef.current}
            oppAvatar={searchBattle?.oppAvatar ?? '🙂'}
            onFinish={onLiveFinish}
            onScore={onScoreCb}
            onQuitRequest={() => setConfirmQuit(true)}
            onLegacy={onLegacyCb}
          />
        ) : (
          <Duel
            key={questions.map((q) => q.id).join('|')}
            questions={questions}
            mode={mode}
            oppName={mode === 'ai' ? 'Lingo (AI)' : searchBattle?.oppName ?? 'Raqib'}
            oppId={mode === 'ai' ? null : searchBattle?.oppId ?? oppIdRef.current}
            oppAvatar={mode === 'ai' ? '🤖' : searchBattle?.oppAvatar ?? '🙂'}
            seed={aiSeedRef.current}
            accuracy={accRef.current}
            userLevel={level}
            onFinish={onDuelFinish}
            onScore={onScoreCb}
            onQuitRequest={() => setConfirmQuit(true)}
          />
        )}
        <Modal open={confirmQuit} onClose={() => setConfirmQuit(false)} title="Jangni tark etamizmi?">
          <p className="text-sm text-muted">Jangni tark etsangiz, bu mag‘lubiyat hisoblanadi va reytingdan ochko ayiriladi.</p>
          <div className="mt-4 flex gap-2">
            <Button variant="secondary" full onClick={() => setConfirmQuit(false)}>Davom etish</Button>
            <Button variant="danger" full onClick={() => { setConfirmQuit(false); applyForfeit(); setPhase('lobby'); }}>Tark etish</Button>
          </div>
        </Modal>
      </div>
    );
  }

  if (phase === 'searching') {
    return (
      <div>
        <Bar emoji="🔎" title="Raqib izlanmoqda" onBack={cancelSearch} />
        <Card className="text-center">
          <div className="flex justify-center">
            <Mascot mood="think" size={96} />
          </div>
          <p className="mt-2 text-lg font-extrabold">Raqib qidirilmoqda…</p>
          <p className="mt-1 text-sm text-muted">Jang e’lon qilindi. Kimdir qo‘shilishi bilanoq jang boshlanadi.</p>
          <div className="mt-4 flex justify-center gap-2">
            <span className="flex h-3 w-3 animate-bounce rounded-full bg-indigo-500 [animation-delay:0ms]" />
            <span className="flex h-3 w-3 animate-bounce rounded-full bg-indigo-500 [animation-delay:150ms]" />
            <span className="flex h-3 w-3 animate-bounce rounded-full bg-indigo-500 [animation-delay:300ms]" />
          </div>
          <div className="mt-5 flex flex-col gap-2">
            <Button onClick={startAi}>🤖 Lingo AI bilan o‘ynash</Button>
            <Button variant="secondary" onClick={cancelSearch}>Bekor qilish</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (phase === 'waiting') {
    return (
      <div>
        <Bar emoji="⏳" title="Natija kutilmoqda" onBack={leaveWaiting} />
        <Card className="text-center">
          <div className="flex justify-center"><Mascot mood="think" size={96} /></div>
          <p className="mt-2 text-lg font-extrabold">{waitNote || 'Raqib o‘z savollariga javob beryapti…'}</p>
          <div className="mt-4 flex justify-center gap-2">
            <span className="flex h-3 w-3 animate-bounce rounded-full bg-indigo-500 [animation-delay:0ms]" />
            <span className="flex h-3 w-3 animate-bounce rounded-full bg-indigo-500 [animation-delay:150ms]" />
            <span className="flex h-3 w-3 animate-bounce rounded-full bg-indigo-500 [animation-delay:300ms]" />
          </div>
          <div className="mt-5">
            <Button variant="secondary" onClick={leaveWaiting}>Chiqish (reyting o‘zgarmaydi)</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (phase === 'result' && outcome) {
    const win = outcome.result === 'win';
    const draw = outcome.result === 'draw';
    const aborted = outcome.aborted === true;
    return (
      <div>
        <Bar emoji="⚔️" title="Jang tugadi" onBack={() => setPhase('lobby')} />
        <Card className="pop-in relative text-center">
          {win && !aborted && <Confetti count={44} />}
          <div className="flex justify-center"><Mascot mood={aborted ? 'think' : win ? 'cheer' : draw ? 'happy' : 'think'} size={92} /></div>
          <p className="mt-1 text-2xl font-extrabold">
            {aborted ? '📡 Jang bekor qilindi' : win ? '🏆 G‘alaba!' : draw ? '🤝 Durrang!' : '💪 Mag‘lubiyat'}
          </p>
          <p className="mt-1 text-sm text-muted">
            {aborted
              ? 'Ulanish uzilishi tufayli hech kim javob bermadi — bu jang hisobga olinmadi.'
              : `${outcome.opponent}ga qarshi`}
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-3xl">{myAvatar}</div>
              <div className="mt-0.5 text-xs font-bold">Siz</div>
              <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-300">{outcome.you}</div>
            </div>
            <div className="text-2xl font-extrabold text-muted">:</div>
            <div className="text-center">
              <div className="text-3xl">{outcome.vs === 'ai' ? '🤖' : '🙂'}</div>
              <div className="mt-0.5 text-xs font-bold">{outcome.opponent}</div>
              <div className="text-2xl font-extrabold text-rose-500">{outcome.them}</div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Pill tone={win ? 'green' : draw ? 'neutral' : 'rose'} className="!px-3 !py-1.5">
              {outcome.delta > 0 ? `📈 +${outcome.delta} reyting` : outcome.delta < 0 ? `📉 ${outcome.delta} reyting` : '±0 reyting'}
            </Pill>
            {outcome.rated && <Pill tone="amber" className="!px-3 !py-1.5">🪙 +{win ? WIN_COINS : draw ? DRAW_COINS : LOSS_COINS} Coin</Pill>}
          </div>
          {!outcome.rated && !aborted && (
            <p className="mt-2 text-xs text-muted">Kunlik {AI_BATTLES_PER_DAY} ta reytingli AI jangi tugadi — bu jang mashq rejimida o‘tdi.</p>
          )}
          {outcome.vs === 'player' && oppIdRef.current && (
            <div className="mt-3 flex justify-center">
              <Button size="sm" variant="secondary" icon="user" onClick={() => navigate(`/u/${oppIdRef.current}`)}>
                Raqib profili
              </Button>
            </div>
          )}
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={mode === 'ai' || !online ? startAi : goSearching}>⚔️ Yana jang</Button>
            <Button variant="secondary" onClick={shareResult} icon="share">Ulashish</Button>
            <Button variant="ghost" onClick={() => setPhase('lobby')}>Lobbyga</Button>
          </div>
        </Card>
      </div>
    );
  }

  // ===== Lobby =====
  return (
    <div>
      <Bar emoji="⚔️" title="Do‘stona jang" />
      <p className="-mt-3 mb-4 text-sm text-muted">Raqibni yutib reytingni oshir!</p>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-rose-500 to-orange-500 p-5 text-white shadow-lg shadow-rose-500/25">
        <div className="pointer-events-none absolute -right-3 -top-5 text-[6.5rem] opacity-20 select-none">⚔️</div>
        <div className="flex items-center gap-3">
          {myPhoto ? (
            <img src={myPhoto} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-white/60" />
          ) : (
            <span className="text-4xl">{myAvatar}</span>
          )}
          <div className="min-w-0 flex-1">
            <p className={cx('truncate font-extrabold', nameCls)}>{myName}</p>
            <p className="mt-0.5 text-sm text-rose-100">
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 font-bold">{rank.tier.name}</span>{' '}
              <b className="text-white">{fmt(rating)} reyting</b>
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full bg-white/20 px-2.5 py-1">🏆 {s.battle.wins} g‘alaba</span>
          <span className="rounded-full bg-white/20 px-2.5 py-1">💔 {s.battle.losses} mag‘lubiyat</span>
          <span className="rounded-full bg-white/20 px-2.5 py-1">🤝 {s.battle.draws} durrang</span>
        </div>
      </div>

      {online === false && (
        <div className="mt-3">
          <Notice tone="warn">
            Haqiqiy raqib topish uchun onlayn server kerak (Vercelda <b>/api/battle</b> + Supabase). Hozircha Lingo AI bilan jang qiling — bu ham reytingga ta’sir qiladi!
          </Notice>
        </div>
      )}

      {diag && (
        <div className="mt-3">
          <Notice tone="warn">
            {diag === 'storage' && (
              <>🔌 Server bazasiga yozish ishlamadi. Ko‘pincha sabab — <b>battles</b> jadvali yo‘qligi: Supabase → SQL Editor → <b>supabase/schema.sql</b> ni to‘liq qayta ishga tushiring (Table Editor’da <b>battles</b> jadvali paydo bo‘lishi kerak), so‘ng Vercelda <b>Redeploy</b>.</>
            )}
            {diag === 'unauthorized' && (
              <>🔑 Telegram tasdiqlamadi. Mini appni <b>bot ichidagi tugma orqali</b> oching (brauzer havolasi emas) va Verceldagi <b>TELEGRAM_BOT_TOKEN</b> aynan shu botniki ekanini tekshiring.</>
            )}
            {diag === 'not_configured' && (
              <>⚙️ Onlayn server sozlanmagan: Vercel → Settings → Environment Variables da <b>SUPABASE_URL</b>, <b>SUPABASE_SERVICE_ROLE_KEY</b> va <b>TELEGRAM_BOT_TOKEN</b> bo‘lishi kerak, keyin <b>Redeploy</b>.</>
            )}
            {diag === 'rate' && <>⏳ Juda ko‘p urinish bo‘ldi — bir daqiqa kutib turing.</>}
            {diag === 'net' && <>🌐 Serverga ulanib bo‘lmadi — internetni tekshirib, keyinroq urinib ko‘ring.</>}
          </Notice>
        </div>
      )}

      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => online && goSearching()}
          disabled={!online}
          className={cx(
            'rounded-3xl border-2 p-4 text-left transition',
            online ? 'border-indigo-200 bg-indigo-50 hover:border-indigo-400 dark:border-indigo-400/30 dark:bg-indigo-500/10' : 'cursor-not-allowed border-line opacity-50',
          )}
        >
          <div className="text-3xl">🧑‍🤝‍🧑</div>
          <p className="mt-1.5 font-extrabold">Raqib topish</p>
          <p className="mt-0.5 text-xs text-muted">Boshqa o‘quvchilar bilan haqiqiy Elo jangi. Reyting doim o‘zgaradi.</p>
        </button>
        <button
          type="button"
          onClick={startAi}
          className="rounded-3xl border-2 border-amber-200 bg-amber-50 p-4 text-left transition hover:border-amber-400 dark:border-amber-400/30 dark:bg-amber-500/10"
        >
          <div className="text-3xl">🤖</div>
          <p className="mt-1.5 font-extrabold">Lingo AI bilan jang</p>
          <p className="mt-0.5 text-xs text-muted">Lingo sizning darajangizda o‘ynaydi va ba’zan adashadi — tez hamda to‘g‘ri javob bilan uni yutishingiz mumkin.</p>
        </button>
      </div>

      <div className="mt-3">
        <Notice>
          <b>Qoidalar:</b> {BATTLE_QUESTIONS} ta savol, har biri uchun ~15 soniya. Kim birinchi to‘g‘ri javob bersa — ochko shunga va savol darhol keyingisiga almashadi! Noto‘g‘ri javob — raqibning javobi kutiladi, ikkalasi ham xato bo‘lsa keyingi savol. <b>Jangni o‘rtada tark etish mag‘lubiyat hisoblanadi.</b> G‘alaba ≈ +{Math.round(PVP_ELO_K / 2)}…+{PVP_ELO_K} reyting, mag‘lubiyat shunga qarab ayiriladi. Kuniga {AI_BATTLES_PER_DAY} ta AI jangi reytingli (bugun: {ratedLeft}/{AI_BATTLES_PER_DAY}), keyingilari mashq bo‘ladi.
        </Notice>
      </div>

      <Section
        title="🏆 Reyting jadvali"
        action={<A to="/leaderboard" className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">Ko‘rish →</A>}
      >
        <Card className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300">
            <Icon name="trophy" />
          </span>
          <p className="min-w-0 flex-1 text-sm text-muted">O‘zingizni boshqa o‘quvchilar bilan solishtiring — reyting jadvalida o‘rningizni ko‘ring.</p>
          <Icon name="right" className="h-4 w-4 shrink-0 text-muted" />
        </Card>
      </Section>

      <Section title="📜 Oxirgi janglar">
        {s.battle.history.length === 0 ? (
          <p className="text-sm text-muted">Hali jang bo‘lmagan — birinchi g‘alabangizni qo‘lga kiriting!</p>
        ) : (
          <div className="space-y-2">
            {s.battle.history.slice(0, 8).map((h) => (
              <Card key={h.id} className="flex items-center gap-3 !p-3.5">
                <span
                  className={cx(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base',
                    h.result === 'win'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                      : h.result === 'loss'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                        : 'bg-surface2 text-muted',
                  )}
                >
                  {h.result === 'win' ? '🏆' : h.result === 'loss' ? '💔' : '🤝'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">
                    {h.opponent} <span className="font-normal text-muted">· {h.vs === 'ai' ? 'AI' : 'o‘yinchi'}</span>
                  </p>
                  <p className="text-xs text-muted">{h.you} : {h.them} · {new Date(h.date).toLocaleDateString()}</p>
                </div>
                <Pill tone={h.delta > 0 ? 'green' : h.delta < 0 ? 'rose' : 'neutral'}>{h.delta > 0 ? `+${h.delta}` : h.delta}</Pill>
              </Card>
            ))}
          </div>
        )}
      </Section>

      <div className="mt-4">
        <Button variant="ghost" onClick={() => navigate('/profile')}>Profil va reyting ramkalari →</Button>
      </div>
    </div>
  );
}

// ===== The live quiz duel (race mode) =====
// Report fix: a per-question clock now decides everything. Whoever answers
// CORRECTLY first takes the point and the next question appears right away —
// a wrong pick locks you out of the current question, and the buzzer ends it.

interface DuelProps {
  questions: BattleQuiz[];
  mode: 'ai' | 'pvp';
  oppName: string;
  oppId?: string | null; // opponent's user id — when present their name opens the public profile
  oppAvatar: string;
  seed: string;
  accuracy: number; // Lingo's base accuracy — mirrors the learner's own skill
  userLevel: Level;
  onFinish: (you: number, them: number | null) => void; // them: AI score in ai mode, null in pvp
  onScore: (you: number, them: number) => void; // live score feed for the forfeit record
  onQuitRequest: () => void;
}

/** How a duel question ended. 'you' / 'ai' = the first correct answer won the point. */
type ResolveKind = 'you' | 'ai' | 'nobody' | 'timeout';

function Duel({ questions, mode, oppName, oppId, oppAvatar, seed, accuracy, userLevel, onFinish, onScore, onQuitRequest }: DuelProps) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null); // my pick (a wrong pick locks me out of this question)
  const [aiDone, setAiDone] = useState<boolean | null>(null); // null = Lingo has not answered yet
  const [res, setRes] = useState<ResolveKind | null>(null); // non-null = question over (flash phase)
  const [myScore, setMyScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [tenth, setTenth] = useState(() => (questions[0] ? timeForQuestion(questions[0]) / 100 : 0));

  // Refs mirror state inside timers so nothing reads stale values.
  const myScoreRef = useRef(0);
  const aiScoreRef = useRef(0);
  const pickedRef = useRef<number | null>(null);
  const aiDoneRef = useRef<boolean | null>(null);
  const resRef = useRef<ResolveKind | null>(null);
  const aiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const goTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  const q = questions[idx];

  /** Go to the next question (or finish) — used by the auto-timer and the skip button. */
  function advance() {
    if (goTimer.current) clearTimeout(goTimer.current);
    if (idx + 1 < questions.length) setIdx(idx + 1);
    else onFinish(myScoreRef.current, mode === 'ai' ? aiScoreRef.current : null);
  }

  /** Ends the question: stop the clocks, show the flash, auto-advance. */
  function end(kind: ResolveKind) {
    if (resRef.current) return; // already over
    resRef.current = kind;
    if (aiTimer.current) clearTimeout(aiTimer.current);
    if (tick.current) clearInterval(tick.current);
    setRes(kind);
    goTimer.current = setTimeout(() => advance(), kind === 'you' ? 1300 : 2300);
  }

  // Per-question lifecycle: reset, countdown, and Lingo's independent answer.
  useEffect(() => {
    const cur = questions[idx];
    if (!cur) return;
    pickedRef.current = null;
    aiDoneRef.current = null;
    resRef.current = null;
    setPicked(null);
    setAiDone(null);
    setRes(null);
    setTenth(timeForQuestion(cur) / 100);

    if (mode === 'ai') {
      const challenge = levelIdx(cur.level) - levelIdx(userLevel) === 1;
      const ok = aiCorrectFor(seed, idx, aiAccFor(accuracy, cur.level, userLevel));
      aiTimer.current = setTimeout(() => {
        aiDoneRef.current = ok;
        setAiDone(ok);
        if (ok) {
          aiScoreRef.current += 1;
          setAiScore(aiScoreRef.current);
          onScore(myScoreRef.current, aiScoreRef.current);
          haptic('light');
          playSfx('wrong');
          end('ai'); // Lingo answered first — the race is over
        } else if (pickedRef.current !== null) {
          end('nobody'); // both missed
        }
        // Lingo missed and I have not answered yet: my pick or the buzzer decides.
      }, aiThinkMs(seed, idx, challenge));
    }

    tick.current = setInterval(() => setTenth((v) => Math.max(0, v - 1)), 100);
    return () => {
      if (aiTimer.current) clearTimeout(aiTimer.current);
      if (tick.current) clearInterval(tick.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  // The buzzer.
  useEffect(() => {
    if (tenth <= 0 && resRef.current === null && questions[idx]) end('timeout');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenth]);

  // Safety net on unmount.
  useEffect(
    () => () => {
      if (aiTimer.current) clearTimeout(aiTimer.current);
      if (goTimer.current) clearTimeout(goTimer.current);
      if (tick.current) clearInterval(tick.current);
    },
    [],
  );

  function choose(i: number) {
    if (!q || resRef.current !== null || pickedRef.current !== null) return;
    pickedRef.current = i;
    setPicked(i);
    if (i === q.answer) {
      myScoreRef.current += 1;
      setMyScore(myScoreRef.current);
      onScore(myScoreRef.current, aiScoreRef.current);
      haptic('success');
      playSfx('correct');
      end('you'); // first correct answer wins the point — Lingo's guess no longer matters
    } else {
      haptic('error');
      playSfx('wrong');
      if (mode === 'ai' && aiDoneRef.current === false) end('nobody'); // both missed
      // otherwise: wait for Lingo or the buzzer
    }
  }

  if (!q) return null;

  const frac = Math.min(1, tenth / (timeForQuestion(q) / 100));
  const revealed = picked !== null || res !== null;

  const hint =
    res === 'you'
      ? 'To‘g‘ri javob birinchi bo‘ldi — ochko sizniki! ⚡'
      : res === 'ai'
        ? 'Lingo oldin to‘g‘ri javob berdi — ochko raqibniki 🤖'
        : res === 'nobody'
          ? 'Hech kim to‘g‘ri javob topmadi 🤝'
          : res === 'timeout'
            ? 'Vaqt tugadi — ochko hech kimga emas ⏰'
            : picked !== null
              ? 'Noto‘g‘ri tanlov — bu savolda siz chiqdingiz'
              : mode === 'ai' && aiDone === false
                ? 'Lingo xato qildi — siz hali ochko olasiz!'
                : mode === 'ai'
                  ? 'Kim birinchi to‘g‘ri javob bersa — ochko shunga. Lingo o‘ylanyapti…'
                  : `${oppName} ham shu savolga javob beryapti…`;

  return (
    <div className="slide-up">
      {/* Scoreboard */}
      <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-3xl border border-line bg-surface p-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🙂</span>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold">Siz</p>
            <p className="text-xl font-extrabold leading-none text-indigo-600 dark:text-indigo-300">{myScore}</p>
          </div>
        </div>
        <div className="text-center text-xs font-extrabold text-muted">VS</div>
        <div className="flex items-center justify-end gap-2 text-right">
          <div className="min-w-0">
            {oppId ? (
              <button
                type="button"
                onClick={() => navigate(`/u/${oppId}`)}
                className="truncate text-xs font-bold underline decoration-dotted underline-offset-2 hover:text-indigo-600 dark:hover:text-indigo-300"
                aria-label={`${oppName} profilini ochish`}
              >
                {oppName} 🔍
              </button>
            ) : (
              <p className="truncate text-xs font-bold">{oppName}</p>
            )}
            <p className="text-xl font-extrabold leading-none text-rose-500">{mode === 'ai' ? aiScore : '…'}</p>
          </div>
          <span className="text-2xl">{oppAvatar}</span>
        </div>
      </div>

      <p className="mb-2 text-center text-[11px] text-muted" aria-live="polite">{hint}</p>

      <ProgressBar value={((idx + (res !== null ? 1 : 0)) / questions.length) * 100} label="Jang jarayoni" />

      <Card className="mt-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-muted">Savol {idx + 1}/{questions.length}</p>
          <span
            className={cx(
              'rounded-full px-2 py-0.5 text-xs font-extrabold tabular-nums',
              frac > 0.5
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                : frac > 0.25
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
            )}
          >
            ⏱ {Math.ceil(tenth / 10)}s
          </span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface2" role="timer" aria-label="Qolgan vaqt">
          <div
            className={cx(
              'h-full rounded-full transition-[width] duration-100 ease-linear',
              frac > 0.5 ? 'bg-emerald-500' : frac > 0.25 ? 'bg-amber-500' : 'bg-rose-500',
            )}
            style={{ width: `${Math.round(frac * 100)}%` }}
          />
        </div>
        <p className="mt-2 whitespace-pre-line text-lg font-bold leading-snug">{q.q}</p>
        <div className="mt-4 grid gap-2.5" role="group" aria-label="Javob variantlari">
          {q.options.map((o, i) => {
            const isCorrect = i === q.answer;
            const isPicked = picked === i;
            const show = revealed;
            return (
              <button
                key={i}
                type="button"
                disabled={show}
                onClick={() => choose(i)}
                aria-pressed={isPicked}
                className={cx(
                  'flex w-full items-center gap-3 rounded-2xl border-2 px-3.5 py-3 text-left text-[15px] font-medium transition',
                  !show && 'border-line bg-surface hover:border-indigo-400 hover:bg-surface2',
                  show && isCorrect && 'correct-pop border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-100',
                  show && isPicked && !isCorrect && 'shake-x border-rose-500 bg-rose-50 text-rose-900 dark:bg-rose-500/15 dark:text-rose-100',
                  show && !isCorrect && !isPicked && 'border-line opacity-60',
                )}
              >
                <span className={cx('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold', show && isCorrect ? 'bg-emerald-500 text-white' : show && isPicked ? 'bg-rose-500 text-white' : 'bg-surface2 text-muted')}>
                  {show && isCorrect ? <Icon name="check" className="h-4 w-4" /> : show && isPicked ? <Icon name="x" className="h-4 w-4" /> : LETTERS[i]}
                </span>
                <span className="min-w-0 flex-1">{o}</span>
              </button>
            );
          })}
        </div>
        {revealed && (
          <div className={cx('slide-up mt-4 rounded-2xl p-3.5 text-sm', res === 'you' ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-100' : 'bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-100')} aria-live="polite">
            <p className="font-bold">{res === 'you' ? 'To‘g‘ri! ✅' : `To‘g‘ri javob: ${q.options[q.answer]}`}</p>
            <p className="mt-1">{q.explain}</p>
          </div>
        )}
      </Card>

      {mode === 'ai' && (res !== null || aiDone !== null) && (
        <div className="mt-3 flex justify-center">
          {res === 'you' ? (
            <Pill tone="green" className="pop-in !px-3 !py-1.5">⚡ Siz oldinda javob berdingiz — {myScore} : {aiScore}</Pill>
          ) : res === 'ai' ? (
            <Pill tone="rose" className="pop-in !px-3 !py-1.5">🤖 Lingo oldinda javob berdi — {myScore} : {aiScore}</Pill>
          ) : res !== null ? (
            <Pill tone="neutral" className="pop-in !px-3 !py-1.5">{res === 'nobody' ? '🤝 Ikkala javob ham xato' : '⏰ Vaqt tugadi'} — {myScore} : {aiScore}</Pill>
          ) : (
            <Pill tone="amber" className="pop-in !px-3 !py-1.5">🤖 Lingo xato qildi ✗ — {myScore} : {aiScore}</Pill>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-2">
        <p className="text-xs text-muted">
          {res !== null ? (idx + 1 < questions.length ? 'Keyingi savol…' : 'Natija tayyorlanmoqda…') : 'Birinchi to‘g‘ri javob ochko oladi'}
        </p>
        {res !== null && (
          <Button onClick={advance}>{idx + 1 < questions.length ? 'Keyingi →' : 'Natijani ko‘rish'}</Button>
        )}
      </div>

      <div className="mt-3 flex justify-center">
        <Button variant="ghost" onClick={onQuitRequest}>⏹ Jangni tark etish</Button>
      </div>
    </div>
  );
}

// ===== Live PvP duel — both players see the same question at the same time =====
// The server (api/battle.ts action=sync) is the clock and the referee: the first correct
// answer takes the point and advances the round for BOTH players, a wrong answer waits
// for the opponent, both wrong / the buzzer advances with no point. Polling (~1.2s)
// doubles as the presence heartbeat — a player who disappears forfeits the battle.

interface LiveDuelProps {
  battleId: string;
  me: 'p1' | 'p2';
  questions: BattleQuiz[];
  oppName: string;
  oppId?: string | null; // opponent's user id — when present their name opens the public profile
  oppAvatar: string;
  onFinish: (you: number, them: number, delta: number, winner: 'me' | 'opp' | 'draw' | null, aborted: boolean) => void;
  onScore: (you: number, them: number) => void;
  onQuitRequest: () => void;
  onLegacy: () => void; // battle row predates live duels -> fall back to the async flow
}

function LiveDuel({ battleId, me, questions, oppName, oppId, oppAvatar, onFinish, onScore, onQuitRequest, onLegacy }: LiveDuelProps) {
  const [sync, setSync] = useState<LiveSync | null>(null);
  const [pick, setPick] = useState<number | null>(null); // my optimistic pick for this round
  const [now, setNow] = useState(() => Date.now());
  const [errs, setErrs] = useState(0);
  const [banner, setBanner] = useState(''); // round-result flash (shown while the next question counts in)

  const finishedRef = useRef(false);
  const syncRef = useRef<LiveSync | null>(null);
  const pickRef = useRef<number | null>(null);
  const inflightRef = useRef(false);
  const errsRef = useRef(0); // mirror of errs for the poll loop (adaptive backoff)
  const offsetRef = useRef(0); // serverNow - clientNow, for a shared clock
  const prevRef = useRef<{ round: number; mine: number; theirs: number } | null>(null);

  const nowS = useCallback(() => Date.now() + offsetRef.current, []);

  const apply = useCallback(
    (v: SyncResult) => {
      if (isLegacySync(v)) {
        onLegacy();
        return;
      }
      offsetRef.current = v.serverNow - Date.now();
      syncRef.current = v;
      setSync(v);
      setErrs(0);
      errsRef.current = 0;
      const mine = me === 'p1' ? v.s1 : v.s2;
      const theirs = me === 'p1' ? v.s2 : v.s1;
      onScore(mine, theirs);
      if (v.status === 'finished') {
        if (!finishedRef.current) {
          finishedRef.current = true;
          onFinish(mine, theirs, v.myDelta ?? 0, v.winner, v.aborted === true);
        }
        return;
      }
      const prev = prevRef.current;
      if (prev && v.round > prev.round) {
        // the server advanced the round — flash who took the point (+ the correct answer)
        const pq = questions[prev.round];
        const corr = pq ? `To‘g‘ri javob: ${pq.options[pq.answer]}` : '';
        if (mine > prev.mine) {
          setBanner(`⚡ Siz oldin to‘g‘ri javob berdingiz — ochko sizniki! ${corr}`);
          haptic('success');
          playSfx('correct');
        } else if (theirs > prev.theirs) {
          setBanner(`🗡️ ${oppName} oldin javob berdi — ochko uniki. ${corr}`);
          haptic('light');
          playSfx('wrong');
        } else {
          setBanner(`⏰ Vaqt tugadi yoki ikkala javob ham xato — ochko yo‘q. ${corr}`);
          playSfx('wrong');
        }
        pickRef.current = null;
        setPick(null);
      }
      prevRef.current = { round: v.round, mine, theirs };
    },
    [me, onFinish, onScore, onLegacy, oppName, questions],
  );

  // Round-state poll — also the heartbeat that keeps me "online" on the server.
  // A self-rescheduling timeout (not a fixed interval) so a run of failures backs the poll
  // off to 2.5s instead of hammering a struggling network every 1.2s.
  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const run = async () => {
      if (inflightRef.current || finishedRef.current) return;
      inflightRef.current = true;
      try {
        const v = await syncPvp(battleId);
        if (alive) apply(v);
      } catch {
        if (alive) {
          errsRef.current += 1;
          setErrs(errsRef.current);
        }
      } finally {
        inflightRef.current = false;
      }
    };
    const loop = async () => {
      await run();
      if (!alive) return;
      timer = setTimeout(() => void loop(), errsRef.current >= 3 ? 2500 : 1200);
    };
    void loop();
    const tick = setInterval(() => setNow(Date.now()), 100);
    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
      clearInterval(tick);
    };
  }, [battleId, apply]);

  const q = sync ? questions[Math.min(sync.round, questions.length - 1)] : undefined;

  function choose(i: number) {
    const v = syncRef.current;
    if (!q || !v || v.status !== 'active' || pickRef.current !== null || v.mine) return;
    if (v.roundStart == null || nowS() >= v.roundStart + timeForQuestion(q)) return;
    pickRef.current = i;
    setPick(i);
    const correct = i === q.answer;
    if (correct) {
      haptic('success');
      playSfx('correct');
    } else {
      haptic('error');
      playSfx('wrong');
    }
    const t = Math.max(0, Math.round(nowS() - (v.roundStart ?? nowS())));
    void answerPvp(battleId, v.round, correct, t)
      .then((r) => {
        if (!finishedRef.current) apply(r);
      })
      .catch(() => {
        errsRef.current += 1;
        setErrs(errsRef.current);
      });
  }

  if (!sync || !q) {
    return (
      <Card className="text-center">
        <div className="flex justify-center"><Mascot mood="think" size={96} /></div>
        <p className="mt-2 text-lg font-extrabold">Jangga ulanmoqda…</p>
        <p className="mt-1 text-sm text-muted">Server savolni tayyorlamoqda — bir necha soniya.</p>
      </Card>
    );
  }

  const myScore = me === 'p1' ? sync.s1 : sync.s2;
  const oppScore = me === 'p1' ? sync.s2 : sync.s1;
  const total = timeForQuestion(q);
  const preStart = sync.roundStart != null && nowS() < sync.roundStart; // countdown / reveal pause
  const remainMs = sync.roundStart != null ? Math.max(0, sync.roundStart + total - nowS()) : 0;
  const frac = Math.min(1, remainMs / total);
  const locked = preStart || sync.status !== 'active' || pick !== null || !!sync.mine || remainMs <= 0;

  const hint =
    sync.status === 'finished'
      ? 'Jang yakunlandi'
      : preStart && sync.round === 0
        ? `Jang boshlanadi: ${Math.max(1, Math.ceil(((sync.roundStart ?? nowS()) - nowS()) / 1000))}…`
        : preStart
          ? banner || 'Keyingi savol…'
          : sync.mine?.c === 1
            ? 'To‘g‘ri javob — ochko sizniki! ⚡'
            : pick !== null
              ? 'Noto‘g‘ri tanlov — raqibning javobi kutilmoqda…'
              : sync.opp
                ? `${oppName} xato qildi — siz javob bering!`
                : remainMs <= 0
                  ? 'Vaqt tugadi — server keyingi savolga o‘tkazmoqda…'
                  : 'Kim birinchi to‘g‘ri javob bersa — ochko shunga!';

  return (
    <div className="slide-up">
      {/* Scoreboard */}
      <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-3xl border border-line bg-surface p-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🙂</span>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold">Siz</p>
            <p className="text-xl font-extrabold leading-none text-indigo-600 dark:text-indigo-300">{myScore}</p>
          </div>
        </div>
        <div className="text-center text-xs font-extrabold text-muted">VS</div>
        <div className="flex items-center justify-end gap-2 text-right">
          <div className="min-w-0">
            {oppId ? (
              <button
                type="button"
                onClick={() => navigate(`/u/${oppId}`)}
                className="truncate text-xs font-bold underline decoration-dotted underline-offset-2 hover:text-indigo-600 dark:hover:text-indigo-300"
                aria-label={`${oppName} profilini ochish`}
              >
                {oppName} 🔍
              </button>
            ) : (
              <p className="truncate text-xs font-bold">{oppName}</p>
            )}
            <p className="text-xl font-extrabold leading-none text-rose-500">{oppScore}</p>
          </div>
          <span className="text-2xl">{oppAvatar}</span>
        </div>
      </div>

      <p className="mb-2 text-center text-[11px] text-muted" aria-live="polite">{hint}</p>
      {errs >= 3 && (
        <p className="mb-2 text-center text-[11px] font-semibold text-amber-600 dark:text-amber-300">🌐 Ulanish sekin — javoblar kechikishi mumkin…</p>
      )}

      <ProgressBar value={(sync.round / questions.length) * 100} label="Jang jarayoni" />

      <Card className="mt-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-muted">Savol {Math.min(sync.round + 1, questions.length)}/{questions.length}</p>
          <span
            className={cx(
              'rounded-full px-2 py-0.5 text-xs font-extrabold tabular-nums',
              frac > 0.5
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                : frac > 0.25
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
            )}
          >
            {preStart ? '⏳' : `⏱ ${Math.ceil(remainMs / 1000)}s`}
          </span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface2" role="timer" aria-label="Qolgan vaqt">
          <div
            className={cx(
              'h-full rounded-full transition-[width] duration-100 ease-linear',
              frac > 0.5 ? 'bg-emerald-500' : frac > 0.25 ? 'bg-amber-500' : 'bg-rose-500',
            )}
            style={{ width: `${Math.round(frac * 100)}%` }}
          />
        </div>
        <p className="mt-2 whitespace-pre-line text-lg font-bold leading-snug">{q.q}</p>
        <div className="mt-4 grid gap-2.5" role="group" aria-label="Javob variantlari">
          {q.options.map((o, i) => {
            const isCorrect = sync.mine?.c === 1 && i === q.answer; // reveal only my own correct answer
            const isPicked = pick === i;
            return (
              <button
                key={i}
                type="button"
                disabled={locked}
                onClick={() => choose(i)}
                aria-pressed={isPicked}
                className={cx(
                  'flex w-full items-center gap-3 rounded-2xl border-2 px-3.5 py-3 text-left text-[15px] font-medium transition',
                  !locked && 'border-line bg-surface hover:border-indigo-400 hover:bg-surface2',
                  locked && !isCorrect && !isPicked && 'border-line opacity-60',
                  isCorrect && 'correct-pop border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-100',
                  isPicked && !isCorrect && 'shake-x border-rose-500 bg-rose-50 text-rose-900 dark:bg-rose-500/15 dark:text-rose-100',
                )}
              >
                <span className={cx('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold', isCorrect ? 'bg-emerald-500 text-white' : isPicked ? 'bg-rose-500 text-white' : 'bg-surface2 text-muted')}>
                  {isCorrect ? <Icon name="check" className="h-4 w-4" /> : isPicked ? <Icon name="x" className="h-4 w-4" /> : LETTERS[i]}
                </span>
                <span className="min-w-0 flex-1">{o}</span>
              </button>
            );
          })}
        </div>
        {preStart && banner && (
          <div className="slide-up mt-4 rounded-2xl bg-indigo-50 p-3.5 text-sm text-indigo-900 dark:bg-indigo-500/10 dark:text-indigo-100" aria-live="polite">
            <p className="font-bold">{banner}</p>
          </div>
        )}
      </Card>

      <div className="mt-3 flex justify-center">
        <Button variant="ghost" onClick={onQuitRequest}>⏹ Jangni tark etish</Button>
      </div>
    </div>
  );
}
