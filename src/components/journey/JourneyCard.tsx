// Dashboard card for the Daily Learning Journey (Phase 7 integration).
// Compact teaser: theme title, minutes, progress dots — the full preview
// lives on /journey. Rendered on the home screen above Today's Discovery.
import { navigate } from '../../lib/router';
import { useJourneySession } from './useJourney';
import { journeyDoneCount } from '../../store/journeyActions';
import { themeById } from '../../lib/journey';
import { Emo } from '../Emo';
import { cx } from '../../lib/utils';

export function JourneyCard() {
  const data = useJourneySession();
  if (!data) return null;
  const { session, j } = data;
  const theme = themeById(session.themeId);
  const doneCount = journeyDoneCount(j, session);
  const allDone = doneCount === session.stages.length;
  const pct = Math.round((doneCount / session.stages.length) * 100);

  return (
    <button
      type="button"
      onClick={() => navigate('/journey')}
      className={cx(
        'rise-in mx-3 mt-4 flex w-[calc(100%-1.5rem)] items-center gap-3 overflow-hidden rounded-[26px] bg-gradient-to-br p-4 text-left text-white shadow-lg transition active:scale-[0.99]',
        theme.gradient,
        allDone ? 'shadow-emerald-500/20' : 'shadow-indigo-500/20',
      )}
      data-testid="home-journey"
      aria-label="Bugungi Learning Journey sahifasini ochish"
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15"><Emo n={theme.emo} size={26} /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10.5px] font-black uppercase tracking-widest text-white/80">Bugungi learning journey</span>
        <span className="block truncate text-[15.5px] font-black leading-snug">{session.titleEn}</span>
        <span className="mt-1 block text-[11.5px] font-bold text-white/85">
          {allDone ? '✓ Bajarildi — ertaga yangi mavzu!' : `${session.minutes} daqiqa · ${session.stages.length} bosqich`}
        </span>
        {!allDone && (
          <span className="mt-1.5 block h-2 w-full overflow-hidden rounded-full bg-white/25">
            <span className="block h-full rounded-full bg-white transition-all duration-500" style={{ width: `${Math.max(4, pct)}%` }} />
          </span>
        )}
      </span>
      {!allDone && <span className="shrink-0 rounded-2xl bg-white/25 px-3 py-2 text-[13px] font-black">{doneCount === 0 ? 'Boshlash' : 'Davom etish'}</span>}
    </button>
  );
}
