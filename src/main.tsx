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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
