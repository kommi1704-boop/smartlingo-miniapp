import { useEffect, useRef, useState } from 'react';
import { SPEAKING, SPEAKING_CHECKLIST } from '../data/speaking';
import { useApp } from '../store/store';
import { completeSpeaking } from '../store/actions';
import { navigate } from '../lib/router';
import { ContentList, type ListItem } from '../components/ContentList';
import { Button, Card, Empty, LevelBadge, Notice, PageHeader, Pill, Section, Tabs } from '../components/ui';
import { SpeakButton } from '../components/SpeakButton';
import { Highlightable } from '../components/Highlightable';
import { toast } from '../store/ui';
import { cx } from '../lib/utils';

export function SpeakingList() {
  const s = useApp();
  const [kind, setKind] = useState<'conversation' | 'ielts'>('conversation');
  const list = SPEAKING.filter((x) => x.kind === kind);
  const items: ListItem[] = list.map((x) => {
    const n = s.speakingDone[x.id]?.length ?? 0;
    return {
      id: x.id,
      title: x.title,
      subtitle: x.promptUz,
      level: x.level,
      emoji: kind === 'ielts' ? '🎓' : '🗣️',
      done: n > 0,
      status: n > 0 ? { label: `${n} marta bajarilgan`, tone: 'green' } : { label: 'Yangi', tone: 'neutral' },
    };
  });
  return (
    <div>
      <PageHeader emoji="🗣️" title="Gaplashish" subtitle="Ovoz chiqarib mashq qiling va o‘zingizni baholang" />
      <div className="mb-3"><Notice>Hozircha talaffuz tahlil qilinmaydi (ovoz yozib olish va tekshirish yo‘q). Mashq: ovoz chiqarib ayting, namuna bilan solishtiring va ro‘yxat bo‘yicha o‘zingizni baholang.</Notice></div>
      <Tabs<'conversation' | 'ielts'>
        value={kind}
        onChange={setKind}
        tabs={[
          { id: 'conversation', label: 'Suhbat mashqlari' },
          { id: 'ielts', label: 'IELTS uslubi (ilg‘or)' },
        ]}
      />
      <div className="mt-4"><ContentList items={items} base="/speaking" filter={false} /></div>
    </div>
  );
}

export function SpeakingPage({ id }: { id: string }) {
  const s = useApp();
  const p = SPEAKING.find((x) => x.id === id);
  const [showSample, setShowSample] = useState(false);
  const [checks, setChecks] = useState<boolean[]>(() => SPEAKING_CHECKLIST.map(() => false));
  const [done, setDone] = useState<number | null>(null);
  const [secs, setSecs] = useState(0);
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    timer.current = setInterval(() => setSecs((x) => x + 1), 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [running]);

  if (!p) return <Empty emoji="🤔" title="Mashq topilmadi" action={<Button onClick={() => navigate('/speaking')}>Ro‘yxat</Button>} />;
  const count = checks.filter(Boolean).length;
  const times = s.speakingDone[p.id]?.length ?? 0;
  const target = p.kind === 'ielts' && p.level !== 'B1' ? 120 : 60;
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');

  return (
    <div>
      <PageHeader back="/speaking" emoji={p.kind === 'ielts' ? '🎓' : '🗣️'} title={p.title} subtitle={p.kind === 'ielts' ? 'IELTS uslubidagi mashq' : 'Suhbat mashqi'} right={<LevelBadge level={p.level} />} />

      <Card>
        <p className="text-xs font-bold uppercase tracking-wide text-muted">Topshiriq</p>
        <p className="mt-1 whitespace-pre-line text-lg font-bold leading-snug">{p.prompt}</p>
        <p className="mt-2 text-sm text-muted">{p.promptUz}</p>
        {times > 0 && <Pill tone="green" className="mt-3">{times} marta bajarilgan</Pill>}
      </Card>

      <Section title="⏱ Gapirish taymeri">
        <Card className="text-center">
          <div className="text-4xl font-extrabold tabular-nums" aria-live="off">{mm}:{ss}</div>
          <p className="mt-1 text-xs text-muted">Maqsad: taxminan {target} soniya to‘xtamasdan gapirish</p>
          <div className="mt-3 flex justify-center gap-2">
            <Button icon={running ? 'stop' : 'play'} onClick={() => setRunning(!running)}>{running ? 'To‘xtatish' : 'Boshlash'}</Button>
            <Button variant="secondary" icon="refresh" onClick={() => { setRunning(false); setSecs(0); }}>Nolga</Button>
          </div>
        </Card>
      </Section>

      <Section title="💬 Foydali iboralar">
        <ul className="space-y-2">
          {p.expressions.map((e) => (
            <li key={e.en} className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-3.5 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{e.en}</p>
                <p className="text-sm text-muted">{e.uz}</p>
              </div>
              <SpeakButton text={e.en} />
            </li>
          ))}
        </ul>
      </Section>

      <Section title="📝 Namunaviy javob">
        {showSample ? (
          <Card className="slide-up">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1"><Highlightable storeKey={`speaking:${p.id}`} paragraphs={p.sample.split(/\n+/)} className="space-y-2 leading-relaxed" showHint={false} /></div>
              <SpeakButton text={p.sample} />
            </div>
          </Card>
        ) : (
          <Button variant="secondary" icon="eye" full onClick={() => setShowSample(true)}>Avval o‘zingiz ayting, keyin namunani ko‘ring</Button>
        )}
      </Section>

      <Section title="✅ O‘zingizni baholash">
        <Card>
          <ul className="space-y-2">
            {SPEAKING_CHECKLIST.map((c, i) => (
              <li key={i}>
                <label className={cx('flex cursor-pointer items-start gap-3 rounded-xl px-2 py-1.5 text-sm hover:bg-surface2', checks[i] && 'font-semibold')}>
                  <input
                    type="checkbox"
                    checked={checks[i]}
                    onChange={() => setChecks((a) => a.map((v, j) => (j === i ? !v : v)))}
                    className="mt-0.5 h-5 w-5 shrink-0 accent-indigo-600"
                  />
                  {c}
                </label>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">Belgilangan: {count}/{SPEAKING_CHECKLIST.length}</p>
        </Card>
      </Section>

      <div className="mt-5">
        {done === null ? (
          <Button size="lg" full icon="check" onClick={() => { const xp = completeSpeaking(p.id, count, SPEAKING_CHECKLIST.length); setDone(xp); toast(`+${xp} XP`, 'success'); setRunning(false); }}>
            Mashqni bajardim
          </Button>
        ) : (
          <Card className="pop-in text-center">
            <div className="text-4xl">🎉</div>
            <p className="mt-1 font-bold">Barakalla! +{done} XP</p>
            <p className="text-sm text-muted">Keyingi safar boshqa mavzuni sinab ko‘ring.</p>
            <Button className="mt-3" onClick={() => navigate('/speaking')}>Boshqa mashqlar</Button>
          </Card>
        )}
      </div>
    </div>
  );
}
