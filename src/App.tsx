import { Suspense, lazy, useEffect } from 'react';
import { navigate, goBack, segments, usePath } from './lib/router';
import { bindBackButton, tgUser } from './lib/telegram';
import { applyTheme, watchTheme } from './lib/theme';
import { getState, useApp } from './store/store';
import { dayStart } from './store/actions';
import { checkPendingCredits } from './lib/billing';
import { isTelegram } from './lib/telegram';
import { Shell, TAB_ROOTS } from './components/Shell';
import { Overlays } from './components/Overlays';
import { Button, Empty } from './components/ui';
import { Landing } from './pages/Landing';
import { Onboarding, Assessment, SkillProbes, Result } from './pages/Start';
import { Dashboard } from './pages/Dashboard';
import { Learn } from './pages/Learn';
import { Roadmap } from './pages/Roadmap';
import { Plan } from './pages/Plan';
import { Tutor } from './pages/Tutor';
import { Vocab } from './pages/Vocab';
import { GamesHub, GamePage } from './pages/Games';
import { GrammarList, GrammarLessonPage } from './pages/Grammar';
import { ReadingList, ReadingPage } from './pages/Reading';
import { ListeningList, ListeningPage } from './pages/Listening';
import { SpeakingList, SpeakingPage } from './pages/Speaking';
import { WritingList, WritingPage } from './pages/Writing';
import { Resources } from './pages/Resources';
import { Progress } from './pages/Progress';
import { Settings } from './pages/Settings';
import { More } from './pages/More';
import { Shop } from './pages/Shop';
import { Stars } from './pages/Stars';
import { Profile } from './pages/Profile';
import { Battle } from './pages/Battle';
import { Leaderboard } from './pages/Leaderboard';
import { PublicProfile } from './pages/PublicProfile';

// The 3D Learning Universe (three.js) ships as its own lazy chunk — it is only
// downloaded when a learner actually opens the world map.
const Universe = lazy(() => import('./pages/Universe'));

const PUBLIC = ['welcome', 'onboarding', 'assessment', 'assessment-extra', 'result'];

export function App() {
  const path = usePath();
  const s = useApp();
  const seg = segments(path);
  const first = seg[0];
  const hasProfile = !!s.profile;

  // theme (re-apply when the setting changes; follow Telegram/OS in "auto")
  useEffect(() => {
    applyTheme(s.settings.theme, s.settings.bg);
    return watchTheme(() => getState().settings);
  }, [s.settings.theme, s.settings.bg]);

  // daily upkeep: streak freeze auto-use, weekly streak bonus (safe to call any number of times)
  useEffect(() => {
    dayStart();
  }, []);

  // Coin Store ledger: apply any paid-but-unapplied Stars purchases exactly once at start
  useEffect(() => {
    if (isTelegram() && s.profile) void checkPendingCredits();
  }, [s.profile]);

  // Telegram native Back button
  const showBack = !!first && !TAB_ROOTS.includes(path);
  useEffect(() => bindBackButton(showBack, () => goBack('/')), [showBack, path]);

  // gate: new students start at the welcome page
  useEffect(() => {
    if (!hasProfile && !PUBLIC.includes(first ?? '')) navigate('/welcome', { replace: true });
  }, [hasProfile, first]);

  if (!hasProfile && !PUBLIC.includes(first ?? '')) return null;

  let page;
  if (first === 'welcome') page = <Landing />;
  else if (first === 'onboarding') page = <Onboarding defaultName={tgUser()?.first_name ?? ''} />;
  else if (first === 'assessment') page = <Assessment />;
  else if (first === 'assessment-extra') page = <SkillProbes />;
  else if (first === 'result') page = hasProfile ? <Result /> : null;

  if (page) {
    return (
      <>
        {page}
        <Overlays />
      </>
    );
  }

  let body;
  switch (first) {
    case undefined: body = <Dashboard />; break;
    case 'learning': body = <Learn />; break;
    case 'roadmap': body = <Roadmap />; break;
    case 'plan': body = <Plan />; break;
    case 'tutor': body = <Tutor />; break;
    case 'vocab': body = <Vocab />; break;
    case 'games': body = seg[1] ? <GamePage key={seg[1]} id={seg[1]} /> : <GamesHub />; break;
    case 'grammar': body = seg[1] ? <GrammarLessonPage id={seg[1]} /> : <GrammarList />; break;
    case 'reading': body = seg[1] ? <ReadingPage id={seg[1]} /> : <ReadingList />; break;
    case 'listening': body = seg[1] ? <ListeningPage id={seg[1]} /> : <ListeningList />; break;
    case 'speaking': body = seg[1] ? <SpeakingPage id={seg[1]} /> : <SpeakingList />; break;
    case 'writing': body = seg[1] ? <WritingPage id={seg[1]} /> : <WritingList />; break;
    case 'resources': body = <Resources />; break;
    case 'progress': body = <Progress />; break;
    case 'shop': body = <Shop />; break;
    case 'stars': body = <Stars />; break;
    case 'profile': body = <Profile />; break;
    case 'battle': body = <Battle />; break;
    case 'universe':
      body = (
        <Suspense
          fallback={
            <div className="flex h-56 items-center justify-center text-sm font-semibold text-muted">
              <span className="animate-pulse">🪐 Koinot yuklanmoqda…</span>
            </div>
          }
        >
          <Universe />
        </Suspense>
      );
      break;
    case 'leaderboard': body = <Leaderboard />; break;
    case 'u': body = seg[1] && /^\d{1,15}$/.test(seg[1]) ? <PublicProfile uid={seg[1]} /> : (
      <Empty emoji="🔍" title="O‘quvchi topilmadi" text="Bunday sahifa yo‘q." action={<Button onClick={() => navigate('/leaderboard')}>Reyting jadvali</Button>} />
    );
    break;
    case 'settings': body = <Settings />; break;
    case 'more': body = <More />; break;
    default:
      body = (
        <Empty emoji="🧭" title="Sahifa topilmadi" text="Bunday sahifa yo‘q. Bosh sahifaga qaytamiz." action={<Button onClick={() => navigate('/')}>Bosh sahifa</Button>} />
      );
  }

  return (
    <>
      <Shell>{body}</Shell>
      <Overlays />
    </>
  );
}
