import { useState } from 'react';
import type { FullQuestion } from '../lib/quizApi';
import { Button, Card, Pill } from './ui';
import { Icon } from './Icon';
import { ProgressRing } from './ui';
import { Confetti, Mascot, type Mood } from './Mascot';
import { shareToTelegram } from '../lib/telegram';
import { cx } from '../lib/utils';

// ---------------------------------------------------------------------------
// ResultCard — the shareable "natijalar kartochkasi". Classic is free; the gold
// theme is a small Coin unlock (the server journals it, see QuizPlay).
// ---------------------------------------------------------------------------

export interface ResultCardProps {
  quizTitle: string;
  creatorName: string;
  playerName: string;
  score: number;
  total: number;
  theme: 'classic' | 'gold';
  shareUrl: string | null; // quiz deep link (t.me/<bot>?start=quiz_<id>)
}

export function verdictOf(ratio: number): { emoji: string; text: string; mood: Mood } {
  if (ratio === 1) return { emoji: '🏆', text: 'Mukammal natija!', mood: 'cheer' };
  if (ratio >= 0.8) return { emoji: '🎉', text: 'Juda kuchli!', mood: 'cheer' };
  if (ratio >= 0.6) return { emoji: '👏', text: 'Yaxshi o‘ynadingiz!', mood: 'happy' };
  if (ratio >= 0.4) return { emoji: '💪', text: 'Yana mashq — natija albatta o‘sadi!', mood: 'think' };
  return { emoji: '🌱', text: 'Har xato — yangi bilim. Davom eting!', mood: 'think' };
}

export function ResultCard({ quizTitle, creatorName, playerName, score, total, theme, shareUrl }: ResultCardProps) {
  const ratio = total ? score / total : 0;
  const v = verdictOf(ratio);

  return (
    <Card
      className={cx(
        'relative overflow-hidden text-center',
        theme === 'gold' && 'border-gold/60 bg-gradient-to-br from-gold/15 via-surface to-gold/10',
      )}
    >
      {ratio >= 0.8 && <Confetti count={26} />}
      {theme === 'gold' && <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />}
      <div className="text-[11px] font-bold uppercase tracking-widest text-muted">Do‘st quizi natijasi</div>
      <div className="mt-2 flex justify-center">
        <ProgressRing value={ratio * 100} size={116} stroke={11}>
          <div>
            <div className="text-2xl font-extrabold">
              {score}/{total}
            </div>
            <div className="text-[11px] text-muted">to‘g‘ri javob</div>
          </div>
        </ProgressRing>
      </div>
      <div className="mt-2 text-3xl">{v.emoji}</div>
      <p className="mt-1 text-lg font-extrabold">{v.text}</p>
      <p className="mt-1 text-sm text-muted">
        «{quizTitle}» · {creatorName} yuborgan
      </p>
      <div className="mt-3 flex items-center justify-center gap-2">
        <Pill tone="indigo">👤 {playerName}</Pill>
        {theme === 'gold' && <Pill tone="amber">✨ Oltin kartochka</Pill>}
      </div>
      <div className="mt-4 flex justify-center">
        <Mascot mood={v.mood} size={64} animate={false} interactive={false} />
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button
          icon="share"
          onClick={() =>
            shareUrl
              ? shareToTelegram(shareUrl, `🎯 «${quizTitle}» quizida ${score}/${total}! ${v.emoji} Sen ham sinab ko'r: ${shareUrl}`)
              : shareToTelegram('', `🎯 «${quizTitle}» quizida ${score}/${total}! ${v.emoji} — SmartLingo AI`)
          }
        >
          Natijani ulashish
        </Button>
        {shareUrl && (
          <Button variant="secondary" icon="link" onClick={() => shareToTelegram(shareUrl, `🎯 «${quizTitle}» — SmartLingo do‘st quizi. Sen ham qatnash: ${shareUrl}`)}>
            Quiz havolasi
          </Button>
        )}
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Answer review — shown only AFTER submission (the server never sent the
// correct answers before that point).
// ---------------------------------------------------------------------------

export function AnswerReview({ questions, answers }: { questions: FullQuestion[]; answers: number[] }) {
  return (
    <div className="space-y-2.5">
      {questions.map((q, i) => {
        const mine = answers[i];
        const ok = mine === q.answer;
        return (
          <Card key={q.id ?? i} className="!p-3.5">
            <div className="flex items-start gap-2.5">
              <span
                className={cx(
                  'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white',
                  ok ? 'bg-emerald-500' : 'bg-rose-500',
                )}
              >
                <Icon name={ok ? 'check' : 'x'} className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold leading-snug">
                  {i + 1}. {q.q}
                </p>
                {!ok && (
                  <p className="mt-1 text-xs text-muted">
                    Siz javobi: <span className="font-semibold text-rose-500">{q.options[mine] ?? '—'}</span>
                  </p>
                )}
                <p className="mt-0.5 text-xs text-muted">
                  To‘g‘ri javob: <span className="font-semibold text-emerald-600 dark:text-emerald-300">{q.options[q.answer]}</span>
                </p>
                {q.explain && <p className="mt-1 rounded-xl bg-surface2/60 p-2 text-xs leading-relaxed text-muted">{q.explain}</p>}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/** Gold-theme unlock control (20 Coins, journaled server-side). */
export function GoldUnlock({ cost, coins, onUnlock }: { cost: number; coins: number; onUnlock: () => boolean }) {
  const [busy, setBusy] = useState(false);
  if (coins < cost) {
    return (
      <div className="rounded-2xl border border-dashed border-line p-3 text-center text-xs text-muted">
        ✨ Oltin kartochka uchun 🪙 {cost} Coin kerak — vazifalar va o‘yinlar bilan yig‘ib oling.
      </div>
    );
  }
  return (
    <Button
      variant="secondary"
      full
      icon="sparkles"
      disabled={busy}
      onClick={() => {
        setBusy(true);
        try {
          if (onUnlock()) return;
        } finally {
          setBusy(false);
        }
      }}
    >
      ✨ Oltin kartochka — 🪙 {cost} Coin
    </Button>
  );
}
