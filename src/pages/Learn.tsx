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
  tile: string;
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
    { path: '/vocab', label: 'So‘z boyligi', desc: 'Kartochkalar va takrorlash', icon: 'cards', emoji: '🃏', done: learned, total: VOCAB.length, tile: 'tile-green' },
    { path: '/grammar', label: 'Grammatika', desc: 'Qoida + test savollari', icon: 'bulb', emoji: '🧩', done: completed('grammar'), total: GRAMMAR.length, tile: 'tile-blue' },
    { path: '/reading', label: 'O‘qish', desc: 'Matn va savollar', icon: 'book', emoji: '📖', done: completed('reading'), total: READING.length, tile: 'tile-purple' },
    { path: '/listening', label: 'Tinglash', desc: 'Audio + transkript', icon: 'headphones', emoji: '🎧', done: completed('listening'), total: LISTENING.length, tile: 'tile-yellow' },
    { path: '/speaking', label: 'Gaplashish', desc: 'AI tekshiradigan topshiriqlar', icon: 'mic', emoji: '🗣️', done: Object.keys(s.speakingDone).length, total: SPEAKING.length, tile: 'tile-coral' },
    { path: '/writing', label: 'Yozish', desc: 'Insholar va tekshiruv', icon: 'pen', emoji: '✍️', done: writingDone, total: WRITING.length, tile: 'tile-sky' },
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
        className="play-card wash-sun flex items-center gap-3 p-4 transition active:scale-[0.98]"
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
          {skills.map((sk, i) => {
            const pct = sk.total ? Math.min(100, Math.round((sk.done / sk.total) * 100)) : 0;
            return (
              <A key={sk.path} to={sk.path} className={cx('tile pg-pop flex min-h-[132px] flex-col rounded-[26px] p-3.5', sk.tile)} style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/35 text-2xl shadow-inner">{sk.emoji}</span>
                  <span className="rounded-full bg-white/30 px-2 py-0.5 text-[11px] font-extrabold">{sk.done}/{sk.total}</span>
                </div>
                <span className="mt-auto text-[15px] font-black leading-tight">{sk.label}</span>
                <span className="mb-2 truncate text-[11px] font-semibold opacity-85">{sk.desc}</span>
                <span className="block h-2 overflow-hidden rounded-full bg-black/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${sk.label} progressi`}>
                  <span className="block h-full rounded-full bg-white/90 transition-all duration-700" style={{ width: `${pct}%` }} />
                </span>
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
