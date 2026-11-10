import { useCallback, useEffect, useState } from 'react';
import type { Participant, QuizGetResponse } from '../lib/quizApi';
import { closeQuiz, fetchQuiz, fetchQuizMeta, quizDeepLink, quizNotConfigured } from '../lib/quizApi';
import { useApp } from '../store/store';
import { toast } from '../store/ui';
import { A, navigate } from '../lib/router';
import { shareToTelegram } from '../lib/telegram';
import { Button, Card, Empty, PageHeader, Pill, Section } from '../components/ui';
import { Icon } from '../components/Icon';
import { dateShort, labelOf, QUIZ_CATEGORIES, QUIZ_DIFFICULTIES } from './QuizFriends';
import { cx } from '../lib/utils';

const MEDALS = ['🥇', '🥈', '🥉'];

export function QuizDetail({ quizId, embedded }: { quizId: string; embedded?: boolean }) {
  const s = useApp();
  const [data, setData] = useState<QuizGetResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [botUsername, setBotUsername] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);

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
    fetchQuizMeta().then((m) => setBotUsername(m.botUsername ?? null)).catch(() => undefined);
  }, [load]);

  if (error === 'not_found') {
    return (
      <div>
        {!embedded && <PageHeader emoji="🎯" title="Do‘st quizi" back="/friendquiz" />}
        <Empty
          emoji="🔍"
          title="Quiz topilmadi"
          text="Havola eskirgan yoki noto‘g‘ri. Do‘stingizdan yangi havola so‘rang."
          action={<Button onClick={() => navigate('/friendquiz')}>Do‘st quizi</Button>}
        />
      </div>
    );
  }
  if (error) {
    return (
      <div>
        {!embedded && <PageHeader emoji="🎯" title="Do‘st quizi" back="/friendquiz" />}
        <Empty emoji="📡" title="Yuklanmadi" text="Internetni tekshirib, qayta urinib ko‘ring." action={<Button onClick={load}>Qayta urinish</Button>} />
      </div>
    );
  }
  if (!data) {
    return (
      <div>
        {!embedded && <PageHeader emoji="🎯" title="Do‘st quizi" back="/friendquiz" />}
        <div className="h-52 animate-pulse rounded-2xl border border-line bg-surface2/50" />
      </div>
    );
  }

  const { quiz, participants, myAttempt, role } = data;
  const isCreator = role === 'creator';
  const shareUrl = quizDeepLink(botUsername, quiz.id);
  const canPlay = !isCreator && !myAttempt && quiz.status === 'active';

  return (
    <div className="space-y-5">
      {!embedded && <PageHeader emoji="🎯" title={quiz.title} subtitle={isCreator ? 'Sizning quizingiz' : `${quiz.creatorName} yuborgan`} back="/friendquiz" />}

      {/* ---- info card ---- */}
      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone="indigo">{labelOf(QUIZ_CATEGORIES, quiz.category)}</Pill>
          <Pill>{labelOf(QUIZ_DIFFICULTIES, quiz.difficulty)}</Pill>
          <Pill>{quiz.size} savol</Pill>
          {quiz.costCoins > 0 && <Pill tone="amber">🪙 {quiz.costCoins}</Pill>}
          {quiz.status === 'closed' && <Pill tone="rose">Yopiq</Pill>}
        </div>
        <div className="mt-2 text-xs text-muted">
          {isCreator ? 'Siz yaratdingiz' : `${quiz.creatorName} yaratdi`} · {dateShort(quiz.createdAt)} · {participants.length} ta qatnashchi
        </div>

        {canPlay && (
          <div className="mt-4">
            <Button size="lg" full icon="play" onClick={() => navigate(`/friendquiz/play/${quiz.id}`)}>
              Quizni boshlash
            </Button>
            <p className="mt-2 text-center text-[11px] text-muted">Bir marta javob berish mumkin — natijangiz do‘stingizga yuboriladi.</p>
          </div>
        )}
        {myAttempt && !isCreator && (
          <div className="mt-4 rounded-2xl bg-surface2/60 p-3 text-sm">
            <span className="font-bold">Sizning natijangiz: {myAttempt.score}/{myAttempt.total}</span>
            <A to={`/friendquiz/play/${quiz.id}`} className="ml-2 inline-flex items-center gap-1 font-semibold text-accent">
              Kartochka <Icon name="right" className="h-3.5 w-3.5" />
            </A>
          </div>
        )}
      </Card>

      {/* ---- share (creator) ---- */}
      {isCreator && (
        <Card className="border-accent/30 bg-accent/5">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Icon name="share" className="h-4 w-4" /> Do‘stlaringizga yuboring
          </div>
          <p className="mt-1 text-xs text-muted">
            Havolani ochgan do‘stingiz quizni bir marta yechadi, natijalar shu sahifadagi jadvalga tushadi.
          </p>
          {shareUrl ? (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Button
                full
                icon="send"
                onClick={() =>
                  shareToTelegram(
                    shareUrl,
                    `🎯 Men sizga «${quiz.title}» quizi tuzdim! ${quiz.size} ta savol — urinib ko'r: ${shareUrl}`,
                  )
                }
              >
                Telegram’da ulashish
              </Button>
              <Button
                full
                variant="secondary"
                icon="link"
                onClick={() => {
                  void navigator.clipboard?.writeText(shareUrl).then(() => toast('Havola nusxalandi ✓', 'success')).catch(() => toast(shareUrl, 'info', 5000));
                }}
              >
                Havolani nusxalash
              </Button>
            </div>
          ) : (
            <p className="mt-3 text-xs text-muted">Havola uchun bot username hozircha noma’lum — bir necha soniyadan keyin sahifani yangilang.</p>
          )}
          {quiz.status === 'active' && participants.length > 0 && (
            <div className="mt-3">
              <Button
                size="sm"
                variant="ghost"
                disabled={closing}
                onClick={async () => {
                  setClosing(true);
                  await closeQuiz(quiz.id);
                  toast('Quiz yopildi — yangi javoblar qabul qilinmaydi', 'success');
                  load();
                  setClosing(false);
                }}
              >
                {closing ? 'Yopilmoqda…' : 'Quizni yopish'}
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* ---- leaderboard ---- */}
      <Section title={`Natijalar jadvali (${participants.length})`}>
        {participants.length === 0 ? (
          <Empty emoji="⏳" title="Hali kimdir javob bermagan" text="Do‘stlaringiz javob bergach, shu yerda jadval ko‘rinadi." />
        ) : (
          <div className="space-y-2">
            {participants.map((p, i) => (
              <LeaderRow key={p.playerId} p={p} rank={i + 1} me={String(p.playerId) === String(s.profile ? tgId() : '')} />
            ))}
          </div>
        )}
      </Section>

      {!isCreator && (
        <div className="pb-2 text-center">
          <A to="/friendquiz">
            <Button variant="ghost" size="sm">O‘z quizimni tuzish</Button>
          </A>
        </div>
      )}
    </div>
  );
}

/** The Telegram id of the signed-in user (from initData). */
function tgId(): string {
  try {
    const u = window.Telegram?.WebApp?.initDataUnsafe?.user;
    return u ? String(u.id) : '';
  } catch {
    return '';
  }
}

function LeaderRow({ p, rank, me }: { p: Participant; rank: number; me: boolean }) {
  const ratio = p.total ? p.score / p.total : 0;
  return (
    <div
      className={cx(
        'flex items-center gap-3 rounded-2xl border p-3',
        me ? 'border-accent/50 bg-accent/10' : 'border-line bg-surface',
      )}
    >
      <span className="w-8 shrink-0 text-center text-lg font-extrabold">{MEDALS[rank - 1] ?? <span className="text-sm text-muted">{rank}</span>}</span>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface2 text-lg" aria-hidden="true">{p.avatar ?? '🙂'}</span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold">
          {p.name} {me && <span className="text-accent">(siz)</span>}
        </div>
        <div className="text-[11px] text-muted">
          {p.score}/{p.total} · {Math.round((p.durationMs || 0) / 1000)}s
        </div>
      </div>
      <div className={cx('shrink-0 text-lg font-extrabold', ratio >= 0.8 ? 'text-emerald-500' : ratio >= 0.5 ? 'text-gold' : 'text-rose-400')}>
        {Math.round(ratio * 100)}%
      </div>
    </div>
  );
}
