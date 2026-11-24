import type { CSSProperties, ReactElement } from 'react';
import { cx } from '../lib/utils';

/**
 * Brand "emojis" — sticker-style SVG art that replaces system emoji glyphs.
 *
 * Why: system emojis render differently on every device (Telegram Android often
 * shows old, flat or missing glyphs) which is a big part of the generic "AI-made"
 * look. These drawings use the app's own palette (Duolingo-ish warm stickers with
 * a soft outline) and render identically everywhere. They size like text (1em)
 * so they drop into sentences, pills and headers as if they were emojis.
 */

export type EmoName =
  | 'star' | 'coin' | 'flame' | 'target' | 'bolt' | 'cal' | 'trophy' | 'brain' | 'gem'
  | 'gift' | 'game' | 'chart' | 'sparkle' | 'bell' | 'grad' | 'headset' | 'puzzle'
  | 'toolbox' | 'rocket' | 'book' | 'mic' | 'cart' | 'gear' | 'cards' | 'shoe' | 'abc' | 'medal' | 'search'
  | 'signal' | 'flag' | 'globe' | 'pen' | 'map' | 'crown' | 'clock' | 'ice' | 'chest' | 'camera';

export type MedalTone = 'gold' | 'silver' | 'bronze';

// palette
const D = '#463a30'; // soft outline
const A = '#ffc83d'; // amber
const A2 = '#eda212';
const O = '#ff9600';
const R = '#ff5b5b';
const R2 = '#e04848';
const G = '#58cc83';
const G2 = '#3fae68';
const S = '#48b8f5';
const S2 = '#2f8fe0';
const V = '#8b7cf3';
const V2 = '#6c5ce7';
const P = '#ff9fb8';
const P2 = '#e57495';
const T = '#8b9bb0';
const T2 = '#66788f';
const W = '#ffffff';

const STROKE = { stroke: D, strokeWidth: 1.5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

const MEDAL: Record<MedalTone, { face: string; ring: string }> = {
  gold: { face: A, ring: A2 },
  silver: { face: '#cfd8e3', ring: '#a8b6c6' },
  bronze: { face: '#d9925f', ring: '#b87848' },
};

function art(n: EmoName, tone?: MedalTone): ReactElement {
  switch (n) {
    case 'star':
      return (
        <>
          <path d="M12 2.6l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" fill={A} {...STROKE} />
          <circle cx="9.1" cy="9.3" r="1.1" fill={W} opacity=".75" />
        </>
      );
    case 'coin':
      return (
        <>
          <circle cx="12" cy="12" r="9.2" fill={A} {...STROKE} />
          <circle cx="12" cy="12" r="5.6" fill="none" stroke={A2} strokeWidth="1.6" />
          <path d="M17.1 5.2l.6 1.5 1.5.6-1.5.6-.6 1.5-.6-1.5-1.5-.6 1.5-.6z" fill={W} opacity=".9" />
        </>
      );
    case 'flame':
      return (
        <>
          <path d="M12 2.8c.6 3.4 4.4 5.2 5.2 8.6.9 3.6-1.6 7-5.2 7s-6.1-3.4-5.2-7c.8-3.4 4.6-5.2 5.2-8.6z" fill={O} {...STROKE} />
          <path d="M12 9c.5 2.4 3.1 3.6 3.6 6 .5 2.5-1.4 4.4-3.6 4.4s-4.1-1.9-3.6-4.4c.5-2.4 3.1-3.6 3.6-6z" fill="#ffd23f" />
          <circle cx="10.2" cy="15.6" r="1.2" fill={W} opacity=".65" />
        </>
      );
    case 'target':
      return (
        <>
          <circle cx="12" cy="12" r="9.3" fill={W} {...STROKE} />
          <circle cx="12" cy="12" r="6.3" fill={R} stroke={D} strokeWidth="1.2" />
          <circle cx="12" cy="12" r="3.5" fill={W} stroke={D} strokeWidth="1.2" />
          <circle cx="12" cy="12" r="1.5" fill={R} />
        </>
      );
    case 'bolt':
      return (
        <>
          <path d="M13.2 2.6L5.4 13.6h5l-1.6 7.8 8-11.2h-5.1z" fill={A} {...STROKE} />
          <path d="M11.6 5.6l-3.4 5" stroke={W} strokeWidth="1.3" strokeLinecap="round" opacity=".7" />
        </>
      );
    case 'cal':
      return (
        <>
          <rect x="3.4" y="4.6" width="17.2" height="16" rx="3" fill={W} {...STROKE} />
          <path d="M3.4 7.6c0-1.7 1.3-3 3-3h11.2c1.7 0 3 1.3 3 3v2.3H3.4z" fill={G} stroke={D} strokeWidth="1.2" />
          <circle cx="8" cy="3.7" r="1.3" fill={D} />
          <circle cx="16" cy="3.7" r="1.3" fill={D} />
          <path d="M8.2 14.2l2.6 2.6 5-5" fill="none" stroke={G2} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
    case 'trophy':
      return (
        <>
          <path d="M7 4h10v5.4a5 5 0 0 1-10 0z" fill={A} {...STROKE} />
          <path d="M7 5.6H4.4v1.4a2.8 2.8 0 0 0 2.8 2.8M17 5.6h2.6v1.4a2.8 2.8 0 0 1-2.8 2.8" fill="none" stroke={D} strokeWidth="1.5" />
          <path d="M12 14.5v4.6" stroke={D} strokeWidth="1.5" />
          <rect x="8.2" y="19" width="7.6" height="2.6" rx="1.1" fill={A} {...STROKE} />
          <path d="M10 7l2-1 2 1-.6 1.9h-2.8z" fill={W} opacity=".8" />
        </>
      );
    case 'brain':
      return (
        <>
          <path d="M8.8 4.6C6.4 4.6 4.6 6.4 4.6 8.6c-1.2.8-1.8 2.1-1.6 3.5.2 1.3 1 2.4 2.2 3 .3 2 2 3.5 4.1 3.5h1.5c.4 0 .8-.1 1.2-.2.4.1.8.2 1.2.2h1.5c2.1 0 3.8-1.5 4.1-3.5 1.2-.6 2-1.7 2.2-3 .2-1.4-.4-2.7-1.6-3.5 0-2.2-1.8-4-4.2-4-.9 0-1.7.2-2.4.7-.7-.5-1.5-.7-2.4-.7z" fill={P} {...STROKE} />
          <path d="M12 5.4v13M8.4 9.2c1 .3 2-.1 2.5-1M6.8 13c1.3.5 2.7 0 3.4-1M15.6 9.2c-1 .3-2-.1-2.5-1M17.2 13c-1.3.5-2.7 0-3.4-1" fill="none" stroke={P2} strokeWidth="1.2" strokeLinecap="round" />
        </>
      );
    case 'gem':
      return (
        <>
          <path d="M7 3.4h10l4 5.4-9 12.4L3 8.8z" fill={V} {...STROKE} />
          <path d="M3.2 8.8h17.6M7 3.4l3 5.4 2 12M17 3.4l-3 5.4" fill="none" stroke={W} strokeWidth="1.1" opacity=".45" />
        </>
      );
    case 'gift':
      return (
        <>
          <rect x="4.4" y="10.6" width="15.2" height="9.6" rx="2" fill={R} {...STROKE} />
          <rect x="3.2" y="6.8" width="17.6" height="4.6" rx="1.6" fill={R2} {...STROKE} />
          <rect x="10.7" y="6.8" width="2.6" height="13.4" fill="#ffd23f" />
          <path d="M12 6.6c-1.4-2.6-3.8-3-4.6-1.6-.7 1.3.6 2.4 2.2 2.4zM12 6.6c1.4-2.6 3.8-3 4.6-1.6.7 1.3-.6 2.4-2.2 2.4z" fill="#ffd23f" stroke={D} strokeWidth="1.2" strokeLinejoin="round" />
        </>
      );
    case 'game':
      return (
        <>
          <path d="M7.2 6h9.6c2.9 0 5.2 2.3 5.2 5.2 0 3.4-1.5 6.8-3.4 6.8-1 0-1.7-.7-2.4-1.6-.8-1-1.5-1.8-2.9-1.8H8.7c-1.4 0-2.1.8-2.9 1.8-.7.9-1.4 1.6-2.4 1.6-1.9 0-3.4-3.4-3.4-6.8C0 8.3 4.3 6 7.2 6z" fill={V2} {...STROKE} />
          <path d="M7.4 10.2v3.4M5.7 11.9h3.4" stroke={W} strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="15.2" cy="10.7" r="1.15" fill="#ffd23f" />
          <circle cx="17.4" cy="13" r="1.15" fill={G} />
        </>
      );
    case 'chart':
      return (
        <>
          <rect x="4" y="12.6" width="4" height="7" rx="1.4" fill={S} {...STROKE} />
          <rect x="10" y="8" width="4" height="11.6" rx="1.4" fill={G} {...STROKE} />
          <rect x="16" y="4.4" width="4" height="15.2" rx="1.4" fill={A} {...STROKE} />
        </>
      );
    case 'sparkle':
      return (
        <>
          <path d="M10.2 3.6l1.7 4.4 4.4 1.7-4.4 1.7-1.7 4.4-1.7-4.4-4.4-1.7 4.4-1.7z" fill="#ffd23f" {...STROKE} />
          <path d="M17.6 13.8l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9z" fill={W} stroke={D} strokeWidth="1.2" strokeLinejoin="round" />
        </>
      );
    case 'bell':
      return (
        <>
          <path d="M12 3.2c-3.6 0-6 2.6-6.2 6l-.9 5.2c-.1.7.4 1.4 1.2 1.4h11.8c.8 0 1.3-.7 1.2-1.4l-.9-5.2c-.2-3.4-2.6-6-6.2-6z" fill={A} {...STROKE} />
          <path d="M9.6 18.6c.4 1.3 1.3 2.2 2.4 2.2s2-.9 2.4-2.2z" fill={A2} {...STROKE} />
          <circle cx="12" cy="3.4" r="1.4" fill={D} />
        </>
      );
    case 'grad':
      return (
        <>
          <path d="M6.4 10.8v4.4c0 1.6 2.5 3 5.6 3s5.6-1.4 5.6-3v-4.4" fill="#3d4d5c" {...STROKE} />
          <path d="M12 4.2L1.8 8.6 12 13l10.2-4.4z" fill="#3d4d5c" {...STROKE} />
          <path d="M21 9.4v5.2" stroke={D} strokeWidth="1.4" />
          <circle cx="21" cy="15.8" r="1.2" fill={A} stroke={D} strokeWidth="1" />
        </>
      );
    case 'headset':
      return (
        <>
          <path d="M4.4 13.4v-1.2c0-4.2 3.4-7.6 7.6-7.6s7.6 3.4 7.6 7.6v1.2" fill="none" stroke={R2} strokeWidth="2" />
          <rect x="2.8" y="12" width="4.2" height="6.6" rx="1.9" fill={R} {...STROKE} />
          <rect x="17" y="12" width="4.2" height="6.6" rx="1.9" fill={R} {...STROKE} />
        </>
      );
    case 'puzzle':
      return (
        <>
          <rect x="4.5" y="8.5" width="15" height="12" rx="2.5" fill={G} {...STROKE} />
          <circle cx="12" cy="8.5" r="2.6" fill={G} />
          <circle cx="19.5" cy="14.5" r="2.6" fill={G} />
          <circle cx="8.6" cy="16.8" r="1.8" fill={G2} />
        </>
      );
    case 'toolbox':
      return (
        <>
          <path d="M9.4 6.8v-.8a2.6 2.6 0 0 1 5.2 0v.8" fill="none" stroke={D} strokeWidth="1.5" />
          <rect x="2.8" y="6.6" width="18.4" height="4.4" rx="1.8" fill={T2} {...STROKE} />
          <rect x="3.6" y="9.8" width="16.8" height="10.2" rx="2.2" fill={T} {...STROKE} />
          <rect x="10.8" y="9.8" width="2.4" height="2.4" rx="0.7" fill="#ffd23f" stroke={D} strokeWidth="1" />
        </>
      );
    case 'rocket':
      return (
        <>
          <path d="M7.8 12.6L5 17.8l3.2-1zM16.2 12.6l2.8 5.2-3.2-1z" fill={R2} {...STROKE} />
          <path d="M12 2.6c3 1.8 4.6 5.4 4.6 8.8 0 1.6-.3 3-.8 4.2H8.2c-.5-1.2-.8-2.6-.8-4.2 0-3.4 1.6-7 4.6-8.8z" fill={R} {...STROKE} />
          <circle cx="12" cy="9.4" r="2" fill={S} stroke={D} strokeWidth="1.2" />
          <path d="M12 18.4c.8 1 .8 2.2 0 3.4-.8-1.2-.8-2.4 0-3.4z" fill={O} stroke={D} strokeWidth="1" strokeLinejoin="round" />
        </>
      );
    case 'book':
      return (
        <>
          <path d="M12 6.4C10 5 7.4 4.4 4.4 4.6c-.8 0-1.4.6-1.4 1.4v11.4c0 .8.7 1.4 1.5 1.4 2.7-.1 5.1.4 7.5 1.8z" fill={W} {...STROKE} />
          <path d="M12 6.4c2-1.4 4.6-2 7.6-1.8.8 0 1.4.6 1.4 1.4v11.4c0 .8-.7 1.4-1.5 1.4-2.7-.1-5.1.4-7.5 1.8z" fill={W} {...STROKE} />
          <path d="M12 6.4v13.8" stroke={D} strokeWidth="1.3" />
          <path d="M6.2 9.4h3.4M6.2 12h3.4M14.4 9.4h3.4" stroke={S} strokeWidth="1.3" strokeLinecap="round" />
        </>
      );
    case 'mic':
      return (
        <>
          <rect x="9" y="3" width="6" height="11" rx="3" fill={S} {...STROKE} />
          <path d="M5.6 12.4a6.4 6.4 0 0 0 12.8 0" fill="none" stroke={D} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M12 18.8v2.4M9 21.2h6" stroke={D} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M10.6 5.6c0-1 .4-1.7 1.1-2" stroke={W} strokeWidth="1.3" strokeLinecap="round" opacity=".8" />
        </>
      );
    case 'cart':
      return (
        <>
          <path d="M3 5.2h2.4l1 2.6M6.4 7.8" fill="none" stroke={D} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M4.6 8.2h14.8l-1.8 7.2a1.8 1.8 0 0 1-1.8 1.4H8.2a1.8 1.8 0 0 1-1.8-1.4z" fill={G} {...STROKE} />
          <circle cx="9.6" cy="19.8" r="1.4" fill={D} />
          <circle cx="15.4" cy="19.8" r="1.4" fill={D} />
          <path d="M8.4 10.6h7.2M9 13.2h6" stroke={W} strokeWidth="1.3" strokeLinecap="round" opacity=".8" />
        </>
      );
    case 'gear': {
      const teeth = [0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return <circle key={deg} cx={12 + Math.cos(rad) * 7} cy={12 + Math.sin(rad) * 7} r="1.9" fill={T} />;
      });
      return (
        <>
          {teeth}
          <circle cx="12" cy="12" r="5.4" fill={T} {...STROKE} />
          <circle cx="12" cy="12" r="2.2" fill={W} stroke={D} strokeWidth="1.2" />
        </>
      );
    }
    case 'cards':
      return (
        <>
          <rect x="7.6" y="3.4" width="10.4" height="14.8" rx="2.2" fill={S} {...STROKE} transform="rotate(8 12.8 10.8)" />
          <rect x="6.2" y="6.6" width="10.4" height="14.8" rx="2.2" fill={W} {...STROKE} />
          <path d="M11.4 10.4l1.3 2.6 2.9.4-2.1 2 .5 2.9-2.6-1.4-2.6 1.4.5-2.9-2.1-2 2.9-.4z" fill={A} />
        </>
      );
    case 'shoe':
      return (
        <>
          <path d="M3.4 16.2c0-2.8 1-5.6 2.8-7.4l3.2 2.8c1.8 1.6 4 2.6 6.4 2.8l3.8.4c1.4.2 2.4 1.2 2.4 2.6v.6H3.4z" fill={R} {...STROKE} />
          <rect x="3" y="17.8" width="18.8" height="2.8" rx="1.4" fill={W} {...STROKE} />
          <path d="M9.4 11.4l2 1.6M11.8 9.8l2 1.6" stroke={W} strokeWidth="1.3" strokeLinecap="round" />
        </>
      );
    case 'abc':
      return (
        <>
          <rect x="3.6" y="3.6" width="16.8" height="16.8" rx="3" fill="#ffd23f" {...STROKE} />
          <text x="12" y="15.6" textAnchor="middle" fontSize="9.5" fontWeight="900" fill={D} fontFamily="inherit">Aa</text>
        </>
      );
    case 'medal': {
      const c = MEDAL[tone ?? 'gold'];
      return (
        <>
          <path d="M8.2 3.2h3.4l.8 5.8-4.8-.9zM15.8 3.2h-3.4l-.8 5.8 4.8-.9z" fill={R} {...STROKE} />
          <circle cx="12" cy="15.4" r="5.6" fill={c.face} {...STROKE} />
          <circle cx="12" cy="15.4" r="3.4" fill="none" stroke={c.ring} strokeWidth="1.6" />
          <path d="M12 12.8l.6 1.7 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6z" fill={W} opacity=".9" />
        </>
      );
    }
    case 'search':
      return (
        <>
          <circle cx="10.5" cy="10.5" r="6.6" fill={W} {...STROKE} />
          <path d="M15.4 15.4L21 21" stroke={D} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M7 10.5c0-1.9 1.6-3.5 3.5-3.5" stroke={S} strokeWidth="1.4" strokeLinecap="round" fill="none" />
        </>
      );
    case 'signal':
      return (
        <>
          <path d="M12 11.6L6.6 21h10.8z" fill={A} {...STROKE} />
          <circle cx="12" cy="9.4" r="2" fill={R} {...STROKE} />
          <path d="M7.6 9.6a5.4 5.4 0 0 1 8.8 0M5 7.2a9.2 9.2 0 0 1 14 0" fill="none" stroke={S2} strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="12" cy="16.6" r="1.2" fill={D} />
        </>
      );
    case 'flag':
      return (
        <>
          <path d="M5.6 3.6v17" stroke={D} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M5.6 4.4h11.8c.7 0 1 .7.6 1.2L15 9.2l3 3.6c.4.5.1 1.2-.6 1.2H5.6z" fill={W} {...STROKE} />
          <path d="M8.6 4.4v9.6M12.4 4.4v9.6M5.6 8.2h12M5.6 12h12" stroke={T2} strokeWidth="1.2" opacity=".55" />
        </>
      );
    case 'globe':
      return (
        <>
          <circle cx="12" cy="12" r="9.2" fill={S} {...STROKE} />
          <path d="M6.2 6.8c2 1.4 2.6 3.4 1.4 5-1 1.4-.6 3 1 3.8 1.8.9 2 2.8.8 4.4M17.8 6.8c-1.6 1.2-2 2.8-.8 4.2 1.3 1.5 1 3.4-.9 4.6" fill="none" stroke={G2} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M3 12h18" stroke={W} strokeWidth="1.2" opacity=".6" />
        </>
      );
    case 'pen':
      return (
        <>
          <path d="M14.6 4.2l3.4 3.4L8.4 17.2l-4.6 1.4 1.4-4.6z" fill={S} {...STROKE} />
          <path d="M14.6 4.2l2.2-1.6c.6-.4 1.4-.3 1.9.2l.9.9c.5.5.6 1.3.2 1.9l-1.6 2.2z" fill={A} {...STROKE} />
          <path d="M8.4 17.2l-1.8-.6-.6-1.8" fill="none" stroke={D} strokeWidth="1.2" />
        </>
      );
    case 'map':
      return (
        <>
          <path d="M3.4 5.6l5.8-1.8 5.6 1.8 5.8-1.8v14.6l-5.8 1.8-5.6-1.8-5.8 1.8z" fill={W} {...STROKE} />
          <path d="M9.2 3.8v14.6M14.8 5.6v14.6" stroke={D} strokeWidth="1.1" opacity=".5" />
          <path d="M5.4 12.4l2.6-2.4 3 2.6 3.4-3 2.4 2.2" fill="none" stroke={R2} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="16.8" cy="9.6" r="1.6" fill={R} stroke={D} strokeWidth="1" />
        </>
      );
    case 'crown':
      return (
        <>
          <path d="M4 17.4L2.8 7.6c-.1-.8.8-1.3 1.4-.8l3.8 3 3.4-4.9c.3-.4 1-.4 1.3 0l3.3 4.9 3.9-3c.6-.5 1.5 0 1.4.8L20 17.4z" fill={A} {...STROKE} />
          <rect x="4.6" y="18.6" width="14.8" height="2.6" rx="1.2" fill={A2} {...STROKE} />
          <circle cx="12" cy="12.6" r="1.2" fill={R} />
          <circle cx="7.6" cy="12.6" r="1" fill={S} />
          <circle cx="16.4" cy="12.6" r="1" fill={G} />
        </>
      );
    case 'clock':
      return (
        <>
          <circle cx="12" cy="12" r="9.2" fill={S} {...STROKE} />
          <circle cx="12" cy="12" r="6.4" fill={W} />
          <path d="M12 7.4V12l3.4 2.2" fill="none" stroke={D} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="1.1" fill={D} />
        </>
      );
    case 'ice':
      return (
        <>
          <path d="M12 2.8v18.4M12 2.8l-2.6 2M12 2.8l2.6 2M12 21.2l-2.6-2M12 21.2l2.6-2M4 7l16 10M4 7l.6 3.2M4 7l3.2-.6M20 17l-.6-3.2M20 17l-3.2.6M20 7L4 17M20 7l-3.2-.6M20 7l-.6 3.2M4 17l.6-3.2" fill="none" stroke={S2} strokeWidth="1.5" strokeLinecap="round" />
          <rect x="7.6" y="7.6" width="8.8" height="8.8" rx="2" transform="rotate(45 12 12)" fill="#bfe6ff" fillOpacity=".55" stroke={S2} strokeWidth="1.5" />
        </>
      );
    case 'chest':
      return (
        <>
          <path d="M4.4 9.4v8.2a2.4 2.4 0 0 0 2.4 2.4h10.4a2.4 2.4 0 0 0 2.4-2.4V9.4z" fill={A2} {...STROKE} />
          <path d="M4.4 9.4C4.4 6 7 4 12 4s7.6 2 7.6 5.4v0H4.4z" fill={A} {...STROKE} />
          <rect x="10.2" y="8.2" width="3.6" height="4.6" rx="1" fill="#ffd23f" stroke={D} strokeWidth="1.2" />
          <circle cx="12" cy="10.4" r="0.9" fill={D} />
          <path d="M7 14.6h10" stroke="#8a5a1d" strokeWidth="1.2" strokeLinecap="round" opacity=".6" />
        </>
      );
    case 'camera':
      return (
        <>
          <rect x="3" y="7" width="18" height="12.6" rx="2.6" fill={T} {...STROKE} />
          <path d="M9 7l1-2.2h4L15 7" fill={T} {...STROKE} />
          <circle cx="12" cy="13.2" r="4" fill={W} stroke={D} strokeWidth="1.5" />
          <circle cx="12" cy="13.2" r="1.7" fill={S} />
          <circle cx="18.2" cy="9.8" r="0.9" fill={R} />
        </>
      );
    default:
      return art('sparkle');
  }
}

export function Emo({ n, size, tone, className, style }: { n: EmoName; size?: number | string; tone?: MedalTone; className?: string; style?: CSSProperties }) {
  const s: CSSProperties = { width: size ?? '1.18em', height: size ?? '1.18em', verticalAlign: '-0.2em', display: 'inline-block', ...style };
  return (
    <svg viewBox="0 0 24 24" className={cx('shrink-0', className)} style={s} aria-hidden="true" focusable="false">
      {art(n, tone)}
    </svg>
  );
}

/** Raw emoji → brand art, where a drawing exists. Falls back to the original glyph. */
export const EMOJI_ART: Record<string, EmoName> = {
  '⭐': 'star', '🌟': 'star', '✨': 'sparkle', '🪙': 'coin', '💰': 'coin', '🧧': 'gift',
  '🔥': 'flame', '🏆': 'trophy', '🥇': 'medal', '🥈': 'medal', '🥉': 'medal', '🏅': 'medal',
  '🎯': 'target', '⚡': 'bolt', '🧠': 'brain', '💎': 'gem', '🎁': 'chest', '🎀': 'gift',
  '🎮': 'game', '🕹️': 'game', '📊': 'chart', '📈': 'chart', '🔔': 'bell', '🎓': 'grad',
  '🎧': 'headset', '🎵': 'headset', '🧩': 'puzzle', '🧰': 'toolbox', '🚀': 'rocket',
  '📖': 'book', '📚': 'book', '🎤': 'mic', '🗣️': 'mic', '🛒': 'cart', '⚙️': 'gear',
  '🃏': 'cards', '🎴': 'cards', '🏃': 'shoe', '🔤': 'abc', '🔍': 'search', '📶': 'signal',
  '🚩': 'flag', '🏁': 'flag', '🌐': 'globe', '🌍': 'globe', '✏️': 'pen', '🖊️': 'pen', '📝': 'pen',
  '🗺️': 'map', '👑': 'crown', '🕐': 'clock', '⏰': 'clock', '🧊': 'ice', '📷': 'camera', '📸': 'camera',
  '📅': 'cal', '🗓️': 'cal',
};

/** Drop-in replacement for a raw emoji in text/rows: brand art when we have it. */
export function Glyph({ emoji, size, className, style }: { emoji: string; size?: number | string; className?: string; style?: CSSProperties }) {
  const n = EMOJI_ART[emoji];
  if (!n) return <span className={className} style={style}>{emoji}</span>;
  return <Emo n={n} size={size} className={className} style={style} />;
}
