// Daily Learning Journey — the immersive full-screen learning interface (Phase 3).
//
// A fixed overlay above the whole app: journey path on one side, the current
// stage on the other. Progress is persisted on every step (journeyActions),
// so exiting (X), refreshing or losing connection always resumes exactly
// where the learner stopped. Leaving is never blocked — the X is always there
// and nothing traps the user.
import { useEffect, useRef, useState } from 'react';
import { navigate } from '../../lib/router';
import { useApp } from '../../store/store';
import { useJourneySession } from './useJourney';
import { startJourney, addJourneyStageXp, saveJourneyAiText } from '../../store/journeyActions';
import { themeById } from '../../lib/journey';
import { aiLeftToday, aiPost } from '../../lib/aiUsage';
import { refreshServerStats } from '../../lib/xpApi';
import { haptic } from '../../lib/telegram';
import { playSfx } from '../../lib/sfx';
import { ttsAvailable } from '../../lib/tts';
import { Emo } from '../Emo';
import { Icon } from '../Icon';
import { Button } from '../ui';
import { cx } from '../../lib/utils';
import {
  DiscoverStage, VocabStage, GrammarStage, ListeningStage, ReadingStage, GameStage, ChallengeStage, type StageProps,
} from './stages';
import { JourneyComplete } from './JourneyComplete';
import type { JourneySession, JourneyStage, JourneyState } from '../../types';

const STAGE_COMP: Record<string, (p: StageProps) => React.ReactElement | null> = {
  discover: DiscoverStage, vocab: VocabStage, grammar: GrammarStage, listening: ListeningStage,
  reading: ReadingStage, game: GameStage, challenge: ChallengeStage,
};

export function JourneyRunner() {
  const data = useJourneySession();
  if (!data) return <div className="grid h-full place-items-center text-sm font-bold text-muted"><span className="animate-pulse">Yo‘l xaritasi tayyorlanmoqda…</span></div>;
  return <RunnerInner key={data.session.date + data.session.themeId} session={data.session} j={data.j} />;
}

function RunnerInner({ session, j }: { session: JourneySession; j: JourneyState }) {
  const s = useApp();
  const theme = themeById(session.themeId);
  const doneCount = session.stages.filter((st) => j.stages[st.id]?.done).length;
  const allDone = doneCount === session.stages.length;
  const currentIdx = session.stages.findIndex((st) => !j.stages[st.id]?.done);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [lastDone, setLastDone] = useState<{ stageId: string; score: number; total: number; xp: number } | null>(null);
  const [celebrateNow, setCelebrateNow] = useState(false);
  const aiTried = useRef(false);

  // start timestamp (once per day)
  useEffect(() => {
    if (!j.startedAt) startJourney();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // one silent attempt to get the AI reading for today (3/day server quota, cached on success)
  useEffect(() => {
    if (aiTried.current) return;
    aiTried.current = true;
    const stage = session.stages.find((st) => st.kind === 'reading' && !st.aiText);
    if (!stage || j.aiText || aiLeftToday('generate-text') <= 0) return;
    const interest = (s.profile?.interests ?? []).find((i) => theme.interests.includes(i)) ?? s.profile?.interests?.[0] ?? 'ilm-fan';
    aiPost<{ result: { title: string; text: string; questions: { q: string; options: string[]; answerIndex: number }[]; words: { en: string; uz: string }[] } }>(
      'generate-text', '/api/generate-text', { interest, level: session.level },
    )
      .then((r) => saveJourneyAiText({ ...r.result, interest }, interest))
      .catch(() => undefined); // offline / no key: the catalog passage is already in place    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stageOpen = openIdx !== null ? session.stages[openIdx] : null;
  const StageComp = stageOpen ? STAGE_COMP[stageOpen.kind] : null;

  function handleStageDone(stage: JourneyStage, args: { score: number; total: number; xp: number }) {
    haptic('success');
    playSfx('correct');
    setLastDone({ stageId: stage.id, ...args });
    // finishing the FINAL stage flows straight into the celebration (Duolingo-style linear run)
    const remaining = session.stages.filter((st) => st.id !== stage.id && !j.stages[st.id]?.done);
    if (remaining.length === 0) setCelebrateNow(true);
  }

  const xpEarned = session.stages.reduce((a, st) => a + (j.stages[st.id]?.xp ?? 0), 0);

  return (
    <div className="fixed inset-0 z-[80] flex flex-col overflow-hidden bg-surface">
      {/* header */}
      <div className={cx('safe-top shrink-0 bg-gradient-to-br px-4 pb-3 pt-2 text-white shadow-md', theme.gradient)}>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button" aria-label="Safardan chiqish (progress saqlanadi)"
            className="tap grid h-9 w-9 place-items-center rounded-2xl bg-white/20 text-lg font-black"
            onClick={() => navigate('/journey')}
          >
            <Icon name="x" className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-[11px] font-black uppercase tracking-wider text-white/80">{theme.titleUz}</p>
            <p className="truncate text-[15px] font-extrabold leading-tight">{allDone ? 'Safar yakunlandi' : stageOpen ? stageOpen.title : 'Yo‘l xaritasi'}</p>
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-2xl bg-white/20 px-2.5 py-1.5 text-[13px] font-black">
            <Emo n="star" size={14} /> {xpEarned}
          </span>
        </div>
        {/* progress bar */}
        <div className="mt-2 flex items-center gap-2">
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${Math.max(3, (doneCount / session.stages.length) * 100)}%` }} />
          </div>
          <span className="text-[11px] font-black text-white/90">{doneCount}/{session.stages.length}</span>
        </div>
      </div>

      {/* body */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {allDone && j.celebrated && !lastDone && (
          <div className="mb-3 rounded-3xl border-2 border-emerald-300 bg-emerald-50 p-4 text-center dark:border-emerald-500/40 dark:bg-emerald-500/10">
            <p className="text-[15px] font-extrabold">Bugungi safar bajarildi 🎉</p>
            <p className="mt-1 text-[13px] font-semibold text-muted">Ertaga yangi mavzu bilan qaytishingizni kutamiz.</p>
            <Button className="mt-3" variant="secondary" onClick={() => navigate('/')}>Bosh sahifa</Button>
          </div>
        )}

        {stageOpen && StageComp ? (
          lastDone && lastDone.stageId === stageOpen.id ? (
            /* ---- interstitial after a finished stage ---- */
            <div className="pop-in rounded-3xl border-2 border-emerald-200 bg-emerald-50/70 p-6 text-center dark:border-emerald-500/40 dark:bg-emerald-500/10">
              <Emo n={stageOpen.emo as never} size={44} />
              <h3 className="mt-2 text-xl font-extrabold">Bosqich bajarildi!</h3>
              {lastDone.total > 0 && <p className="mt-0.5 text-sm font-bold text-muted">{lastDone.score}/{lastDone.total} to‘g‘ri</p>}
              {lastDone.xp > 0 && (
                <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-[#fff3c2] px-3 py-1 text-sm font-black text-[#5a3d00] dark:bg-white/10 dark:text-white">
                  <Emo n="star" size={14} /> +{lastDone.xp} XP
                </p>
              )}
              <p className="mt-2 text-[13px] font-semibold text-muted">Progress avtomatik saqlandi — xohlaganda chiqib, keyin davom etishingiz mumkin.</p>
              {currentIdx === -1 || celebrateNow ? (
                <Button className="mt-4" size="lg" full icon="sparkles" onClick={() => setCelebrateNow(true)}>🎉 Yakuniy natijani ko‘rish</Button>
              ) : (
                <Button className="mt-4" size="lg" full icon="right" onClick={() => { setOpenIdx(currentIdx); setLastDone(null); }}>
                  Keyingi bosqich: {session.stages[currentIdx]?.title.split(':')[0] ?? ''}
                </Button>
              )}
            </div>
          ) : (
            <StageComp key={stageOpen.id} stage={stageOpen} session={session} onDone={(args) => handleStageDone(stageOpen, args)} />
          )
        ) : (
          /* ---- the journey path (shown on entry/resume; the run itself is linear) ---- */
          <div className="mx-auto max-w-md">
            <div className="relative">
              <div className="absolute bottom-6 left-[27px] top-6 w-0.5 bg-line" aria-hidden />
              <ol className="space-y-3">
                {session.stages.map((st, i) => {
                  const run = j.stages[st.id];
                  const done = !!run?.done;
                  const current = i === currentIdx;
                  const locked = !done && !current;
                  return (
                    <li key={st.id} className="relative flex items-stretch gap-3">
                      <span className={cx(
                        'relative z-[1] grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-2 shadow-sm transition',
                        done ? 'border-emerald-400 bg-emerald-500 text-white' : current ? 'border-sky-400 bg-white dark:bg-white/10' : 'border-line bg-surface2 opacity-60',
                        current && 'ring-4 ring-sky-400/25',
                      )}>
                        {done ? <Icon name="check" className="h-6 w-6" /> : <Emo n={st.emo as never} size={24} />}
                      </span>
                      <div className={cx(
                        'min-w-0 flex-1 rounded-3xl border-2 p-3.5 transition',
                        current ? 'border-sky-300 bg-surface shadow-sm' : 'border-line bg-surface',
                        locked && 'opacity-60',
                      )}>
                        <div className="flex items-center gap-2">
                          <p className="min-w-0 flex-1 truncate text-[15px] font-extrabold">{st.title}</p>
                          <span className="shrink-0 text-[11px] font-black text-muted">~{st.minutes} daq</span>
                        </div>
                        <p className="truncate text-[12.5px] font-semibold text-muted">{st.desc}</p>
                        {done && run && run.total > 0 && (
                          <p className="mt-1 flex items-center gap-2 text-[12px] font-bold text-emerald-600 dark:text-emerald-400">
                            <Icon name="check" className="h-3.5 w-3.5" /> {run.score}/{run.total}
                            {run.xp > 0 && <span className="inline-flex items-center gap-1 text-[#b45309] dark:text-amber-300"><Emo n="star" size={12} /> +{run.xp} XP</span>}
                          </p>
                        )}
                        {done && run && run.total === 0 && <p className="mt-1 text-[12px] font-bold text-emerald-600 dark:text-emerald-400"><Icon name="check" className="mr-1 inline h-3.5 w-3.5" />Bajarildi</p>}
                        {current && !lastDone && (
                          <Button className="mt-2.5" size="md" full icon="play" onClick={() => { haptic('light'); setOpenIdx(i); }}>
                            {i === 0 && !j.startedAt ? 'Safarni boshlash' : 'Bosqichni boshlash'}
                          </Button>
                        )}
                        {locked && (
                          <p className="mt-1 flex items-center gap-1 text-[11.5px] font-bold text-muted"><Icon name="lock" className="h-3.5 w-3.5" /> Oldingi bosqichdan keyin ochiladi</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
            <p className="mt-4 rounded-2xl bg-surface2 px-3.5 py-2.5 text-center text-[12px] font-semibold text-muted">
              <Icon name="info" className="mr-1 inline h-3.5 w-3.5" />
              Progress avtomatik saqlanadi. X tugmasi bilan chiqsangiz ham, shu yerdan davom etasiz.
            </p>
          </div>
        )}
      </div>

      {/* ---- the completion celebration: plays exactly once per completed session ---- */}
      {/* allDone && !celebrated covers re-entry after closing mid-celebration; celebrateNow
          covers the moment the final stage finishes. markJourneyCelebrated() is called by
          JourneyComplete itself when the learner finishes the sequence — never on mount. */}
      {((allDone && !j.celebrated) || celebrateNow) && (
        <JourneyComplete onFinish={() => { setCelebrateNow(false); navigate('/journey'); }} />
      )}
    </div>
  );
}
