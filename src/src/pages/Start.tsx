import { useMemo, useState, type ReactNode } from 'react';
import type { Level, Profile } from '../types';
import { LEVELS } from '../types';
import { ACTIVITY_OPTIONS, GOALS, LEVEL_DESC, MINUTES, SELF_LEVELS } from '../data/options';
import { evaluate, levelGroup, placementOrder, PASS_MARK, sectionLabel, type PlacementAnswer, type Section } from '../lib/assessment';
import { defaultTarget, generateRoadmap, profileSummary } from '../lib/roadmap';
import { navigate } from '../lib/router';
import { getState, useApp } from '../store/store';
import { recordPlacement, saveProfile } from '../store/actions';
import { Button, Card, LevelBadge, Notice, ProgressBar, ProgressRing } from '../components/ui';
import { Icon } from '../components/Icon';
import { cx } from '../lib/utils';

type Draft = Pick<Profile, 'name' | 'age' | 'goal' | 'dailyMinutes' | 'activities' | 'selfLevel'>;
const DRAFT_KEY = 'smartlingo:draft';

function loadDraft(): Draft | null {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}
function saveDraft(d: Draft) {
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d));
  } catch {
    /* ignore */
  }
}

function Frame({ step, total, title, subtitle, children, onBack }: { step?: number; total?: number; title: string; subtitle?: string; children: ReactNode; onBack?: () => void }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 pb-8 pt-5">
      <div className="flex items-center gap-3">
        {onBack ? (
          <button type="button" onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface" aria-label="Orqaga">
            <Icon name="left" />
          </button>
        ) : (
          <img src="./favicon.svg" alt="" className="h-9 w-9" />
        )}
        {step && total && <ProgressBar value={(step / total) * 100} className="flex-1" label="Jarayon" />}
        {step && total && <span className="text-xs font-semibold text-muted">{step}/{total}</span>}
      </div>
      <h1 className="mt-6 text-2xl font-extrabold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      <div className="mt-5 flex-1">{children}</div>
    </div>
  );
}

function OptionButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        'flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left text-[15px] font-semibold transition',
        active ? 'border-indigo-600 bg-indigo-50 text-indigo-900 dark:bg-indigo-500/15 dark:text-indigo-100' : 'border-line bg-surface hover:border-indigo-300',
      )}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------- Onboarding
export function Onboarding({ defaultName }: { defaultName: string }) {
  const existing = useApp().profile;
  const init = loadDraft() ?? (existing ? { name: existing.name, age: existing.age, goal: existing.goal, dailyMinutes: existing.dailyMinutes, activities: existing.activities, selfLevel: existing.selfLevel } : null);
  const [step, setStep] = useState(1);
  const [name, setName] = useState(init?.name ?? defaultName);
  const [age, setAge] = useState(init ? String(init.age) : '');
  const [goal, setGoal] = useState(init?.goal ?? '');
  const [minutes, setMinutes] = useState(init?.dailyMinutes ?? 15);
  const [acts, setActs] = useState<string[]>(init?.activities ?? ['flashcards', 'grammar']);
  const [self, setSelf] = useState<Level>(init?.selfLevel ?? 'A1');
  const [touched, setTouched] = useState(false);
  const total = 6;

  const ageNum = Number(age);
  const nameOk = name.trim().length >= 2 && name.trim().length <= 30;
  const ageOk = Number.isInteger(ageNum) && ageNum >= 6 && ageNum <= 99;
  const nameErr = touched && !nameOk ? 'Ismingizni yozing (2–30 ta belgi).' : '';
  const ageErr = touched && !ageOk ? 'Yoshingizni raqam bilan kiriting (masalan, 12).' : '';

  function next() {
    if (step === 1) {
      setTouched(true);
      if (!nameOk || !ageOk) return;
    }
    if (step === 2 && !goal) return;
    if (step === 4 && acts.length === 0) return;
    if (step < total) return setStep(step + 1);
    saveDraft({ name: name.trim(), age: ageNum, goal, dailyMinutes: minutes, activities: acts, selfLevel: self });
    navigate('/assessment');
  }

  const canNext = step === 2 ? !!goal : step === 4 ? acts.length > 0 : true;
  const back = step > 1 ? () => setStep(step - 1) : () => navigate('/welcome');

  const titles = [
    ['Keling, tanishamiz!', 'Ismingiz va yoshingiz yo‘l xaritangizni moslashtirishga yordam beradi.'],
    ['Asosiy maqsadingiz nima?', 'Bittasini tanlang.'],
    ['Kuniga qancha vaqt ajrata olasiz?', 'Kichik, lekin muntazam mashq eng yaxshi natija beradi.'],
    ['Qaysi mashqlar sizga yoqadi?', 'Bir nechtasini tanlashingiz mumkin.'],
    ['Inglizcha darajangizni qanday baholaysiz?', 'Keyingi testda haqiqiy natijani ko‘ramiz.'],
    ['Deyarli tayyor!', 'Endi qisqa daraja aniqlash testi.'],
  ];

  return (
    <Frame step={step} total={total} title={titles[step - 1][0]} subtitle={titles[step - 1][1]} onBack={back}>
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-semibold">Ism yoki laqab</label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              autoComplete="nickname"
              aria-invalid={!!nameErr}
              aria-describedby={nameErr ? 'name-err' : undefined}
              className="w-full rounded-2xl border-2 border-line bg-surface px-4 py-3 text-base outline-none focus:border-indigo-500"
              placeholder="Masalan: Aziza"
            />
            {nameErr && <p id="name-err" className="mt-1 text-sm text-rose-500">{nameErr}</p>}
          </div>
          <div>
            <label htmlFor="age" className="mb-1.5 block text-sm font-semibold">Yoshingiz</label>
            <input
              id="age"
              value={age}
              onChange={(e) => setAge(e.target.value.replace(/\D/g, '').slice(0, 2))}
              inputMode="numeric"
              aria-invalid={!!ageErr}
              aria-describedby={ageErr ? 'age-err' : undefined}
              className="w-full rounded-2xl border-2 border-line bg-surface px-4 py-3 text-base outline-none focus:border-indigo-500"
              placeholder="Masalan: 12"
            />
            {ageErr && <p id="age-err" className="mt-1 text-sm text-rose-500">{ageErr}</p>}
            {ageOk && (ageNum < 8 || ageNum > 17) && <p className="mt-1 text-xs text-muted">Ilova 8–17 yoshdagilar uchun mo‘ljallangan, lekin foydalanishingiz mumkin.</p>}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-2.5">
          {GOALS.map((g) => (
            <OptionButton key={g.id} active={goal === g.id} onClick={() => setGoal(g.id)}>
              <span className="text-2xl">{g.emoji}</span>
              {g.label}
            </OptionButton>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="grid grid-cols-2 gap-2.5">
          {MINUTES.map((m) => (
            <OptionButton key={m} active={minutes === m} onClick={() => setMinutes(m)}>
              <Icon name="clock" className="h-5 w-5 text-indigo-500" />
              <span>{m} daqiqa{m === 15 ? ' ⭐' : ''}</span>
            </OptionButton>
          ))}
        </div>
      )}

      {step === 4 && (
        <div className="grid grid-cols-2 gap-2.5">
          {ACTIVITY_OPTIONS.map((a) => (
            <OptionButton key={a.id} active={acts.includes(a.id)} onClick={() => setActs((p) => (p.includes(a.id) ? p.filter((x) => x !== a.id) : [...p, a.id]))}>
              <span className="text-xl">{a.emoji}</span>
              <span className="text-sm">{a.label}</span>
            </OptionButton>
          ))}
        </div>
      )}

      {step === 5 && (
        <div className="space-y-2.5">
          {SELF_LEVELS.map((l) => (
            <OptionButton key={l.level} active={self === l.level} onClick={() => setSelf(l.level)}>
              <LevelBadge level={l.level} className="min-w-[3.25rem] justify-center" />
              <span className="text-sm">{l.label}</span>
            </OptionButton>
          ))}
        </div>
      )}

      {step === 6 && (
        <div className="space-y-4">
          <Card>
            <p className="font-bold">Daraja aniqlash testi</p>
            <ul className="mt-2 space-y-1.5 text-sm text-muted">
              <li>• So‘z boyligi, grammatika va o‘qish savollari</li>
              <li>• Eng ko‘pi bilan 21 ta savol, qiyinlashib boradi</li>
              <li>• Bilmagan savolda “Bilmayman” tugmasini bosing — bu normal</li>
              <li>• Natija — taxminiy baho, rasmiy CEFR imtihoni emas</li>
            </ul>
          </Card>
          <Notice>Test davomida to‘g‘ri/noto‘g‘ri javob ko‘rsatilmaydi — oxirida umumiy natijani ko‘rasiz.</Notice>
        </div>
      )}

      <div className="mt-8">
        <Button size="lg" full onClick={next} disabled={!canNext}>
          {step === total ? 'Testni boshlash' : 'Davom etish'}
        </Button>
        {step === total && (
          <button
            type="button"
            className="mt-3 w-full text-center text-sm font-semibold text-muted underline"
            onClick={() => {
              saveDraft({ name: name.trim(), age: ageNum, goal, dailyMinutes: minutes, activities: acts, selfLevel: self });
              finishWithoutTest();
            }}
          >
            Testni o‘tkazib yuborish (o‘zim baholagan daraja bilan)
          </button>
        )}
      </div>
    </Frame>
  );
}

function buildProfile(d: Draft, level: Level, scores?: Profile['placementScores']): Profile {
  const prev = getState().profile;
  return {
    ...d,
    estimatedLevel: level,
    targetLevel: prev && prev.targetLevel && LEVELS.indexOf(prev.targetLevel) >= LEVELS.indexOf(level) ? prev.targetLevel : defaultTarget(d.goal, level),
    placementScores: scores,
    createdAt: prev?.createdAt ?? new Date().toISOString(),
  };
}

function finishWithoutTest() {
  const d = loadDraft();
  if (!d) return navigate('/onboarding');
  saveProfile(buildProfile(d, d.selfLevel));
  navigate('/result');
}

// ---------------------------------------------------------------- Assessment
export function Assessment() {
  const existing = useApp().profile;
  const draft: Draft | null = useMemo(
    () => loadDraft() ?? (existing ? { name: existing.name, age: existing.age, goal: existing.goal, dailyMinutes: existing.dailyMinutes, activities: existing.activities, selfLevel: existing.selfLevel } : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const order = useMemo(() => placementOrder(), []);
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [answers, setAnswers] = useState<PlacementAnswer[]>([]);

  if (!draft) {
    navigate('/onboarding', { replace: true });
    return null;
  }

  const q = order[idx];

  function commit(picked: number) {
    const all = [...answers, { q, picked }];
    // end of a level group: stop early when the group is failed
    const group = levelGroup(q.level);
    const done = all.filter((a) => a.q.level === q.level);
    const lastInGroup = done.length === group.length;
    const failed = lastInGroup && done.filter((a) => a.picked === a.q.answer).length < PASS_MARK;
    if (failed || idx + 1 >= order.length) {
      const r = evaluate(all);
      const askedBy = { vocabulary: r.bySection.vocabulary.asked, grammar: r.bySection.grammar.asked, reading: r.bySection.reading.asked };
      recordPlacement(r.total, r.asked, r.level);
      saveProfile(buildProfile(draft!, r.level, { vocabulary: r.bySection.vocabulary.correct, grammar: r.bySection.grammar.correct, reading: r.bySection.reading.correct, total: r.total, max: r.asked, askedBy }));
      navigate('/result', { replace: true });
      return;
    }
    setAnswers(all);
    setIdx(idx + 1);
    setSel(null);
  }

  return (
    <Frame step={idx + 1} total={order.length} title="Daraja aniqlash testi" subtitle={`${sectionLabel(q.section as Section)} · javob to‘g‘ri/noto‘g‘ri ekani oxirida ko‘rsatiladi`} onBack={() => navigate('/onboarding')}>
      <div className="slide-up" key={q.id}>
        {q.passage && (
          <Card className="mb-3 bg-surface2 !shadow-none">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Matn</p>
            <p className="mt-1 text-[15px] leading-relaxed">{q.passage}</p>
          </Card>
        )}
        <p className="text-lg font-bold leading-snug">{q.q}</p>
        <div className="mt-4 grid gap-2.5" role="radiogroup" aria-label="Javob variantlari">
          {q.options.map((o, i) => (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={sel === i}
              onClick={() => setSel(i)}
              className={cx(
                'rounded-2xl border-2 px-4 py-3 text-left text-[15px] font-medium transition',
                sel === i ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/15' : 'border-line bg-surface hover:border-indigo-300',
              )}
            >
              {o}
            </button>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-3">
          <Button variant="secondary" onClick={() => commit(-1)}>Bilmayman</Button>
          <Button className="flex-1" disabled={sel === null} onClick={() => sel !== null && commit(sel)}>
            {idx + 1 >= order.length ? 'Yakunlash' : 'Keyingi'}
          </Button>
        </div>
      </div>
    </Frame>
  );
}

// ---------------------------------------------------------------- Result
export function Result() {
  const s = useApp();
  const p = s.profile!;
  const stages = useMemo(() => generateRoadmap(p, s).slice(0, 4), [p, s]);
  const sc = p.placementScores;
  const lines = profileSummary(p);
  const sections: Section[] = ['vocabulary', 'grammar', 'reading'];
  const diff = LEVELS.indexOf(p.selfLevel) - LEVELS.indexOf(p.estimatedLevel);

  return (
    <Frame title={`${p.name}, natijangiz tayyor! 🎉`}>
      <Card className="text-center">
        <p className="text-sm font-semibold text-muted">Taxminiy darajangiz</p>
        <div className="mt-2 flex justify-center">
          <ProgressRing value={sc ? Math.round((sc.total / Math.max(1, sc.max)) * 100) : 50} size={120} stroke={12}>
            <span className="text-3xl font-extrabold">{p.estimatedLevel}</span>
          </ProgressRing>
        </div>
        <p className="mt-3 font-bold">{LEVEL_DESC[p.estimatedLevel].title}</p>
        <p className="text-sm text-muted">{LEVEL_DESC[p.estimatedLevel].desc}</p>
        {sc ? (
          <p className="mt-3 text-sm">To‘g‘ri javoblar: <b>{sc.total}</b> / {sc.max}</p>
        ) : (
          <p className="mt-3 text-sm text-muted">Test o‘tkazilmadi: daraja siz o‘zingiz tanlagan baho asosida qo‘yildi.</p>
        )}
      </Card>

      <div className="mt-3">
        <Notice tone="warn">
          Bu — <b>dastlabki taxminiy baho</b>, rasmiy CEFR imtihoni emas. Mashq qilgan sari aniqroq bo‘ladi, darajani Sozlamalardan qayta aniqlashingiz mumkin.
          {diff >= 2 && ' O‘zingizni natijadan yuqoriroq baholagansiz — bu odatiy holat, tashvishlanmang.'}
        </Notice>
      </div>

      {sc?.askedBy && (
        <Card className="mt-3">
          <p className="font-bold">Bo‘limlar bo‘yicha</p>
          <div className="mt-3 space-y-3">
            {sections.map((k) => {
              const asked = sc.askedBy![k];
              const pct = asked ? Math.round((sc[k] / asked) * 100) : 0;
              return (
                <div key={k}>
                  <div className="flex justify-between text-sm"><span>{sectionLabel(k)}</span><span className="font-semibold">{sc[k]}/{asked}</span></div>
                  <ProgressBar value={pct} className="mt-1" label={sectionLabel(k)} />
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card className="mt-3">
        <p className="font-bold">Shaxsiy profilingiz</p>
        <ul className="mt-2 space-y-1.5 text-sm text-muted">
          {lines.map((l) => <li key={l}>• {l}</li>)}
        </ul>
        <p className="mt-4 font-bold">Yo‘l xaritangiz</p>
        <ol className="mt-2 space-y-2">
          {stages.map((st) => (
            <li key={st.level} className="flex items-center gap-3 rounded-2xl bg-surface2 px-3 py-2.5">
              <LevelBadge level={st.level} className="min-w-[3.25rem] justify-center" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{st.consolidate && p.estimatedLevel !== p.targetLevel ? 'Mustahkamlash: ' : ''}{st.focus}</div>
                <div className="text-xs text-muted">≈ {st.weeks} hafta (taxminiy)</div>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <div className="mt-6 flex flex-col gap-2.5">
        <Button size="lg" full onClick={() => navigate('/')}>O‘rganishni boshlash</Button>
        <Button variant="secondary" full onClick={() => navigate('/roadmap')}>To‘liq yo‘l xaritasini ko‘rish</Button>
      </div>
    </Frame>
  );
}
