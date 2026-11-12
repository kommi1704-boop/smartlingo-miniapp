import { useCallback, useEffect, useState } from 'react';
import type { NotifyKind } from '../types.notify';
import { NOTIFY_KINDS } from '../types.notify';
import {
  fetchNotifySettings, notifNotConfigured, pauseNotifications, resetNotifications, saveNotifyPrefs,
  type NotifySettings,
} from '../lib/notifyApi';
import { Button, Card, Empty, Modal, Notice, PageHeader, Section, Tabs } from '../components/ui';
import { Icon, type IconName } from '../components/Icon';
import { toast } from '../store/ui';
import { cx } from '../lib/utils';

// The 7 categories — icons map onto the app's existing icon set.
const KIND_UI: Record<NotifyKind, { icon: IconName; desc: string }> = {
  streak: { icon: 'flame', desc: 'Kunlik seriyangiz xavf ostida bo‘lsa eslatamiz (soat 18:00)' },
  news: { icon: 'globe', desc: 'Yangi imkoniyatlar va e’lonlar (faqat admin yuborsa)' },
  motivation: { icon: 'sun', desc: 'Kayfiyat beruvchi qisqa xabarlar' },
  achievements: { icon: 'trophy', desc: 'Mukofotlar, sovg‘alar va yutuqlar' },
  quiz: { icon: 'cards', desc: 'Do‘st quizi takliflari va natijalari' },
  battle: { icon: 'swords', desc: 'Do‘stona jang takliflari va natijalari' },
  weekly: { icon: 'calendar', desc: 'Haftalik challenge (dushanba kunlari)' },
};

const QUIET_HOURS = [20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8];
const HOUR_LABEL = (h: number): string => `${String(h).padStart(2, '0')}:00`;

export function Notify() {
  const [data, setData] = useState<NotifySettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'prefs' | 'history'>('prefs');
  const [confirmReset, setConfirmReset] = useState(false);

  const load = useCallback(() => {
    fetchNotifySettings()
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((e) => setError(notifNotConfigured(e) ? 'not_configured' : 'net'));
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  if (error === 'not_configured') {
    return (
      <div>
        <PageHeader emoji="🔔" title="Bildirishnomalar" back="/settings" />
        <Notice tone="warn">
          Sozlamalar serveri ulanmagan. <b>supabase/schema.sql</b> qayta ishga tushirilsin va <b>/api/notifications</b> deploy qilinsin.
        </Notice>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div>
        <PageHeader emoji="🔔" title="Bildirishnomalar" back="/settings" />
        <Empty emoji="📡" title="Yuklanmadi" text="Internetni tekshirib, qayta urinib ko‘ring." action={<Button onClick={load}>Qayta urinish</Button>} />
      </div>
    );
  }

  const paused = data.pausedUntil && new Date(data.pausedUntil).getTime() > Date.now();

  return (
    <div>
      <PageHeader emoji="🔔" title="Bildirishnomalar" subtitle="Nima, qachon va qanday xabarlar kelishini o‘zingiz tanlang" back="/settings" />

      {paused && (
        <div className="mb-4">
          <Notice>
            ⏸️ Bildirishnomalar vaqtincha to‘xtatilgan — <b>{new Date(data.pausedUntil!).toLocaleString('uz-UZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</b> gacha.
          </Notice>
        </div>
      )}

      <Tabs
        tabs={[
          { id: 'prefs' as const, label: 'Sozlamalar', icon: 'settings' },
          { id: 'history' as const, label: 'Tarix', icon: 'clock' },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'prefs' ? (
        <PrefsView data={data} onChanged={setData} onAskReset={() => setConfirmReset(true)} />
      ) : (
        <HistoryView data={data} />
      )}

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Hammasini tiklash">
        <p className="text-sm text-muted">Barcha turdagi xabarlar yoqiladi, tinch soatlari va pauza o‘chiriladi. Davom etamizmi?</p>
        <div className="mt-4 flex gap-2">
          <Button
            full
            onClick={async () => {
              setConfirmReset(false);
              try {
                setData(await resetNotifications());
                toast('Standart sozlamalar tiklandi ✓', 'success');
              } catch {
                toast('Tiklab bo‘lmadi — qayta urinib ko‘ring', 'warn');
              }
            }}
          >
            Ha, tiklash
          </Button>
          <Button full variant="secondary" onClick={() => setConfirmReset(false)}>
            Bekor
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function PrefsView({ data, onChanged, onAskReset }: { data: NotifySettings; onChanged: (d: NotifySettings) => void; onAskReset: () => void }) {
  const [busyKind, setBusyKind] = useState<string | null>(null);

  const toggleKind = async (kind: NotifyKind) => {
    if (busyKind) return;
    setBusyKind(kind);
    const nextCategories = { ...data.categories, [kind]: data.categories[kind] === false };
    try {
      onChanged(await saveNotifyPrefs({ categories: nextCategories }));
      // positive, no-guilt microcopy on opt-out
      if (nextCategories[kind] === false) toast('Ok — bu turdagi xabarlar boshqa yuborilmaydi. Istasangiz yana yoqasiz 🙂', 'info');
    } catch {
      toast('Saqlab bo‘lmadi — qayta urinib ko‘ring', 'warn');
    } finally {
      setBusyKind(null);
    }
  };

  const setQuiet = async (enabled: boolean, start?: number, end?: number) => {
    const qs = start ?? data.quietStart ?? 22;
    const qe = end ?? data.quietEnd ?? 8;
    try {
      onChanged(await saveNotifyPrefs({ quietEnabled: enabled, quietStart: qs, quietEnd: qe }));
      if (enabled) toast(`Tinch soatlari: ${HOUR_LABEL(qs)} – ${HOUR_LABEL(qe)} oralig‘ida xabar kelmaydi 🌙`, 'success');
    } catch {
      toast('Saqlab bo‘lmadi — qayta urinib ko‘ring', 'warn');
    }
  };

  const pause = async (hours: number) => {
    try {
      onChanged(await pauseNotifications(hours));
      toast(hours === 0 ? 'Pauza bekor qilindi ✓' : `${hours === 2 ? '2 soat' : hours === 24 ? '24 soat' : '7 kun'}ga pauza qo‘yildi 🤫`, 'success');
    } catch {
      toast('Saqlab bo‘lmadi — qayta urinib ko‘ring', 'warn');
    }
  };

  const paused = data.pausedUntil && new Date(data.pausedUntil).getTime() > Date.now();

  return (
    <div className="space-y-5">
      {/* pause */}
      <Section title="Vaqtincha to‘xtatish">
        <Card>
          <div className="grid grid-cols-4 gap-2">
            {[
              { h: 0, label: 'Yoqish' },
              { h: 2, label: '2 soat' },
              { h: 24, label: '1 kun' },
              { h: 168, label: '7 kun' },
            ].map((o) => (
              <button
                key={o.h}
                type="button"
                onClick={() => pause(o.h)}
                className={cx(
                  'rounded-xl border px-2 py-2 text-xs font-bold transition',
                  (o.h === 0 && !paused) || (o.h !== 0 && paused) ? 'border-accent bg-accent/10 text-accent' : 'border-line bg-surface2/40 hover:border-accent/40',
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-muted">Pauza paytida hech qanday xabar kelmaydi — o‘rganish jarayoningiz buzilmaydi.</p>
        </Card>
      </Section>

      {/* categories */}
      <Section title="Xabar turlari">
        <div className="space-y-2">
          {NOTIFY_KINDS.map((k) => {
            const enabled = data.categories[k] !== false;
            const ui = KIND_UI[k];
            return (
              <button
                key={k}
                type="button"
                onClick={() => toggleKind(k)}
                disabled={busyKind === k}
                aria-pressed={enabled}
                className={cx(
                  'flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition',
                  enabled ? 'border-line bg-surface hover:border-accent/40' : 'border-line bg-surface2/40 opacity-75',
                )}
              >
                <span className={cx('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', enabled ? 'bg-accent/12 text-accent dark:bg-accent/20 dark:text-[#7ee2a8]' : 'bg-surface2 text-muted')}>
                  <Icon name={ui.icon} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold">{data.kinds.find((x) => x.id === k)?.label ?? k}</span>
                  <span className="block text-xs text-muted">{ui.desc}</span>
                </span>
                {/* switch */}
                <span className={cx('relative h-6 w-11 shrink-0 rounded-full transition', enabled ? 'bg-accent' : 'bg-surface2 border border-line')}>
                  <span className={cx('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', enabled ? 'left-[22px]' : 'left-0.5')} />
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* quiet hours */}
      <Section title="Tinch soatlari">
        <Card>
          <button type="button" onClick={() => setQuiet(!data.quietEnabled)} aria-pressed={data.quietEnabled} className="flex w-full items-center gap-3 text-left">
            <span className={cx('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', data.quietEnabled ? 'bg-violet-500/15 text-violet-600 dark:text-violet-300' : 'bg-surface2 text-muted')}>
              <Icon name="moon" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold">Tunda xabar yuborilmasin</span>
              <span className="block text-xs text-muted">Uyqu vaqtida hech kim bezovta qilmaydi</span>
            </span>
            <span className={cx('relative h-6 w-11 shrink-0 rounded-full transition', data.quietEnabled ? 'bg-accent' : 'bg-surface2 border border-line')}>
              <span className={cx('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', data.quietEnabled ? 'left-[22px]' : 'left-0.5')} />
            </span>
          </button>
          {data.quietEnabled && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-muted">Boshlanishi</span>
                <select
                  value={data.quietStart ?? 22}
                  onChange={(e) => setQuiet(true, Number(e.target.value), data.quietEnd ?? 8)}
                  className="w-full rounded-xl border border-line bg-surface2 px-3 py-2 text-sm font-semibold outline-none focus:border-accent"
                >
                  {QUIET_HOURS.map((h) => (
                    <option key={h} value={h}>{HOUR_LABEL(h)}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-muted">Tugashi</span>
                <select
                  value={data.quietEnd ?? 8}
                  onChange={(e) => setQuiet(true, data.quietStart ?? 22, Number(e.target.value))}
                  className="w-full rounded-xl border border-line bg-surface2 px-3 py-2 text-sm font-semibold outline-none focus:border-accent"
                >
                  {QUIET_HOURS.map((h) => (
                    <option key={h} value={h}>{HOUR_LABEL(h)}</option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </Card>
      </Section>

      <div className="flex justify-center pb-2">
        <Button variant="ghost" size="sm" icon="refresh" onClick={onAskReset}>
          Standart sozlamalarni tiklash
        </Button>
      </div>
    </div>
  );
}

const STATUS_UI: Record<string, { icon: IconName; label: string; cls: string }> = {
  sent: { icon: 'check', label: 'Yuborildi', cls: 'text-emerald-500' },
  failed: { icon: 'x', label: 'Yetmadi', cls: 'text-rose-500' },
  sending: { icon: 'clock', label: 'Yuborilmoqda', cls: 'text-muted' },
  skipped_pref: { icon: 'lock', label: 'Siz o‘chirgan', cls: 'text-muted' },
  skipped_quiet: { icon: 'moon', label: 'Tinch soatida', cls: 'text-muted' },
  skipped_paused: { icon: 'clock', label: 'Pauzada', cls: 'text-muted' },
  skipped_block: { icon: 'shield', label: 'Muzlatgich bilan himoyalangan', cls: 'text-muted' },
};

function HistoryView({ data }: { data: NotifySettings }) {
  if (data.history.length === 0) {
    return <Empty emoji="📭" title="Hozircha tarix bo‘sh" text="Sizga yuborilgan xabarlar shu yerda ko‘rinadi." />;
  }
  return (
    <div className="space-y-2">
      {data.history.map((h, i) => {
        const st = STATUS_UI[h.status] ?? STATUS_UI.sent;
        const at = typeof h.at === 'string' ? h.at : '';
        const when = at
          ? new Date(at).toLocaleString('uz-UZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
          : '';
        return (
          <Card key={h.id ?? i} className="!p-3.5">
            <div className="flex items-center gap-3">
              <span className={cx('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface2', st.cls)}>
                <Icon name={st.icon} className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">{h.label ?? h.kind}</div>
                <div className="text-[11px] text-muted">
                  {st.label}
                  {when && ` · ${when}`}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
      <p className="pt-1 text-center text-[11px] text-muted">Faqat oxirgi 20 ta yozuv ko‘rsatiladi.</p>
    </div>
  );
}
