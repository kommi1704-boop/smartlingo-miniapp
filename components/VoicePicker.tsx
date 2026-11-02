import { useEffect, useState } from 'react';
import { Chip, Button } from './ui';
import { NEURAL_VOICES, getNeural, loadNeural, neuralSupported, onNeural, type NeuralState } from '../lib/neural';
import {
  RATE_FAST, RATE_NORMAL, RATE_SLOW, englishVoices, getPrefs, loadVoices, onPrefsChange, primaryVoice, setPrefs, speak, stopSpeaking, ttsAvailable, type VoiceChoice,
} from '../lib/tts';

/** Re-renders when voices finish loading or the preferences change. */
export function useVoices(): { voices: VoiceChoice[]; prefs: ReturnType<typeof getPrefs>; best?: VoiceChoice } {
  const [, force] = useState(0);
  useEffect(() => {
    let alive = true;
    loadVoices().then(() => alive && force((n) => n + 1));
    const off = onPrefsChange(() => force((n) => n + 1));
    return () => {
      alive = false;
      off();
    };
  }, []);
  return { voices: englishVoices(), prefs: getPrefs(), best: primaryVoice() };
}

export function useNeural(): NeuralState {
  const [, force] = useState(0);
  useEffect(() => onNeural(() => force((n) => n + 1)), []);
  return getNeural();
}

/** Optional natural voice (downloaded once, runs on the device). Falls back to the device voice on any problem. */
function NaturalVoice({ compact }: { compact?: boolean }) {
  const n = useNeural();
  const { prefs } = useVoices();
  if (!neuralSupported()) return null;
  const on = prefs.engine === 'natural' && n.status === 'ready';

  async function enable() {
    try {
      await loadNeural();
      setPrefs({ engine: 'natural' });
    } catch {
      /* the error is shown below */
    }
  }

  return (
    <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/60 p-3 dark:border-indigo-400/30 dark:bg-indigo-500/10">
      <p className="flex items-center gap-1.5 text-sm font-bold">✨ Tabiiy ovoz <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">SINOV</span></p>
      {!compact && (
        <p className="mt-1 text-xs text-muted">
          Telefon ovozi yoqmasa, bepul tabiiyroq ovozni yoqing. U bir marta yuklab olinadi (taxminan 90 MB, Wi‑Fi tavsiya etiladi), keyin internetsiz ishlaydi. Faqat inglizcha. Eski telefonlarda sekin bo‘lishi mumkin.
        </p>
      )}

      {n.status === 'loading' ? (
        <div className="mt-2" role="status" aria-live="polite">
          <div className="h-2.5 overflow-hidden rounded-full bg-indigo-100 dark:bg-indigo-500/20">
            <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${Math.max(4, n.percent)}%` }} />
          </div>
          <p className="mt-1 text-xs text-muted">Yuklanmoqda… {n.percent}% {n.mb ? `(${n.mb} MB)` : ''}. Sahifani yopmang.</p>
        </div>
      ) : on ? (
        <div className="mt-2 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {NEURAL_VOICES.map((v) => (
              <Chip key={v.id} active={prefs.nVoice === v.id} onClick={() => { setPrefs({ nVoice: v.id }); speak('Hello! My name is Lingo. Today we will practise English together.'); }}>
                {v.label} · {v.desc}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" icon="volume" onClick={() => speak('Hello! My name is Lingo. Today we will practise English together.')}>Sinash</Button>
            <Button size="sm" variant="ghost" onClick={() => { stopSpeaking(); setPrefs({ engine: 'device' }); }}>Telefon ovoziga qaytish</Button>
          </div>
        </div>
      ) : (
        <div className="mt-2 space-y-1.5">
          <Button size="sm" onClick={enable}>{n.status === 'error' ? 'Qayta urinish' : prefs.engine === 'natural' ? 'Tabiiy ovozni yuklash' : 'Yuklab olish va yoqish'}</Button>
          {n.status === 'error' && (
            <p className="text-xs text-rose-700 dark:text-rose-300">
              Tabiiy ovoz ishlamadi{n.error ? ` (${n.error})` : ''}. Hozircha telefon ovozi ishlatiladi. Internetni tekshirib, qayta urinib ko‘ring.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export const SPEEDS: { label: string; rate: number }[] = [
  { label: '🐢 Sekin', rate: RATE_SLOW },
  { label: 'Oddiy', rate: RATE_NORMAL },
  { label: '🐇 Tez', rate: RATE_FAST },
];

/** Speed chips (used on the listening page and in settings). */
export function SpeedChips({ rate, onChange }: { rate: number; onChange: (r: number) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {SPEEDS.map((x) => (
        <Chip key={x.rate} active={Math.abs(rate - x.rate) < 0.05} onClick={() => onChange(x.rate)}>{x.label}</Chip>
      ))}
    </div>
  );
}

/** Voice + speed chooser with a test button. The voice list depends on the device. */
export function VoicePicker({ compact }: { compact?: boolean }) {
  const { voices: all, prefs, best } = useVoices();
  // hide novelty / robotic voices unless they are all the device has (or the learner already picked one)
  const decent = all.filter((v) => v.score > -50 || v.uri === prefs.voiceURI);
  const voices = decent.length ? decent : all;
  if (!ttsAvailable()) return <p className="text-sm text-muted">Bu qurilma matnni ovoz chiqarib o‘qishni qo‘llamaydi.</p>;

  return (
    <div className="space-y-3">
      <NaturalVoice compact={compact} />
      {voices.length === 0 ? (
        <p className="text-sm text-muted">Inglizcha ovoz topilmadi. Qurilma sozlamalaridan inglizcha ovoz yuklab olish mumkin (pastdagi maslahatga qarang).</p>
      ) : (
        <div className={prefs.engine === 'natural' ? 'opacity-60' : undefined}>
          <label htmlFor="voice-select" className="text-sm font-semibold">Inglizcha ovoz (telefon ovozi){prefs.engine === 'natural' ? ' — hozir tabiiy ovoz yoqilgan' : ''}</label>
          <select
            id="voice-select"
            value={prefs.voiceURI ?? ''}
            onChange={(e) => {
              setPrefs({ voiceURI: e.target.value || undefined });
              speak('Hello! This is my voice. Can you understand me?');
            }}
            className="mt-1.5 w-full rounded-2xl border-2 border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
          >
            <option value="">Avto — eng yaxshisi{best ? ` (${best.name})` : ''}</option>
            {voices.slice(0, 20).map((v) => (
              <option key={v.uri} value={v.uri}>{v.name} · {v.lang}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <p className="text-sm font-semibold">Tezlik</p>
        <div className="mt-1.5"><SpeedChips rate={prefs.rate} onChange={(r) => setPrefs({ rate: r })} /></div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="secondary" icon="volume" onClick={() => speak('Hello! My name is Lingo. Today we will practise English together.')}>Ovozni sinash</Button>
        <Button size="sm" variant="ghost" onClick={() => stopSpeaking()}>To‘xtatish</Button>
      </div>

      {!compact && (
        <details className="rounded-2xl bg-surface2 p-3 text-sm">
          <summary className="cursor-pointer font-semibold">Ovoz tushunarsiz yoki robotga o‘xshaydimi?</summary>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-muted">
            <li>Yuqoridagi ro‘yxatdan boshqa ovozni tanlab ko‘ring va “Sekin” tezlikni yoqing.</li>
            <li>Ovoz sifati qurilmaga bog‘liq: bu dastur yozib olingan inson ovozini emas, telefon yoki kompyuterning o‘z ovozini ishlatadi.</li>
            <li>Telefon sozlamalarida (Til yoki Maxsus imkoniyatlar bo‘limida “Ovozli o‘qish / Text-to-speech / Spoken Content”) yaxshiroq inglizcha ovoz yuklab oling. Ko‘pincha “Enhanced”, “Premium” yoki “Natural” deb belgilanadi.</li>
            <li>Kompyuterda Microsoft Edge brauzeri odatda “Natural” nomli sifatli ovozlarni beradi.</li>
            <li>Har doim matnni (transkript) o‘qib, qurilma ovozi bilan solishtirib tinglang.</li>
          </ul>
        </details>
      )}
    </div>
  );
}
