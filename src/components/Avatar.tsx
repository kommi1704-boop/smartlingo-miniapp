import type { ReactNode } from 'react';
import { useApp } from '../store/store';
import { DEFAULT_AVATAR, frameClassFor } from '../lib/shop';
import { ratingOf } from '../lib/gamification';
import { isOwnedActive } from '../store/actions';
import { cx } from '../lib/utils';

/** Circular avatar with the equipped frame ring. Shows the uploaded photo when there is one. */
export function Avatar({ emoji, size = 64, className }: { emoji: string; size?: number; className?: string }) {
  const s = useApp();
  const ring = frameClassFor(s.shop.equipped.frame, isOwnedActive, ratingOf(s));
  const pad = size >= 80 ? 6 : 4;
  const photo = s.profile?.photoAvatar;
  return (
    <div
      className={cx('frame-ring shrink-0 rounded-full', ring, className)}
      style={{ width: size, height: size, padding: pad }}
      role="img"
      aria-label="Avatar"
    >
      {photo ? (
        <img src={photo} alt="" className="h-full w-full rounded-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-surface2" style={{ fontSize: size * 0.52, lineHeight: 1 }}>
          {emoji}
        </div>
      )}
    </div>
  );
}

/** Same look, but the ring class is passed explicitly (shop previews, rank cards). */
export function FramedEmoji({ emoji, frameCls, size = 64, className, children }: { emoji: string; frameCls: string; size?: number; className?: string; children?: ReactNode }) {
  const s = useApp();
  const pad = size >= 80 ? 6 : 4;
  // the uploaded photo stands in only for the learner's own avatar (not for 🔒 locked previews)
  const equipped = s.shop.equipped.avatar ?? DEFAULT_AVATAR;
  const photo = s.profile?.photoAvatar && emoji === equipped ? s.profile.photoAvatar : undefined;
  return (
    <div className={cx('frame-ring relative shrink-0 rounded-full', frameCls, className)} style={{ width: size, height: size, padding: pad }}>
      {photo ? (
        <img src={photo} alt="" className="h-full w-full rounded-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-surface2" style={{ fontSize: size * 0.52, lineHeight: 1 }}>
          {emoji}
        </div>
      )}
      {children}
    </div>
  );
}
