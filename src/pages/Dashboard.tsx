// SmartLingo Home — premium dark restructure.
// Hierarchy: greeting → continue learning → Learning Universe teaser →
// daily challenge → quick access → stats → recent activity.
// Every number is derived from real state / real catalogs — nothing fake.
import { useMemo } from 'react';
import { A, navigate } from '../lib/router';
import { useApp } from '../store/store';
import { buildPlan, planSummary } from '../lib/plan';
import { streakOf, xpProgress, BADGES } from '../lib/gamification';
import { nameStyleClasses } from '../lib/shop';
import { isOwnedActive, claimQuest } from '../store/actions';
import { today } from '../lib/dates';
import { Button, Card, LevelBadge, ProgressBar, ProgressRing, Section, StatTile } from '../components/ui';
import { Icon } from '../components/Icon';
import { Avatar } from '../components/Avatar';
import { LingoBubble, Mascot, type Mood } from '../components/Mascot';
import { CountUp, DotChart, StreakWeek } from '../components/Alive';
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
  const greet = hour < 5 ? 'Tungi boyqush' : hour < 11 ? 'Xayrli tong' : hour < 18 ? 'Salom' : 'Xayrli kech';
  const lingoLine = useMemo(() => {
    if (lingoMood === 'sleep') return 'Zzz… kech bo‘ldi! Bitta qisqa mashq qilamiz-u, keyin dam olamiz 🌙';
    if (lingoMood === 'sad') return 'Kechagi kunni o‘tkazib yuboribsan… Bugun bitta mashq bilan seriyani qaytaramiz! 💪';
    if (lingoMood === 'proud') return 'Zo‘r! Bugungi reja tayyor 🎉 Endi o‘yin yoki jang vaqti!';
    if (lingoMood === 'wow') return 'Salom! Men Lingo. Birga birinchi mashqni boshlaymizmi? ✨';
    if (lingoMood === 'love') return `${streak} kunlik seriya! Sen eng zo‘r o‘quvchisan 💜`;
    if (streak >= 3) return `${streak} kunlik seriya! Olovni o‘chirmaylik 🔥`;
    return next ? `Bugun «${next.title}» dan boshlaymizmi? Men tayyorman!` : 'Bugun yangi so‘zlar o‘rganamizmi?';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lingoMood, streak, next?.title]);

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
    { path: '/vocab', label: 'So‘zlar', emoji: '🃏', count: `${learned}/${VOCAB.length}`, tint: 'bg-emerald-500/15' },
    { path: '/grammar', label: 'Grammatika', emoji: '🧩', count: `${GRAMMAR.length} dars`, tint: 'bg-blue-500/15' },
    { path: '/reading', label: 'O‘qish', emoji: '📖', count: `${READING.length} matn`, tint: 'bg-lav/30' },
    { path: '/listening', label: 'Tinglash', emoji: '🎧', count: `${LISTENING.length} mashq`, tint: 'bg-sun/30' },
    { path: '/speaking', label: 'Gaplashish', emoji: '🗣️', count: `${SPEAKING.length} mavzu`, tint: 'bg-coral/30' },
    { path: '/writing', label: 'Yozish', emoji: '✍️', count: `${WRITING.length} mavzu`, tint: 'bg-sky-500/15' },
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
      {/* ---------- B. Alive hero: Lingo + speech bubble + XP ---------- */}
      <section className="aurora rise-in rounded-3xl p-4 shadow-xl shadow-accent/25 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {s.shop.equipped.avatar && <Avatar emoji={s.shop.equipped.avatar} size={30} />}
            <h1 className={cx('truncate text-lg font-extrabold leading-tight sm:text-xl', nameCls)}>{greet}, {p.name}!</h1>
          </div>
          <span className="glass-card shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold !text-white">{p.estimatedLevel}</span>
        </div>

        <div className="mt-3 flex items-end gap-2">
          <Mascot mood={lingoMood} size={96} title="Lingo — bosing, javob beradi" />
          <div className="min-w-0 flex-1 pb-3">
            <LingoBubble text={lingoLine} />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-xs font-bold text-white/80">
            <span>Daraja {xp.level}</span>
            <span><CountUp value={xp.into} /> / {fmt(xp.need)} XP</span>
          </div>
          <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-white/15" role="progressbar" aria-valuenow={xp.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Keyingi darajagacha">
            <div className="xp-fill h-full rounded-full transition-all duration-700" style={{ width: `${Math.max(4, xp.pct)}%` }} />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <A to="/progress" className="glass-card tap rounded-2xl px-2.5 py-2 !text-white">
            <span className="block text-[11px] font-semibold text-white/70">Seriya</span>
            <span className="text-base font-black"><span className="flame-dance">🔥</span> <CountUp value={streak} /></span>
          </A>
          <A to="/progress" className="glass-card tap rounded-2xl px-2.5 py-2 !text-white">
            <span className="block text-[11px] font-semibold text-white/70">Jami XP</span>
            <span className="text-base font-black">⭐ <CountUp value={s.xp} /></span>
          </A>
          <A to="/shop" className="glass-card tap rounded-2xl px-2.5 py-2 !text-white">
            <span className="block text-[11px] font-semibold text-white/70">Coin</span>
            <span className="text-base font-black"><span className="coin-spin">🪙</span> <CountUp value={s.coins.balance} /></span>
          </A>
        </div>
      </section>

      {/* ---------- Weekly streak (hex badges) ---------- */}
      <Card className="glass-card rise-in mt-3 !p-4" >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-extrabold">Haftalik seriya</p>
          <span className="text-xs font-bold text-gold">{streak > 0 ? `🔥 ${streak} kun ketma-ket` : 'Bugun boshlang!'}</span>
        </div>
        <StreakWeek activity={s.activity} />
      </Card>

      {/* ---------- C. Continue learning ---------- */}
      <Section title="Davom ettirish" action={<A to="/plan" className="text-sm font-semibold text-accent dark:text-[#7ee2a8]">Reja →</A>}>
        <Card className="!p-4">
          <div className="flex items-center gap-4">
            <ProgressRing value={sum.pct} size={72} stroke={8}>
              <span className="text-base font-extrabold">{sum.pct}%</span>
            </ProgressRing>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold">{next ? next.title : 'Bugungi reja bajarildi 🎉'}</p>
              <p className="mt-0.5 truncate text-xs text-muted">
                {lastMeta
                  ? `Oxirgi mashq: ${lastMeta.emoji} ${lastMeta.label} · ${sum.doneCount}/${sum.count} bugun`
                  : `${sum.doneCount}/${sum.count} bugungi mashq · ${p.dailyMinutes} daqiqa maqsad`}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-muted">So‘zlar: {Math.min(day?.words ?? 0, goal)}/{goal} · {next?.reason ?? 'Yangi mashqlar kutmoqda'}</p>
            </div>
          </div>
          <Button className="mt-4" size="lg" full icon="play" onClick={() => navigate(next ? next.route : '/universe')}>
            {next ? 'Davom ettirish' : 'Universeni ochish'}
          </Button>
        </Card>
      </Section>

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
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface2 text-base">{m.quest.emoji}</span>
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
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-base">{daily?.emoji ?? '🎮'}</span>
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
            <A key={q.path} to={q.path} style={{ animationDelay: `${i * 60}ms` }} className="rise-in tap flex flex-col items-center gap-1 rounded-3xl border-2 border-line/70 bg-surface px-2 py-3 text-center transition hover:-translate-y-0.5 hover:border-leaf/60 hover:shadow-[0_10px_22px_-12px_rgba(88,204,131,0.45)]">
              <span className={cx('flex h-11 w-11 items-center justify-center rounded-2xl text-2xl', q.tint)}>{q.emoji}</span>
              <span className="text-xs font-bold">{q.label}</span>
              <span className="text-[10px] font-semibold text-muted">{q.count}</span>
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
                      <p className="truncate text-sm font-semibold">{meta ? `${meta.emoji} ` : ''}{q.title}</p>
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
    </div>
  );
}
