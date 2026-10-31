import { useCallback, useEffect, useRef, useState } from 'react';
import type { Quiz } from '../types';
import { useApp } from '../store/store';
import { addCoins, isOwnedActive, recordBattleResult } from '../store/actions';
import { toast } from '../store/ui';
import { rankInfo, ratingOf } from '../lib/gamification';
import { nameStyleClasses } from '../lib/shop';
import {
  AI_BATTLES_PER_DAY, BATTLE_QUESTIONS, aiK, aiAccuracy, aiCorrectFor, aiRatedLeft, aiThinkMs,
  battleResultOf, buildBattleQuestions, eloDelta, scoreOf,
} from '../lib/battle';
import {
  battleAvailable, cancelChallenge, getBattle, joinChallenge, listChallenges, notConfigured,
  openChallenge, submitScore, type BattleView,
} from '../lib/battleApi';
import { Button, Card, Notice, Pill, ProgressBar, Section } from '../components/ui';
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
  const [questions, setQuestions] = useState<Quiz[]>([]);
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

  const myName = (s.profile?.name ?? 'O‘quvchi').trim().split(/\s+/)[0] || 'O‘quvchi';
  const myAvatar = s.shop.equipped.avatar ?? '🙂';
  const myPhoto = s.profile?.photoAvatar;
  const nameCls = nameStyleClasses(s.shop.equipped, isOwnedActive);

  useEffect(() => {
    let alive = true;
    battleAvailable().then((v) => alive && setOnline(v));
    return () => {
      alive = false;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // ===== Battle starters =====

  const startAi = useCallback(() => {
    const seed = uid('b');
    aiSeedRef.current = seed;
    accRef.current = aiAccuracy(s.quizHistory);
    const level = s.profile?.estimatedLevel ?? s.profile?.selfLevel ?? 'A2';
    setMode('ai');
    setQuestions(buildBattleQuestions(level, seed));
    setSearchBattle(null);
    setPhase('duel');
    haptic('light');
  }, [s.quizHistory, s.profile]);

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
            setQuestions(joined.questions);
            battleIdRef.current = joined.id;
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
      const level = s.profile?.estimatedLevel ?? s.profile?.selfLevel ?? 'A2';
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
            setQuestions(b.questions);
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
  }, [rating, myName, myAvatar, s.quizHistory, s.profile, startAi]);

  const cancelSearch = useCallback(async () => {
    if (pollRef.current) clearInterval(pollRef.current);
    const id = battleIdRef.current;
    if (id) await cancelChallenge(id);
    setPhase('lobby');
  }, []);

  // ===== Finish paths =====

  const finish = useCallback(
    (you: number, them: number, vs: 'ai' | 'player', opponent: string, serverDelta?: number) => {
      const result = battleResultOf(you, them);
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
    (you: number) => {
      if (mode === 'ai') {
        // Lingo answers with the same accuracy the learner usually shows -> evenly matched
        const acc = accRef.current;
        const seed = aiSeedRef.current;
        const them = questions.reduce((a, _q, i) => a + (aiCorrectFor(seed, i, acc) ? 1 : 0), 0);
        finish(you, them, 'ai', 'Lingo (AI)');
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
          finish(view.meScore ?? you, view.oppScore ?? 0, 'player', view.oppName, view.myDelta ?? 0);
        } catch {
          if (waitRunRef.current !== run) return;
          toast('Ulanish xatosi — natija saqlanmadi', 'warn');
          setPhase('lobby');
        }
      })();
    },
    [finish, mode, questions],
  );

  const shareResult = useCallback(() => {
    if (!outcome) return;
    const text =
      outcome.result === 'win'
        ? `⚔️ Do‘stona jangda g‘aliba qozondim: ${outcome.you}:${outcome.them} (${outcome.opponent})! Reytingim oshdi 📈`
        : `⚔️ Do‘stona jang: ${outcome.you}:${outcome.them} (${outcome.opponent}). Keyingi safar g‘aliba meniki! 💪`;
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
        <Duel
          key={questions.map((q) => q.id).join('|')}
          questions={questions}
          mode={mode}
          oppName={mode === 'ai' ? 'Lingo (AI)' : searchBattle?.oppName ?? 'Raqib'}
          oppAvatar={mode === 'ai' ? '🤖' : searchBattle?.oppAvatar ?? '🙂'}
          seed={aiSeedRef.current}
          accuracy={accRef.current}
          onFinish={onDuelFinish}
        />
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
    return (
      <div>
        <Bar emoji="⚔️" title="Jang tugadi" onBack={() => setPhase('lobby')} />
        <Card className="pop-in relative text-center">
          {win && <Confetti count={44} />}
          <div className="flex justify-center"><Mascot mood={win ? 'cheer' : draw ? 'happy' : 'think'} size={92} /></div>
          <p className="mt-1 text-2xl font-extrabold">{win ? '🏆 G‘aliba!' : draw ? '🤝 Durrang!' : '💪 Mag‘lubiyat'}</p>
          <p className="mt-1 text-sm text-muted">{outcome.opponent}ga qarshi</p>
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
          {!outcome.rated && (
            <p className="mt-2 text-xs text-muted">Kunlik {AI_BATTLES_PER_DAY} ta reytingli AI jangi tugadi — bu jang mashq rejimida o‘tdi.</p>
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
          <span className="rounded-full bg-white/20 px-2.5 py-1">🏆 {s.battle.wins} g‘aliba</span>
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
          <p className="mt-0.5 text-xs text-muted">Lingo aynan sizning darajangizda o‘ynaydi — ham kuchli, ham kuchsiz emas.</p>
        </button>
      </div>

      <div className="mt-3">
        <Notice>
          <b>Qoidalar:</b> {BATTLE_QUESTIONS} ta savol — kim ko‘p to‘g‘ri javob bersa, g‘olib. G‘aliba reytingni oshiradi, mag‘lubiyat kamaytiradi. Kuniga {AI_BATTLES_PER_DAY} ta AI jangi reytingli (bugun: {ratedLeft}/{AI_BATTLES_PER_DAY}), keyingilari mashq bo‘ladi.
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
          <p className="text-sm text-muted">Hali jang bo‘lmagan — birinchi g‘alibangizni qo‘lga kiritng!</p>
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

// ===== The live quiz duel =====

interface DuelProps {
  questions: Quiz[];
  mode: 'ai' | 'pvp';
  oppName: string;
  oppAvatar: string;
  seed: string;
  accuracy: number; // Lingo's accuracy — mirrors the learner's own skill
  onFinish: (you: number) => void;
}

function Duel({ questions, mode, oppName, oppAvatar, seed, accuracy, onFinish }: DuelProps) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [aiReveal, setAiReveal] = useState<boolean | null>(null);
  const [aiScore, setAiScore] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const q = questions[idx];

  function choose(i: number) {
    if (picked !== null || !q) return;
    setPicked(i);
    const ok = i === q.answer;
    setMyScore((v) => v + (ok ? 1 : 0));
    haptic(ok ? 'success' : 'error');
    playSfx(ok ? 'correct' : 'wrong');
    if (mode === 'ai') {
      const aiOk = aiCorrectFor(seed, idx, accuracy);
      timer.current = setTimeout(() => {
        setAiReveal(aiOk);
        setAiScore((v) => v + (aiOk ? 1 : 0));
        haptic('light');
      }, aiThinkMs(seed, idx));
    }
  }

  function next() {
    if (picked === null) return;
    if (mode === 'ai' && aiReveal === null) return; // wait for Lingo's answer
    if (idx + 1 < questions.length) {
      setIdx(idx + 1);
      setPicked(null);
      setAiReveal(null);
    } else {
      onFinish(myScore);
    }
  }

  if (!q) return null;

  const waitingAi = mode === 'ai' && picked !== null && aiReveal === null;

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
            <p className="truncate text-xs font-bold">{oppName}</p>
            <p className="text-xl font-extrabold leading-none text-rose-500">{mode === 'ai' ? aiScore : '…'}</p>
          </div>
          <span className="text-2xl">{oppAvatar}</span>
        </div>
      </div>
      <p className="mb-2 text-center text-[11px] text-muted" aria-live="polite">
        {waitingAi ? 'Lingo o‘ylanyapti…' : mode === 'ai' ? 'Lingo sizning darajangizda o‘ynaydi' : `${oppName} ham shu savollarga javob bermoqda…`}
      </p>

      <ProgressBar value={((idx + (picked !== null ? 1 : 0)) / questions.length) * 100} label="Jang jarayoni" />

      <Card className="mt-3">
        <p className="text-sm font-semibold text-muted">Savol {idx + 1}/{questions.length}</p>
        <p className="mt-1 whitespace-pre-line text-lg font-bold leading-snug">{q.q}</p>
        <div className="mt-4 grid gap-2.5" role="group" aria-label="Javob variantlari">
          {q.options.map((o, i) => {
            const isCorrect = i === q.answer;
            const isPicked = picked === i;
            const show = picked !== null;
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
        {picked !== null && (
          <div className={cx('slide-up mt-4 rounded-2xl p-3.5 text-sm', picked === q.answer ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-100' : 'bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-100')} aria-live="polite">
            <p className="font-bold">{picked === q.answer ? 'To‘g‘ri! ✅' : `Noto‘g‘ri. To‘g‘ri javob: ${q.options[q.answer]}`}</p>
            <p className="mt-1">{q.explain}</p>
          </div>
        )}
      </Card>

      {mode === 'ai' && picked !== null && aiReveal !== null && (
        <div className="mt-3 flex justify-center">
          <Pill tone={aiReveal ? 'rose' : 'green'} className="pop-in !px-3 !py-1.5">
            🤖 Lingo {aiReveal ? 'to‘g‘ri javob berdi ✓' : 'xato qildi ✗'} — hisob {myScore} : {aiScore}
          </Pill>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Button onClick={next} disabled={picked === null || waitingAi}>
          {idx + 1 < questions.length ? 'Keyingi savol' : 'Natijani ko‘rish'}
        </Button>
      </div>
    </div>
  );
}
