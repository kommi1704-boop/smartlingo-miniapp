// Daily Learning Journey — the session preview screen (Phase 2).
//
// The learner first sees WHAT today's journey is before committing: the
// personalized title, the hook, duration, stage count, difficulty, objectives
// and the honest XP estimate. One strong CTA starts (or resumes) the run.
import { navigate } from '../../lib/router';
import { useJourneySession } from './useJourney';
import { startJourney } from '../../store/journeyActions';
import { themeById } from '../../lib/journey';
import { prettyDate, today } from '../../lib/dates';
import { Button, Card, PageHeader, Pill } from '../ui';
import { Emo } from '../Emo';
import { Icon } from '../Icon';
import { cx } from '../../lib/utils';

export function JourneyPreview() {
  const data = useJourneySession();
  if (!data) return <div className="py-16 text-center text-sm font-bold text-muted"><span className="animate-pulse">Safar tayyorlanmoqda…</span></div>;
  const { session, j } = data;
  const theme = themeById(session.themeId);
  const doneCount = session.stages.filter((st) => j.stages[st.id]?.done).length;
  const allDone = doneCount === session.stages.length;
  const started = !!j.startedAt;

  function go() {
    if (!started) startJourney();
    navigate('/journey/run');
  }

  return (
    <div>
      <PageHeader back emo="rocket" title="Bugungi safar" subtitle={`Kunlik Learning Journey · ${prettyDate(today())}`} />

      {/* ---------- hero ---------- */}
      <section className={cx('rise-in overflow-hidden rounded-[28px] bg-gradient-to-br p-5 text-white shadow-lg', theme.gradient)}>
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10.5px] font-black uppercase tracking-widest">Today's learning journey</span>
          {allDone ? (
            <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-[11px] font-extrabold">✓ Bajarildi</span>
          ) : started ? (
            <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-[11px] font-extrabold">{doneCount}/{session.stages.length}</span>
          ) : null}
        </div>
        <h1 className="mt-2.5 text-2xl font-black leading-tight">{session.titleEn}</h1>
        <p className="mt-0.5 text-[14px] font-extrabold text-white/85">{session.titleUz}</p>
        <p className="mt-2 text-[13.5px] font-semibold leading-relaxed text-white/90">«{session.hookUz}»</p>
        <div className="mt-3.5 grid grid-cols-4 gap-1.5 text-center">
          <HeroMeta emo="clock" value={`${session.minutes}`} label="daqiqa" />
          <HeroMeta emo="target" value={`${session.stages.length}`} label="bosqich" />
          <HeroMeta emo="chart" value={session.level} label="daraja" />
          <HeroMeta emo="star" value={`~${session.rewardsXp[0]}+`} label="XP" />
        </div>
      </section>

      {/* ---------- objectives ---------- */}
      <Card className="mt-4">
        <p className="text-[13px] font-black uppercase tracking-wide text-muted">Bugun siz:</p>
        <ul className="mt-2 space-y-2">
          {session.objectives.map((o, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[14.5px] font-bold leading-snug">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                <Icon name="check" className="h-3.5 w-3.5" />
              </span>
              {o}
            </li>
          ))}
        </ul>
      </Card>

      {/* ---------- journey path preview ---------- */}
      <Card className="mt-4">
        <p className="text-[13px] font-black uppercase tracking-wide text-muted">Yo‘l xaritasi</p>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {session.stages.map((st, i) => {
            const done = !!j.stages[st.id]?.done;
            const current = !done && i === session.stages.findIndex((x) => !j.stages[x.id]?.done);
            return (
              <div key={st.id} className={cx(
                'flex w-28 shrink-0 flex-col items-center gap-1.5 rounded-3xl border-2 p-3 text-center',
                done ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10'
                  : current ? 'border-sky-300 bg-sky-50 dark:border-sky-500/40 dark:bg-sky-500/10' : 'border-dashed border-line bg-surface',
              )}>
                <span className={cx('grid h-10 w-10 place-items-center rounded-2xl', done ? 'bg-emerald-500 text-white' : 'bg-surface2')}>
                  {done ? <Icon name="check" className="h-5 w-5" /> : <Emo n={st.emo as never} size={20} />}
                </span>
                <p className="w-full truncate text-[11.5px] font-extrabold">{st.title.split(':').pop()?.trim() || st.title}</p>
                <p className="text-[10px] font-bold text-muted">~{st.minutes} daq</p>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[12px] font-semibold text-muted">Bosqichlar ketma-ket ochiladi — har biri avvalgisining davomi.</p>
      </Card>

      {/* ---------- rewards + why ---------- */}
      <Card className="mt-4">
        <div className="flex items-center gap-2">
          <Emo n="gift" size={20} />
          <p className="text-[14.5px] font-extrabold">Mukofotlar</p>
        </div>
        <p className="mt-1.5 text-[13.5px] font-semibold leading-relaxed text-muted">
          Bu safar uchun taxminan <b className="text-ink">{session.rewardsXp[0]}–{session.rewardsXp[1]} XP</b> (bosqichlar + yakuniy bonus) yig‘asiz.
          XP har bosqichdan so‘ng server tomonidan hisoblanadi va seriyangizni oshiradi.
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Pill tone="green"><Emo n="flame" size={12} /> Seriya davom etadi</Pill>
          <Pill tone="violet"><Emo n="brain" size={12} /> Sizning darajangizga mos</Pill>
          <Pill tone="amber"><Emo n="sparkle" size={12} /> Har kuni yangi mavzu</Pill>
        </div>
      </Card>

      {/* ---------- CTA ---------- */}
      {allDone ? (
        <Card className="mt-4 text-center">
          <div className="flex justify-center"><Emo n="trophy" size={44} /></div>
          <p className="mt-1.5 text-lg font-extrabold">Bugungi safar bajarildi!</p>
          <p className="mt-1 text-[13px] font-semibold text-muted">Ertaga yangi mavzu bilan qaytishingizni kutamiz. Yolib olishingiz mumkin: yo‘l xaritasini ko‘rib chiqing.</p>
          <div className="mt-3 space-y-2">
            <Button size="lg" full icon="right" onClick={() => navigate('/journey/run')}>Yo‘l xaritasini ko‘rish</Button>
            <Button variant="secondary" full onClick={() => navigate('/')}>Bosh sahifa</Button>
          </div>
        </Card>
      ) : (
        <Button className="mt-4" size="lg" full icon="play" onClick={go}>
          {started ? `Davom etish (${doneCount}/${session.stages.length})` : 'START TODAY’S JOURNEY'}
        </Button>
      )}

      <p className="mt-3 rounded-2xl bg-surface2 px-3.5 py-2.5 text-center text-[12px] font-semibold text-muted">
        <Icon name="info" className="mr-1 inline h-3.5 w-3.5" />
        Sessiya xavfsiz saqlanadi: internet uzilsa yoki ilovani yopsangiz ham, shu bosqichdan davom etasiz.
      </p>
    </div>
  );
}

function HeroMeta({ emo, value, label }: { emo: Parameters<typeof Emo>[0]['n']; value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white/15 px-1 py-2">
      <div className="flex items-center justify-center"><Emo n={emo} size={16} /></div>
      <p className="mt-0.5 truncate text-[13.5px] font-black leading-tight">{value}</p>
      <p className="text-[9.5px] font-bold uppercase tracking-wide text-white/75">{label}</p>
    </div>
  );
}
