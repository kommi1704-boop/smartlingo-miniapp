// Browser/device text-to-speech (Web Speech API). This is NOT recorded audio:
// it is the device's synthetic voice reading English text. Availability varies by device.

export function ttsAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

function pickVoice(): SpeechSynthesisVoice | undefined {
  try {
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find((v) => v.lang === 'en-US') ||
      voices.find((v) => v.lang === 'en-GB') ||
      voices.find((v) => v.lang.toLowerCase().startsWith('en'))
    );
  } catch {
    return undefined;
  }
}

export function stopSpeaking(): void {
  if (!ttsAvailable()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}

export interface SpeakOpts {
  rate?: number;
  pitch?: number;
  onEnd?: () => void;
  onError?: () => void;
}

export function speak(text: string, opts: SpeakOpts = {}): boolean {
  if (!ttsAvailable()) return false;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = opts.rate ?? 0.9;
    u.pitch = opts.pitch ?? 1;
    const v = pickVoice();
    if (v) u.voice = v;
    u.onend = () => opts.onEnd?.();
    u.onerror = () => opts.onError?.();
    window.speechSynthesis.speak(u);
    return true;
  } catch {
    return false;
  }
}

/** Reads a transcript line by line. Dialogue lines ("Name: text") get a slightly different pitch per speaker. */
export function speakTranscript(transcript: string, rate: number, onEnd: () => void): boolean {
  if (!ttsAvailable()) return false;
  stopSpeaking();
  const lines = transcript.split('\n').map((l) => l.trim()).filter(Boolean);
  const speakers = new Map<string, number>();
  let ok = false;
  lines.forEach((line, i) => {
    const m = line.match(/^([A-Z][A-Za-z ]{0,20}):\s*(.+)$/);
    let text = line;
    let pitch = 1;
    if (m) {
      const name = m[1];
      if (!speakers.has(name)) speakers.set(name, speakers.size);
      pitch = speakers.get(name)! % 2 === 0 ? 0.9 : 1.25;
      text = m[2];
    }
    const last = i === lines.length - 1;
    const started = speak(text, { rate, pitch, onEnd: last ? onEnd : undefined, onError: last ? onEnd : undefined });
    ok = ok || started;
  });
  if (!ok) onEnd();
  return ok;
}
