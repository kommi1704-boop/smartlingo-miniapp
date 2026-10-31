import type { ReactNode } from 'react';
import { useApp } from '../store/store';
import { frameClassFor } from '../lib/shop';
import { ratingOf } from '../lib/gamification';
import { isOwnedActive } from '../store/actions';
import { cx } from '../lib/utils';

/** Circular avatar with the equipped frame ring. */
export function Avatar({ emoji, size = 64, className }: { emoji: string; size?: number; className?: string }) {
  const s = useApp();
  const ring = frameClassFor(s.shop.equipped.frame, isOwnedActive, ratingOf(s));
  const pad = size >= 80 ? 6 : 4;
  return (
    <div
      className={cx('frame-ring shrink-0 rounded-full', ring, className)}
      style={{ width: size, height: size, padding: pad }}
      role="img"
      aria-label={`Avatar: ${emoji}`}
    >
      <div className="flex h-full w-full items-center justify-center rounded-full bg-surface2" style={{ fontSize: size * 0.52, lineHeight: 1 }}>
        {emoji}
      </div>
    </div>
  );
}

/** Same look, but the ring class is passed explicitly (shop previews, rank cards). */
export function FramedEmoji({ emoji, frameCls, size = 64, className, children }: { emoji: string; frameCls: string; size?: number; className?: string; children?: ReactNode }) {
  const pad = size >= 80 ? 6 : 4;
  return (
    <div className={cx('frame-ring relative shrink-0 rounded-full', frameCls, className)} style={{ width: size, height: size, padding: pad }}>
      <div className="flex h-full w-full items-center justify-center rounded-full bg-surface2" style={{ fontSize: size * 0.52, lineHeight: 1 }}>
        {emoji}
      </div>
      {children}
    </div>
  );
}
