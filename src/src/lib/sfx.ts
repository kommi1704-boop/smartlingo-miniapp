// Tiny feedback sounds made with the Web Audio API (no audio files). Can be switched off in Settings.
import { getState } from '../store/store';

type Kind = 'correct' | 'wrong' | 'levelup' | 'pop';

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  try {
    if (!ctx) {
      const C = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(c: AudioContext, freq: number, at: number, dur: number, type: OscillatorType, gain: number) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  const t0 = c.currentTime + at;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

export function playSfx(kind: Kind): void {
  if (!getState().settings.sound) return;
  const c = audio();
  if (!c) return;
  try {
    if (kind === 'correct') {
      tone(c, 659, 0, 0.14, 'sine', 0.12);
      tone(c, 880, 0.1, 0.2, 'sine', 0.12);
    } else if (kind === 'wrong') {
      tone(c, 247, 0, 0.16, 'triangle', 0.1);
      tone(c, 196, 0.13, 0.22, 'triangle', 0.1);
    } else if (kind === 'levelup') {
      [523, 659, 784, 1047].forEach((f, i) => tone(c, f, i * 0.1, 0.25, 'sine', 0.12));
    } else {
      tone(c, 880, 0, 0.08, 'sine', 0.07);
    }
  } catch {
    /* sound is optional */
  }
}
