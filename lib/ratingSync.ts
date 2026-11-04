// The rating lives on the SERVER (table public.ratings); the app only displays it.
// refreshRating() asks the server for my current numbers and stores them in the local state.
// It is called on app start, when the Battle / Leaderboard pages open, and after every battle.
// Anything on the device that says otherwise (e.g. a hand-edited localStorage) is overwritten.
import { fetchMyRating, type MyRating } from './battleApi';
import { applyServerRating } from '../store/actions';

let inflight: Promise<MyRating | null> | null = null;

/** Fetches my server rating and stores it. Resolves null when the server cannot be reached. */
export function refreshRating(): Promise<MyRating | null> {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const m = await fetchMyRating();
      applyServerRating(m);
      return m;
    } catch {
      return null; // offline / not inside Telegram: keep showing the last known server numbers
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}
