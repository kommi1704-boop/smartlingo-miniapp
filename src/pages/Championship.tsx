// Weekly Championship (Phase 5) — verified-XP standings for the Tashkent
// Monday week, top-3 prize preview, previous champions, time remaining.
// All numbers come from the server ledger (/api/xp?k=championship) — the
// client cannot inflate this ranking.
import { useEffect, useState } from 'react';
import { navigate } from '../lib/router';
import { PageHeader, Card, Pill, Empty, Notice } from '../components/ui';
import { Icon } from '../components/Icon';
import { Avatar } from '../components/Avatar';
import { xpApi, refreshServerStats, type ServerStats } from '../lib/xpApi';
import { cx } from '../lib/utils';

interface ChampionshipData {
  week: { start: string; end: string; daysLeft: number };
  standings: { rank: number; uid: number; xp: number; name: string; me: boolean }[];
  me: { uid: number; xp: number; rank: number | null; provisional: boolean };
  champions: { week: string; winners: { rank: number; uid: number; xp: number; name: string }[] }[];
  isChampion: boolean;
}

const MEDAL = (rank: number): string => (rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '');
const RARITY_STYLE: Record<number, string> = {
  1: 'from-amber-400/90 to-yellow-500/90 border-amber-300',
  2: 'from-slate-300/80 to-slate-400/80 border-slate-300',
  3: 'from-orange-400/80 to-amber-600/80 border-orange-300',
};

export function Championship() {
  const [data, setData] = useState<ChampionshipData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    xpApi
      .championship()
      .then((d) => {
        if (!live) return;
        setData(d as ChampionshipData);
        void refreshServerStats();
      })
      .catch(() => {
        if (live) setFailed(true);
      });
    return () => {
      live = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-3 pb-24 pt-4">
      <PageHeader title="Haftalik chempionat" subtitle="Haftalik XP reytingi — dushanba 00:00 da yangi hafta boshlanadi" back={true} />

      {failed && (
        <Notice tone="warn">Serverga ulanolmadik — reyting vaqtincha ko‘rinmaydi. Internetni tekshirib sahifani yangilang.</Notice>
      )}

      {!data && !failed && (
        <Card className="text-center">
          <div className="text-5xl">⏳</div>
          <p className="mt-2 font-bold">Reyting yuklanmoqda…</p>
        </Card>
      )}

      {data && (
        <>
          {/* my card */}
          <div className="rise-in overflow-hidden rounded-[26px] bg-gradient-to-br from-[#4338ca] via-[#6d28d9] to-[#a21caf] p-4 text-white shadow-lg shadow-purple-500/20">
            <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wide text-white/80">
              <span>
                {data.week.start.slice(5)} — {data.week.end.slice(5)}
              </span>
              <span>{data.week.daysLeft} kun qoldi</span>
            </div>
            <div className="mt-2 flex items-end gap-3">
              <span className="text-4xl font-black leading-none">
                {data.me.rank ?? '—'}
                {data.me.rank ? <span className="text-lg">-o‘rin</span> : null}
              </span>
              <span className="pb-1 text-sm font-bold text-white/90">⭐ {data.me.xp} XP (bu hafta)</span>
            </div>
            {data.isChampion && <span className="mt-2 inline-block rounded-full bg-white/25 px-3 py-1 text-xs font-extrabold">🏆 Siz — Chempion! Maxsus ramka taqildi</span>}
            {!data.isChampion && data.me.provisional && <p className="mt-2 text-xs font-bold text-white/85">Siz reytingdasiz — XP to‘plashda davom eting!</p>}
          </div>

          {/* prizes */}
          <Card className="rise-in mt-4 p-4">
            <p className="text-sm font-black">Mukofotlar (har hafta)</p>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              {[
                { place: 1, coins: 500, xp: 100, extra: '🏆 Chempion ramkasi' },
                { place: 2, coins: 250, xp: 50, extra: '' },
                { place: 3, coins: 100, xp: 25, extra: '' },
              ].map((p) => (
                <div key={p.place} className={cx('rounded-2xl border-2 bg-gradient-to-b p-2.5', RARITY_STYLE[p.place])}>
                  <p className="text-lg">{MEDAL(p.place)}</p>
                  <p className="text-xs font-black">+{p.coins} 🪙</p>
                  <p className="text-[11px] font-bold opacity-80">+{p.xp} ⭐</p>
                  {p.extra && <p className="mt-0.5 text-[10px] font-extrabold leading-tight">{p.extra}</p>}
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] font-semibold text-muted">Faqat tasdiqlangan (server XP) hisoblanadi · teng natijada raqam tartibi</p>
          </Card>

          {/* standings */}
          <p className="mb-2 mt-5 px-1 text-sm font-black">📋 Shu haftaning reytingi</p>
          {data.standings.length === 0 ? (
            <Empty emoji="🏁" title="Reyting hali bo‘sh" text="Birinchi mashqni bajarib, reytingga chiqing!" />
          ) : (
            <ul className="space-y-2">
              {data.standings.map((row) => (
                <li
                  key={row.uid}
                  className={cx(
                    'flex items-center gap-3 rounded-2xl border-2 bg-surface px-3.5 py-2.5',
                    row.me ? 'border-purple-400 dark:border-purple-500' : 'border-line',
                  )}
                >
                  <span className="w-8 shrink-0 text-center text-sm font-black text-muted">{MEDAL(row.rank) || row.rank}</span>
                  <Avatar emoji="🙂" size={30} />
                  <span className="min-w-0 flex-1 truncate text-[15px] font-bold">
                    {row.name}
                    {row.me && <Pill tone="violet">Siz</Pill>}
                  </span>
                  <span className="shrink-0 text-sm font-black text-[#5a3d00] dark:text-white">⭐ {row.xp}</span>
                </li>
              ))}
            </ul>
          )}

          {/* previous champions */}
          {data.champions.length > 0 && (
            <>
              <p className="mb-2 mt-5 px-1 text-sm font-black">👑 Oldingi chempionlar</p>
              <ul className="space-y-2">
                {data.champions.map((w) => (
                  <li key={w.week} className="rounded-2xl border border-line bg-surface px-3.5 py-2.5">
                    <p className="text-[11px] font-extrabold text-muted">{w.week.slice(5)} hafta</p>
                    <p className="mt-0.5 text-[13px] font-bold">
                      {w.winners.map((x) => `${MEDAL(x.rank) || x.rank} ${x.name}`).join(' · ')}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}

          <p className="mt-5 px-1 text-center text-[11px] font-semibold text-muted">
            Reyting faqat tekshirilgan XP (so‘z testi, darslar, juftlash, janglar, kashfiyot) bilan hisoblanadi.
          </p>
          <button type="button" className="mx-auto mt-3 block text-sm font-bold text-purple-600 underline dark:text-purple-300" onClick={() => navigate('/shop')}>
            🎁 Mukofot do‘koniga o‘tish
          </button>
        </>
      )}
    </div>
  );
}

