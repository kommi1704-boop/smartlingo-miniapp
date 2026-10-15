import { useEffect } from 'react';
import { dismissCelebration, useUI } from '../store/ui';
import { Button } from './ui';
import { haptic } from '../lib/telegram';
import { cx } from '../lib/utils';

export function Overlays() {
  const { toasts, celebrations } = useUI();
  const current = celebrations[0];

  useEffect(() => {
    if (current) haptic('success');
  }, [current]);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-4" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cx(
              'slide-up rounded-2xl px-4 py-2.5 text-sm font-semibold shadow-lg',
              t.kind === 'success' ? 'bg-emerald-600 text-white' : t.kind === 'warn' ? 'bg-amber-500 text-white' : 'bg-ink text-app',
            )}
          >
            {t.text}
          </div>
        ))}
      </div>
      {current && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-5" role="dialog" aria-modal="true" aria-label={current.title}>
          <div className="pop-in w-full max-w-sm rounded-3xl bg-surface p-6 text-center shadow-2xl">
            <div className="bounce-soft text-6xl">{current.emoji}</div>
            <h2 className="mt-3 text-xl font-extrabold">{current.title}</h2>
            <p className="mt-1.5 text-sm text-muted">{current.text}</p>
            {celebrations.length > 1 && <p className="mt-2 text-xs text-muted">Yana {celebrations.length - 1} ta yangilik bor</p>}
            <Button className="mt-5" full onClick={dismissCelebration} autoFocus>
              Ajoyib!
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
