// "What's new" card — greets the learner after an update with the recent changes,
// told by Lingo. Shown once per version (settings.seenVersion), from the Dashboard.
import { useState } from 'react';
import { useApp } from '../store/store';
import { updateSettings } from '../store/actions';
import { APP_VERSION, WHATS_NEW } from '../lib/version';
// (first-run learners see IntroTour instead — it stamps seenVersion on finish)
import { haptic } from '../lib/telegram';
import { Emo, type EmoName } from './Emo';
import { Mascot } from './Mascot';
import { Button } from './ui';

export function WhatsNew() {
  const s = useApp();
  const [step, setStep] = useState(0);
  if (s.settings.seenVersion === APP_VERSION) return null;

  const item = WHATS_NEW[Math.min(step, WHATS_NEW.length - 1)];
  const last = step >= WHATS_NEW.length - 1;

  const close = () => {
    haptic('success');
    updateSettings({ seenVersion: APP_VERSION });
  };
  const next = () => {
    haptic('light');
    if (last) close();
    else setStep(step + 1);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-5" role="dialog" aria-modal="true" aria-label="Yangiliklar">
      <div className="pop-in w-full max-w-sm rounded-3xl bg-surface p-6 text-center shadow-2xl">
        <div className="flex items-center justify-center gap-2">
          <Mascot mood="wow" size={56} />
          <p className="text-left text-sm font-extrabold leading-snug">Lingo xabar beradi:<br />yangilanishlar bor! 🎉</p>
        </div>
        <div key={item.title} className="rise-in mt-4 rounded-2xl border border-line bg-surface2/60 p-4 text-left">
          <p className="flex items-center gap-2 font-extrabold"><Emo n={item.icon as EmoName} size={20} /> {item.title}</p>
          <p className="mt-1.5 text-[13px] font-semibold text-muted">{item.text}</p>
        </div>
        <div className="mt-3 flex items-center justify-center gap-1.5" aria-hidden>
          {WHATS_NEW.map((w, i) => (
            <span key={w.title} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-5 bg-accent' : 'w-1.5 bg-line'}`} />
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={close}>Keyinroq</Button>
          <Button className="flex-1" onClick={next}>{last ? 'Tushunarli!' : 'Keyingisi'}</Button>
        </div>
        <p className="mt-2 text-[11px] font-semibold text-muted">Versiya {APP_VERSION}</p>
      </div>
    </div>
  );
}
