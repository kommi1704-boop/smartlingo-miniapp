import { useCallback, useEffect, useRef, useState } from 'react';
import type { QuizGetResponse, PlayQuestion, SubmitResult } from '../lib/quizApi';
import {
  clearDraft, fetchQuiz, fetchQuizMeta, journalCardPurchase, loadDraft, quizNotConfigured,
  resolveQuizDeepLink, saveDraft, submitQuiz, quizDeepLink,
} from '../lib/quizApi';
import { record, spendCoins } from '../store/actions';
import { toast } from '../store/ui';
import { useApp } from '../store/store';
import { tgUser } from '../lib/telegram';
import { haptic } from '../lib/telegram';
import { playSfx } from '../lib/sfx';
import { A, goBack, navigate } from '../lib/router';
import { Button, Card, Empty, PageHeader, ProgressBar, Section } from '../components/ui';
import { AnswerReview, GoldUnlock, ResultCard } from '../components/QuizResultCard';
import { QuizDetail } from './QuizDetail';
import { Icon } from '../components/Icon';
import { cx, uid } from '../lib/utils';

const LETTERS = ['A', 'B', 'C', 'D'];

export function QuizPlay({ quizId }: { quizId: string }) {
  const s = useApp();
  const [data, setData] = useState<QuizGetResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchQuiz(quizId)
      .then(setData)
      .catch((e) => {
        const m = e instanceof Error ? e.message : '';
        setError(m === 'not_found' || m === 'bad_id' ? 'not_found' : quizNotConfigured(e) ? 'not_configured' : 'net');
      });
  }, [quizId]);
  useEffect(() => {
    load();
  }, [load]);

  if (error === 'not_found') {
    return (
      <div>
        <PageHeader emoji="🎯" title="Do‘st quizi" back="/friendquiz" />
        <Empty
          emoji="🔍"
          title="Quiz topilmadi"
          text="Havola noto‘g‘ri yoki quiz o‘chirilgan. Do‘stingizdan yangi havola so‘rang."
          action={<Button onClick={() => navigate('/friendquiz')}>Do‘st quizi</Button>}
        />
      </div>
    );
  }
  if (error) {
    return (
      <div>
        <PageHeader emoji="🎯" title="Do‘st quizi" back="/friendquiz" />
        <Empty emoji="📡" title="Yuklanmadi" text="Internetni tekshirib, qayta urinib ko‘ring." action={<Button onClick={load}>Qayta urinish</Button>} />
      </div>
    );
  }
  if (!data) {
    return (
      <div>
        <PageHeader emoji="🎯" title="Do‘st quizi" back="/friendquiz" />
        <div className="h-52 animate-pulse rounded-2xl border border-line bg-surface2/50" />
      </div>
    );
  }

  const me = data.role === 'creator';
  if (me || data.quiz.status !== 'active') {
    // creators and closed quizzes go to the results view
    return <QuizDetail quizId={quizId} embedded />;
  }

  if (data.myAttempt) {
    return (
      <QuizResult
        quizId={quizId}
        title={data.quiz.title}
        creatorName={data.quiz.creatorName}
        result={{
          score: data.myAttempt.score,
          total: data.myAttempt.total,
          durationMs: data.myAttempt.durationMs,
          questions: data.myAttempt.questions,
          answers: data.myAttempt.answers,
        }}
        replay={false}
      />
    );
  }

  return <Runner key={quizId} data={data} />;
}

// ---------------------------------------------------------------------------
// The runner — picks are NOT graded in-app (the server decides at submit time;
// correct answers are never shown before that).
// ---------------------------------------------------------------------------

function Runner({ data }: { data: QuizGetResponse }) {
  const quizId = data.quiz.id;
  const s = useApp();
  const draft = useRef(loadDraft(quizId));
  const [idx, setIdx] = useState(() => draft.current?.idx ?? 0);
  const [picks, setPicks] = useState<number[]>(() => draft.current?.picks ?? []);
  const [picked, setPicked] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const startedAt = useRef(draft.current?.startedAt ?? Date.now());

  const questions: PlayQuestion[] = data.questions ?? [];
  const q = questions[idx];

  useEffect(() => {
    if (result) return;
    saveDraft({ quizId, idx, picks, startedAt: startedAt.current, savedAt: Date.now() });
  }, [quizId, idx, picks, result]);

  const choose = (i: number) => {
    if (picked !== null || !q || busy) return;
    setPicked(i);
    haptic('select');
    playSfx('pop'); // neutral tap feedback — correctness stays unknown until submit
  };

  const next = async () => {
    if (picked === null || busy) return;
    if (idx + 1 < questions.length) {
      setPicks([...picks, picked]);
      setPicked(null);
      setIdx(idx + 1);
      return;
    }
    // last question -> submit everything to the server (it grades).
    // Picks/picked are NOT mutated until the server confirms, so a network
    // failure keeps the exact state and the retry sends the same answers.
    setBusy(true);
    try {
      const durationMs = Math.max(1000, Date.now() - startedAt.current);
      const r = await submitQuiz(quizId, [...picks, picked], durationMs, s.profile?.name?.trim().slice(0, 24) || 'Do‘st', s.shop.equipped.avatar);
      setPicks([...picks, picked]);
      setPicked(null);
      clearDraft(quizId);
      const reward = r.score === r.total ? 40 : 10 + r.score * 2;
      record({ xp: reward, quizzes: 1 });
      haptic('success');
      setResult(r);
    } catch (e) {
      const m = e instanceof Error ? e.message : '';
      if (m === 'already_attempted') {
        clearDraft(quizId);
        toast('Siz bu quizga allaqachon javob bergansiz — natijalar ko‘rsatilmoqda', 'info');
        navigate(`/friendquiz/view/${quizId}`, { replace: true });
        return;
      }
      if (m === 'too_fast') {
        // anti-cheat guard: restart cleanly (nothing was graded)
        toast('Javoblar juda tez yuborildi — quizni qaytadan boshlaymiz', 'warn');
        clearDraft(quizId);
        setPicks([]);
        setPicked(null);
        setIdx(0);
        startedAt.current = Date.now();
        return;
      }
      if (m === 'quiz_closed') {
        toast('Bu quiz yopilgan', 'warn');
        navigate(`/friendquiz/view/${quizId}`, { replace: true });
        return;
      }
      toast('Yuborib bo‘lmadi — internetni tekshirib, qayta urinib ko‘ring', 'warn');
      // picked stays highlighted: the user can press Yuborish again
    } finally {
      setBusy(false);
    }
  };

  if (result) {
    return <QuizResult quizId={quizId} title={data.quiz.title} creatorName={data.quiz.creatorName} result={result} replay={false} />;
  }

  if (!q) return null;

  return (
    <div className="slide-up">
      <PageHeader emoji="🎯" title={data.quiz.title} subtitle={`${data.quiz.creatorName} yuborgan quiz`} back="/friendquiz" />
      <div className="mb-3 flex items-center gap-3">
        <span className="shrink-0 text-sm font-semibold text-muted">
          Savol {idx + 1}/{questions.length}
        </span>
        <ProgressBar value={((idx + (picked !== null ? 1 : 0)) / questions.length) * 100} className="flex-1" label="Quiz jarayoni" />
      </div>
      <Card>
        <p className="text-lg font-bold leading-snug">{q.q}</p>
        <div className="mt-4 grid gap-2.5" role="group" aria-label="Javob variantlari">
          {q.options.map((o, i) => (
            <button
              key={i}
              type="button"
              disabled={picked !== null}
              onClick={() => choose(i)}
              aria-pressed={picked === i}
              className={cx(
                'flex w-full items-center gap-3 rounded-2xl border-2 px-3.5 py-3 text-left text-[15px] font-medium transition',
                picked === i ? 'border-accent bg-accent/10' : 'border-line bg-surface hover:border-accent/40 hover:bg-surface2',
              )}
            >
              <span className={cx('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold', picked === i ? 'bg-accent text-white' : 'bg-surface2 text-muted')}>
                {LETTERS[i]}
              </span>
              <span className="min-w-0 flex-1">{o}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-muted">Natijalar barcha javoblar yuborilgach ko‘rsatiladi — shoshilmang, o‘ylab javob bering 😉</p>
      </Card>
      <div className="mt-4 flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          icon="x"
          onClick={() => {
            if (picks.length > 0) {
              toast('Progress saqlandi — sahifani yangilasangiz davom etasiz', 'info');
            }
            goBack('/friendquiz');
          }}
        >
          Chiqish
        </Button>
        <Button onClick={next} disabled={picked === null || busy}>
          {busy ? 'Yuborilmoqda…' : idx + 1 < questions.length ? 'Keyingi savol' : 'Yuborish'}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Result view — score card, answer review, gold unlock, leaderboard link.
// ---------------------------------------------------------------------------

export function QuizResult({
  quizId, title, creatorName, result, replay,
}: {
  quizId: string;
  title: string;
  creatorName: string;
  result: SubmitResult;
  replay: boolean;
}) {
  const s = useApp();
  const [theme, setTheme] = useState<'classic' | 'gold'>('classic');
  const [meta, setMeta] = useState<{ botUsername: string | null; cardCost: number } | null>(null);
  const playerName = s.profile?.name?.trim().split(/\s+/)[0] || 'O‘quvchi';

  useEffect(() => {
    fetchQuizMeta()
      .then((m) => setMeta({ botUsername: m.botUsername ?? null, cardCost: m.cardThemeCost ?? 20 }))
      .catch(() => setMeta({ botUsername: null, cardCost: 20 }));
  }, []);

  const shareUrl = quizDeepLink(meta?.botUsername, quizId);

  const unlockGold = (): boolean => {
    const cost = meta?.cardCost ?? 20;
    if (!spendCoins(cost)) return false;
    const spendId = `cs_${tgUser()?.id ?? 'x'}_${uid('card')}`;
    void journalCardPurchase(quizId, spendId).catch(() => {
      // server could not journal (offline) — keep the local unlock, the audit row is cosmetic
    });
    setTheme('gold');
    toast('✨ Oltin kartochka yoqildi!', 'success');
    return true;
  };

  return (
    <div className="space-y-5">
      <PageHeader emoji="🏁" title="Natija" subtitle={title} back={`/friendquiz/view/${quizId}`} />
      <ResultCard
        quizTitle={title}
        creatorName={creatorName}
        playerName={playerName}
        score={result.score}
        total={result.total}
        theme={theme}
        shareUrl={shareUrl}
      />
      {theme === 'classic' && (
        <div className="px-1">
          <GoldUnlock cost={meta?.cardCost ?? 20} coins={s.coins.balance} onUnlock={unlockGold} />
        </div>
      )}
      <Section title="Javoblar tahlili">
        <AnswerReview questions={result.questions} answers={result.answers} />
      </Section>
      <div className="flex flex-col gap-2 sm:flex-row">
        <A to={`/friendquiz/view/${quizId}`} className="flex-1">
          <Button full icon="trophy">Jadvalni ko‘rish</Button>
        </A>
        <A to="/friendquiz" className="flex-1">
          <Button full variant="secondary" icon="plus">O‘z quizimni tuzish</Button>
        </A>
      </div>
      {replay && null}
    </div>
  );
}
