import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';
import { initTelegram, setHapticsEnabled } from './lib/telegram';
import { applyTheme } from './lib/theme';
import { getState } from './store/store';
import { initSync } from './lib/sync';

initTelegram();
const st = getState();
applyTheme(st.settings.theme);
setHapticsEnabled(st.settings.haptics);

void initSync();

// Bot shortcuts (/plan, /battle, ...) open the app as  <url>/?go=<page>  — jump straight to that page.
try {
  const go = new URLSearchParams(window.location.search).get('go');
  if (go && ['plan', 'battle', 'leaderboard', 'games', 'profile', 'vocab'].includes(go) && st.profile) {
    window.location.hash = `/${go}`;
  }
} catch {
  /* ignore */
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
