import { useState, type ReactNode } from 'react';
import type { GameOutcome } from '../../store/actions';
import { markManyForReview } from '../../store/actions';
import { DAILY_BONUS_XP, type GameInfo, type GameResult } from '../../lib/games';
import { Mascot, Confetti } from '../Mascot';
import { SpeakButton } from '../SpeakButton';
import { Button, Card, Pill } from '../ui';
import { cx } from '../../lib/utils';

export interface GameProps {
  daily: boolean;
  onFinish: (r: GameResult) => void;
}

export function Stars({ n, size = 'text-4xl', animate }: { n: number; size?: string; animate?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-1" role="img" aria-label={`${n} ta yulduz, 3 tadan`}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cx(size, i < n ? '' : 'opacity-25 grayscale', animate && i < n && 'pop-in')}
          style={animate ? { animationDelay: `${i * 220}ms` } : undefined}
        >
          ⭐
        </span>
      ))}
    </div>
  );
}

export function Hud({ items }: { items: { label: string; value: ReactNode; tone?: 'normal' | 'bad' | 'good' }[] }) {
  return (
    <div className="mb-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map((it) => (
        <div key={it.label} className="rounded-2xl border border-line bg-surface px-3 py-2 text-center">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">{it.label}</div>
          <div className={cx('text-lg font-extrabold leading-tight', it.tone === 'bad' && 'text-rose-600 dark:text-rose-400', it.tone === 'good' && 'text-emerald-600 dark:text-emerald-400')}>{it.value}</div>
        </div>
      ))}
    </div>
  );
}

const STAR_MSG = ['Yana urinib ko‘ring, albatta chiqadi!', 'Yaxshi boshlanish!', 'Juda yaxshi!', 'A’lo! Mukammal natija!'];

export function GameEnd({ info, result, outcome, daily, onAgain, onExit }: { info: GameInfo; result: GameResult; outcome: GameOutcome; daily: boolean; onAgain: () => void; onExit: () => void }) {
  const [added, setAdded] = useState(false);
  const mood = result.stars >= 3 ? 'cheer' : result.stars >= 1 ? 'happy' : 'think';
  return (
    <div className="relative">
      {result.stars >= 2 && <Confetti />}
      <Card className="text-center">
        <div className="flex justify-center"><Mascot mood={mood} size={96} /></div>
        <h2 className="mt-1 text-xl font-extrabold">{info.emoji} {info.title}</h2>
        <div className="mt-2"><Stars n={result.stars} animate /></div>
        <p className="mt-1 text-sm text-muted">{STAR_MSG[result.stars]}</p>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-surface2 p-2.5"><div className="text-xl font-extrabold">{result.score}</div><div className="text-[11px] font-semibold text-muted">BALL</div></div>
          <div className="rounded-2xl bg-surface2 p-2.5"><div className="text-xl font-extrabold">{result.correct}/{result.total}</div><div className="text-[11px] font-semibold text-muted">TO‘G‘RI</div></div>
          <div className="rounded-2xl bg-surface2 p-2.5"><div className="text-xl font-extrabold">+{outcome.xp + outcome.dailyBonus}</div><div className="text-[11px] font-semibold text-muted">XP</div></div>
        </div>

        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {outcome.record && <Pill tone="amber">🏅 Yangi rekord!</Pill>}
          {outcome.dailyBonus > 0 && <Pill tone="green">📅 Kunlik challenge bajarildi +{DAILY_BONUS_XP} XP</Pill>}
          {daily && outcome.dailyBonus === 0 && result.stars === 0 && <Pill tone="neutral">Kunlik challenge uchun kamida 1 yulduz kerak</Pill>}
        </div>
        {result.note && <p className="mt-2 text-xs text-muted">{result.note}</p>}
        {outcome.capped && (
          <p className="mt-2 rounded-2xl bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
            Bugungi o‘yin XP limiti to‘ldi. O‘ynayverishingiz mumkin, lekin XP uchun darslarga ham qaytib keling 😉
          </p>
        )}

        {result.missed.length > 0 && (
          <div className="mt-4 rounded-2xl border border-line p-3 text-left">
            <div className="text-sm font-bold">Qiyin bo‘lgan so‘zlar</div>
            <ul className="mt-2 space-y-1.5">
              {result.missed.slice(0, 8).map((w) => (
                <li key={w.id} className="flex items-center gap-2 text-sm">
                  <SpeakButton text={w.en} className="h-8 w-8" />
                  <span className="font-bold">{w.en}</span>
                  <span className="text-muted">— {w.uz}</span>
                </li>
              ))}
            </ul>
            <Button
              size="sm"
              variant="secondary"
              className="mt-3"
              disabled={added}
              onClick={() => {
                markManyForReview(result.missed.map((w) => w.id));
                setAdded(true);
              }}
            >
              {added ? '✓ Qo‘shildi' : 'Takrorlashga qo‘shish'}
            </Button>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button size="lg" onClick={onAgain}>🔁 Yana o‘ynash</Button>
          <Button size="lg" variant="secondary" onClick={onExit}>Barcha o‘yinlar</Button>
        </div>
      </Card>
    </div>
  );
}
