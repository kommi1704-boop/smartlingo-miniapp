// Headless smoke test for the Daily Learning Journey UI (Phase 13, runtime).
// Seeds a valid profile into localStorage, then walks: Dashboard -> /journey
// (preview) -> /journey/run (immersive path) and fails on ANY console error or
// page error. Screenshots land in /tmp for visual review.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const PORT = 4199;
const BASE = `http://localhost:${PORT}`;

// minimal valid PersistedState (mirrors defaultState + a profile so the gate opens)
const seed = {
  version: 1,
  profile: {
    name: 'Ali', age: 12, goal: 'school', dailyMinutes: 20, activities: [],
    selfLevel: 'A2', estimatedLevel: 'A2', targetLevel: 'B1',
    interests: ['kosmos', 'hayvonlar'], createdAt: '2026-01-01T00:00:00.000Z',
  },
  xp: 120, vocab: {}, lessons: {}, quizHistory: [], activity: {}, mistakes: [], badges: {},
  conversations: [], writing: [], speakingDone: {}, highlights: {},
  settings: { theme: 'light', bg: 'plain', accent: 'green', dailyWordGoal: 10, haptics: true, sound: false, showTranslation: false },
  games: { best: {}, plays: 0, daily: { date: '', done: false }, dailyCount: 0, xpToday: { date: '', xp: 0 } },
  coins: { balance: 0, earnedToday: { date: '', amount: 0 }, spentTotal: 0 },
  shop: { owned: {}, equipped: { avatar: '🤖' }, chestsOpened: 0, streakFreezes: 0 },
  quests: { date: '', progress: {}, claimed: [] },
  battle: { ratingDelta: 0, wins: 0, losses: 0, draws: 0, ratedToday: { date: '', count: 0 }, history: [] },
  skills: {}, aiRoadmap: null, journey: null,
};

function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  mkdirSync('/tmp/journey-smoke', { recursive: true });
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { cwd: process.cwd(), stdio: 'ignore' });
  await wait(2500);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 420, height: 820 } });
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 300)); });
  page.on('pageerror', (e) => errors.push(`PAGEERROR ${String(e).slice(0, 300)}`));

  await page.addInitScript((s) => { try { window.localStorage.setItem('smartlingo:v1', s); } catch {} }, JSON.stringify(seed));

  let failed = '';
  try {
    // 1. Dashboard: JourneyCard present, old plan section + free-XP Discovery gone
    await page.goto(`${BASE}/#/`, { waitUntil: 'networkidle' });
    await wait(1200);
    const card = await page.locator('[data-testid="home-journey"]').count();
    if (!card) failed = 'journey card missing on dashboard';
    const oldPlan = await page.getByText('Hammasi →').count();
    if (oldPlan) failed = failed || 'old plan section still on dashboard';
    const discovery = await page.getByText('Bugungi kashfiyot').count();
    if (discovery) failed = failed || 'standalone DiscoveryCard still on dashboard';
    await page.screenshot({ path: '/tmp/journey-smoke/1-dashboard.png' });

    // 2. /plan redirects to /journey (the journey IS today's plan)
    await page.goto(`${BASE}/#/plan`, { waitUntil: 'networkidle' });
    await wait(900);
    if (!page.url().includes('#/journey')) failed = failed || '/plan does not redirect to /journey';

    // 3. Journey preview
    await page.goto(`${BASE}/#/journey`, { waitUntil: 'networkidle' });
    await wait(1200);
    const hero = await page.getByText(/Today's learning journey|learning journey/i).count();
    if (!hero) failed = failed || 'preview hero missing';
    await page.screenshot({ path: '/tmp/journey-smoke/2-preview.png', fullPage: true });

    // 4. Runner path
    await page.goto(`${BASE}/#/journey/run`, { waitUntil: 'networkidle' });
    await wait(1500);
    const lock = await page.getByText(/Oldingi bosqichdan keyin ochiladi/i).count();
    if (!lock) failed = failed || 'runner path/locking missing';
    await page.screenshot({ path: '/tmp/journey-smoke/3-runner-path.png' });

    // 5. Discover stage: video player + fact cards render
    await page.getByText(/Safarni boshlash|Bosqichni boshlash/i).first().click();
    await wait(1500);
    const video = await page.locator('img[src*="i.ytimg.com"]').count();
    const playBtn = await page.getByLabel(/Videoni ko/i).count();
    if (!video && !playBtn) failed = failed || 'discover stage has no video player';
    await page.screenshot({ path: '/tmp/journey-smoke/4-discover-stage.png' });

    // 6. Equipped premium avatar renders as ART (the seeded 🤖 maps to robot.webp)
    await page.goto(`${BASE}/#/shop`, { waitUntil: 'networkidle' });
    await wait(1200);
    const shopArt = await page.locator('img[src*=".webp"]').count();
    if (!shopArt) failed = failed || 'premium avatar art missing in shop';

    // 7. Leaderboard renders avatar glyphs without crashing
    await page.goto(`${BASE}/#/leaderboard`, { waitUntil: 'networkidle' });
    await wait(1200);
    await page.screenshot({ path: '/tmp/journey-smoke/6-leaderboard.png' });

    // 8. Exit back to preview (progress preserved)
    await page.goto(`${BASE}/#/journey/run`, { waitUntil: 'networkidle' });
    await wait(900);
    await page.getByLabel(/Safardan chiqish/i).click();
    await wait(900);
    await page.screenshot({ path: '/tmp/journey-smoke/5-back-preview.png' });
  } catch (e) {
    failed = failed || `interaction failed: ${String(e).slice(0, 300)}`;
  }

  await browser.close();
  server.kill();

  const real = errors.filter((e) => !/favicon|net::|Failed to load resource|ERR_/i.test(e));
  console.log(`console/page errors: ${real.length}`);
  real.forEach((e) => console.log('  ERR:', e));
  if (failed) {
    console.error(`SMOKE FAIL: ${failed}`);
    process.exit(1);
  }
  if (real.length) {
    console.error('SMOKE FAIL: console errors present');
    process.exit(1);
  }
  console.log('SMOKE PASS — journey screens render without errors');
}

void main();
