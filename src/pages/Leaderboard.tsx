import { useCallback, useEffect, useState } from 'react';
import { useApp } from '../store/store';
import { rankInfo, ratingOf } from '../lib/gamification';
import { fetchLeaderboard, notConfigured, type LeaderRow, type Leaderboards } from '../lib/battleApi';
import { FRAMES, RANK_TIERS } from '../lib/shop';
import { Button, Card, Empty, Notice, PageHeader, Pill, Section, Tabs } from '../components/ui';
import { Icon } from '../components/Icon';
import { A, navigate } from '../lib/router';
import { cx, fmt } from '../lib/utils';

type BoardId = 'global' | 'week' | 'month';

/** Ring class for a leaderboard row's equipped frame (server already checked it is active). */
function ringFor(frame?: string): string {
  if (!frame) return 'frame-none';
  if (frame.startsWith('rf-')) return RANK_TIERS.find((t) => `rf-${t.id}` === frame)?.ring ?? 'frame-none';
  return FRAMES.find((f) => f.id === frame)?.cls ?? 'frame-none';
}

const MEDALS = ['🥇', '🥈', '🥉'];

function RowView({ r, i, meId, board }: { r: LeaderRow; i: number; meId: string; board: BoardId }) {
  const mine = r.id === meId;
  const rank = rankInfo(r.rating);
  const to = mine ? '/profile' : `/u/${r.id}`;
  return (
    <A
      to={to}
      aria-label={`${r.name} profili`}
      className={cx(
        'flex items-center gap-3 rounded-3xl border bg-surface !p-3.5 shadow-sm shadow-sky-900/5 transition hover:border-sky-300 active:scale-[0.99]',
        mine ? 'border-sky-400 bg-sky-50 dark:bg-sky-500/10' : 'border-line',
      )}
    >
      <span className={cx('w-8 shrink-0 text-center text-lg font-extrabold', i >= 3 && 'text-sm text-muted')}>{i < 3 ? MEDALS[i] : i + 1}</span>
      <div className="flex shrink-0 items-center justify-center rounded-full bg-surface2 p-1">
        <span className={cx('flex h-9 w-9 items-center justify-center rounded-full text-xl', ringFor(r.frame))}>{r.avatar ?? '🙂'}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">
          {r.name} {mine && <span className="text-xs font-semibold text-sky-600 dark:text-sky-300">(siz)</span>}
        </p>
        <p className={cx('text-xs font-semibold', board === 'global' ? rank.tier.text : 'text-muted')}>
          {board === 'global' ? (
            <>
              {rank.tier.name}
              {r.wins + r.losses > 0 && <span className="font-normal text-muted"> · ⚔️ {r.wins}W/{r.losses}L</span>}
            </>
          ) : board === 'week' ? (
            <>7 kun: {fmt(r.xpWeek)} XP · umumiy {fmt(r.xp)}</>
          ) : (
            <>30 kun: {fmt(r.xpMonth)} XP · umumiy {fmt(r.xp)}</>
          )}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-base font-extrabold leading-none">{board === 'global' ? fmt(r.rating) : board === 'week' ? fmt(r.xpWeek) : fmt(r.xpMonth)}</p>
        {board === 'global' && r.delta !== 0 && (
          <p className={cx('mt-0.5 text-[11px] font-bold', r.delta > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500')}>
            {r.delta > 0 ? `+${r.delta}` : r.delta} jang
          </p>
        )}
        {board !== 'global' && <p className="mt-0.5 text-[11px] font-semibold text-muted">XP</p>}
      </div>
      <Icon name="right" className="h-4 w-4 shrink-0 text-muted" />
    </A>
  );
}

export function Leaderboard() {
  const s = useApp();
  const myRating = ratingOf(s);
  const myRank = rankInfo(myRating);
  const myName = (s.profile?.name ?? 'O‘quvchi').trim().split(/\s+/)[0] || 'O‘quvchi';
  const myAvatar = s.shop.equipped.avatar ?? '🙂';

  const [state, setState] = useState<'loading' | 'ok' | 'off' | 'error'>('loading');
  const [data, setData] = useState<Leaderboards | null>(null);
  const [meId, setMeId] = useState('');
  const [tab, setTab] = useState<BoardId>('global');
  const [tick, setTick] = useState(0);

  const load = useCallback(async () => {
    setState('loading');
    try {
      const j = await fetchLeaderboard();
      setData(j);
      setMeId(j.me ?? '');
      setState('ok');
    } catch (e) {
      setState(notConfigured(e) ? 'off' : 'error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, tick]);

  const rows: LeaderRow[] = tab === 'global' ? data?.list ?? [] : tab === 'week' ? data?.weekly ?? [] : data?.monthly ?? [];
  const myIndex = rows.findIndex((r) => r.id === meId);
  const inList = myIndex >= 0;
  const heroValue = tab === 'global' ? fmt(myRating) : tab === 'week' ? fmt(data?.weekly.find((r) => r.id === meId)?.xpWeek ?? 0) : fmt(data?.monthly.find((r) => r.id === meId)?.xpMonth ?? 0);
  const heroHint = tab === 'global' ? (inList && state === 'ok' ? `#${myIndex + 1} o‘rin` : 'reyting') : tab === 'week' ? (inList && state === 'ok' ? `#${myIndex + 1} o‘rin` : "7 kunlik XP") : inList && state === 'ok' ? `#${myIndex + 1} o‘rin` : '30 kunlik XP';

  return (
    <div>
      <PageHeader
        emoji="🏆"
        title="Reyting jadvali"
        subtitle="Jang reytingi va haftalik / oylik XP musobaqalari"
        right={
          <Button size="sm" variant="secondary" icon="refresh" onClick={() => setTick((t) => t + 1)} disabled={state === 'loading'}>
            Yangilash
          </Button>
        }
      />

      {/* My card (always visible, even offline) */}
      <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-violet-600 to-sky-600 p-4 text-white shadow-lg shadow-violet-500/25">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/15 p-1">
            <span className="text-3xl">{myAvatar}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-extrabold">{myName}</p>
            <p className="text-xs text-violet-100">
              <span className="rounded-full bg-white/20 px-2 py-0.5 font-bold">{myRank.tier.name}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-extrabold leading-none">{heroValue}</p>
            <p className="mt-0.5 text-[11px] text-violet-100">{heroHint}</p>
          </div>
        </div>
      </div>

      {state === 'loading' && (
        <div className="mt-3 space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-surface2" />
          ))}
        </div>
      )}

      {state === 'off' && (
        <div className="mt-3">
          <Notice tone="warn">
            Reyting jadvali onlayn rejada ishlaydi: serverda <b>/api/leaderboard</b> + Supabase sozlanishi kerak. Hozir faqat o‘z natijangiz ko‘rinmoqda.
          </Notice>
        </div>
      )}

      {state === 'error' && (
        <div className="mt-3">
          <Notice tone="warn">Jadvalni yuklab bo‘lmadi. Internetni tekshirib, “Yangilash”ni bosing.</Notice>
        </div>
      )}

      {state === 'ok' && (
        <>
          <div className="mt-3">
            <Tabs<BoardId>
              value={tab}
              onChange={setTab}
              tabs={[
                { id: 'global', label: 'Reyting', icon: 'swords' },
                { id: 'week', label: 'Haftalik XP', icon: 'flame' },
                { id: 'month', label: 'Oylik XP', icon: 'chart' },
              ]}
            />
          </div>

          {!inList && (
            <div className="mt-3">
              <Notice>
                <>{tab === 'global' ? <>Siz hali onlayn ro‘yxatda emassiz — <b>Sozlamalar → Onlayn saqlash</b> yoqilgan bo‘lsa, profilingiz jadvalga tushadi (1000 reytingdan boshlanadi).</> : <>Bu jadvalda chiqish uchun oxirgi {tab === 'week' ? '7' : '30'} kunda kamida 1 XP yig‘ing (onlayn saqlash yoqilgan bo‘lishi kerak).</>}</>
              </Notice>
            </div>
          )}

          <Section title={tab === 'global' ? `Top ${rows.length} o‘quvchi (jang reytingi)` : tab === 'week' ? 'Haftalik XP poygasi' : 'Oylik XP poygasi'}>
            {rows.length === 0 ? (
              <Empty emoji="🏆" title="Jadval hali bo‘sh" text="Birinchi bo‘lib jadvalga chiqing — mashq qilsangiz ismingiz shu yerda paydo bo‘ladi!" />
            ) : (
              <div className="space-y-2">
                {rows.map((r, i) => (
                  <RowView key={`${tab}:${r.id}`} r={r} i={i} meId={meId} board={tab} />
                ))}
              </div>
            )}
          </Section>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Pill tone="indigo">📈 Reyting faqat janglardan</Pill>
            <Pill tone="amber">🔥 Haftalik/Oylik — XP bilan</Pill>
            <A to="/battle">
              <Pill tone="neutral" className="cursor-pointer">⚔️ Jang qilib oshiring →</Pill>
            </A>
          </div>

          <div className="mt-3">
            <Card className="flex items-center gap-3 !p-3.5" onClick={() => navigate('/leaderboard')}>
              <Icon name="user" className="h-5 w-5 shrink-0 text-sky-600 dark:text-sky-300" />
              <p className="min-w-0 flex-1 text-sm text-muted">O‘quvchining ismi yoki avatari bosilsa — uning ochiq profili ochiladi.</p>
            </Card>
          </div>
        </>
      )}

      <div className="mt-4 flex items-center gap-2 text-xs text-muted">
        <Icon name="info" className="h-4 w-4 shrink-0" />
        <p>Faqat ismning birinchi so‘zi ko‘rsatiladi. Jang reytingi = 1000 + janglar natijasi; haftalik va oylik jadvallar XP bo‘yicha. Har bir qatorni bosib o‘quvchining ochiq profilini ko‘rishingiz mumkin.</p>
      </div>
    </div>
  );
}
