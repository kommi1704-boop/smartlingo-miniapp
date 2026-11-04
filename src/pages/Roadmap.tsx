import { useMemo, useState, type ReactNode } from 'react';
import { A } from '../lib/router';
import { LEVELS } from '../types';
import { useApp } from '../store/store';
import { updateProfile, saveAiRoadmap, clearAiRoadmap } from '../store/actions';
import { generateRoadmap, profileSummary, type RoadmapStage } from '../lib/roadmap';
import { generateAiRoadmap, hashInputs, roadmapConsent, setRoadmapConsent, aiErrorHint } from '../lib/roadmapAi';
import { Card, Chip, LevelBadge, Notice, PageHeader, Pill, ProgressBar } from '../components/ui';
import { Icon } from '../components/Icon';
import { cx } from '../lib/utils';
import { LEVEL_DESC } from '../data/options';

function ItemList({ items, base }: { items: { id: string; title: string; done: boolean }[]; base: string }) {
  if (!items.length) return null;
  return (
    <ul className="mt-1.5 space-y-1">
      {items.map((i) => (
        <li key={i.id}>
          <A to={`${base}/${i.id}`} className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm hover:bg-surface2">
            <span className={cx('flex h-5 w-5 shrink-0 items-center justify-center rounded-full border', i.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-line')}>
              {i.done && <Icon name="check" className="h-3 w-3" strokeWidth={3} />}
            </span>
            <span className={cx('min-w-0 flex-1 truncate', i.done && 'text-muted line-through')}>{i.title}</span>
            <Icon name="right" className="h-4 w-4 text-muted" />
          </A>
        </li>
      ))}
    </ul>
  );
}

function Block({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-surface2 p-3.5">
      <p className="text-sm font-bold">{icon} {title}</p>
      <div className="mt-1 text-sm text-muted">{children}</div>
    </div>
  );
}

function Stage({ st, defaultOpen }: { st: RoadmapStage; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className={cx(st.status === 'current' && 'ring-2 ring-indigo-500/60')}>
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center gap-3 text-left">
        <LevelBadge level={st.level} className="min-w-[3.25rem] justify-center py-1.5 text-sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold">{st.consolidate && st.status === 'current' ? 'Hozir: mustahkamlash' : 'Keyingi bosqich'}</p>
          <p className="truncate text-xs text-muted">{st.focus} · ≈ {st.weeks} hafta</p>
        </div>
        <Icon name={open ? 'up' : 'down'} className="h-5 w-5 text-muted" />
      </button>
      <div className="mt-3">
        {st.progress === null ? (
          <p className="text-xs text-muted">Demo kontentda bu daraja uchun mashqlar yo‘q — progress hisoblanmaydi.</p>
        ) : (
          <div className="flex items-center gap-3">
            <ProgressBar value={st.progress} className="flex-1" label={`${st.level} bosqichi progressi`} />
            <span className="w-10 text-right text-sm font-bold">{st.progress}%</span>
          </div>
        )}
      </div>

      {open && (
        <div className="slide-up mt-4 grid gap-2.5">
          <Block icon="🎯" title="Maqsadlar (o‘lchanadigan)">
            <ul className="space-y-1">
              {st.objectives.map((o) => <li key={o}>• {o}</li>)}
            </ul>
          </Block>
          <Block icon="📊" title="Natija mezonlari">
            <ul className="space-y-1">
              {st.outcomes.map((o) => <li key={o}>• {o}</li>)}
            </ul>
            <p className="mt-2 text-xs"><b>Tekshiruv nuqtasi:</b> {st.checkpoint}</p>
            <p className="mt-1 text-xs"><b>Bajarilgan deb hisoblanadi:</b> {st.criteria}</p>
          </Block>
          {st.emphasis.length > 0 && (
            <Block icon="💪" title="Sizning zaif ko‘nikmalaringizga urg‘u">
              <p>{st.emphasis.join(', ')} — kunlik reja va bosqich maqsadlarida shu ko‘nikmalarga ko‘proq joy beriladi.</p>
            </Block>
          )}
          <Block icon="🧩" title="Grammatika mavzulari">
            {st.grammar.length > 0 ? <ItemList items={st.grammar} base="/grammar" /> : <p>Ilovada bu daraja uchun grammatika darsi yo‘q.</p>}
            <p className="mt-2 text-xs">Qo‘shimcha mavzular: {st.grammarExtra.join(' · ')}</p>
          </Block>
          <Block icon="🃏" title="So‘z boyligi maqsadi">
            <p>Umumiy maqsad: taxminan {st.vocab.goal} ta faol so‘z. Mavzular: {st.vocab.themes.join(', ')}.</p>
            {st.vocab.total > 0 ? (
              <div className="mt-2">
                <div className="flex justify-between text-xs"><span>Ilovadagi {st.level} so‘zlari</span><span className="font-semibold">{st.vocab.learned}/{st.vocab.total}</span></div>
                <ProgressBar value={(st.vocab.learned / st.vocab.total) * 100} className="mt-1" label="So‘zlar" />
              </div>
            ) : (
              <p className="mt-1 text-xs">Demo lug‘atda bu daraja uchun so‘z yo‘q.</p>
            )}
          </Block>
          <Block icon="📖" title="O‘qish">
            <p>{st.skillText.reading}</p>
            <ItemList items={st.reading} base="/reading" />
          </Block>
          <Block icon="🎧" title="Tinglash">
            <p>{st.skillText.listening}</p>
            <ItemList items={st.listening} base="/listening" />
          </Block>
          <Block icon="🗣️" title="Gaplashish">
            <p>{st.skillText.speaking}</p>
            <ItemList items={st.speaking} base="/speaking" />
          </Block>
          <Block icon="✍️" title="Yozish">
            <p>{st.skillText.writing}</p>
            <ItemList items={st.writing} base="/writing" />
          </Block>
        </div>
      )}
    </Card>
  );
}

function AiRoadmapCard() {
  const s = useApp();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [consent, setConsent] = useState(roadmapConsent());
  const ai = s.aiRoadmap;
  const stale = !!ai && ai.inputsHash !== hashInputs(s);

  async function generate() {
    setBusy(true);
    setErr(null);
    try {
      const r = await generateAiRoadmap(s);
      saveAiRoadmap(r);
    } catch (e) {
      setErr(aiErrorHint(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden>✨</span>
        <div className="min-w-0 flex-1">
          <p className="font-bold">AI shaxsiylashtirilgan reja</p>
          <p className="mt-0.5 text-xs text-muted">
            AI sizning darajalaringiz, zaif ko‘nikmalaringiz va maqsadingiz asosida bosqichlarni yozadi. Bu — tavsiya; mashqlar ro‘yxati pastda avtomatik hisoblanadi.
          </p>
        </div>
        {ai && (
          <button
            type="button"
            aria-label="AI rejasini o‘chirish"
            className="rounded-xl p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
            onClick={() => clearAiRoadmap()}
          >
            <Icon name="trash" className="h-4 w-4" />
          </button>
        )}
      </div>

      {!ai && (
        <>
          <label className="mt-3 flex cursor-pointer items-start gap-2.5 rounded-2xl bg-surface2 p-3 text-xs text-muted">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked);
                setRoadmapConsent(e.target.checked);
              }}
              className="mt-0.5 h-4 w-4 accent-indigo-600"
            />
            <span>
              Qiziqishlarimni AI rejaga qo‘shish (ixtiyoriy). Yoqilsa, tanlangan mavzularingiz serverga yuboriladi; yoqilmagan holda hech qanday shaxsiy matn yuborilmaydi.
            </span>
          </label>
          <button
            type="button"
            className="mt-3 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
            disabled={busy || !s.profile}
            onClick={generate}
          >
            {busy ? 'AI yozmoqda…' : 'AI reja tuzish'}
          </button>
        </>
      )}

      {ai && (
        <>
          {stale && (
            <Notice tone="warn">
              Profilingiz o‘zgargan (daraja yoki natijalar). Yangi ma’lumotlar asosida reja qayta tuzilishi mumkin.
            </Notice>
          )}
          <div className="mt-3 space-y-2.5">
            {ai.stages.map((st, i) => (
              <div key={i} className="rounded-2xl border border-line bg-surface2 p-3">
                <div className="flex items-center gap-2.5">
                  <LevelBadge level={st.level} />
                  <p className="min-w-0 flex-1 truncate text-sm font-bold">{st.focus}</p>
                  <span className="shrink-0 text-xs font-semibold text-muted">≈ {st.weeks} hafta</span>
                </div>
                <div className="mt-2 space-y-1.5 text-xs text-muted">
                  <p><b className="text-ink">Maqsadlar:</b> {st.objectives.join(' · ')}</p>
                  <p><b className="text-ink">Mavzular:</b> {st.topics.join(' · ')}</p>
                  <p><b className="text-ink">Natija mezoni:</b> {st.outcomes.join(' · ')}</p>
                  <p><b className="text-ink">Tekshiruv:</b> {st.checkpoint}</p>
                </div>
              </div>
            ))}
          </div>
          {ai.note && <p className="mt-2.5 rounded-2xl bg-indigo-50 px-3 py-2 text-xs text-indigo-900 dark:bg-indigo-500/10 dark:text-indigo-100">{ai.note}</p>}
          <button
            type="button"
            className="mt-3 w-full rounded-2xl border border-line bg-surface px-4 py-2.5 text-sm font-bold text-indigo-600 disabled:opacity-60 dark:text-indigo-300"
            disabled={busy || !s.profile}
            onClick={generate}
          >
            {busy ? 'AI yozmoqda…' : stale ? 'Qayta tuzish (yangi natijalar bilan)' : 'Yangilash'}
          </button>
        </>
      )}

      {err && <p className="mt-2 text-xs font-semibold text-rose-500">{err}</p>}
      <p className="mt-2 text-[11px] text-muted">AI reja — maslahat. Vaqt hisoblari taxminiy; hech kim aniq natijani kafolatlay olmaydi.</p>
    </Card>
  );
}

export function Roadmap() {
  const s = useApp();
  const p = s.profile!;
  const stages = useMemo(() => generateRoadmap(p, s), [p, s]);
  const lines = profileSummary(p);
  const options = LEVELS.filter((l) => LEVELS.indexOf(l) >= LEVELS.indexOf(p.estimatedLevel));

  return (
    <div>
      <PageHeader emoji="🗺️" title="Shaxsiy yo‘l xaritasi" subtitle={`${p.estimatedLevel} → ${p.targetLevel}`} />
      <Card>
        <ul className="space-y-1 text-sm text-muted">
          {lines.map((l) => <li key={l}>• {l}</li>)}
        </ul>
        <p className="mb-2 mt-4 text-sm font-semibold">Maqsad darajasi</p>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {options.map((l) => (
            <Chip key={l} active={p.targetLevel === l} onClick={() => updateProfile({ targetLevel: l })}>{l}</Chip>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">{LEVEL_DESC[p.targetLevel].title}: {LEVEL_DESC[p.targetLevel].desc}</p>
      </Card>

      <div className="mt-4">
        <AiRoadmapCard />
      </div>

      <p className="mt-5 mb-2 px-1 text-sm font-bold">📖 Bosqichlar (mashqlar bilan)</p>
      <div className="space-y-3">
        {stages.map((st, i) => <Stage key={`${st.level}-${p.targetLevel}`} st={st} defaultOpen={i === 0} />)}
      </div>

      <div className="mt-4">
        <Notice>
          Haftalar soni — kuniga tanlagan vaqtingiz (haftasiga 6 kun) va umumiy taxminiy o‘qish soatlariga asoslangan <b>ko‘rsatkich</b>. Haqiqiy tezlik odamdan odamga farq qiladi.
        </Notice>
      </div>
      <div className="mt-3 text-center"><Pill>Progress mashqlaringizdan avtomatik hisoblanadi</Pill></div>
    </div>
  );
}
