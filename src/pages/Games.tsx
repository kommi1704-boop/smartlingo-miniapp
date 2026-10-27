import { useState, type ComponentType } from 'react';
import { A, navigate } from '../lib/router';
import { useApp } from '../store/store';
import { finishGame, type GameOutcome } from '../store/actions';
import { DAILY_BONUS_XP, GAMES, GAME_XP_CAP, dailyGameId, gameInfo, type GameInfo, type GameResult } from '../lib/games';
import { ttsAvailable } from '../lib/tts';
import { today } from '../lib/dates';
import { streakOf } from '../lib/gamification';
import { Button, Card, Empty, Notice, PageHeader, Pill, Section } from '../components/ui';
import { Mascot } from '../components/Mascot';
import { GameEnd, Stars, type GameProps } from '../components/games/common';
import { MemoryGame } from '../components/games/MemoryGame';
import { RunnerGame } from '../components/games/RunnerGame';
import { ScrambleGame } from '../components/games/ScrambleGame';
import { BlitzGame } from '../components/games/BlitzGame';
import { ListenGame } from '../components/games/ListenGame';
import { cx } from '../lib/utils';

const COMPONENTS: Record<string, ComponentType<GameProps>> = {
  memory: MemoryGame,
  runner: RunnerGame,
  scramble: ScrambleGame,
  blitz: BlitzGame,
  listen: ListenGame,
};

export function GamesHub() {
  const s = useApp();
  const t = today();
  const dailyId = dailyGameId(t);
  const dailyInfo = gameInfo(dailyId)!;
  const dailyDone = s.games.daily.date === t && s.games.daily.done;
  const usedXp = s.games.xpToday.date === t ? s.games.xpToday.xp : 0;
  const totalStars = Object.values(s.games.best).reduce((a, b) => a + b.stars, 0);
  const streak = streakOf(s.activity);

  return (
    <div>
      <PageHeader emoji="🎮" title="O‘yinlar" subtitle="O‘ynab o‘rganing: so‘zlar sizning darajangizga mos" />

      <A
        to="/games/daily"
        className={cx(
          'relative mb-4 block overflow-hidden rounded-[1.75rem] bg-gradient-to-br p-5 text-white shadow-lg transition active:scale-[0.99]',
          dailyDone ? 'from-emerald-500 to-teal-600 shadow-emerald-500/25' : `${dailyInfo.color} shadow-indigo-500/25`,
        )}
      >
        <div className="flex items-center gap-3">
          <div className="rounded-3xl bg-white/20 p-1.5"><Mascot mood={dailyDone ? 'cheer' : 'wow'} size={58} /></div>
          <div className="min-w-0">
            <div className="text-xs font-bold uppercase tracking-wide opacity-90">📅 Kunlik challenge</div>
            <div className="text-xl font-extrabold leading-tight">{dailyInfo.emoji} {dailyInfo.title}</div>
            <div className="text-sm opacity-90">{dailyDone ? 'Bajarildi! Ertaga yangi o‘yin bo‘ladi 🎉' : `Bugungi so‘zlar bilan o‘ynang: +${DAILY_BONUS_XP} XP bonus`}</div>
          </div>
        </div>
      </A>

      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl border border-line bg-surface p-2.5"><div className="text-lg font-extrabold">🔥 {streak}</div><div className="text-[11px] font-semibold text-muted">KUN SERIYA</div></div>
        <div className="rounded-2xl border border-line bg-surface p-2.5"><div className="text-lg font-extrabold">⭐ {totalStars}<span className="text-xs text-muted">/{GAMES.length * 3}</span></div><div className="text-[11px] font-semibold text-muted">YULDUZLAR</div></div>
        <div className="rounded-2xl border border-line bg-surface p-2.5"><div className="text-lg font-extrabold">🎮 {s.games.plays}</div><div className="text-[11px] font-semibold text-muted">O‘YINLAR</div></div>
      </div>

      <Section title="Barcha o‘yinlar">
        <div className="grid gap-3 sm:grid-cols-2">
          {GAMES.map((g) => {
            const b = s.games.best[g.id];
            const noAudio = g.needsAudio && !ttsAvailable();
            return (
              <A key={g.id} to={`/games/${g.id}`} className={cx('block', noAudio && 'pointer-events-none opacity-50')}>
                <Card className="h-full transition hover:border-indigo-300">
                  <div className="flex items-start gap-3">
                    <div className={cx('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-3xl shadow-sm', g.color)}>{g.emoji}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold">{g.title}</h3>
                        {g.id === dailyId && <Pill tone="amber">Bugun</Pill>}
                      </div>
                      <p className="text-sm text-muted">{g.tagline}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <Stars n={b?.stars ?? 0} size="text-xl" />
                        <span className="text-xs font-semibold text-muted">{b ? `Rekord: ${b.score}` : 'Hali o‘ynalmagan'}</span>
                      </div>
                      {noAudio && <p className="mt-1 text-xs text-rose-600">Bu telefonda ovoz yo‘q</p>}
                    </div>
                  </div>
                </Card>
              </A>
            );
          })}
        </div>
      </Section>

      <div className="mt-4">
        <Notice>
          O‘yinlardan kuniga {GAME_XP_CAP} XP gacha olinadi (bugun: {usedXp}). Shunda o‘yin darslarni almashtirmaydi, balki to‘ldiradi. Xato qilgan so‘zlaringizni takrorlashga qo‘shishingiz mumkin. O‘yinlarda Robocoin ham yig‘iladi (kuniga 30 tagacha 🪙) — Do‘konda sarflang!
        </Notice>
      </div>
    </div>
  );
}

export function GamePage({ id }: { id: string }) {
  const daily = id === 'daily';
  const gid = daily ? dailyGameId() : id;
  const info = gameInfo(gid);
  const s = useApp();
  const [phase, setPhase] = useState<'intro' | 'play' | 'end'>('intro');
  const [round, setRound] = useState(0);
  const [end, setEnd] = useState<{ result: GameResult; outcome: GameOutcome } | null>(null);

  if (!info) {
    return <Empty emoji="🎮" title="O‘yin topilmadi" text="Bunday o‘yin yo‘q." action={<Button onClick={() => navigate('/games')}>O‘yinlarga qaytish</Button>} />;
  }

  const Comp = COMPONENTS[info.id];
  const b = s.games.best[info.id];
  const noAudio = info.needsAudio && !ttsAvailable();

  const onFinish = (result: GameResult) => {
    const outcome = finishGame(result, daily);
    setEnd({ result, outcome });
    setPhase('end');
  };

  return (
    <div>
      <PageHeader back="/games" emoji={info.emoji} title={info.title} subtitle={daily ? `Kunlik challenge · +${DAILY_BONUS_XP} XP bonus` : info.tagline} />
      {phase === 'intro' && <Intro info={info} best={b?.stars ?? 0} score={b?.score} daily={daily} noAudio={!!noAudio} onStart={() => setPhase('play')} />}
      {phase === 'play' && <Comp key={round} daily={daily} onFinish={onFinish} />}
      {phase === 'end' && end && (
        <GameEnd
          info={info}
          result={end.result}
          outcome={end.outcome}
          daily={daily}
          onAgain={() => {
            setRound((r) => r + 1);
            setPhase('play');
          }}
          onExit={() => navigate('/games')}
        />
      )}
    </div>
  );
}

function Intro({ info, best, score, daily, noAudio, onStart }: { info: GameInfo; best: number; score?: number; daily: boolean; noAudio: boolean; onStart: () => void }) {
  return (
    <Card className="text-center">
      <div className={cx('mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br text-5xl shadow', info.color)}>{info.emoji}</div>
      <h2 className="mt-3 text-xl font-extrabold">Qanday o‘ynaladi?</h2>
      <ol className="mx-auto mt-3 max-w-md space-y-2 text-left text-sm">
        {info.how.map((h, i) => (
          <li key={i} className="flex gap-2.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-extrabold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">{i + 1}</span>
            <span>{h}</span>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex flex-col items-center gap-1">
        <Stars n={best} size="text-2xl" />
        <span className="text-xs text-muted">{score ? `Eng yaxshi natija: ${score} ball` : 'Birinchi marta o‘ynayapsiz. Omad!'}</span>
      </div>
      {daily && <p className="mt-2 text-xs text-muted">Kunlik challenge so‘zlari bugun hamma uchun bir xil. Kamida 1 yulduz oling!</p>}
      {noAudio && <p className="mt-2 text-sm text-rose-600">Bu qurilmada ovoz sintezi yo‘q, shuning uchun bu o‘yin ishlamaydi.</p>}
      <Button size="lg" className="mt-5" disabled={noAudio} onClick={onStart}>Boshlash ▶</Button>
    </Card>
  );
}
