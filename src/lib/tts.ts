// Browser/device text-to-speech (Web Speech API). This is NOT recorded audio:
// it is the device's synthetic voice reading English text. Quality depends on the voices installed
// on the phone/computer, so the app ranks the available English voices, lets the learner choose one,
// and plays text sentence by sentence (more reliable and easier to follow than one long utterance).

export function ttsAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

// ---------------------------------------------------------------- preferences (device-local)

const PREF_KEY = 'smartlingo:tts';

export interface TtsPrefs {
  voiceURI?: string; // undefined = automatic (best voice found)
  rate: number; // 0.5 .. 1.2
}

export const RATE_SLOW = 0.6;
export const RATE_NORMAL = 0.8;
export const RATE_FAST = 1;

const DEFAULT_PREFS: TtsPrefs = { rate: RATE_NORMAL };
let prefs: TtsPrefs | null = null;
const prefListeners = new Set<() => void>();

export function getPrefs(): TtsPrefs {
  if (prefs) return prefs;
  try {
    const raw = window.localStorage.getItem(PREF_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<TtsPrefs>) : {};
    prefs = {
      voiceURI: typeof parsed.voiceURI === 'string' ? parsed.voiceURI : undefined,
      rate: typeof parsed.rate === 'number' && parsed.rate >= 0.4 && parsed.rate <= 1.3 ? parsed.rate : DEFAULT_PREFS.rate,
    };
  } catch {
    prefs = { ...DEFAULT_PREFS };
  }
  return prefs;
}

export function setPrefs(patch: Partial<TtsPrefs>): void {
  prefs = { ...getPrefs(), ...patch };
  try {
    window.localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
  } catch {
    /* storage blocked: preference lives only until the page closes */
  }
  prefListeners.forEach((l) => l());
}

export function onPrefsChange(l: () => void): () => void {
  prefListeners.add(l);
  return () => {
    prefListeners.delete(l);
  };
}

// ---------------------------------------------------------------- voice ranking

export interface VoiceChoice {
  uri: string;
  name: string;
  lang: string;
  score: number;
  gender: 'f' | 'm' | '?';
  voice: SpeechSynthesisVoice;
}

// Novelty / robotic voices that are hard to understand.
const BAD = /espeak|zarvox|fred\b|albert|bad news|good news|bahh|bells|boing|bubbles|cellos|deranged|hysterical|junior|kathy|organ|princess|ralph|trinoids|whisper|wobble|superstar|jester|grandma|grandpa|rocko|eddy|flo\b|reed|sandy|shelley/i;
// Voices known to sound natural on common platforms.
const GOOD = /natural|neural|enhanced|premium|siri|samantha|daniel|karen|moira|serena|\bava\b|allison|susan|tessa|google (us|uk|united)|aria|jenny|\bguy\b|sonia|ryan|libby|\bmia\b|\balex\b|oliver|arthur|martha|nicky|stephanie/i;
const FEMALE = /samantha|karen|moira|serena|\bava\b|allison|susan|tessa|aria|jenny|sonia|libby|\bmia\b|female|zira|hazel|victoria|fiona|joanna|kendra|salli|kimberly|ivy|nicky|martha|stephanie/i;
const MALE = /daniel|\balex\b|\bguy\b|ryan|david|\bmark\b|george|thomas|\bmale\b|oliver|arthur|james|richard|brian|matthew|justin|joey/i;

function scoreVoice(v: SpeechSynthesisVoice): number {
  const lang = v.lang.replace('_', '-').toLowerCase();
  if (!lang.startsWith('en')) return -1000;
  let s = 0;
  if (lang === 'en-us') s += 20;
  else if (lang === 'en-gb') s += 18;
  else if (lang === 'en-au') s += 8;
  else if (lang === 'en-in') s += 4;
  const n = v.name;
  if (BAD.test(n)) s -= 100;
  if (GOOD.test(n)) s += 40;
  if (/natural|neural|online/i.test(n)) s += 30;
  if (/enhanced|premium/i.test(n)) s += 20;
  if (/google/i.test(n)) s += 15;
  if (v.default) s += 3;
  return s;
}

function genderOf(name: string): 'f' | 'm' | '?' {
  if (FEMALE.test(name)) return 'f';
  if (MALE.test(name)) return 'm';
  return '?';
}

let voicesReady: Promise<SpeechSynthesisVoice[]> | null = null;

/** Voices load asynchronously in most browsers; resolves with whatever the device offers (maybe empty). */
export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!ttsAvailable()) return Promise.resolve([]);
  if (voicesReady) return voicesReady;
  voicesReady = new Promise((resolve) => {
    const synth = window.speechSynthesis;
    const now = synth.getVoices();
    if (now.length) return resolve(now);
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      synth.removeEventListener?.('voiceschanged', finish);
      resolve(synth.getVoices());
    };
    synth.addEventListener?.('voiceschanged', finish);
    setTimeout(finish, 1500);
  });
  // allow a later retry when the first load found nothing
  voicesReady.then((v) => {
    if (!v.length) voicesReady = null;
  });
  return voicesReady;
}

export function englishVoices(): VoiceChoice[] {
  if (!ttsAvailable()) return [];
  let list: SpeechSynthesisVoice[] = [];
  try {
    list = window.speechSynthesis.getVoices();
  } catch {
    return [];
  }
  const seen = new Set<string>();
  return list
    .map((v) => ({ uri: v.voiceURI, name: v.name, lang: v.lang.replace('_', '-'), score: scoreVoice(v), gender: genderOf(v.name), voice: v }))
    .filter((c) => c.score > -500 && !seen.has(c.uri) && !!seen.add(c.uri))
    .sort((a, b) => b.score - a.score);
}

/** The voice used for narration (the learner's choice, otherwise the best-ranked one). */
export function primaryVoice(): VoiceChoice | undefined {
  const all = englishVoices();
  const chosen = getPrefs().voiceURI;
  return (chosen && all.find((c) => c.uri === chosen)) || all[0];
}

/** A second, different voice for the second speaker of a dialogue (prefers the opposite gender). */
export function secondVoice(first: VoiceChoice | undefined): VoiceChoice | undefined {
  if (!first) return undefined;
  const all = englishVoices().filter((c) => c.uri !== first.uri && c.score > -50);
  if (!all.length) return undefined;
  const top = all[0].score;
  const close = all.filter((c) => c.score >= top - 35);
  return close.find((c) => first.gender !== '?' && c.gender !== '?' && c.gender !== first.gender) ?? close.find((c) => c.gender === '?' || c.gender !== first.gender) ?? close[0];
}

// ---------------------------------------------------------------- playback

let session = 0; // bumping this cancels any running chain

export function stopSpeaking(): void {
  session++;
  if (!ttsAvailable()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}

interface Chunk {
  text: string;
  line: number;
  role: 0 | 1;
}

function splitSentences(text: string): string[] {
  const parts = text.match(/[^.!?]+[.!?]*["”’']?\s*/g) ?? [text];
  const out: string[] = [];
  for (const p of parts) {
    const t = p.trim();
    if (!t) continue;
    if (t.length <= 180) out.push(t);
    else t.split(/,\s+/).forEach((x, i, a) => out.push(i < a.length - 1 ? `${x},` : x));
  }
  return out.length ? out : [text];
}

function utter(text: string, voice: VoiceChoice | undefined, rate: number, pitch: number, onEnd: () => void, onError: () => void): boolean {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = voice?.lang ?? 'en-US';
    if (voice) u.voice = voice.voice;
    u.rate = rate;
    u.pitch = pitch;
    u.volume = 1;
    u.onend = onEnd;
    u.onerror = (e: SpeechSynthesisErrorEvent) => {
      // "canceled"/"interrupted" are normal when the learner stops or restarts playback
      if (e.error === 'canceled' || e.error === 'interrupted') return;
      onError();
    };
    window.speechSynthesis.resume?.();
    window.speechSynthesis.speak(u);
    return true;
  } catch {
    return false;
  }
}

/** Speaks one short text (a word or sentence) with the learner's chosen voice and speed. */
export function speak(text: string, opts: { rate?: number; onEnd?: () => void; onError?: () => void } = {}): boolean {
  if (!ttsAvailable()) return false;
  stopSpeaking();
  const my = ++session;
  const voice = primaryVoice();
  const rate = opts.rate ?? getPrefs().rate;
  const chunks = splitSentences(text);
  const step = (i: number) => {
    if (my !== session) return;
    if (i >= chunks.length) return opts.onEnd?.();
    const ok = utter(chunks[i], voice, rate, 1, () => step(i + 1), () => opts.onError?.());
    if (!ok) opts.onError?.();
  };
  step(0);
  return true;
}

export interface DialogueLine {
  /** Text to speak (speaker label removed). */
  text: string;
  /** 0 or 1: which speaker voice to use. */
  role: 0 | 1;
}

/** Splits a transcript into lines; dialogue lines ("Name: text") get a speaker role. */
export function parseTranscript(transcript: string): { display: string; speak: string; role: 0 | 1 }[] {
  const speakers = new Map<string, 0 | 1>();
  return transcript
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^([A-Z][A-Za-z .'-]{0,20}):\s*(.+)$/);
      if (!m) return { display: line, speak: line, role: 0 as const };
      if (!speakers.has(m[1])) speakers.set(m[1], (speakers.size % 2) as 0 | 1);
      return { display: line, speak: m[2], role: speakers.get(m[1])! };
    });
}

export interface PlayOpts {
  rate?: number;
  startAt?: number;
  onLine?: (i: number) => void;
  onEnd: () => void;
}

/**
 * Reads the lines one after another (each sentence is a separate utterance, which stays reliable on
 * mobile browsers). Dialogue speakers use two different voices when the device has them; with a single
 * voice only a small pitch change is used so the speech stays clear.
 */
export function playLines(lines: DialogueLine[], opts: PlayOpts): boolean {
  if (!ttsAvailable()) return false;
  stopSpeaking();
  const my = ++session;
  const rate = opts.rate ?? getPrefs().rate;
  const v0 = primaryVoice();
  const v1 = secondVoice(v0);
  const chunks: Chunk[] = [];
  lines.forEach((l, line) => splitSentences(l.text).forEach((text) => chunks.push({ text, line, role: l.role })));
  const start = Math.max(0, chunks.findIndex((c) => c.line >= (opts.startAt ?? 0)));
  let lastLine = -1;

  const step = (i: number) => {
    if (my !== session) return;
    if (i >= chunks.length) return opts.onEnd();
    const c = chunks[i];
    if (c.line !== lastLine) {
      lastLine = c.line;
      opts.onLine?.(c.line);
    }
    const voice = c.role === 1 && v1 ? v1 : v0;
    const pitch = c.role === 1 && !v1 ? 1.12 : c.role === 0 && !v1 && lines.some((l) => l.role === 1) ? 0.96 : 1;
    const nextIsNewLine = !chunks[i + 1] || chunks[i + 1].line !== c.line;
    const ok = utter(
      c.text,
      voice,
      rate,
      pitch,
      () => {
        if (my === session) setTimeout(() => step(i + 1), nextIsNewLine ? 420 : 120);
      },
      () => {
        if (my === session) opts.onEnd();
      },
    );
    if (!ok) opts.onEnd();
  };
  step(start < 0 ? 0 : start);
  return true;
}
