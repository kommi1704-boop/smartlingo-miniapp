// Home-screen extras (Phases 2 & 5): "Today's Discovery" + Championship preview.
//
// Discovery: one personalized item per day (server-cached in the discovery
// table), interactive completion, +10 XP through the verified ledger once.
// Championship preview: verified weekly XP + time left + prize teaser; the
// full standings live on /championship.
import { useEffect, useState } from 'react';
import { A } from '../lib/router';
import {
  cachedServerStats, refreshServerStats, subscribeServerStats, xpApi, XpUnavailable,
  type DiscoveryItemDto, type ServerStats,
} from '../lib/xpApi';
import { useApp } from '../store/store';
import { grantChampionFrame, record } from '../store/actions';
import { showXp } from '../store/ui';
import { haptic } from '../lib/telegram';
import { Button } from './ui';
import { Icon } from './Icon';
import { cx } from '../lib/utils';

export function DiscoveryCard() {
  const s = useApp();
  const [item, setItem] = useState<DiscoveryItemDto | null>(null);
  const [day, setDay] = useState('');
  const [done, setDone] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    xpApi
      .discoveryGet(s.profile?.estimatedLevel ?? 'A2', s.profile?.interests ?? [])
      .then((r) => {
        if (!live) return;
        setItem(r.item);
        setDay(r.day);
        setDone(r.completed);
      })
      .catch(() => {
        if (live) setFailed(true);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function complete() {
    haptic('success');
    setDone(true);
    try {
      const r = await xpApi.discoveryDone(day);
      if (r.granted > 0) {
        record({ xp: r.granted });
        showXp(r.granted);
      }
    } catch {
      /* UI stays completed; the ledger will not double-pay on retry */
    }
  }

  if (loading) return null; // appears quietly once ready
  if (failed || !item) return null; // offline: the rest of the home screen is unaffected

  const qz = item.quiz;
  const correctPicked = checked && qz ? picked === qz.answer : null;

  return (
    <div className="rise-in mx-3 mt-4 overflow-hidden rounded-[26px] bg-gradient-to-br from-[#5b5bd6] via-[#4f6ef0] to-[#38bdf8] p-4 text-white shadow-lg shadow-indigo-500/20">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide">
          {item.emoji} {item.label}
        </span>
        {done ? (
          <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-[11px] font-extrabold">✓ Bajarildi</span>
        ) : (
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-extrabold">Bugungi kashfiyot</span>
        )}
      </div>
      <h3 className="mt-2.5 text-lg font-black leading-snug">{item.title}</h3>
      <p className="mt-1 text-[13px] font-medium leading-relaxed text-white/90">{item.text}</p>

      {qz && (
        <div className="mt-3 space-y-2" role="radiogroup" aria-label="Mini test">
          {qz.options.map((o, i) => {
            const isPicked = picked === i;
            const reveal = checked && (i === qz.answer || isPicked);
            return (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={isPicked}
                disabled={done || checked}
                onClick={() => {
                  setPicked(i);
                  haptic('light');
                  setChecked(true);
                }}
                className={cx(
                  'block w-full rounded-2xl border-2 px-3.5 py-2.5 text-left text-[13px] font-bold transition',
                  reveal
                    ? i === qz.answer
                      ? 'border-emerald-200 bg-emerald-400/25'
                      : 'border-rose-200 bg-rose-400/25'
                    : isPicked
                      ? 'border-white/80 bg-white/25'
                      : 'border-white/25 bg-white/10 hover:border-white/50',
                )}
              >
                {o}
              </button>
            );
          })}
          {checked && (
            <p className="pt-1 text-[12px] font-bold text-white/90">
              {correctPicked ? '✅ To‘g‘ri! ' : '❌ To‘g‘ri javob belgilangan. '}
              {qz.explain ?? ''}
            </p>
          )}
        </div>
      )}

      {!done && (
        <Button className="mt-3.5 !bg-white !text-[#4f46e5] shadow-none" size="md" disabled={!!qz && !checked} onClick={() => void complete()}>
          ✓ Bajarildi — +10 XP
        </Button>
      )}
    </div>
  );
}

export function ChampionshipCard() {
  const [stats, setStats] = useState<ServerStats | null>(cachedServerStats());
  useEffect(() => {
    void refreshServerStats();
    const unsub = subscribeServerStats(() => {
      const st = cachedServerStats();
      setStats(st);
      // the champion frame is earned (place 1) — never purchasable
      if (st?.isChampion) grantChampionFrame();
    });
    return () => {
      unsub();
    };
  }, []);

  const xpWeek = stats?.summary.xpWeek ?? null;
  const daysLeft = stats?.week.daysLeft;

  return (
    <A
      to="/championship"
      className="rise-in mt-4 flex items-center gap-3 rounded-[26px] bg-gradient-to-br from-[#4338ca] via-[#6d28d9] to-[#a21caf] p-4 text-white shadow-lg shadow-purple-500/20 transition active:scale-[0.99]"
      data-testid="home-championship"
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15 text-2xl">🏆</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-extrabold uppercase tracking-wider text-white/75">Haftalik chempionat</span>
        <span className="block text-base font-black leading-snug">
          {xpWeek === null ? 'Reytingga qo‘shiling' : `Bu hafta: ${xpWeek} XP`}
          {daysLeft ? <span className="ml-1 font-bold text-white/80">· {daysLeft} kun qoldi</span> : null}
        </span>
        <span className="block text-xs font-semibold text-white/85">🥇 500 🪙 + Chempion ramkasi · 🥈 250 🪙 · 🥉 100 🪙</span>
      </span>
      <Icon name="right" className="h-5 w-5 shrink-0" />
    </A>
  );
}
