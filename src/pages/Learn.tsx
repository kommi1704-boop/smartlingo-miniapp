// Learning hub — one place for every study tool ("O‘rganish" tab).
// All content numbers are derived from the REAL data arrays, so newly added
// material (reading/listening/…) is reflected here automatically.
import { useMemo } from 'react';
import { A } from '../lib/router';
import { useApp } from '../store/store';
import { buildPlan, planSummary } from '../lib/plan';
import { PageHeader, ProgressBar, Section, Card } from '../components/ui';
import { Icon, type IconName } from '../components/Icon';
import { cx } from '../lib/utils';
import { VOCAB } from '../data/vocab';
import { GRAMMAR } from '../data/grammar';
import { READING } from '../data/reading';
import { LISTENING } from '../data/listening';
import { SPEAKING } from '../data/speaking';
import { WRITING } from '../data/writing';
import { RESOURCES } from '../data/resources';
import { GAMES } from '../lib/games';

interface SkillTile {
  path: string;
  label: string;
  desc: string;
  icon: IconName;
  emoji: string;
  done: number;
  total: number;
  tint: string;
}

export function Learn() {
  const s = useApp();
  const plan = useMemo(() => buildPlan(s), [s]);
  const sum = planSummary(plan);
  const next = plan.find((i) => !i.done);

  const completed = (kind: string) => Object.entries(s.lessons).filter(([k, v]) => k.startsWith(`${kind}:`) && v.completed).length;
  const learned = Object.values(s.vocab).filter((v) => v.status === 'learned').length;
  const writingDone = new Set(s.writing.map((w) => w.promptId)).size;

  const skills: SkillTile[] = [
    { path: '/vocab', label: 'So‘z boyligi', desc: 'Kartochkalar va takrorlash', icon: 'cards', emoji: '🃏', done: learned, total: VOCAB.length, tint: 'text-emerald-600 bg-emerald-500/15' },
    { path: '/grammar', label: 'Grammatika', desc: 'Qoida + test savollari', icon: 'bulb', emoji: '🧩', done: completed('grammar'), total: GRAMMAR.length, tint: 'text-blue-600 bg-blue-500/15' },
    { path: '/reading', label: 'O‘qish', desc: 'Matn va savollar', icon: 'book', emoji: '📖', done: completed('reading'), total: READING.length, tint: 'text-violet-600 bg-lav/30' },
    { path: '/listening', label: 'Tinglash', desc: 'Audio + transkript', icon: 'headphones', emoji: '🎧', done: completed('listening'), total: LISTENING.length, tint: 'text-amber-600 bg-sun/30' },
    { path: '/speaking', label: 'Gaplashish', desc: 'AI tekshiradigan topshiriqlar', icon: 'mic', emoji: '🗣️', done: Object.keys(s.speakingDone).length, total: SPEAKING.length, tint: 'text-rose-500 bg-coral/30' },
    { path: '/writing', label: 'Yozish', desc: 'Insholar va tekshiruv', icon: 'pen', emoji: '✍️', done: writingDone, total: WRITING.length, tint: 'text-sky-600 bg-sky-500/15' },
  ];

  const tools: { path: string; label: string; desc: string; icon: IconName; emoji: string }[] = [
    { path: '/games', label: 'O‘yinlar', desc: `${GAMES.length} ta o‘yin + kunlik challenge`, icon: 'game', emoji: '🎮' },
    { path: '/battle', label: 'Do‘stona jang', desc: 'Raqibga qarshi reyting uchun', icon: 'swords', emoji: '⚔️' },
    { path: '/plan', label: 'Kunlik reja', desc: `${sum.doneCount}/${sum.count} bajarildi`, icon: 'calendar', emoji: '📅' },
    { path: '/roadmap', label: 'Yo‘l xaritasi', desc: 'Bosqichma-bosqich reja', icon: 'map', emoji: '🗺️' },
    { path: '/tutor', label: 'Lingo (AI)', desc: 'Erkin suhbat mashqi', icon: 'chat', emoji: '🤖' },
    { path: '/resources', label: 'Resurslar', desc: `${RESOURCES.length} ta tanlangan manba`, icon: 'globe', emoji: '🌍' },
  ];

  return (
    <div>
      <PageHeader emoji="🎓" tone="green" title="O‘quv markazi" subtitle="Barcha ko‘nikmalar va vositalar bir joyda" />

      {/* Today's plan — compact strip */}
      <A
        to="/plan"
        className="feature-ring flex items-center gap-3 rounded-2xl bg-surface p-4 transition active:scale-[0.99]"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-xl">📅</span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-extrabold">Bugungi reja · {sum.pct}%</span>
          <span className="block truncate text-xs text-muted">
            {next ? `Keyingi: ${next.title}` : 'Barcha mashqlar bajarildi — barakalla!'}
          </span>
          <ProgressBar value={sum.pct} className="mt-1.5 h-1.5" label="Kunlik reja progressi" />
        </span>
        <Icon name="right" className="h-4 w-4 shrink-0 text-muted" />
      </A>

      {/* Skills with live counts */}
      <Section title="Ko‘nikmalar">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {skills.map((sk) => {
            const pct = sk.total ? Math.min(100, Math.round((sk.done / sk.total) * 100)) : 0;
            return (
              <A key={sk.path} to={sk.path} className="flex flex-col rounded-3xl border-2 border-line/70 bg-surface p-3.5 transition hover:-translate-y-0.5 hover:border-leaf/60 hover:shadow-[0_10px_22px_-12px_rgba(88,204,131,0.45)] active:scale-[0.98]">
                <div className="flex items-center justify-between">
                  <span className={cx('flex h-10 w-10 items-center justify-center rounded-2xl text-lg', sk.tint)}>{sk.emoji}</span>
                  <span className="text-[11px] font-bold text-muted">{sk.done}/{sk.total}</span>
                </div>
                <span className="mt-2 text-sm font-extrabold">{sk.label}</span>
                <span className="mb-2 truncate text-[11px] text-muted">{sk.desc}</span>
                <ProgressBar value={pct} className="h-1.5" label={`${sk.label} progressi`} />
              </A>
            );
          })}
        </div>
      </Section>

      {/* Tools & games */}
      <Section title="Vositalar va o‘yinlar">
        <Card className="!p-2">
          <ul className="grid gap-1 sm:grid-cols-2">
            {tools.map((t) => (
              <li key={t.path}>
                <A to={t.path} className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition hover:bg-surface2">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface2 text-lg">{t.emoji}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{t.label}</span>
                    <span className="block truncate text-xs text-muted">{t.desc}</span>
                  </span>
                  <Icon name="right" className="h-4 w-4 shrink-0 text-muted" />
                </A>
              </li>
            ))}
          </ul>
        </Card>
      </Section>
    </div>
  );
}
