import { useEffect, useId, useRef, useState } from 'react';
import { cx } from '../lib/utils';

export type Mood = 'happy' | 'cheer' | 'think' | 'wow' | 'sleep' | 'love' | 'sad' | 'wink' | 'proud';

const TAP_MOODS: Mood[] = ['cheer', 'love', 'wow', 'wink', 'proud'];
const TAP_EMOJI: Record<string, string> = { cheer: '🎉', love: '💜', wow: '✨', wink: '😉', proud: '⭐', happy: '💫', think: '💭', sad: '🫶', sleep: '💤' };

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * "Lingo" — SmartLingo's own mascot: a friendly chat-bubble character with a little star sprout.
 * Pure SVG (no image files). It is ALIVE:
 *  • eyes follow your finger / cursor,
 *  • blinks on its own and now and then winks,
 *  • tap it → it squishes, changes emotion and pops a little emoji,
 *  • 9 moods: happy · cheer · think · wow · sleep · love · sad · wink · proud.
 * `interactive={false}` (or `animate={false}`) makes it fully static.
 */
export function Mascot({
  mood = 'happy',
  size = 96,
  animate = true,
  interactive = true,
  className,
  title,
}: {
  mood?: Mood;
  size?: number;
  animate?: boolean;
  interactive?: boolean;
  className?: string;
  title?: string;
}) {
  const gid = useId().replace(/:/g, '');
  const ink = '#1b1a45';
  const live = animate && interactive && size >= 40;
  const wrap = useRef<HTMLDivElement>(null);
  const eyeLayer = useRef<SVGGElement>(null);
  const [temp, setTemp] = useState<Mood | null>(null);
  const [tapKey, setTapKey] = useState(0);
  const [burst, setBurst] = useState<{ id: number; ch: string } | null>(null);
  const tempTimer = useRef<number | undefined>(undefined);

  const m: Mood = temp ?? mood;

  // eyes follow the pointer (rAF-throttled, writes straight to the DOM — no re-render)
  useEffect(() => {
    if (!live || reduced()) return;
    let raf = 0;
    let lx = 0;
    let ly = 0;
    const apply = () => {
      raf = 0;
      const box = wrap.current?.getBoundingClientRect();
      const g = eyeLayer.current;
      if (!box || !g) return;
      const dx = lx - (box.left + box.width / 2);
      const dy = ly - (box.top + box.height / 2);
      const k = Math.min(1, Math.hypot(dx, dy) / 160);
      const ang = Math.atan2(dy, dx);
      g.style.transform = `translate(${(Math.cos(ang) * 3.4 * k).toFixed(2)}px, ${(Math.sin(ang) * 2.6 * k).toFixed(2)}px)`;
    };
    const on = (e: PointerEvent) => {
      lx = e.clientX;
      ly = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    window.addEventListener('pointermove', on, { passive: true });
    window.addEventListener('pointerdown', on, { passive: true });
    return () => {
      window.removeEventListener('pointermove', on);
      window.removeEventListener('pointerdown', on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [live]);

  // idle life: a quick wink every 8–14 s while calm and happy
  useEffect(() => {
    if (!live || mood !== 'happy' || reduced()) return;
    let t1 = 0;
    let t2 = 0;
    const loop = () => {
      t1 = window.setTimeout(() => {
        setTemp((c) => (c ? c : 'wink'));
        t2 = window.setTimeout(() => setTemp((c) => (c === 'wink' ? null : c)), 700);
        loop();
      }, 8000 + Math.random() * 6000);
    };
    loop();
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [live, mood]);

  useEffect(() => () => window.clearTimeout(tempTimer.current), []);

  const poke = () => {
    if (!live) return;
    const pool = TAP_MOODS.filter((x) => x !== m);
    const next = pool[Math.floor(Math.random() * pool.length)];
    setTemp(next);
    setTapKey((k) => k + 1);
    setBurst({ id: Date.now(), ch: TAP_EMOJI[next] ?? '✨' });
    window.clearTimeout(tempTimer.current);
    tempTimer.current = window.setTimeout(() => {
      setTemp(null);
      setBurst(null);
    }, 1600);
    try {
      navigator.vibrate?.(12);
    } catch {
      /* ignore */
    }
  };

  const blink = animate ? 'mascot-blink' : undefined;
  const arc = (x: number) => <path d={`M${x - 6} 57 Q${x} 48 ${x + 6} 57`} />;

  const eyes = (() => {
    switch (m) {
      case 'cheer':
      case 'proud':
        return (
          <g fill="none" stroke={ink} strokeWidth="3.2" strokeLinecap="round">
            {arc(47)}
            {arc(73)}
          </g>
        );
      case 'sleep':
        return (
          <g fill="none" stroke={ink} strokeWidth="3.2" strokeLinecap="round">
            <path d="M41 54 Q47 60 53 54" />
            <path d="M67 54 Q73 60 79 54" />
          </g>
        );
      case 'wow':
        return (
          <g>
            <circle cx="47" cy="54" r="7.5" fill={ink} />
            <circle cx="73" cy="54" r="7.5" fill={ink} />
            <circle cx="49.5" cy="51.5" r="2.4" fill="#fff" />
            <circle cx="75.5" cy="51.5" r="2.4" fill="#fff" />
          </g>
        );
      case 'love':
        return (
          <g fill="#f43f5e" className={animate ? 'mascot-heartbeat' : undefined}>
            <path d="M47 61 C38 55 39 47 44 47 C46 47 47 48.5 47 49.5 C47 48.5 48 47 50 47 C55 47 56 55 47 61 Z" />
            <path d="M73 61 C64 55 65 47 70 47 C72 47 73 48.5 73 49.5 C73 48.5 74 47 76 47 C81 47 82 55 73 61 Z" />
          </g>
        );
      case 'sad':
        return (
          <g>
            <ellipse cx="47" cy="55" rx="5.5" ry="6.5" fill={ink} />
            <ellipse cx="73" cy="55" rx="5.5" ry="6.5" fill={ink} />
            <circle cx="45.4" cy="52.5" r="2.2" fill="#fff" />
            <circle cx="71.4" cy="52.5" r="2.2" fill="#fff" />
            <path d="M40 49 L53 44 M80 49 L67 44" stroke={ink} strokeWidth="2.8" strokeLinecap="round" />
            <path className={animate ? 'mascot-tear' : undefined} d="M40 62 q-3 5 0 7 q3 -2 0 -7 Z" fill="#7dd3fc" />
          </g>
        );
      case 'wink':
        return (
          <g>
            <g className={blink}>
              <ellipse cx="47" cy="54" rx="5.5" ry="7" fill={ink} />
              <circle cx="45.4" cy="51.5" r="2" fill="#fff" />
            </g>
            <path d="M67 55 Q73 49 79 55" fill="none" stroke={ink} strokeWidth="3.2" strokeLinecap="round" />
          </g>
        );
      case 'think':
        return (
          <g className={blink}>
            <ellipse cx="47" cy="54" rx="5.5" ry="7" fill={ink} />
            <ellipse cx="73" cy="54" rx="5.5" ry="7" fill={ink} />
            <circle cx="49.2" cy="50.5" r="2" fill="#fff" />
            <circle cx="75.2" cy="50.5" r="2" fill="#fff" />
            <path d="M66 42 L80 39" stroke={ink} strokeWidth="3" strokeLinecap="round" />
          </g>
        );
      default:
        return (
          <g className={blink}>
            <ellipse cx="47" cy="54" rx="5.5" ry="7" fill={ink} />
            <ellipse cx="73" cy="54" rx="5.5" ry="7" fill={ink} />
            <circle cx="45.4" cy="51.5" r="2" fill="#fff" />
            <circle cx="71.4" cy="51.5" r="2" fill="#fff" />
          </g>
        );
    }
  })();

  const mouth = (() => {
    switch (m) {
      case 'cheer':
      case 'proud':
        return (
          <g>
            <path d="M49 63 Q60 82 71 63 Z" fill="#7f1d1d" stroke={ink} strokeWidth="2.4" strokeLinejoin="round" />
            <path d="M54 71 Q60 76 66 71 Q60 68 54 71 Z" fill="#fb7185" />
          </g>
        );
      case 'wow':
        return <ellipse cx="60" cy="69" rx="5" ry="6.5" fill="#7f1d1d" stroke={ink} strokeWidth="2.2" />;
      case 'love':
        return <path d="M52 65 Q60 76 68 65 Q60 69 52 65 Z" fill="#fb7185" stroke={ink} strokeWidth="2.4" strokeLinejoin="round" />;
      case 'sad':
        return <path d="M52 71 Q60 63 68 71" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" />;
      case 'think':
        return <path d="M54 68 Q58 65 62 68 T68 67" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" />;
      case 'sleep':
        return <path d="M55 67 Q60 71 65 67" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" />;
      case 'wink':
        return <path d="M50 64 Q60 76 70 64" fill="none" stroke={ink} strokeWidth="3.2" strokeLinecap="round" />;
      default:
        return <path d="M51 64 Q60 74 69 64" fill="none" stroke={ink} strokeWidth="3.2" strokeLinecap="round" />;
    }
  })();

  const armsUp = m === 'cheer' || m === 'proud' || m === 'love';

  return (
    <div
      ref={wrap}
      className={cx('relative inline-block shrink-0', animate && m !== 'sleep' && 'mascot-float', live && 'cursor-pointer select-none touch-manipulation', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={title ?? 'Lingo maskoti'}
      onPointerDown={live ? poke : undefined}
    >
      <svg key={tapKey} viewBox="0 0 120 120" width={size} height={size} aria-hidden="true" className={cx('overflow-visible', tapKey > 0 && 'mascot-squish')}>
        <defs>
          <linearGradient id={`b${gid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7c7bff" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
          <radialGradient id={`h${gid}`} cx="0.3" cy="0.2" r="0.7">
            <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="62" cy="114" rx="30" ry="4" fill="#1b1a45" opacity="0.14" className={animate ? 'mascot-shadow' : undefined} />
        {armsUp ? (
          <g stroke="#a5b4fc" strokeWidth="7" strokeLinecap="round">
            <g className={animate ? 'mascot-wave' : undefined}>
              <path d="M17 62 L8 44" />
              <circle cx="7" cy="42" r="5" fill="#c7d2fe" stroke="none" />
            </g>
            <g className={animate ? 'mascot-wave mascot-wave-b' : undefined}>
              <path d="M103 62 L112 44" />
              <circle cx="113" cy="42" r="5" fill="#c7d2fe" stroke="none" />
            </g>
          </g>
        ) : (
          <g fill="#a5b4fc">
            <ellipse cx="13" cy="76" rx="6" ry="8" transform={m === 'sad' ? 'rotate(8 13 76)' : 'rotate(18 13 76)'} />
            <ellipse cx="107" cy="76" rx="6" ry="8" transform={m === 'sad' ? 'rotate(-8 107 76)' : 'rotate(-18 107 76)'} />
          </g>
        )}
        <path
          d="M42 20 H78 C94 20 106 32 106 48 V64 C106 80 94 92 78 92 H54 L32 108 L36 90 C22 86 14 76 14 64 V48 C14 32 26 20 42 20 Z"
          fill={`url(#b${gid})`}
          stroke="#4f46e5"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M42 20 H78 C94 20 106 32 106 48 V52 C90 40 40 40 14 52 V48 C14 32 26 20 42 20 Z" fill={`url(#h${gid})`} />
        <ellipse cx="60" cy="56" rx="38" ry="27" fill="#fff" opacity="0.96" />
        <circle cx="38" cy="65" r="5.5" fill="#fb7185" opacity={m === 'love' || m === 'proud' ? 0.75 : 0.45} />
        <circle cx="82" cy="65" r="5.5" fill="#fb7185" opacity={m === 'love' || m === 'proud' ? 0.75 : 0.45} />
        <g ref={eyeLayer} className="mascot-eyes">
          {eyes}
        </g>
        {mouth}
        <path d="M60 20 Q57 12 61 8" fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" className={animate ? 'mascot-sprout' : undefined} />
        <path
          d="M62 -2 L64.4 3.2 L70 3.8 L65.8 7.6 L67 13.2 L62 10.3 L57 13.2 L58.2 7.6 L54 3.8 L59.6 3.2 Z"
          fill="#fbbf24"
          stroke="#f59e0b"
          strokeWidth="1.4"
          strokeLinejoin="round"
          className={animate ? 'mascot-twinkle' : undefined}
        />
        {m === 'sleep' && (
          <g fill="#6366f1" fontWeight="800" fontFamily="system-ui, sans-serif" className={animate ? 'mascot-zzz' : undefined}>
            <text x="96" y="22" fontSize="13">z</text>
            <text x="106" y="12" fontSize="10">z</text>
          </g>
        )}
        {m === 'think' && (
          <g>
            <circle cx="98" cy="18" r="3" fill="#c7d2fe" />
            <circle cx="106" cy="8" r="4.5" fill="#c7d2fe" />
            <text x="106" y="12" textAnchor="middle" fontSize="8" fontWeight="800" fill="#4f46e5" fontFamily="system-ui, sans-serif">?</text>
          </g>
        )}
        {m === 'proud' && <path d="M92 28 l2 4 l4 .6 l-3 3 l.8 4 l-3.8 -2 l-3.8 2 l.8 -4 l-3 -3 l4 -.6 z" fill="#fde68a" className={animate ? 'mascot-twinkle' : undefined} />}
      </svg>
      {burst && (
        <span key={burst.id} className="mascot-burst pointer-events-none absolute left-1/2 top-0" style={{ fontSize: Math.max(16, size * 0.3) }} aria-hidden="true">
          {burst.ch}
        </span>
      )}
    </div>
  );
}

/** Speech bubble that types its text out letter by letter (Lingo talking). */
export function LingoBubble({ text, className, speed = 22 }: { text: string; className?: string; speed?: number }) {
  const [n, setN] = useState(() => (reduced() ? text.length : 0));
  useEffect(() => {
    if (reduced()) {
      setN(text.length);
      return;
    }
    setN(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [text, speed]);
  return (
    <div className={cx('lingo-bubble relative rounded-2xl rounded-bl-md px-3.5 py-2.5 text-[13px] font-semibold leading-snug', className)} aria-live="polite">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.slice(0, n)}
        {n < text.length && <span className="lingo-caret" />}
      </span>
    </div>
  );
}

/** Soft floating stars / dots used as decoration behind hero cards (purely visual). */
export function Sparkles({ className }: { className?: string }) {
  const items: { l: string; t: string; s: number; d: string; ch: string }[] = [
    { l: '8%', t: '14%', s: 18, d: '0s', ch: '✨' },
    { l: '78%', t: '10%', s: 14, d: '1.2s', ch: '⭐' },
    { l: '90%', t: '56%', s: 16, d: '0.6s', ch: '✨' },
    { l: '66%', t: '82%', s: 12, d: '1.8s', ch: '💫' },
    { l: '4%', t: '70%', s: 12, d: '2.2s', ch: '⭐' },
  ];
  return (
    <div className={cx('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
      {items.map((it, i) => (
        <span key={i} className="sparkle-float absolute opacity-70" style={{ left: it.l, top: it.t, fontSize: it.s, animationDelay: it.d }}>
          {it.ch}
        </span>
      ))}
    </div>
  );
}

const CONFETTI = ['#f472b6', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#fb7185'];

/** A one-shot burst of confetti pieces (CSS only). Place inside a relatively positioned box. */
export function Confetti({ count = 26 }: { count?: number }) {
  const pieces = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + (i % 3) * 0.3;
    const dist = 90 + ((i * 37) % 70);
    return {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist - 30,
      r: (i * 53) % 360,
      c: CONFETTI[i % CONFETTI.length],
      d: (i % 6) * 40,
      w: 6 + (i % 3) * 3,
    };
  });
  return (
    <div className="pointer-events-none absolute left-1/2 top-24 h-0 w-0" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece absolute block rounded-sm"
          style={{ background: p.c, width: p.w, height: p.w * 0.55, animationDelay: `${p.d}ms`, ['--cx' as string]: `${p.x}px`, ['--cy' as string]: `${p.y}px`, ['--cr' as string]: `${p.r}deg` }}
        />
      ))}
    </div>
  );
}
