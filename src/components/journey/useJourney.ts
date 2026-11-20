// React hook for the Daily Learning Journey — the render-safe session accessor.
//
// `ensureJourney()` writes state, so it runs in an EFFECT, never during render.
// The first render may return null (before the effect lands) — callers render
// a quiet placeholder; the next tick brings the session.
import { useEffect } from 'react';
import { useApp } from '../../store/store';
import { ensureJourney, sessionOf } from '../../store/journeyActions';
import { today } from '../../lib/dates';
import type { JourneySession, JourneyState } from '../../types';

export function useJourneySession(): { session: JourneySession; j: JourneyState } | null {
  const s = useApp();
  useEffect(() => {
    ensureJourney();
  }, []);
  if (!s.journey || s.journey.date !== today()) return null;
  const session = sessionOf(s);
  return session ? { session, j: s.journey } : null;
}
