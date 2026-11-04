// Optional "natural voice": Kokoro, a small open-source (Apache-2.0) English text-to-speech model that
// runs entirely on the learner's own device through WebAssembly. Nothing is sent to a server and it is free.
//
// How it is wired (on purpose):
// - The library is loaded from a CDN only when the learner taps "download", so the normal app bundle,
//   package.json and build are not affected at all.
// - The model files are downloaded once (about 90 MB) and then cached by the browser.
// - If anything fails (offline, weak phone, blocked CDN) the app falls back to the device voice.

export type NeuralStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface NeuralState {
  status: NeuralStatus;
  /** 0..100 while downloading. */
  percent: number;
  /** Megabytes downloaded so far (best effort). */
  mb: number;
  error?: string;
}

export interface NeuralVoice {
  id: string;
  label: string;
  desc: string;
  gender: 'f' | 'm';
}

export const NEURAL_VOICES: NeuralVoice[] = [
  { id: 'af_heart', label: 'Heart', desc: 'ayol · amerikacha', gender: 'f' },
  { id: 'bf_emma', label: 'Emma', desc: 'ayol · britancha', gender: 'f' },
  { id: 'am_michael', label: 'Michael', desc: 'erkak · amerikacha', gender: 'm' },
  { id: 'bm_george', label: 'George', desc: 'erkak · britancha', gender: 'm' },
];

const MODEL_ID = 'onnx-community/Kokoro-82M-v1.0-ONNX';
// Tried in this order. Both serve the same npm package as a ready-made browser module.
const SOURCES = ['https://esm.sh/kokoro-js@1.2.0', 'https://cdn.jsdelivr.net/npm/kokoro-js@1.2.0/+esm'];

let state: NeuralState = { status: 'idle', percent: 0, mb: 0 };
const listeners = new Set<() => void>();
function setState(patch: Partial<NeuralState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}
export function getNeural(): NeuralState {
  return state;
}
export function onNeural(l: () => void): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function neuralSupported(): boolean {
  return typeof window !== 'undefined' && typeof WebAssembly !== 'undefined' && typeof Audio !== 'undefined';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let engine: any = null;
let loading: Promise<void> | null = null;

async function importLib() {
  let last: unknown;
  for (const src of SOURCES) {
    try {
      // The URL is a variable on purpose: the bundler must not try to resolve it at build time.
      const mod = await import(/* @vite-ignore */ src);
      const K = mod?.KokoroTTS ?? mod?.default?.KokoroTTS;
      if (K) return K;
      last = new Error('KokoroTTS topilmadi');
    } catch (e) {
      last = e;
    }
  }
  throw last instanceof Error ? last : new Error('Kutubxonani yuklab bo‘lmadi');
}

/** Downloads (first time) or loads from the browser cache (later) the voice model. Safe to call many times. */
export function loadNeural(): Promise<void> {
  if (state.status === 'ready') return Promise.resolve();
  if (loading) return loading;
  if (!neuralSupported()) {
    setState({ status: 'error', error: 'Bu qurilma tabiiy ovozni qo‘llamaydi.' });
    return Promise.reject(new Error('unsupported'));
  }
  setState({ status: 'loading', percent: 0, mb: 0, error: undefined });
  const files = new Map<string, { loaded: number; total: number }>();
  loading = (async () => {
    const KokoroTTS = await importLib();
    engine = await KokoroTTS.from_pretrained(MODEL_ID, {
      dtype: 'q8',
      device: 'wasm',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      progress_callback: (p: any) => {
        if (!p || typeof p !== 'object') return;
        if (p.status === 'progress' && typeof p.file === 'string') {
          files.set(p.file, { loaded: Number(p.loaded) || 0, total: Number(p.total) || 0 });
          let l = 0;
          let t = 0;
          files.forEach((v) => {
            l += v.loaded;
            t += v.total;
          });
          setState({ percent: t > 0 ? Math.min(99, Math.round((l / t) * 100)) : state.percent, mb: Math.round(l / 1e5) / 10 });
        }
      },
    });
    setState({ status: 'ready', percent: 100 });
  })().catch((e: unknown) => {
    engine = null;
    loading = null;
    setState({ status: 'error', error: e instanceof Error ? e.message : 'Yuklab bo‘lmadi' });
    throw e;
  });
  return loading;
}

// ---------------------------------------------------------------- synthesis (one at a time)

let epoch = 0; // bumping this drops all queued work
let queue: Promise<unknown> = Promise.resolve();
const cache = new Map<string, Promise<Blob | null>>();

function wavFromFloat32(data: Float32Array, rate: number): Blob {
  const buf = new ArrayBuffer(44 + data.length * 2);
  const v = new DataView(buf);
  const w = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i));
  };
  w(0, 'RIFF');
  v.setUint32(4, 36 + data.length * 2, true);
  w(8, 'WAVE');
  w(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, rate, true);
  v.setUint32(28, rate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  w(36, 'data');
  v.setUint32(40, data.length * 2, true);
  for (let i = 0; i < data.length; i++) {
    const s = Math.max(-1, Math.min(1, data[i]));
    v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buf], { type: 'audio/wav' });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toBlob(a: any): Blob {
  const data: unknown = a?.audio ?? a?.data;
  const rate: number = a?.sampling_rate ?? a?.sampleRate ?? 24000;
  if (data instanceof Float32Array) return wavFromFloat32(data, rate);
  if (typeof a?.toBlob === 'function') return a.toBlob();
  if (typeof a?.toWav === 'function') return new Blob([a.toWav()], { type: 'audio/wav' });
  throw new Error('Audio formati tanilmadi');
}

/** Starts (or reuses) the generation of one piece of text. Resolves with null if playback was stopped meanwhile. */
export function neuralSynth(text: string, voice: string): Promise<Blob | null> {
  const key = `${voice}|${text}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const mine = epoch;
  const p = new Promise<Blob | null>((resolve, reject) => {
    queue = queue.then(async () => {
      if (mine !== epoch || !engine) {
        cache.delete(key);
        return resolve(null);
      }
      try {
        const audio = await engine.generate(text, { voice });
        resolve(toBlob(audio));
      } catch (e) {
        cache.delete(key);
        reject(e);
      }
    });
  });
  cache.set(key, p);
  if (cache.size > 40) cache.delete(cache.keys().next().value as string);
  p.catch(() => undefined);
  return p;
}

// ---------------------------------------------------------------- playback

let el: HTMLAudioElement | null = null;
let url: string | null = null;
// 0.05 s of silence. Played inside the tap so mobile browsers allow later playback.
const SILENCE = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';

function audioEl(): HTMLAudioElement {
  if (!el) {
    el = new Audio();
    el.preload = 'auto';
  }
  return el;
}

/** Call synchronously from a tap/click handler before any async work (needed on iPhone). */
export function unlockAudio(): void {
  try {
    const a = audioEl();
    if (!a.src) {
      a.src = SILENCE;
      void a.play().catch(() => undefined);
    }
  } catch {
    /* ignore */
  }
}

/** Slider value used by the app (0.6 slow … 1 fast) -> playback speed of the natural voice. */
function speedFor(rate: number): number {
  return Math.max(0.7, Math.min(1.2, 0.55 + rate * 0.5));
}

export function neuralStop(): void {
  epoch++;
  try {
    el?.pause();
  } catch {
    /* ignore */
  }
}

function play(blob: Blob, rate: number, onEnd: () => void, onError: (soft?: boolean) => void) {
  const a = audioEl();
  if (url) URL.revokeObjectURL(url);
  url = URL.createObjectURL(blob);
  a.onended = () => onEnd();
  a.onerror = () => onError();
  a.src = url;
  a.playbackRate = speedFor(rate);
  // keep the voice pitch natural when the speed changes
  (a as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch = true;
  a.play().catch((e: unknown) => {
    const name = (e as { name?: string } | null)?.name;
    if (name === 'AbortError') return; // a newer sound replaced this one: normal
    onError(name === 'NotAllowedError'); // blocked by the browser: use the device voice once, keep natural voice enabled
  });
}

/** Speaks one piece of text with the natural voice. `isCurrent` lets the caller cancel quietly. */
export function neuralSay(text: string, voice: string, rate: number, isCurrent: () => boolean, onEnd: () => void, onError: (soft?: boolean) => void): void {
  neuralSynth(text, voice)
    .then((blob) => {
      if (!blob || !isCurrent()) return;
      play(blob, rate, onEnd, onError);
    })
    .catch(() => {
      if (isCurrent()) onError();
    });
}

/** Start generating the next sentence while the current one is playing (hides the waiting time). */
export function neuralPrefetch(text: string | undefined, voice: string): void {
  if (text) void neuralSynth(text, voice).catch(() => undefined);
}

/** After a failure the app uses the device voice again until the learner retries. */
export function neuralFailed(message?: string): void {
  setState({ status: 'error', error: message ?? 'Tabiiy ovoz ishlamadi, qurilma ovozi ishlatilmoqda.' });
  engine = null;
  loading = null;
  neuralStop();
}
