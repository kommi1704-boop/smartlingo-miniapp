import type { ReactNode } from 'react';
import { useApp } from '../store/store';
import { DEFAULT_AVATAR, frameClassFor } from '../lib/shop';
import { ratingOf } from '../lib/gamification';
import { isOwnedActive } from '../store/actions';
import { avatarArtFor } from '../lib/avatarArt';
import { cx } from '../lib/utils';

/**
 * Circular avatar with the equipped frame ring.
 * Priority: uploaded photo → premium avatar ART (AI-generated character) → plain emoji.
 */
export function Avatar({ emoji, size = 64, className }: { emoji: string; size?: number; className?: string }) {
  const s = useApp();
  const ring = frameClassFor(s.shop.equipped.frame, isOwnedActive, ratingOf(s));
  const pad = size >= 80 ? 6 : 4;
  const photo = s.profile?.photoAvatar;
  const art = avatarArtFor(emoji);
  return (
    <div
      className={cx('frame-ring shrink-0 rounded-full', ring, className)}
      style={{ width: size, height: size, padding: pad }}
      role="img"
      aria-label="Avatar"
    >
      {photo ? (
        <img src={photo} alt="" className="h-full w-full rounded-full object-cover" />
      ) : art ? (
        <img src={art} alt="" className="h-full w-full rounded-full object-cover" />
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
  const art = avatarArtFor(emoji);
  return (
    <div className={cx('frame-ring relative shrink-0 rounded-full', frameCls, className)} style={{ width: size, height: size, padding: pad }}>
      {photo ? (
        <img src={photo} alt="" className="h-full w-full rounded-full object-cover" />
      ) : art ? (
        <img src={art} alt="" className="h-full w-full rounded-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-surface2" style={{ fontSize: size * 0.52, lineHeight: 1 }}>
          {emoji}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * Compact frameless avatar for list rows (leaderboards, championships).
 * Renders: the learner's own uploaded photo on their row → premium avatar art
 * → the plain emoji char. No store writes, no layout shift.
 */
export function AvatarGlyph({ value, size = 36, className }: { value?: string; size?: number; className?: string }) {
  const s = useApp();
  const equipped = s.shop.equipped.avatar ?? DEFAULT_AVATAR;
  const isMine = (value ?? DEFAULT_AVATAR) === equipped;
  const photo = isMine ? s.profile?.photoAvatar : undefined;
  const art = avatarArtFor(value);
  if (photo || art) {
    return <img src={photo ?? art} alt="" className={cx('shrink-0 rounded-full object-cover', className)} style={{ width: size, height: size }} />;
  }
  return (
    <span
      className={cx('flex shrink-0 items-center justify-center rounded-full bg-surface2', className)}
      style={{ width: size, height: size, fontSize: size * 0.55, lineHeight: 1 }}
      aria-hidden
    >
      {value ?? DEFAULT_AVATAR}
    </span>
  );
}
