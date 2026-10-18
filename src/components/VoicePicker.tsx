import { useEffect, useState } from 'react';
import { Chip, Button } from './ui';
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
      {voices.length === 0 ? (
        <p className="text-sm text-muted">Inglizcha ovoz topilmadi. Qurilma sozlamalaridan inglizcha ovoz yuklab olish mumkin (pastdagi maslahatga qarang).</p>
      ) : (
        <div>
          <label htmlFor="voice-select" className="text-sm font-semibold">Inglizcha ovoz</label>
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
