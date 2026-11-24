// SmartLingo Home — premium dark restructure.
// Hierarchy: greeting → Bugungi reja (Daily Learning Journey, one CTA) → weekly streak →
// weekly championship → Learning Universe teaser → daily challenge → quick access →
// stats → recent activity. Every number is derived from real state / real catalogs.
import { useMemo } from 'react';
import { A, navigate } from '../lib/router';
import { useApp } from '../store/store';
import { buildPlan, planSummary } from '../lib/plan';
import { streakOf, xpProgress, BADGES } from '../lib/gamification';
import { nameStyleClasses } from '../lib/shop';
import { isOwnedActive, claimQuest } from '../store/actions';
import { today, dayOfYear } from '../lib/dates';
import { Button, Card, LevelBadge, ProgressBar, Section, StatTile } from '../components/ui';
import { Icon } from '../components/Icon';
import { Avatar } from '../components/Avatar';
import { LingoBubble, Mascot, type Mood } from '../components/Mascot';
import { CountUp, DotChart, StreakWeek } from '../components/Alive';
import { ChampionshipCard } from '../components/DailyExtras';
import { JourneyCard } from '../components/journey/JourneyCard';
import { Emo, Glyph } from '../components/Emo';
import { WhatsNew } from '../components/WhatsNew';
import { IntroTour } from '../components/IntroTour';
import { APP_VERSION } from '../lib/version';
import { cx, fmt } from '../lib/utils';
import { LEVEL_DESC } from '../data/options';
import { dailyGameId, gameInfo, DAILY_BONUS_XP } from '../lib/games';
import { missionsFor, universeOverall } from '../lib/universe';
import { VOCAB } from '../data/vocab';
import { GRAMMAR } from '../data/grammar';
import { READING } from '../data/reading';
import { LISTENING } from '../data/listening';
import { SPEAKING } from '../data/speaking';
import { WRITING } from '../data/writing';

/** Quiz-history kind → display info for "continue learning" + recent activity. */
const KIND_META: Record<string, { label: string; route: string; emoji: string }> = {
  vocab: { label: 'So‘z boyligi', route: '/vocab', emoji: '🃏' },
  'vocab-quiz': { label: 'So‘z boyligi', route: '/vocab', emoji: '🃏' },
  matching: { label: 'Moslashtirish', route: '/games/memory', emoji: '🧠' },
  grammar: { label: 'Grammatika', route: '/grammar', emoji: '🧩' },
  reading: { label: 'O‘qish', route: '/reading', emoji: '📖' },
  listening: { label: 'Tinglash', route: '/listening', emoji: '🎧' },
  writing: { label: 'Yozish', route: '/writing', emoji: '✍️' },
  placement: { label: 'Daraja testi', route: '/progress', emoji: '🎯' },
};

export function Dashboard() {
  const s = useApp();
  const p = s.profile!;
  const plan = useMemo(() => buildPlan(s), [s]);
  const sum = planSummary(plan);
  const streak = streakOf(s.activity);
  const xp = xpProgress(s.xp);
  const t = today();
  const day = s.activity[t];
  const nameCls = nameStyleClasses(s.shop.equipped, isOwnedActive);
  const goal = s.settings.dailyWordGoal;
  const next = plan.find((i) => !i.done);
  const missions = missionsFor(s);
  const overall = universeOverall(s);

  // Lingo reacts to the learner's real state
  const hour = new Date().getHours();
  const everActive = Object.keys(s.activity).length > 0;
  const lingoMood: Mood = sum.allDone ? 'proud' : hour >= 22 || hour < 5 ? 'sleep' : everActive && streak === 0 ? 'sad' : !everActive ? 'wow' : streak >= 7 ? 'love' : 'happy';
  // a small set of natural greetings per time of day — the day of the year picks one,
  // so it feels less scripted but stays stable within a day
  const greetSets = [
    ['Tungi boyqush'], // night
    ['Xayrli tong', 'Assalomu alaykum', 'Ertalabki salom'], // morning
    ['Salom', 'Qaleysiz', 'Ajoyib kun'], // day
    ['Xayrli kech', 'Kunning yaxshi yakuni'], // evening
  ] as const;
  const greet = greetSets[hour < 5 ? 0 : hour < 11 ? 1 : hour < 18 ? 2 : 3][dayOfYear(today()) % greetSets[hour < 5 ? 0 : hour < 11 ? 1 : hour < 18 ? 2 : 3].length];
  const lingoLine = useMemo(() => {
    const day = dayOfYear(today());
    const pick = (arr: readonly string[]): string => arr[day % arr.length];
    // update hook: after an update Lingo himself points at the news card before anything else
    if (s.settings.seenVersion !== APP_VERSION && s.settings.introDone !== false) {
      return pick(['Psst… yangiliklar bor! 🎉 Pastdagi kartani ochib ko‘r — siz uchun nima o‘zgarganini aytaman', 'Kutilma! Avval yangi xabarni o‘qiydik — shunchaki bosing, men batafsil aytaman']);
    }
    if (lingoMood === 'sleep') return pick(['Zzz… kech bo‘ldi-da. Bitta qisqa mashq, keyin dam — kelishdikmi?', 'Uyquda ham lug‘at yodlayman 😴 Bitami, keyin bo’shamiz?']);
    if (lingoMood === 'sad') return pick(['Kechagi kun o‘tib ketdi… mayli, bo‘ldi qilib qo‘yamiz. Bugun bitta mashq bilan seriyani qaytaramiz', 'Seriyani yo‘qotdik, chidiydir. Bugungi mashq bilan qayta boshlaymizmi?']);
    if (lingoMood === 'proud') return pick(['Bugungisi ham tugadi — zo‘r ketyapsiz! Xohlasangiz o‘yin yoki jang bilan yakunlaymiz', 'Reja bitdi! Endi dam olish ham mumkin, o‘yin ham 😄']);
    if (lingoMood === 'wow') return pick(['Salom! Men Lingo. Birinchi mashqni birga boshlaymizmi?', 'Ooh, yangi o‘quvchi! Bir so‘zdan boshlaymiz, bo‘ladimi?']);
    if (lingoMood === 'love') return pick([`${streak} kunlik seriya! Men birovga bu qadar xursand bo‘lmasdim 😊`, `${streak} kun ketma-ket — o‘chirmaymiz bu olovni!`]);
    if (streak >= 3) return pick([`${streak} kunlik seriya bor. O‘chirmaymiz!`, `Seriya ${streak} kunda — davomi bor-ku!`]);
    return next ? pick([`Bugun «${next.title}» dan boshlaymizmi? Men tayyorman`, `«${next.title}» sizni kutmoqda. Boshlaymizmi?`]) : pick(['Bugun yangi so‘zlar o‘rganamizmi?', 'Keling, bugun ham bir-ikki so‘z qo‘shamiz']);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lingoMood, streak, next?.title, s.settings.seenVersion, s.settings.introDone]);

  const totalLessons = Object.values(s.lessons).filter((l) => l.completed).length;
  const totalReviews = Object.values(s.vocab).reduce((a, v) => a + v.reviews, 0);
  const learned = Object.values(s.vocab).filter((v) => v.status === 'learned').length;

  // last finished quiz → "continue learning" context
  const lastQuiz = s.quizHistory[s.quizHistory.length - 1];
  const lastMeta = lastQuiz ? KIND_META[lastQuiz.kind] : undefined;

  const recent = s.quizHistory.slice(-4).reverse();
  const daily = gameInfo(dailyGameId());
  const dailyDone = s.games.daily.date === t && s.games.daily.done;

  const quick = [
    { path: '/vocab', label: 'So‘zlar', emoji: '🃏', count: `${learned}/${VOCAB.length}`, tile: 'tile-green' },
    { path: '/grammar', label: 'Grammatika', emoji: '🧩', count: `${GRAMMAR.length} dars`, tile: 'tile-blue' },
    { path: '/reading', label: 'O‘qish', emoji: '📖', count: `${READING.length} matn`, tile: 'tile-purple' },
    { path: '/listening', label: 'Tinglash', emoji: '🎧', count: `${LISTENING.length} mashq`, tile: 'tile-yellow' },
    { path: '/speaking', label: 'Gaplashish', emoji: '🗣️', count: `${SPEAKING.length} mavzu`, tile: 'tile-coral' },
    { path: '/writing', label: 'Yozish', emoji: '✍️', count: `${WRITING.length} mavzu`, tile: 'tile-sky' },
  ];

  const apps = [
    { path: '/games', label: 'O‘yinlar', icon: 'game' as const },
    { path: '/battle', label: 'Janglar', icon: 'swords' as const },
    { path: '/stars', label: 'Tangalar', icon: 'coins' as const },
    { path: '/shop', label: 'Do‘kon', icon: 'cart' as const },
    { path: '/leaderboard', label: 'Reyting', icon: 'trophy' as const },
    { path: '/progress', label: 'Progress', icon: 'chart' as const },
  ];

  return (
    <div>
      {/* ---------- B. Sky hero: greeting + Lingo + XP ---------- */}
      <section className="sky-hero rise-in p-4 pb-7 sm:p-5 sm:pb-8">
        <span className="pg-drift pointer-events-none absolute right-5 top-14 opacity-80" aria-hidden><Emo n="star" size={22} /></span>
        <span className="pg-drift pointer-events-none absolute left-[46%] top-3 opacity-70" style={{ animationDelay: '1.2s' }} aria-hidden><Emo n="sparkle" size={17} /></span>
        <div className="relative z-[1] flex items-center justify-between gap-2">
          <A to="/profile" className="flex min-w-0 items-center gap-2" aria-label="Profil">
            {s.shop.equipped.avatar && <Avatar emoji={s.shop.equipped.avatar} size={34} />}
            <h1 className={cx('truncate text-lg font-black leading-tight text-ink sm:text-xl', nameCls)}>{greet}, {p.name}!</h1>
          </A>
          <span className="shrink-0 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-black text-[#3b95e6] shadow-sm dark:bg-white/10 dark:text-white">{p.estimatedLevel}</span>
        </div>

        <div className="relative z-[1] mt-3 flex items-end gap-2">
          <Mascot mood={lingoMood} size={96} title="Lingo — bosing, javob beradi" />
          <div className="min-w-0 flex-1 pb-3">
            <LingoBubble text={lingoLine} />
          </div>
        </div>

        <div className="relative z-[1] mt-3 grid grid-cols-3 gap-2 tnum">
          <A to="/progress" className="tap rounded-2xl bg-white/90 px-2.5 py-2 shadow-sm dark:bg-white/10">
            <span className="block text-[11px] font-bold text-muted">Seriya</span>
            <span className="flex items-center gap-1 text-base font-black text-[#d6523f]"><span className="flame-dance inline-flex"><Emo n="flame" size={17} /></span> <CountUp value={streak} /></span>
          </A>
          <A to="/progress" className="tap rounded-2xl bg-[#fff3c2] px-2.5 py-2 shadow-sm dark:bg-white/10">
            <span className="block text-[11px] font-bold text-[#8a6a00] dark:text-white/70">XP</span>
            <span className="flex items-center gap-1 text-base font-black text-[#5a3d00] dark:text-white"><Emo n="star" size={17} /> <CountUp value={s.xp} /></span>
          </A>
          <A to="/shop" className="tap rounded-2xl bg-[#fff3c2] px-2.5 py-2 shadow-sm dark:bg-white/10">
            <span className="block text-[11px] font-bold text-[#8a6a00] dark:text-white/70">Coin</span>
            <span className="flex items-center gap-1 text-base font-black text-[#5a3d00] dark:text-white"><span className="coin-spin inline-flex"><Emo n="coin" size={17} /></span> <CountUp value={s.coins.balance} /></span>
          </A>
        </div>
      </section>

      {/* XP level bar sits on a card so it never fights the sky */}
      <div className="play-card rise-in -mt-4 relative z-[2] mx-3 px-3.5 py-2.5">
        <div className="flex items-center justify-between text-xs font-extrabold text-muted">
          <span>Daraja {xp.level}</span>
          <span><CountUp value={xp.into} /> / {fmt(xp.need)} XP</span>
        </div>
        <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-line/60" role="progressbar" aria-valuenow={xp.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Keyingi darajagacha">
          <div className="xp-fill h-full rounded-full transition-all duration-700" style={{ width: `${Math.max(4, xp.pct)}%` }} />
        </div>
      </div>

      {/* ---------- Bugungi reja = Daily Learning Journey ----------
          ONE engaging AI session per day with a single CTA (Duolingo-style). The old
          adaptive task list no longer clutters the home screen (the classic exercises
          stay available in the Learn hub), and the Daily Discovery now lives INSIDE
          the journey's first stage — so nothing on the home screen awards XP for free. */}
      <JourneyCard />

      {/* ---------- Weekly streak (hex badges) ---------- */}
      <div className="play-card rise-in mt-4 p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-black">Haftalik seriya</p>
          <span className="rounded-full bg-[#ffeae6] px-2.5 py-0.5 text-xs font-extrabold text-[#d6523f] dark:bg-surface2">{streak > 0 ? `🔥 ${streak} kun ketma-ket` : 'Bugun boshlang!'}</span>
        </div>
        <StreakWeek activity={s.activity} />
      </div>

      {/* ---------- Weekly Championship preview (Phase 5) ---------- */}
      <ChampionshipCard />

      {/* ---------- AI Tutor featured card ---------- */}
      <A to="/tutor" className="tile tile-purple rise-in mt-4 flex items-center gap-3 rounded-[26px] p-4" data-testid="home-tutor">
        <Mascot mood="happy" size={64} title="Lingo" />
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-extrabold uppercase tracking-wider text-white/80">AI Tutor</span>
          <span className="block text-base font-black leading-snug">Lingo bilan gaplash</span>
          <span className="block text-xs font-semibold text-white/85">Savol ber, xatolaringni tuzat, mashq qil</span>
        </span>
        <Icon name="right" className="h-5 w-5 shrink-0" />
      </A>

      {/* ---------- D. Learning Universe teaser ---------- */}
      <Section title="Learning Universe">
        <A
          to="/universe"
          className="uni-teaser relative block overflow-hidden rounded-2xl border border-accent/25 p-4 text-white shadow-lg shadow-accent/10 transition active:scale-[0.99]"
          data-testid="home-universe"
        >
          <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden>
            <span className="absolute right-[18%] top-[22%] h-1 w-1 rounded-full bg-white/80" />
            <span className="absolute right-[38%] top-[64%] h-1 w-1 rounded-full bg-white/60" />
            <span className="absolute right-[8%] top-[72%] h-1.5 w-1.5 rounded-full bg-[#50d5f5]/70" />
            <span className="absolute right-[52%] top-[12%] h-1 w-1 rounded-full bg-white/50" />
          </div>
          <div className="relative flex items-center gap-4">
            {/* mini planet + floating isles (CSS art, GPU-cheap) */}
            <div className="relative h-20 w-20 shrink-0" aria-hidden>
              <div className="teaser-ring teaser-float-slow absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full [transform:translate(-50%,-50%)_rotate(-18deg)_scaleY(0.42)]" />
              <div className="teaser-planet teaser-float absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full" />
              <span className="teaser-float-slow absolute -left-1 top-1 text-base">🌱</span>
              <span className="teaser-float absolute -right-2 top-3 text-base">🌊</span>
              <span className="teaser-float-slow absolute bottom-0 left-2 text-base">🌌</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#50d5f5]">5 ta sehrli olam</p>
              <p className="mt-0.5 text-base font-extrabold leading-snug">Koinotni zabt eting</p>
              <p className="mt-0.5 text-xs text-slate-300">{overall}% egallandi · yangi dunyolar va XP sizni kutmoqda</p>
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
                Kashf qilish <Icon name="right" className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </A>
      </Section>

      {/* ---------- E. Daily challenge ---------- */}
      <Section title="Kunlik challenge" action={<A to="/shop" className="text-sm font-semibold text-accent dark:text-[#7ee2a8]">Vazifalar →</A>}>
        <Card className="!p-2">
          {missions.map((m) => (
            <div key={m.quest.id} className="flex items-center gap-3 px-2 py-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface2 text-base"><Glyph emoji={m.quest.emoji} size={22} /></span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="min-w-0 truncate text-sm font-bold">{m.quest.title}</p>
                  <span className="shrink-0 text-[11px] font-bold text-gold">+{m.quest.coins} 🪙</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <ProgressBar value={m.pct} className="h-1.5 flex-1" />
                  <span className={cx('shrink-0 text-[11px] font-semibold', m.claimed ? 'text-emerald-500 dark:text-emerald-400' : 'text-muted')}>
                    {m.claimed ? 'olingan ✓' : `${m.done}/${m.quest.target}`}
                  </span>
                </div>
              </div>
              {m.claimed ? (
                <span className="flex h-8 shrink-0 items-center rounded-xl bg-emerald-500/15 px-2.5 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">✓ Olingan</span>
              ) : (
                <Button size="sm" variant={m.claimable ? 'primary' : 'ghost'} disabled={!m.claimable} className="w-16 shrink-0" onClick={() => m.claimable && claimQuest(m.quest.id)}>
                  Olish
                </Button>
              )}
            </div>
          ))}
          {/* daily game row */}
          <A to="/games/daily" className="mt-1 flex items-center gap-3 rounded-xl border border-line bg-surface2/60 px-3 py-2.5 transition hover:border-accent/40">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-base"><Glyph emoji={daily?.emoji ?? '🎮'} size={22} /></span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold">{daily?.title ?? 'Kunlik o‘yin'}</span>
              <span className="block text-[11px] text-muted">{dailyDone ? 'Bugun bajarildi ✓' : `Hozir o‘ynang: +${DAILY_BONUS_XP} XP bonus`}</span>
            </span>
            <Icon name="right" className="h-4 w-4 shrink-0 text-muted" />
          </A>
        </Card>
      </Section>

      {/* ---------- F. Quick access (skills) ---------- */}
      <Section title="Tezkor kirish">
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
          {quick.map((q, i) => (
            <A key={q.path} to={q.path} style={{ animationDelay: `${i * 60}ms` }} className={cx('tile rise-in flex flex-col items-center gap-0.5 rounded-[22px] px-2 py-3 text-center', q.tile)}>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/35 text-2xl"><Glyph emoji={q.emoji} size={28} /></span>
              <span className="text-xs font-black">{q.label}</span>
              <span className="text-[10px] font-bold opacity-85">{q.count}</span>
            </A>
          ))}
        </div>
        <div className="mt-2.5 grid grid-cols-6 gap-2.5">
          {apps.map((a) => (
            <A key={a.path} to={a.path} className="flex flex-col items-center gap-1 rounded-2xl border border-line bg-surface2/60 px-1 py-2.5 text-center transition hover:border-accent/40 active:scale-[0.97]" aria-label={a.label}>
              <Icon name={a.icon} className="h-5 w-5 text-muted" />
              <span className="text-[11px] font-bold text-muted">{a.label}</span>
            </A>
          ))}
        </div>
      </Section>

      {/* ---------- Stats ---------- */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <StatTile icon="check" tone="emerald" label="Tugatilgan darslar" value={totalLessons} hint="grammatika, o‘qish, tinglash" />
        <StatTile icon="cards" tone="indigo" label="Takrorlangan so‘zlar" value={totalReviews} hint={`${learned} ta o‘rganildi`} />
      </div>

      {/* ---------- G. Recent activity ---------- */}
      <Section title="Yaqindagi faollik">
        <Card>
          <DotChart activity={s.activity} />
          <p className="mt-3 text-xs text-muted">{LEVEL_DESC[p.estimatedLevel].title} · <LevelBadge level={p.estimatedLevel} /> → maqsad <LevelBadge level={p.targetLevel} /></p>
          <div className="mt-4 border-t border-line pt-2">
            {recent.length === 0 ? (
              <p className="py-2 text-sm text-muted">Hali mashq bajarilmagan — yuqoridagi «Davom ettirish» bilan boshlang! 🚀</p>
            ) : (
              recent.map((q) => {
                const meta = KIND_META[q.kind];
                return (
                  <div key={q.id} className="flex items-center justify-between gap-3 border-b border-line py-2 last:border-0">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1 truncate text-sm font-semibold">{meta ? <Glyph emoji={meta.emoji} /> : null}{q.title}</p>
                      <p className="text-[11px] text-muted">{new Date(q.date).toLocaleDateString('uz-UZ')}</p>
                    </div>
                    <span className={cx('shrink-0 text-xs font-extrabold', q.score / Math.max(1, q.total) >= 0.6 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500')}>
                      {q.score}/{q.total}
                    </span>
                  </div>
                );
              })
            )}
            <A to="/progress" className="mt-2 flex items-center justify-center gap-1 text-xs font-bold text-accent dark:text-[#7ee2a8]">
              To‘liq progress va nishonlar ({Object.keys(s.badges).length}/{BADGES.length}) <Icon name="right" className="h-3.5 w-3.5" />
            </A>
          </div>
        </Card>
      </Section>

      {/* first-run Lingo tour + post-update "what's new" card */}
      <IntroTour />
      <WhatsNew />
    </div>
  );
}
