import { useCallback, useEffect, useState } from 'react';
import { useApp } from '../store/store';
import { spendCoins } from '../store/actions';
import { toast } from '../store/ui';
import { tgUser } from '../lib/telegram';
import { A, navigate } from '../lib/router';
import {
  createQuiz, fetchMyQuizzes, fetchQuizMeta, quizAvailable, quizNotConfigured,
  type QuizMeta, type QuizSummary,
} from '../lib/quizApi';
import { Button, Card, Empty, Notice, PageHeader, Pill, Section, Tabs } from '../components/ui';
import { Icon } from '../components/Icon';
import { cx, fmt, uid } from '../lib/utils';

export const QUIZ_CATEGORIES: { id: string; label: string; hint: string; emoji: string }[] = [
  { id: 'vocab', label: 'So‘z boyligi', hint: 'So‘z ma’nolari', emoji: '📚' },
  { id: 'grammar', label: 'Grammatika', hint: 'Qoidalar va tuzilma', emoji: '🧩' },
  { id: 'mixed', label: 'Aralash', hint: 'Ikkalasi birga', emoji: '🌀' },
  { id: 'random', label: 'Tasodifiy', hint: 'Hammasi bo‘ladi', emoji: '🎲' },
];

export const QUIZ_DIFFICULTIES: { id: string; label: string; cefr: string }[] = [
  { id: 'beginner', label: 'Boshlang‘ich', cefr: 'Pre-A1 · A1' },
  { id: 'elementary', label: 'Elementar', cefr: 'A2' },
  { id: 'intermediate', label: 'O‘rta', cefr: 'B1' },
  { id: 'advanced', label: 'Yuqori', cefr: 'B2+' },
];

export const EXTENDED_COST = 50;
const CARD_UNLOCK_COST = 20;

type Tab = 'create' | 'mine' | 'history';

export function QuizFriends() {
  const s = useApp();
  const [tab, setTab] = useState<Tab>('create');
  const [online, setOnline] = useState<boolean | null>(null);
  const [meta, setMeta] = useState<QuizMeta | null>(null);

  useEffect(() => {
    let alive = true;
    quizAvailable().then((v) => alive && setOnline(v));
    fetchQuizMeta().then((m) => alive && setMeta(m)).catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div>
      <PageHeader emoji="🎯" title="Do‘st quizi" subtitle="Quiz tuz, do‘stlarga yubor, jadvalda bellash" />
      {!online && online !== null && (
        <div className="mb-4">
          <Notice tone="warn">
            Onlayn quiz serverga ulanmagan (Supabase + bot kerak). Sozlash: <b>supabase/schema.sql</b> qayta ishga tushirilsin va <b>/api/quiz</b> deploy qilinsin.
          </Notice>
        </div>
      )}
      <Tabs<Tab>
        tabs={[
          { id: 'create', label: 'Yaratish', icon: 'plus' },
          { id: 'mine', label: 'Mening quizlarim', icon: 'cards' },
          { id: 'history', label: 'Natijalarim', icon: 'trophy' },
        ]}
        value={tab}
        onChange={setTab}
      />
      <div className="mt-4">
        {tab === 'create' && <CreateTab meta={meta} online={online} coins={s.coins.balance} creatorName={s.profile?.name ?? 'O‘quvchi'} />}
        {tab === 'mine' && <MineTab online={online} goCreate={() => setTab('create')} />}
        {tab === 'history' && <HistoryTab online={online} />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

function CreateTab({ meta, online, coins, creatorName }: { meta: QuizMeta | null; online: boolean | null; coins: number; creatorName: string }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('mixed');
  const [difficulty, setDifficulty] = useState('elementary');
  const [size, setSize] = useState<5 | 10>(5);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async () => {
    if (busy || online === false) return;
    const cleanTitle = title.trim().replace(/\s+/g, ' ').slice(0, 60);
    if (!cleanTitle) {
      setError('Quizga nom bering — do‘stlaringiz shu nomni ko‘radi.');
      return;
    }
    setError(null);
    setBusy(true);
    let spendId: string | undefined;
    let spentLocal = false;
    try {
      if (size === 10) {
        spendId = `cs_${tgUser()?.id ?? 'x'}_${uid('qz')}`;
        if (!spendCoins(EXTENDED_COST)) {
          setBusy(false);
          return; // insufficient-coins toast already shown by the wallet
        }
        spentLocal = true;
      }
      const { quiz } = await createQuiz({
        title: cleanTitle,
        category,
        difficulty,
        size,
        spendId,
        creatorName: creatorName.trim().slice(0, 24) || 'O‘quvchi',
      });
      toast(size === 10 ? `🎉 «${quiz.title}» tayyor — endi do‘stlarga yuboring!` : '🎉 Quiz tayyor — endi do‘stlarga yuboring!', 'success');
      navigate(`/friendquiz/view/${quiz.id}`);
    } catch (e) {
      if (spentLocal) {
        // the server did not create the quiz — return the Coins (same wallet)
        const { refundCoins } = await import('../store/actions');
        refundCoins(EXTENDED_COST, '🪙 50 Coin qaytarildi — quiz yaratilmadi');
      }
      const m = e instanceof Error ? e.message : '';
      setError(
        m === 'daily_limit'
          ? 'Kunlik limit (15 ta quiz) tugagan — ertaga davom etamiz!'
          : m === 'unauthorized' || m === 'http_401'
            ? 'Telegram ichidan oching.'
            : 'Yaratib bo‘lmadi — internetni tekshirib, qayta urinib ko‘ring.',
      );
    } finally {
      setBusy(false);
    }
  }, [busy, online, title, category, difficulty, size, creatorName]);

  const enough = coins >= EXTENDED_COST;

  return (
    <div className="space-y-4">
      <Card>
        <label className="text-sm font-bold" htmlFor="fq-title">Quiz nomi</label>
        <input
          id="fq-title"
          value={title}
          maxLength={60}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Masalan: Top 5 — Present Simple"
          className="mt-2 w-full rounded-xl border border-line bg-surface2 px-3.5 py-2.5 text-[15px] font-medium outline-none transition focus:border-accent"
        />
        <div className="mt-1 text-right text-[11px] text-muted">{title.length}/60</div>
      </Card>

      <Card>
        <div className="text-sm font-bold">Mavzu</div>
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          {QUIZ_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              aria-pressed={category === c.id}
              className={cx(
                'flex items-center gap-2.5 rounded-2xl border-2 p-3 text-left transition',
                category === c.id ? 'border-accent bg-accent/10' : 'border-line bg-surface2/40 hover:border-accent/40',
              )}
            >
              <span className="text-xl">{c.emoji}</span>
              <span className="min-w-0">
                <span className="block text-sm font-bold">{c.label}</span>
                <span className="block truncate text-[11px] text-muted">{c.hint}</span>
              </span>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <div className="text-sm font-bold">Daraja</div>
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          {QUIZ_DIFFICULTIES.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDifficulty(d.id)}
              aria-pressed={difficulty === d.id}
              className={cx(
                'rounded-2xl border-2 p-3 text-left transition',
                difficulty === d.id ? 'border-accent bg-accent/10' : 'border-line bg-surface2/40 hover:border-accent/40',
              )}
            >
              <span className="block text-sm font-bold">{d.label}</span>
              <span className="block text-[11px] text-muted">{d.cefr}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <div className="text-sm font-bold">Savollar soni</div>
        <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setSize(5)}
            aria-pressed={size === 5}
            className={cx(
              'rounded-2xl border-2 p-4 text-left transition',
              size === 5 ? 'border-accent bg-accent/10' : 'border-line bg-surface2/40 hover:border-accent/40',
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-extrabold">5 savol</span>
              <Pill tone="green">Bepul</Pill>
            </div>
            <div className="mt-1 text-xs text-muted">Tez bellashuv uchun</div>
          </button>
          <button
            type="button"
            onClick={() => setSize(10)}
            aria-pressed={size === 10}
            className={cx(
              'rounded-2xl border-2 p-4 text-left transition',
              size === 10 ? 'border-accent bg-accent/10' : 'border-line bg-surface2/40 hover:border-accent/40',
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-extrabold">10 savol</span>
              <Pill tone="amber">🪙 {EXTENDED_COST} Coin</Pill>
            </div>
            <div className="mt-1 text-xs text-muted">
              {enough ? 'Katta bellashuv — balansingiz yetadi' : 'Katta bellashuv — Coin yetmaydi'}
            </div>
          </button>
        </div>
        {size === 10 && !enough && (
          <div className="mt-3">
            <Notice tone="warn">
              Balansda 🪙 {fmt(coins)} Coin bor, kerak 🪙 {EXTENDED_COST}. Vazifalar, o‘yinlar yoki Tanga do‘koni bilan to‘ldiring!
            </Notice>
          </div>
        )}
        {meta?.bank && (
          <div className="mt-3 text-[11px] text-muted">
            Savollar SmartLingo’ning tekshirilgan bankidan tanlanadi ({fmt(meta.bank.total)}+ savol) — har quizda takrorlanmaydi.
          </div>
        )}
      </Card>

      {error && <Notice tone="warn">{error}</Notice>}

      <Button size="lg" full icon="rocket" onClick={create} disabled={busy || online === false}>
        {busy ? 'Yaratilmoqda…' : size === 10 ? `Yaratish — 🪙 ${EXTENDED_COST} Coin` : 'Quiz yaratish (bepul)'}
      </Button>
      <p className="px-2 text-center text-[11px] text-muted">
        Yaratgandan keyin havolani Telegram’da do‘stlaringizga yuborasiz. Har bir do‘st bir marta javob beradi.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mine
// ---------------------------------------------------------------------------

interface MineData {
  created: QuizSummary[];
  attempts: { id: string; quizId: string; score: number; total: number; durationMs: number; createdAt: string; title: string; creator: string }[];
}

function MineTab({ online, goCreate }: { online: boolean | null; goCreate: () => void }) {
  const [data, setData] = useState<MineData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    fetchMyQuizzes().then(setData).catch((e) => setError(quizNotConfigured(e) ? 'not_configured' : 'net'));
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  if (error) return <Notice tone="warn">Ro‘yxatni olish qiyinlashdi — internetni tekshirib, sahifani yangilang.</Notice>;
  if (!data) return <LoadingRows />;
  if (data.created.length === 0) {
    return (
      <Empty
        emoji="🎯"
        title="Hali quiz yaratmagansiz"
        text="«Yaratish» bo‘limida birinchi quizngizni tuzing va do‘stlaringizga yuboring."
        action={<Button onClick={goCreate}>Yaratish</Button>}
      />
    );
  }
  return (
    <div className="space-y-2.5">
      {data.created.map((q) => (
        <A key={q.id} to={`/friendquiz/view/${q.id}`} className="block">
          <Card className="transition hover:border-accent/40">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent dark:bg-accent/20 dark:text-[#b3a4ff]">
                <Icon name="cards" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold">{q.title}</span>
                <span className="block text-xs text-muted">
                  {labelOf(QUIZ_CATEGORIES, q.category)} · {labelOf(QUIZ_DIFFICULTIES, q.difficulty)} · {q.size} savol · {dateShort(q.createdAt)}
                </span>
              </span>
              {q.status === 'closed' && <Pill>Yopiq</Pill>}
              <Icon name="right" className="h-4 w-4 text-muted" />
            </div>
          </Card>
        </A>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// History (my attempts)
// ---------------------------------------------------------------------------

function HistoryTab({ online }: { online: boolean | null }) {
  const [data, setData] = useState<MineData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchMyQuizzes().then((d) => alive && setData(d)).catch((e) => alive && setError(quizNotConfigured(e) ? 'not_configured' : 'net'));
    return () => {
      alive = false;
    };
  }, []);

  if (error) return <Notice tone="warn">Natijalarni olish qiyinlashdi — keyinroq urinib ko‘ring.</Notice>;
  if (!data) return <LoadingRows />;
  if (data.attempts.length === 0) {
    return <Empty emoji="🏆" title="Hali birorta quizda qatnashmagansiz" text="Do‘stlaringiz sizga quiz yuborsa, natijalaringiz shu yerda ko‘rinadi." />;
  }
  return (
    <div className="space-y-2.5">
      {data.attempts.map((a) => {
        const ratio = a.total ? a.score / a.total : 0;
        return (
          <Card key={a.id}>
            <div className="flex items-center gap-3">
              <span
                className={cx(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-extrabold',
                  ratio >= 0.8 ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300' : ratio >= 0.5 ? 'bg-gold/15 text-amber-600 dark:text-[#ffd27d]' : 'bg-rose-500/12 text-rose-600 dark:text-rose-300',
                )}
              >
                {a.score}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-bold">{a.title}</div>
                <div className="text-xs text-muted">
                  {a.creator} yuborgan · {a.score}/{a.total} to‘g‘ri · {dateShort(a.createdAt)}
                </div>
              </div>
              <A to={`/friendquiz/view/${a.quizId}`} className="shrink-0">
                <Button size="sm" variant="secondary">Jadval</Button>
              </A>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// shared bits
// ---------------------------------------------------------------------------

export function LoadingRows() {
  return (
    <div className="space-y-2.5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-20 animate-pulse rounded-2xl border border-line bg-surface2/50" />
      ))}
    </div>
  );
}

export function labelOf(list: { id: string; label: string }[], id: string): string {
  return list.find((x) => x.id === id)?.label ?? id;
}

export function dateShort(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

export const CARD_COST = CARD_UNLOCK_COST;
