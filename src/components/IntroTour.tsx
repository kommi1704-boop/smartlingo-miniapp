// First-run intro tour — Lingo personally walks a new learner through the app.
// Shown once (settings.introDone) right after onboarding, from the Dashboard.
import { useState } from 'react';
import { useApp } from '../store/store';
import { updateSettings } from '../store/actions';
import { haptic } from '../lib/telegram';
import { navigate } from '../lib/router';
import { APP_VERSION } from '../lib/version';
import { Emo } from './Emo';
import { Mascot, type Mood } from './Mascot';
import { Button } from './ui';

interface TourStep {
  mood: Mood;
  title: string;
  text: string;
  action?: { label: string; path: string };
}

const STEPS: TourStep[] = [
  {
    mood: 'wow',
    title: 'Salom! Men Lingoman 🤖',
    text: 'Sizning shaxsiy ingliz tili safaringizdagi yo‘ldoshim. Bir necha soniyada ilovaning asosiy joylarini ko‘rsataman — tayyormisiz?',
  },
  {
    mood: 'happy',
    title: 'Kunlik safari',
    text: 'Har kuni shu yerdan BOSHINGIZ: bitta «safar» — kashfiyot, yangi so‘zlar, mini-o‘yin. 15–25 daqiqa. Safarni tugatsangiz, seriyangiz o‘sadi! 🔥',
    action: { label: 'Safarni ko‘rish', path: '/journey' },
  },
  {
    mood: 'cheer',
    title: 'O‘yinlar va janglar',
    text: 'O‘yinlar Coin yig‘ishning eng tez yo‘li. Jangda esa do‘stlaringiz bilan bellashasiz — g‘olibga reyting va Coin! Do‘konda Coinlaringizni avatarga, ramkaga va hatto o‘z rasm-foningizga almashtirasiz.',
    action: { label: 'Do‘konni ko‘rish', path: '/shop' },
  },
  {
    mood: 'proud',
    title: 'Reyting va chempionat',
    text: 'Har hafta XP yig‘ib, chempionatda 1–3 o‘rinni olsangiz — Coin va maxsus chempion ramkasi sizniki. Men har kuni ilovani ochganingizda sizni kutib olaman. Keling, boshlaymiz! 🚀',
    action: { label: 'Boshlash!', path: '/' },
  },
];

export function IntroTour() {
  const s = useApp();
  const [step, setStep] = useState(0);
  if (s.settings.introDone !== false) return null;

  const cur = STEPS[Math.min(step, STEPS.length - 1)];
  const last = step >= STEPS.length - 1;

  const finish = () => {
    haptic('success');
    // new learners skip the separate "what's new" card — the tour already told them
    updateSettings({ introDone: true, seenVersion: APP_VERSION });
  };
  const next = () => {
    haptic('light');
    if (last) finish();
    else setStep(step + 1);
  };

  return (
    <div className="fixed inset-0 z-[85] flex items-end justify-center bg-black/60 p-5 pb-10" role="dialog" aria-modal="true" aria-label="Tanishuv">
      <div className="pop-in w-full max-w-sm rounded-3xl bg-surface p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <Mascot mood={cur.mood} size={84} />
          <div className="min-w-0 flex-1 pt-1">
            <p className="text-[11px] font-black uppercase tracking-widest text-muted">Lingo bilan tanishuv · {step + 1}/{STEPS.length}</p>
            <h2 key={cur.title} className="rise-in mt-1 text-lg font-black leading-tight">{cur.title}</h2>
          </div>
        </div>
        <p key={cur.text} className="rise-in mt-3 text-[14px] font-semibold leading-relaxed text-muted">{cur.text}</p>
        <div className="mt-4 flex gap-2">
          {cur.action && !last && (
            <Button variant="secondary" className="flex-1" onClick={() => { haptic('light'); navigate(cur.action!.path); finish(); }}>
              {cur.action.label}
            </Button>
          )}
          <Button className="flex-1" onClick={next}>{last ? 'Keling, boshlaymiz!' : 'Davom etish'}</Button>
        </div>
        <button type="button" className="mt-3 w-full text-center text-xs font-bold text-muted" onClick={finish}>
          O‘tkazib yuborish
        </button>
        <p className="mt-2 flex items-center justify-center gap-1 text-[11px] font-semibold text-muted" aria-hidden>
          <Emo n="sparkle" size={12} /> Keyin bu sayohat sizniki!
        </p>
      </div>
    </div>
  );
}
