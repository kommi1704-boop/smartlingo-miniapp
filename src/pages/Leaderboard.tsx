import { useCallback, useEffect, useState } from 'react';
import { useApp } from '../store/store';
import { rankInfo, ratingOf } from '../lib/gamification';
import { fetchLeaderboard, notConfigured, type LeaderRow } from '../lib/battleApi';
import { FRAMES, RANK_TIERS } from '../lib/shop';
import { Button, Card, Empty, Notice, PageHeader, Pill, Section } from '../components/ui';
import { Icon } from '../components/Icon';
import { A } from '../lib/router';
import { cx, fmt } from '../lib/utils';

/** Ring class for a leaderboard row's equipped frame (server already checked it is active). */
function ringFor(frame?: string): string {
  if (!frame) return 'frame-none';
  if (frame.startsWith('rf-')) return RANK_TIERS.find((t) => `rf-${t.id}` === frame)?.ring ?? 'frame-none';
  return FRAMES.find((f) => f.id === frame)?.cls ?? 'frame-none';
}

const MEDALS = ['🥇', '🥈', '🥉'];

export function Leaderboard() {
  const s = useApp();
  const myRating = ratingOf(s);
  const myRank = rankInfo(myRating);
  const myName = (s.profile?.name ?? 'O‘quvchi').trim().split(/\s+/)[0] || 'O‘quvchi';
  const myAvatar = s.shop.equipped.avatar ?? '🙂';

  const [state, setState] = useState<'loading' | 'ok' | 'off' | 'error'>('loading');
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [meId, setMeId] = useState('');
  const [tick, setTick] = useState(0);

  const load = useCallback(async () => {
    setState('loading');
    try {
      const j = await fetchLeaderboard();
      setRows(j.list ?? []);
      setMeId(j.me ?? '');
      setState('ok');
    } catch (e) {
      setState(notConfigured(e) ? 'off' : 'error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, tick]);

  const myIndex = rows.findIndex((r) => r.id === meId);
  const inList = myIndex >= 0;

  return (
    <div>
      <PageHeader
        emoji="🏆"
        title="Reyting jadvali"
        subtitle="Eng kuchli o‘quvchilar — reyting bo‘yicha top"
        right={
          <Button size="sm" variant="secondary" icon="refresh" onClick={() => setTick((t) => t + 1)} disabled={state === 'loading'}>
            Yangilash
          </Button>
        }
      />

      {/* My card (always visible, even offline) */}
      <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-violet-600 to-indigo-600 p-4 text-white shadow-lg shadow-violet-500/25">
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
            <p className="text-xl font-extrabold leading-none">{fmt(myRating)}</p>
            <p className="mt-0.5 text-[11px] text-violet-100">{inList && state === 'ok' ? `#${myIndex + 1} o‘rin` : 'reyting'}</p>
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
          {!inList && (
            <div className="mt-3">
              <Notice>
                Siz hali onlayn ro‘yxatdasiz emas — <b>Sozlamalar → Onlayn saqlash</b> yoqilgan bo‘lsa, natijangiz jadvalga tushadi.
              </Notice>
            </div>
          )}
          <Section title={`Top ${Math.min(rows.length, 100)} o‘quvchi`}>
            {rows.length === 0 ? (
              <Empty emoji="🏆" title="Jadval hali bo‘sh" text="Birinchi bo‘lib reyting jadvaliga kirishingiz mumkin — darslarni bajarib reyting to‘plang!" />
            ) : (
              <div className="space-y-2">
                {rows.map((r, i) => {
                  const rank = rankInfo(r.rating);
                  const mine = r.id === meId;
                  return (
                    <Card
                      key={r.id}
                      className={cx('flex items-center gap-3 !p-3.5', mine && 'border-indigo-400 bg-indigo-50 dark:bg-indigo-500/10')}
                    >
                      <span className={cx('w-8 shrink-0 text-center text-lg font-extrabold', i >= 3 && 'text-sm text-muted')}>
                        {i < 3 ? MEDALS[i] : i + 1}
                      </span>
                      <div className="flex shrink-0 items-center justify-center rounded-full bg-surface2 p-1">
                        <span className={cx('flex h-9 w-9 items-center justify-center rounded-full text-xl', ringFor(r.frame))}>{r.avatar ?? '🙂'}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">
                          {r.name} {mine && <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-300">(siz)</span>}
                        </p>
                        <p className={cx('text-xs font-semibold', rank.tier.text)}>
                          {rank.tier.name}
                          {r.wins + r.losses > 0 && <span className="font-normal text-muted"> · ⚔️ {r.wins}W/{r.losses}L</span>}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-base font-extrabold leading-none">{fmt(r.rating)}</p>
                        {r.delta !== 0 && (
                          <p className={cx('mt-0.5 text-[11px] font-bold', r.delta > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500')}>
                            {r.delta > 0 ? `+${r.delta}` : r.delta} jang
                          </p>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </Section>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Pill tone="indigo">📈 Reyting = o‘rganish + janglar</Pill>
            <A to="/battle">
              <Pill tone="amber" className="cursor-pointer">⚔️ Jang qilib oshiring →</Pill>
            </A>
          </div>
        </>
      )}

      <div className="mt-4 flex items-center gap-2 text-xs text-muted">
        <Icon name="info" className="h-4 w-4 shrink-0" />
        <p>Faqat ismning birinchi so‘zi ko‘rsatiladi. Reyting = 1000 + XP÷3 + yulduzlar + nishonlar + janglar natijasi.</p>
      </div>
    </div>
  );
}
