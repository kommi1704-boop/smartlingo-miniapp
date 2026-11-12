import { useMemo, useState, type ReactNode } from 'react';
import type { Level, Profile, Skill, SkillAssessment } from '../types';
import { LEVELS } from '../types';
import { ACTIVITY_OPTIONS, GOALS, LEVEL_DESC, MINUTES, SELF_LEVELS } from '../data/options';
import {
  LISTENING_PROBES, SPEAKING_STATEMENTS, WRITING_PROBES,
  listeningProbeResult, speakingSelfResult, writingProbeResult,
} from '../data/placement-skills';
import { evaluate, levelGroup, placementOrderFor, PASS_MARK, sectionLabel, type PlacementAnswer, type Section } from '../lib/assessment';
import { computeSkillLevels, SKILL_EMOJI, SKILL_LABEL, confidenceLabel, sourceLabel } from '../lib/skills';
import { checkText } from '../lib/writingCheck';
import { parseTranscript, playLines, stopSpeaking, ttsAvailable } from '../lib/tts';
import { defaultTarget, generateRoadmap, profileSummary } from '../lib/roadmap';
import { navigate } from '../lib/router';
import { today } from '../lib/dates';
import { getState, useApp } from '../store/store';
import { recordPlacement, saveProfile, saveSkillLevels } from '../store/actions';
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
        active ? 'border-sky-600 bg-sky-50 text-sky-900 dark:bg-sky-500/15 dark:text-sky-100' : 'border-line bg-surface hover:border-sky-300',
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
              className="w-full rounded-2xl border-2 border-line bg-surface px-4 py-3 text-base outline-none focus:border-sky-500"
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
              className="w-full rounded-2xl border-2 border-line bg-surface px-4 py-3 text-base outline-none focus:border-sky-500"
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
              <Icon name="clock" className="h-5 w-5 text-sky-500" />
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
  // Adaptive: the test starts one group below the self-declared level and climbs until a group fails.
  const order = useMemo(() => placementOrderFor(draft?.selfLevel ?? 'A2'), [draft]);
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
      const r = evaluate(all, draft!.selfLevel);
      const askedBy = { vocabulary: r.bySection.vocabulary.asked, grammar: r.bySection.grammar.asked, reading: r.bySection.reading.asked };
      recordPlacement(r.total, r.asked, r.level);
      saveProfile(buildProfile(draft!, r.level, { vocabulary: r.bySection.vocabulary.correct, grammar: r.bySection.grammar.correct, reading: r.bySection.reading.correct, total: r.total, max: r.asked, askedBy, confidence: r.confidence }));
      // per-skill estimates: the MCQ placement measures vocabulary, grammar and reading;
      // listening / writing / speaking stay unmeasured until the optional probes are taken.
      const perSkill = (sec: Section): SkillAssessment => ({
        level: r.level,
        confidence: r.bySection[sec].asked >= 2 ? 'medium' : 'low',
        source: 'placement',
        accuracy: r.bySection[sec].asked ? r.bySection[sec].correct / r.bySection[sec].asked : undefined,
        updatedAt: today(),
      });
      saveSkillLevels({ vocabulary: perSkill('vocabulary'), grammar: perSkill('grammar'), reading: perSkill('reading') });
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
                sel === i ? 'border-sky-600 bg-sky-50 dark:bg-sky-500/15' : 'border-line bg-surface hover:border-sky-300',
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

// ---------------------------------------------------------------- Skill probes (extended assessment)
//
// Measures the three skills the MCQ placement cannot: listening (device TTS speaks, transcript
// hidden until answered), writing (local rule-based check) and speaking (structured self-report).
// Everything is optional and every result is saved with an honest confidence label.

function probeFor<T extends { level: Level }>(list: T[], est: Level): T {
  const i = LEVELS.indexOf(est);
  const want = i <= 2 ? 'A2' : i === 3 ? 'B1' : 'B2';
  return list.find((x) => x.level === want) ?? list[0];
}

export function SkillProbes() {
  const [phase, setPhase] = useState<'intro' | 'listen' | 'write' | 'speak'>('intro');
  const skipAll = () => {
    stopSpeaking();
    navigate('/result');
  };
  return (
    <Frame title="Qo‘shimcha ko‘nikmalarni baholash" subtitle="Tinglash, yozish va gaplashish · 2–3 daqiqa · ixtiyoriy" onBack={skipAll}>
      {phase === 'intro' && <ProbesIntro onNext={() => setPhase('listen')} onSkip={skipAll} />}
      {phase === 'listen' && <ListenProbe onDone={() => setPhase('write')} />}
      {phase === 'write' && <WriteProbe onDone={() => setPhase('speak')} />}
      {phase === 'speak' && <SpeakProbe onDone={() => navigate('/result', { replace: true })} />}
    </Frame>
  );
}

function ProbesIntro({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <div className="space-y-4">
      <Card>
        <p className="font-bold">Nima baholanadi?</p>
        <ul className="mt-2 space-y-2 text-sm text-muted">
          <li>🎧 <b>Tinglash</b> — qisqa suhbat qurilma ovozida o‘qiladi, so‘ng 2 ta savol beriladi.</li>
          <li>✍️ <b>Yozish</b> — qisqa matn yozasiz, xatolar avtomatik tekshiriladi.</li>
          <li>🗣️ <b>Gaplashish</b> — «men buni qila olaman» ro‘yxati bilan o‘zingizni baholaysiz.</li>
        </ul>
      </Card>
      <Notice tone="warn">
        Bu — <b>taxminiy baho</b>, rasmiy imtihon emas. Gapiringan nutq tahlil qilinmaydi (buning uchun texnologiya yo‘q),
        shuning uchun gaplashish baho faqat sizning javobingizga asoslanadi.
      </Notice>
      <Button size="lg" full onClick={onNext}>Boshlash</Button>
      <button type="button" className="w-full text-center text-sm font-semibold text-muted underline" onClick={onSkip}>
        O‘tkazib yuborish (faqat test natijasi bilan)
      </button>
    </div>
  );
}

function ListenProbe({ onDone }: { onDone: () => void }) {
  const p = useApp().profile!;
  const probe = useMemo(() => probeFor(LISTENING_PROBES, p.estimatedLevel), [p.estimatedLevel]);
  const [step, setStep] = useState(0); // 0 = play, 1.. = questions, last = mini result
  const [playing, setPlaying] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [sel, setSel] = useState<number | null>(null);
  const [result, setResult] = useState<SkillAssessment | null>(null);
  const tts = ttsAvailable();
  const totalQ = probe.questions.length;

  if (step === 0 || step > totalQ) {
    // play screen or mini-result
    return (
      <div className="space-y-4">
        {step === 0 && (
          <>
            <Card>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">🎧 Tinglash · {probe.level}</p>
              <p className="mt-1.5 font-bold">{probe.situationUz}</p>
              <p className="mt-2 text-sm text-muted">
                Ovoz qurilmaning sun’iy ovozi (yozuv emas). Tinglang va 2 ta savolga javob bering. Matnni javoblardan keyin ko‘rasiz.
              </p>
              {!tts && <p className="mt-2 text-sm font-semibold text-rose-500">Bu qurilmada ovoz ishlamaydi — bu bo‘limni o‘tkazib yuborish tavsiya etiladi.</p>}
            </Card>
            <Button
              size="lg"
              full
              disabled={!tts}
              onClick={() => {
                if (playing) {
                  stopSpeaking();
                  setPlaying(false);
                  return;
                }
                setPlaying(true);
                const ok = playLines(
                  parseTranscript(probe.transcript).map((l) => ({ text: l.speak, role: l.role })),
                  {
                    onEnd: () => {
                      setPlaying(false);
                      setStep(1);
                    },
                  },
                );
                if (!ok) setPlaying(false);
              }}
            >
              {playing ? 'To‘xtatish' : '▶ Ovozni ijro etish'}
            </Button>
          </>
        )}
        {step > totalQ && result && (
          <Card className="text-center">
            <p className="text-sm font-semibold text-muted">Tinglash bo‘yicha taxminiy daraja</p>
            <div className="mt-2 flex justify-center"><LevelBadge level={result.level ?? 'A1'} /></div>
            <p className="mt-2 text-xs text-muted">{confidenceLabel(result.confidence)} · {sourceLabel(result.source)} · 2 ta savol asosida</p>
          </Card>
        )}
        {step === 0 && (
          <button type="button" className="w-full text-center text-sm font-semibold text-muted underline" onClick={onDone}>
            Bu bo‘limni o‘tkazib yuborish
          </button>
        )}
        {step > 0 && (
          <Button size="lg" full variant={step > totalQ ? 'primary' : 'secondary'} onClick={onDone}>
            {step > totalQ ? 'Davom etish: yozish' : 'Bu bo‘limni o‘tkazib yuborish'}
          </Button>
        )}
      </div>
    );
  }

  const q = probe.questions[step - 1];
  return (
    <div className="slide-up space-y-4" key={q.id}>
      <p className="text-xs font-bold uppercase tracking-wide text-muted">Savol {step}/{totalQ}</p>
      <p className="text-lg font-bold leading-snug">{q.q}</p>
      <div className="grid gap-2.5" role="radiogroup" aria-label="Javob variantlari">
        {q.options.map((o, i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={sel === i}
            onClick={() => setSel(i)}
            className={cx(
              'rounded-2xl border-2 px-4 py-3 text-left text-[15px] font-medium transition',
              sel === i ? 'border-sky-600 bg-sky-50 dark:bg-sky-500/15' : 'border-line bg-surface hover:border-sky-300',
            )}
          >
            {o}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Button variant="secondary" onClick={() => commit(-1)}>Bilmayman</Button>
        <Button className="flex-1" disabled={sel === null} onClick={() => sel !== null && commit(sel)}>{step === totalQ ? 'Yakunlash' : 'Keyingi'}</Button>
      </div>
      {step === totalQ && (
        <button type="button" className="w-full text-center text-sm text-muted underline" onClick={onDone}>Bu bo‘limni o‘tkazib yuborish</button>
      )}
    </div>
  );

  function commit(picked: number) {
    const all = [...answers, picked];
    setAnswers(all);
    setSel(null);
    if (all.length >= totalQ) {
      const correct = probe.questions.filter((qq, i) => all[i] === qq.answer).length;
      const res = listeningProbeResult(probe.level, correct);
      const saved: SkillAssessment = { level: res.level, confidence: res.confidence, source: 'probe', accuracy: correct / totalQ, updatedAt: today() };
      saveSkillLevels({ listening: saved });
      setResult(saved);
    }
    setStep(all.length + 1);
  }
}

function WriteProbe({ onDone }: { onDone: () => void }) {
  const p = useApp().profile!;
  const probe = useMemo(() => probeFor(WRITING_PROBES, p.estimatedLevel), [p.estimatedLevel]);
  const [text, setText] = useState('');
  const [result, setResult] = useState<{ saved: SkillAssessment; issues: { found: string; suggestion: string }[] } | null>(null);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  if (result) {
    return (
      <div className="space-y-4">
        <Card className="text-center">
          <p className="text-sm font-semibold text-muted">Yozish bo‘yicha taxminiy daraja</p>
          <div className="mt-2 flex justify-center"><LevelBadge level={result.saved.level ?? 'A1'} /></div>
          <p className="mt-2 text-xs text-muted">{confidenceLabel(result.saved.confidence)} · {sourceLabel(result.saved.source)} · qoidalar asosidagi tekshiruv</p>
        </Card>
        <Card>
          <p className="text-sm font-bold">Topilgan xatolar: {result.issues.length}</p>
          {result.issues.length === 0 ? (
            <p className="mt-1 text-sm text-muted">Katta xato topilmadi — zo‘r!</p>
          ) : (
            <ul className="mt-2 space-y-1.5 text-sm">
              {result.issues.slice(0, 3).map((i, k) => (
                <li key={k}>• <s className="text-rose-500">{i.found}</s> → <b>{i.suggestion || '…'}</b></li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-xs text-muted">To‘liq tahlil + AI tavsiyalari Yozish bo‘limida mavjud.</p>
        </Card>
        <Button size="lg" full onClick={onDone}>Davom etish: gaplashish</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-xs font-bold uppercase tracking-wide text-muted">✍️ Yozish · {probe.level}</p>
        <p className="mt-1.5 font-bold">{probe.promptEn}</p>
        <p className="mt-1 text-sm text-muted">{probe.promptUz}</p>
        <p className="mt-2 text-xs text-muted">Kamida {probe.minWords} ta so‘z yozing. Buning uchun AI ishlatilmaydi — matn faqat sizning qurilmangizda tekshiriladi va hech qayerga yuborilmaydi.</p>
      </Card>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        maxLength={1200}
        placeholder="Write in English…"
        className="w-full resize-none rounded-2xl border-2 border-line bg-surface px-4 py-3 text-base outline-none focus:border-sky-500"
        aria-label="Inglizcha matn"
      />
      <div className="flex items-center justify-between text-xs text-muted">
        <span>{words} ta so‘z (kamida {probe.minWords})</span>
      </div>
      <Button
        size="lg"
        full
        disabled={words < 8}
        onClick={() => {
          const c = checkText(text);
          const res = writingProbeResult(words, c.issues.length, p.selfLevel);
          const saved: SkillAssessment = {
            level: res.level,
            confidence: res.confidence,
            source: 'probe',
            accuracy: Math.max(0, Math.min(1, 1 - (c.issues.length / Math.max(1, words)) * 2.5)),
            updatedAt: today(),
          };
          saveSkillLevels({ writing: saved });
          setResult({ saved, issues: c.issues.map((i) => ({ found: i.found, suggestion: i.suggestion })) });
        }}
      >
        Tekshirish va davom etish
      </Button>
      <button type="button" className="w-full text-center text-sm font-semibold text-muted underline" onClick={onDone}>Bu bo‘limni o‘tkazib yuborish</button>
    </div>
  );
}

function SpeakProbe({ onDone }: { onDone: () => void }) {
  const [yes, setYes] = useState<Set<number>>(new Set());
  const done = yes.size > 0;
  return (
    <div className="space-y-4">
      <Card>
        <p className="text-xs font-bold uppercase tracking-wide text-muted">🗣️ Gaplashish · o‘z bahoingiz</p>
        <p className="mt-1.5 text-sm text-muted">Ovoz chiqarib aytib ko‘ring, so‘ng qaysi gaplarni erkin aytayotganingizni belgilang. Ilova nutqni yozib olmaydi va tahlil qilmaydi — bu sizning o‘z bahoingiz.</p>
      </Card>
      <div className="space-y-2">
        {SPEAKING_STATEMENTS.map((st, i) => {
          const active = yes.has(i);
          return (
            <button
              key={i}
              type="button"
              aria-pressed={active}
              onClick={() => {
                const next = new Set(yes);
                if (active) next.delete(i);
                else next.add(i);
                setYes(next);
              }}
              className={cx(
                'w-full rounded-2xl border-2 px-4 py-3 text-left transition',
                active ? 'border-sky-600 bg-sky-50 dark:bg-sky-500/15' : 'border-line bg-surface hover:border-sky-300',
              )}
            >
              <span className="block text-sm font-semibold text-sky-700 dark:text-sky-300">{st.en}</span>
              <span className="mt-0.5 block text-xs text-muted">{st.uz}</span>
            </button>
          );
        })}
      </div>
      <Notice tone="warn">Bu baho «o‘z bahoingiz» deb belgilanadi va past ishonch bilan saqlanadi.</Notice>
      <Button size="lg" full disabled={!done} onClick={() => {
        const level = speakingSelfResult(yes.size);
        const saved: SkillAssessment = { level, confidence: 'low', source: 'self', updatedAt: today() };
        saveSkillLevels({ speaking: saved });
        onDone();
      }}>
        Yakunlash va natijani ko‘rish
      </Button>
      <button type="button" className="w-full text-center text-sm font-semibold text-muted underline" onClick={onDone}>Bu bo‘limni o‘tkazib yuborish</button>
    </div>
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
          <>
            <p className="mt-3 text-sm">To‘g‘ri javoblar: <b>{sc.total}</b> / {sc.max}</p>
            {sc.confidence && (
              <p className="mt-1.5 text-xs text-muted">
                {sc.confidence === 'high'
                  ? '🎯 Ishonch darajasi: yuqori — natija barqaror asosga ega.'
                  : sc.confidence === 'medium'
                    ? '🧭 Ishonch darajasi: o‘rtacha — bir-ikki guruh savol bilan aniqlik oshadi.'
                    : '❓ Ishonch darajasi: past — test juda erta tugadi; Sozlamalardan qayta topshirsangiz, natija aniqroq bo‘ladi.'}
              </p>
            )}
          </>
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

      <SkillProfileCard showCta />

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

// ---------------------------------------------------------------- Shared: per-skill profile card
//
// Shows all six skills honestly: measured ones with level + confidence + source; unmeasured ones
// as "baholanmagan" with a path to measure them (never a guessed level).

const SKILL_ORDER: Skill[] = ['vocabulary', 'grammar', 'reading', 'listening', 'speaking', 'writing'];

export function SkillProfileCard({ showCta = false }: { showCta?: boolean }) {
  const s = useApp();
  const levels = useMemo(() => computeSkillLevels(s), [s]);
  const unmeasured = SKILL_ORDER.filter((k) => !levels[k]?.level);

  return (
    <Card className="mt-3">
      <p className="font-bold">🌍 Ko‘nikmalar profilingiz</p>
      <p className="mt-1 text-xs text-muted">Har bir ko‘nikma alohida baholanadi. Baholanmagan ko‘nikma uchun daraja o‘ylab topilmaydi.</p>
      <div className="mt-3 space-y-2">
        {SKILL_ORDER.map((k) => {
          const a = levels[k];
          const acc = a?.accuracy;
          return (
            <div key={k} className="flex items-center gap-3 rounded-2xl bg-surface2 px-3 py-2.5">
              <span className="text-lg" aria-hidden>{SKILL_EMOJI[k]}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{SKILL_LABEL[k]}</p>
                <p className="truncate text-[11px] text-muted">
                  {a?.level
                    ? `${confidenceLabel(a.confidence)} · ${sourceLabel(a.source)}${acc !== undefined ? ` · ${Math.round(acc * 100)}%` : ''}`
                    : 'Hali baholanmagan'}
                </p>
              </div>
              {a?.level ? <LevelBadge level={a.level} /> : <span className="text-xs font-semibold text-muted">—</span>}
            </div>
          );
        })}
      </div>
      {showCta && unmeasured.length > 0 && (
        <>
          <p className="mt-3 text-xs text-muted">Baholanmagan: {unmeasured.map((k) => SKILL_LABEL[k]).join(', ')}.</p>
          <Button className="mt-2" full onClick={() => navigate('/assessment-extra')}>
            Qo‘shimcha ko‘nikmalarni baholash (2–3 daqiqa)
          </Button>
        </>
      )}
    </Card>
  );
}
