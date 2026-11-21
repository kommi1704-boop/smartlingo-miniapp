// Brand YouTube player for the journey DISCOVER stage (user request: learners
// understand the topic through video). Curated, oEmbed-verified IDs only (see
// data/videos.ts) — this component never receives an arbitrary id.
//
// - Lazy: the iframe mounts only when the learner taps Play (no heavy embeds
//   on page load, mobile-data friendly).
// - Thumbnail from YouTube's CDN; if it cannot load, a branded gradient
//   placeholder keeps the layout intact.
// - External "open in browser/Telegram" link as the universal fallback
//   (e.g. iOS Mini App webviews).
import { useState } from 'react';
import { Emo } from '../Emo';
import { Icon } from '../Icon';
import { Pill } from '../ui';
import { cx } from '../../lib/utils';

export function VideoPlayer({ videoId, title, channel, noteUz, compact }: { videoId: string; title: string; channel: string; noteUz?: string; compact?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [thumbOk, setThumbOk] = useState(true);

  return (
    <div className="overflow-hidden rounded-3xl border-2 border-line bg-surface">
      <div className={cx('relative w-full overflow-hidden bg-gradient-to-br from-[#4338ca] to-[#0ea5e9]', compact ? 'aspect-video' : 'aspect-video')}>
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            className="absolute inset-0 h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 h-full w-full"
            aria-label={`Videoni ko'rish: ${title}`}
          >
            {thumbOk ? (
              <img
                src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
                alt=""
                onError={() => setThumbOk(false)}
                className="absolute inset-0 h-full w-full object-cover opacity-90"
              />
            ) : (
              <span className="absolute inset-0 grid place-items-center"><Emo n="rocket" size={56} /></span>
            )}
            <span className="absolute inset-0 bg-gradient-to-t from-[#1e1b4b]/80 via-transparent to-transparent" />
            <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 shadow-xl transition group-active:scale-90">
              <Icon name="play" className="ml-1 h-7 w-7 text-[#4f46e5]" />
            </span>
            <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[10.5px] font-black text-white">YouTube · {channel}</span>
          </button>
        )}
      </div>
      <div className="p-3">
        <p className="truncate text-[14px] font-extrabold">{title}</p>
        {noteUz && <p className="mt-0.5 text-[12px] font-semibold leading-snug text-muted">{noteUz}</p>}
        <div className="mt-1.5 flex items-center gap-2">
          <Pill tone="violet"><Emo n="headset" size={12} /> Tinglab tushunish uchun</Pill>
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1 text-[11.5px] font-bold text-accent dark:text-[#7ee2a8]"
          >
            <Icon name="globe" className="h-3.5 w-3.5" /> Brauzerda ochish
          </a>
        </div>
      </div>
    </div>
  );
}
