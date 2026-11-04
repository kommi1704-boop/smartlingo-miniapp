import { useId } from 'react';
import { cx } from '../lib/utils';

export type Mood = 'happy' | 'cheer' | 'think' | 'wow' | 'sleep';

/**
 * "Lingo" — SmartLingo's own mascot: a friendly chat-bubble character with a little star sprout.
 * Pure SVG (no image files), original artwork. Mood changes the face; it gently floats and blinks.
 */
export function Mascot({ mood = 'happy', size = 96, animate = true, className, title }: { mood?: Mood; size?: number; animate?: boolean; className?: string; title?: string }) {
  const gid = useId().replace(/:/g, '');
  const ink = '#1b1a45';
  const eyes = (() => {
    switch (mood) {
      case 'cheer':
        return (
          <g fill="none" stroke={ink} strokeWidth="3.2" strokeLinecap="round">
            <path d="M41 57 Q47 48 53 57" />
            <path d="M67 57 Q73 48 79 57" />
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
      case 'think':
        return (
          <g className={animate ? 'mascot-blink' : undefined}>
            <ellipse cx="47" cy="54" rx="5.5" ry="7" fill={ink} />
            <ellipse cx="73" cy="54" rx="5.5" ry="7" fill={ink} />
            <circle cx="49.2" cy="50.5" r="2" fill="#fff" />
            <circle cx="75.2" cy="50.5" r="2" fill="#fff" />
            <path d="M66 42 L80 39" stroke={ink} strokeWidth="3" strokeLinecap="round" />
          </g>
        );
      default:
        return (
          <g className={animate ? 'mascot-blink' : undefined}>
            <ellipse cx="47" cy="54" rx="5.5" ry="7" fill={ink} />
            <ellipse cx="73" cy="54" rx="5.5" ry="7" fill={ink} />
            <circle cx="45.4" cy="51.5" r="2" fill="#fff" />
            <circle cx="71.4" cy="51.5" r="2" fill="#fff" />
          </g>
        );
    }
  })();

  const mouth = (() => {
    switch (mood) {
      case 'cheer':
        return (
          <g>
            <path d="M49 63 Q60 82 71 63 Z" fill="#7f1d1d" stroke={ink} strokeWidth="2.4" strokeLinejoin="round" />
            <path d="M54 71 Q60 76 66 71 Q60 68 54 71 Z" fill="#fb7185" />
          </g>
        );
      case 'wow':
        return <ellipse cx="60" cy="69" rx="5" ry="6.5" fill="#7f1d1d" stroke={ink} strokeWidth="2.2" />;
      case 'think':
        return <path d="M54 68 Q58 65 62 68 T68 67" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" />;
      case 'sleep':
        return <path d="M55 67 Q60 71 65 67" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" />;
      default:
        return <path d="M51 64 Q60 74 69 64" fill="none" stroke={ink} strokeWidth="3.2" strokeLinecap="round" />;
    }
  })();

  return (
    <div className={cx('relative inline-block shrink-0', animate && mood !== 'sleep' && 'mascot-float', className)} style={{ width: size, height: size }} role="img" aria-label={title ?? 'Lingo maskoti'}>
      <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true" className="overflow-visible">
        <defs>
          <linearGradient id={`b${gid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6366f1" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        {/* little shadow */}
        <ellipse cx="62" cy="114" rx="30" ry="4" fill="#1b1a45" opacity="0.12" />
        {/* arms */}
        {mood === 'cheer' ? (
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
            <ellipse cx="13" cy="76" rx="6" ry="8" transform="rotate(18 13 76)" />
            <ellipse cx="107" cy="76" rx="6" ry="8" transform="rotate(-18 107 76)" />
          </g>
        )}
        {/* body: speech-bubble */}
        <path
          d="M42 20 H78 C94 20 106 32 106 48 V64 C106 80 94 92 78 92 H54 L32 108 L36 90 C22 86 14 76 14 64 V48 C14 32 26 20 42 20 Z"
          fill={`url(#b${gid})`}
          stroke="#4f46e5"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* face plate */}
        <ellipse cx="60" cy="56" rx="38" ry="27" fill="#fff" opacity="0.96" />
        {/* cheeks */}
        <circle cx="38" cy="65" r="5.5" fill="#fb7185" opacity="0.45" />
        <circle cx="82" cy="65" r="5.5" fill="#fb7185" opacity="0.45" />
        {eyes}
        {mouth}
        {/* sprout with a star */}
        <path d="M60 20 Q57 12 61 8" fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
        <path d="M62 -2 L64.4 3.2 L70 3.8 L65.8 7.6 L67 13.2 L62 10.3 L57 13.2 L58.2 7.6 L54 3.8 L59.6 3.2 Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.4" strokeLinejoin="round" className={animate ? 'mascot-twinkle' : undefined} />
        {mood === 'sleep' && (
          <g fill="#6366f1" fontWeight="800" fontFamily="system-ui, sans-serif">
            <text x="96" y="22" fontSize="13">z</text>
            <text x="106" y="12" fontSize="10">z</text>
          </g>
        )}
        {mood === 'think' && (
          <g>
            <circle cx="98" cy="18" r="3" fill="#c7d2fe" />
            <circle cx="106" cy="8" r="4.5" fill="#c7d2fe" />
            <text x="106" y="12" textAnchor="middle" fontSize="8" fontWeight="800" fill="#4f46e5" fontFamily="system-ui, sans-serif">?</text>
          </g>
        )}
      </svg>
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
