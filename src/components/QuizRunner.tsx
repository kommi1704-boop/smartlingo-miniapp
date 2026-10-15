import { useState } from 'react';
import type { ContentKind, Quiz } from '../types';
import { finishQuiz, type QuizItemResult, type QuizOutcome } from '../store/actions';
import { Button, Card, ProgressBar, ProgressRing } from './ui';
import { Icon } from './Icon';
import { haptic } from '../lib/telegram';
import { cx } from '../lib/utils';

interface Props {
  title: string;
  questions: Quiz[];
  kind: ContentKind;
  lessonKey?: string;
  /** Called for every answered question (used by the vocabulary quiz to update spaced repetition). */
  onAnswer?: (q: Quiz, correct: boolean) => void;
  onExit?: () => void;
  exitLabel?: string;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export function QuizRunner({ title, questions, kind, lessonKey, onAnswer, onExit, exitLabel = 'Yopish' }: Props) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [items, setItems] = useState<QuizItemResult[]>([]);
  const [outcome, setOutcome] = useState<QuizOutcome | null>(null);

  const q = questions[idx];

  function choose(i: number) {
    if (picked !== null || !q) return;
    setPicked(i);
    const ok = i === q.answer;
    haptic(ok ? 'success' : 'error');
    onAnswer?.(q, ok);
    setItems((prev) => [...prev, { quiz: q, picked: i }]);
  }

  function next() {
    if (picked === null) return;
    if (idx + 1 < questions.length) {
      setIdx(idx + 1);
      setPicked(null);
    } else {
      setOutcome(finishQuiz({ kind, title, items, lessonKey }));
    }
  }

  function restart() {
    setIdx(0);
    setPicked(null);
    setItems([]);
    setOutcome(null);
  }

  if (outcome) {
    const ratio = outcome.total ? outcome.score / outcome.total : 0;
    const msg =
      ratio === 1 ? 'Mukammal! Barcha javoblar to‘g‘ri 🎉' : ratio >= 0.8 ? 'Juda yaxshi natija! 👏' : ratio >= 0.6 ? 'Yaxshi! Dars bajarildi ✅' : 'Hech qisi yo‘q — xatolar eng yaxshi ustoz. Qayta urinib ko‘ring 💪';
    return (
      <Card className="pop-in text-center">
        <div className="flex justify-center">
          <ProgressRing value={ratio * 100} size={110} stroke={11}>
            <div>
              <div className="text-2xl font-extrabold">{outcome.score}/{outcome.total}</div>
              <div className="text-[11px] text-muted">to‘g‘ri</div>
            </div>
          </ProgressRing>
        </div>
        <p className="mt-3 text-lg font-bold">{msg}</p>
        <p className="mt-1 text-sm text-muted">
          +{outcome.xp} XP{outcome.firstCompletion ? ' (birinchi marta bajarildi uchun bonus bilan)' : ''}
          {outcome.mistakes > 0 && ` · ${outcome.mistakes} ta xato “Xatolar daftari”ga saqlandi`}
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button variant="secondary" icon="refresh" onClick={restart}>Qayta urinish</Button>
          {onExit && <Button onClick={onExit}>{exitLabel}</Button>}
        </div>
      </Card>
    );
  }

  if (!q) return null;

  return (
    <div className="slide-up">
      <div className="mb-3 flex items-center gap-3">
        <span className="text-sm font-semibold text-muted">Savol {idx + 1}/{questions.length}</span>
        <ProgressBar value={((idx + (picked !== null ? 1 : 0)) / questions.length) * 100} className="flex-1" label="Test jarayoni" />
      </div>
      <Card>
        <p className="text-lg font-bold leading-snug">{q.q}</p>
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
                  show && isCorrect && 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-100',
                  show && isPicked && !isCorrect && 'border-rose-500 bg-rose-50 text-rose-900 dark:bg-rose-500/15 dark:text-rose-100',
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
      <div className="mt-4 flex justify-end">
        <Button onClick={next} disabled={picked === null}>
          {idx + 1 < questions.length ? 'Keyingi savol' : 'Natijani ko‘rish'}
        </Button>
      </div>
    </div>
  );
}
