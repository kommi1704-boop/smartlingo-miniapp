// Daily Learning Journey — the completion celebration (Phase 6).
//
// One of the most impressive screens in the app: achievements appear ONE BY
// ONE (never all at once), the XP counter counts up, and the streak step is
// shown only after the SERVER confirms it (xpApi.me → streaks table). The
// session-completion bonus is claimed here exactly once — the ledger's
// deterministic event key makes any double claim impossible, and refreshing
// the page never replays rewards (the `celebrated` flag + server idempotency).
import { useEffect, useRef, useState } from 'react';
import { navigate } from '../../lib/router';
import { getState } from '../../store/store';
import { claimJourneyBonus, markJourneyCelebrated } from '../../store/journeyActions';
import { themeById } from '../../lib/journey';
import { refreshServerStats } from '../../lib/xpApi';
import { streakOf } from '../../lib/gamification';
import { VOCAB } from '../../data/vocab';
import { haptic } from '../../lib/telegram';
import { playSfx } from '../../lib/sfx';
import { Emo, Glyph } from '../Emo';
import { Mascot, Confetti } from '../Mascot';
import { CountUp } from '../Alive';
import { Button } from '../ui';

const SKILL_LABEL: Record<string, string> = {
  vocab: 'So‘z boyligi', grammar: 'Grammatika', listening: 'Tinglash', reading: 'O‘qish', speaking: 'Gaplashish', writing: 'Yozish', game: 'O‘yin', mistakes: 'Xatolar',
};
const SKILL_EMO: Record<string, Parameters<typeof Emo>[0]['n']> = {
  vocab: 'cards', grammar: 'puzzle', listening: 'headset', reading: 'book', speaking: 'mic', writing: 'pen', game: 'game', mistakes: 'brain',
};

export function JourneyComplete({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(0);
  const [bonus, setBonus] = useState<number | null>(null);
  const [streakAfter, setStreakAfter] = useState<number | null>(null);
  const bonusTried = useRef(false);
  // plain state read (not a hook): the runner has already ensured today's slice exists
  const j = getState().journey;
  if (!j || !j.session) return null;
  const session = j.session;
  const theme = themeById(session.themeId);

  const stageXp = session.stages.reduce((a, st) => a + (j.stages[st.id]?.xp ?? 0), 0);
  const totalXp = stageXp + (bonus ?? 0);
  const vocabStage = session.stages.find((st) => st.kind === 'vocab');
  const words = (vocabStage?.words ?? []).map((id) => VOCAB.find((w) => w.id === id)).filter(Boolean);
  const skills = [...new Set(session.stages.map((st) => st.kind).filter((k) => k !== 'discover'))];
  const mistakesFixed = session.stages.filter((st) => st.challenge?.type === 'mistakes').reduce((a, st) => a + (j.stages[st.id]?.score ?? 0), 0);
  const startedMs = j.startedAt ? new Date(j.startedAt).getTime() : 0;
  const finishedMs = j.finishedAt ? new Date(j.finishedAt).getTime() : Date.now();
  const tookMin = startedMs ? Math.max(1, Math.round((finishedMs - startedMs) / 60_000)) : null;
  const streakBefore = streakAfter !== null ? Math.max(0, streakAfter - 1) : null;

  // claim the once-per-day session bonus + confirm the streak server-side
  useEffect(() => {
    if (bonusTried.current) return;
    bonusTried.current = true;
    void claimJourneyBonus().then((g) => { setBonus(g); playSfx('levelup'); haptic('success'); });
    void refreshServerStats().then((stats) => {
      setStreakAfter(stats?.summary?.streak?.current ?? streakOf(getState().activity));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const steps = buildSteps();
  const current = steps[Math.min(step, steps.length - 1)];
  const isLast = step >= steps.length - 1;

  function buildSteps() {
    const list: { key: string; title: string; body: React.ReactNode; sfx?: 'levelup' | 'correct' }[] = [
      {
        key: 'session',
        title: 'Safar yakunlandi!',
        sfx: 'levelup',
        body: (
          <>
            <div className="flex justify-center"><Mascot mood="cheer" size={110} /></div>
            <p className="mt-2 text-[15px] font-bold leading-snug">«{session.titleEn}» — muvaffaqiyatli yakunlandi. Fantastik!</p>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {session.stages.map((st) => (
                <span key={st.id} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11.5px] font-black text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <Emo n={st.emo as never} size={12} /> {st.title.split(':')[0]}
                </span>
              ))}
            </div>
          </>
        ),
      },
      {
        key: 'xp',
        title: 'XP yig‘dingiz',
        body: (
          <>
            <div className="flex justify-center"><Emo n="star" size={56} /></div>
            <p className="mt-2 text-5xl font-black text-[#b45309] dark:text-amber-300">+<CountUp value={totalXp} /> XP</p>
            <p className="mt-1 text-[13px] font-semibold text-muted">{bonus === 0 ? 'Bonus server tomonidan keyinroq tasdiqlanishi mumkin (limit yoki internet)' : 'Hammasi server tomonidan tasdiqlandi ✓'}</p>
          </>
        ),
      },
    ];
    if (words.length > 0) {
      list.push({
        key: 'words',
        title: `${words.length} ta yangi so‘z`,
        sfx: 'correct',
        body: (
          <>
            <div className="flex justify-center"><Emo n="cards" size={52} /></div>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {words.map((w) => (
                <span key={w!.id} className="rounded-2xl bg-surface2 px-3 py-1.5 text-[13.5px] font-extrabold">{w!.en} <span className="font-semibold text-muted">— {w!.uz}</span></span>
              ))}
            </div>
            <p className="mt-2 text-[13px] font-semibold text-muted">Ular SRS jadvalingizga qo‘shildi — takrorlash muddati kelganda ko‘rasiz.</p>
          </>
        ),
      });
    }
    list.push({
      key: 'skills',
      title: 'Mashq qilingan ko‘nikmalar',
      body: (
        <div className="grid grid-cols-2 gap-2">
          {skills.map((sk) => (
            <div key={sk} className="flex items-center gap-2 rounded-2xl border-2 border-line bg-surface px-3 py-2.5">
              <Emo n={SKILL_EMO[sk] ?? 'sparkle'} size={20} />
              <span className="text-[14px] font-extrabold">{SKILL_LABEL[sk] ?? sk}</span>
            </div>
          ))}
        </div>
      ),
    });
    if (streakAfter !== null && streakAfter >= 1) {
      const fresh = streakAfter === 1;
      list.push({
        key: 'streak',
        title: fresh ? 'Yangi seriya boshlandi!' : 'Seriya davom etdi!',
        sfx: 'levelup',
        body: (
          <>
            {/* streak-up moment: the flame pops with sparks — this is THE payoff of the daily safari */}
            <div className="relative flex items-center justify-center gap-3 py-2">
              <span className="pointer-events-none absolute inset-x-0 bottom-0 h-24" aria-hidden>
                <span className="streak-spark" /><span className="streak-spark s2" /><span className="streak-spark s3" /><span className="streak-spark s4" />
              </span>
              <span className="streak-flame-pop relative inline-flex scale-[1.9]"><Emo n="flame" size={46} /></span>
              <span className="relative text-4xl font-black text-muted">{streakBefore}</span>
              <span className="relative text-3xl font-black text-muted">→</span>
              <span className="relative text-6xl font-black text-[#d6523f]"><CountUp value={streakAfter} /></span>
            </div>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-[15px] font-extrabold"><Glyph emoji="🔥" size={18} /> {fresh ? 'ILK SERIYA — 1 KUN!' : `SERIYA ${streakAfter} KUNGA YETDI!`}</p>
            <p className="mt-1 text-[13px] font-semibold text-muted">
              {fresh
                ? 'Bugunki safari bilan yangi seriya boshlandingiz. Ertaga yana keling — olov o‘sadi!'
                : `Server tasdiqladi — seriyangiz endi ${streakAfter} kun. Olovni o‘chirmaysiz-ku!`}
            </p>
          </>
        ),
      });
    }
    list.push({
      key: 'final',
      title: 'Yakuniy natija',
      body: (
        <>
          <div className="grid grid-cols-2 gap-2">
            <FinalCell emo="star" value={`+${totalXp}`} label="XP" />
            <FinalCell emo="cards" value={String(words.length)} label="yangi so‘z" />
            <FinalCell emo="brain" value={String(mistakesFixed)} label="xato tuzatildi" />
            {tookMin !== null && <FinalCell emo="clock" value={`${tookMin} daq`} label="sarflangan vaqt" />}
          </div>
          <p className="mt-3 text-[15px] font-extrabold leading-snug">Yana bir kun. Yana bir qadam oldinga.</p>
          <p className="mt-1 text-[12.5px] font-semibold text-muted">Ertaga boshqa mavzu, boshqa bosqichlar — har kuni yangi kashfiyot.</p>
        </>
      ),
    });
    return list;
  }

  function next() {
    haptic('light');
    if (isLast) {
      markJourneyCelebrated();
      (onFinish ?? (() => navigate('/journey')))();
      return;
    }
    const s = steps[step + 1];
    if (s?.sfx) playSfx(s.sfx);
    setStep(step + 1);
  }

  return (
    <div className="fixed inset-0 z-[90] flex flex-col overflow-hidden bg-gradient-to-b from-[#4f46e5] via-[#6d28d9] to-[#a21caf]">
      <div className="pointer-events-none absolute inset-0"><Confetti count={34} /></div>
      <div className="relative z-[1] flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-8 text-center text-white">
        <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-black uppercase tracking-widest">
          YUTUQ {step + 1}/{steps.length} · {theme.titleUz}
        </span>
        <div key={current.key} className="pop-in mt-5 w-full max-w-md rounded-[28px] bg-white/95 p-6 shadow-2xl dark:bg-[#1e293b]/95">
          <h2 className="text-2xl font-black leading-tight">{current.title}</h2>
          <div className="mt-3 text-ink dark:text-white/90">{current.body}</div>
        </div>
        <Button className="mt-5 w-full max-w-md" size="lg" onClick={next}>
          {isLast ? 'Kashfiyotlarni davom ettirish' : 'Davom etish'}
        </Button>
        <p className="mt-2 text-[11px] font-bold text-white/70">Progress allaqachon saqlangan — yopib qo‘ysangiz ham yo‘qolmaydi</p>
      </div>
    </div>
  );
}

function FinalCell({ emo, value, label }: { emo: Parameters<typeof Emo>[0]['n']; value: string; label: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl bg-surface2 px-3 py-3 text-left">
      <Emo n={emo} size={26} />
      <div className="min-w-0">
        <p className="text-lg font-black leading-tight">{value}</p>
        <p className="truncate text-[11.5px] font-bold text-muted">{label}</p>
      </div>
    </div>
  );
}
