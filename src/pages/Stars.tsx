import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../store/store';
import { buyPackage, fetchBilling, PACKAGES, type BillingInfo, type PaymentStatus } from '../lib/billing';
import { isTelegram } from '../lib/telegram';
import { cx, fmt } from '../lib/utils';
import { prettyDateTime } from '../lib/dates';
import { haptic } from '../lib/telegram';
import { toast } from '../store/ui';
import { Button, Card, Modal, Notice, PageHeader, Pill, Section } from '../components/ui';
import { Confetti } from '../components/Mascot';
import { Icon } from '../components/Icon';

type Phase = 'idle' | 'confirm' | 'opening' | 'waiting' | 'paid' | 'failed' | 'cancelled';

const STATUS_META: Record<PaymentStatus, { label: string; cls: string }> = {
  succeeded: { label: '✅ Bajarildi', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200' },
  pending: { label: '⏳ Kutilmoqda', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200' },
  failed: { label: '❌ Bekor qilindi', cls: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200' },
  refunded: { label: '↩️ Qaytarildi', cls: 'bg-surface2 text-muted' },
};

export function Stars() {
  const s = useApp();
  const [info, setInfo] = useState<BillingInfo | null>(null);
  const [state, setState] = useState<'loading' | 'ok' | 'off' | 'error'>('loading');
  const [phase, setPhase] = useState<Phase>('idle');
  const [chosen, setChosen] = useState<string | null>(null);
  const [reward, setReward] = useState(0);
  const busyRef = useRef(false);

  const load = useCallback(async () => {
    setState('loading');
    try {
      const j = await fetchBilling();
      setInfo(j);
      setState('ok');
    } catch (e) {
      setState(e instanceof Error && (e.message === 'not_configured' || e.message === 'http_503' || e.message === 'http_404') ? 'off' : 'error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openConfirm = (id: string) => {
    haptic('light');
    setChosen(id);
    setPhase('confirm');
  };

  const confirmBuy = async () => {
    if (!chosen || busyRef.current) return;
    busyRef.current = true;
    setPhase('opening');
    try {
      // This opens a REAL Telegram Stars invoice (XTR) and waits for the invoice window to close.
      setPhase('waiting');
      const res = await buyPackage(chosen);
      const pkg = PACKAGES.find((p) => p.id === chosen);
      if (res === 'paid') {
        haptic('success');
        setReward(pkg?.coins ?? 0);
        setPhase('paid');
      } else if (res === 'maybe_paid') {
        toast('To‘lov qabul qilindi — Coin bir necha soniyadan keyin qo‘shiladi', 'info', 4000);
        setPhase('idle');
      } else if (res === 'cancelled') {
        setPhase('cancelled');
      } else {
        setPhase('failed');
      }
      const j = await fetchBilling();
      setInfo(j);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      if (msg === 'tiny_limit') toast('Tiny Pack limiti tugagan (3 marta). Boshqa paketni tanlang.', 'warn');
      else if (msg === 'no_telegram') toast('Coin olish faqat Telegram ichida ishlaydi', 'warn');
      else toast('Hisob-faktura yaratilmadi — keyinroq urinib ko‘ring', 'warn');
      setPhase('idle');
    } finally {
      busyRef.current = false;
      setChosen(null);
    }
  };

  const closeResult = () => setPhase('idle');
  const chosenPkg = PACKAGES.find((p) => p.id === chosen);
  const tinyLeft = info?.tinyLeft;

  return (
    <div>
      <PageHeader emoji="⭐" title="Tanga do‘koni" subtitle="Telegram Stars bilan Coin oling — darhol hisobga tushadi" />

      {/* Balance hero */}
      <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-sky-600 via-violet-600 to-purple-600 p-5 text-white shadow-lg shadow-violet-500/25">
        <div className="pointer-events-none absolute -right-4 -top-6 text-[7rem] opacity-20 select-none">⭐</div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-sky-100">Sizning hisobingiz</div>
            <div className="mt-1 text-4xl font-black leading-none">{fmt(s.coins.balance)} 🪙</div>
            <div className="mt-1 text-sm text-sky-100">Coin · do‘konda ramkalar, avatarlar va sovg‘alarga sarflanadi</div>
          </div>
          <div className="shrink-0 text-right text-xs font-semibold text-sky-100">
            <div className="inline-block rounded-full bg-white/20 px-3 py-1.5">🔒 Xavfsiz</div>
            <div className="mt-1.5">⭐ Telegram Stars</div>
          </div>
        </div>
      </div>

      {state === 'loading' && (
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-3xl bg-surface2" />
          ))}
        </div>
      )}

      {state === 'off' && (
        <div className="mt-4">
          <Notice tone="warn">
            Coin olish onlayn rejada ishlaydi: serverda <b>/api/payments</b> + Supabase + bot sozlanishi kerak (Vercel → Environment Variables → <b>SUPABASE_URL</b>, <b>SUPABASE_SERVICE_ROLE_KEY</b>, <b>TELEGRAM_BOT_TOKEN</b> → Redeploy). Coin yig‘ishning bepul yo‘llari — vazifalar, o‘yinlar va janglar.
          </Notice>
        </div>
      )}

      {state === 'error' && (
        <div className="mt-4">
          <Notice tone="warn">Do‘konni yuklab bo‘lmadi. Internetni tekshirib, sahifani yangilang.</Notice>
        </div>
      )}

      {state === 'ok' && !isTelegram() && (
        <div className="mt-4">
          <Notice tone="warn">Telegram Stars to‘lovlari faqat Telegram ilovasi ichidan amalga oshiriladi. Ilovani bot orqali oching.</Notice>
        </div>
      )}

      {state === 'ok' && (
        <>
          <Section title="🪙 Coin paketlari" action={<Pill tone="indigo">⭐ Stars</Pill>}>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {PACKAGES.map((p) => {
                const left = p.maxPerUser ? p.tinyLeft ?? tinyLeft ?? 0 : undefined;
                const soldOut = p.maxPerUser !== undefined && left !== undefined && left <= 0;
                return (
                  <Card key={p.id} className={cx('relative !p-4 text-center', p.popular && '!border-amber-400')}>
                    {p.popular && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-sm">
                        Ommabop
                      </span>
                    )}
                    <div className={cx(p.id === 'ultimate' && 'text-4xl', p.id !== 'ultimate' && 'text-3xl')}>
                      {p.id === 'tiny' ? '🌱' : p.id === 'starter' ? '🪙' : p.id === 'popular' ? '💎' : p.id === 'pro' ? '🚀' : p.id === 'mega' ? '🌠' : '👑'}
                    </div>
                    <p className="mt-1.5 text-xs font-extrabold uppercase tracking-wide text-muted">{p.label}</p>
                    <p className="mt-0.5 text-2xl font-black leading-tight">{fmt(p.coins)}</p>
                    <p className="text-[11px] font-bold text-muted">Coin</p>
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-sm font-extrabold text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                        ⭐ {fmt(p.stars)}
                      </span>
                    </div>
                    {p.maxPerUser && (
                      <p className={cx('mt-2 text-[11px] font-bold', soldOut ? 'text-rose-500' : 'text-muted')}>
                        {soldOut ? 'Limit tugagan (3/3)' : `Faqat ${left}/3 qoldi`}
                      </p>
                    )}
                    <div className="mt-2.5">
                      <Button
                        size="sm"
                        full
                        variant={p.popular ? 'primary' : 'secondary'}
                        disabled={soldOut || !isTelegram()}
                        onClick={() => openConfirm(p.id)}
                      >
                        {soldOut ? 'Tugagan' : 'Sotib olish'}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-muted">
              ⭐ 1 Star ≈ bitta telegram yulduzi. To‘lov Telegram tomonidan xavfsiz amalga oshiriladi; Coinlar to‘lov tasdiqlangandan so‘ng darhol hisobingizga qo‘shiladi. Tiny Pack har bir o‘quvchi uchun ko‘pi bilan 3 marta.
            </p>
          </Section>

          {/* Payment history */}
          <Section title="📜 To‘lovlar tarixi">
            {!info?.history || info.history.length === 0 ? (
              <p className="text-sm text-muted">Hali to‘lov bo‘lmagan. Coin yig‘ishning bepul yo‘li — kunlik vazifalar va o‘yinlar!</p>
            ) : (
              <div className="space-y-2">
                {info.history.slice(0, 12).map((h) => {
                  const meta = STATUS_META[h.status] ?? STATUS_META.pending;
                  return (
                    <Card key={h.id} className="flex items-center gap-3 !p-3.5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-xl dark:bg-amber-500/20">🪙</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">
                          +{fmt(h.coins)} Coin <span className="font-normal text-muted">· {h.packageId}</span>
                        </p>
                        <p className="text-xs text-muted">{prettyDateTime(h.date)}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className={cx('inline-block rounded-full px-2.5 py-1 text-[11px] font-bold', meta.cls)}>{meta.label}</span>
                        <p className="mt-1 text-xs font-bold text-muted">⭐ {fmt(h.stars)}</p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </Section>
        </>
      )}

      {/* Confirm modal */}
      <Modal open={phase === 'confirm' && !!chosenPkg} onClose={() => setPhase('idle')} title="To‘lovni tasdiqlang">
        {chosenPkg && (
          <div className="text-center">
            <div className="text-5xl">🪙</div>
            <p className="mt-2 text-2xl font-black">+{fmt(chosenPkg.coins)} Coin</p>
            <p className="mt-1 text-sm text-muted">{chosenPkg.label}</p>
            <div className="mt-4 rounded-2xl bg-surface2 p-4">
              <p className="text-sm font-semibold">
                To‘laysiz: <span className="font-black text-amber-600 dark:text-amber-300">⭐ {fmt(chosenPkg.stars)} Stars</span>
              </p>
              <p className="mt-1 text-xs text-muted">Telegram to‘lov oynasi ochiladi. Coinlar to‘lovdan so‘ng darhol hisobga tushadi.</p>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="secondary" full onClick={() => setPhase('idle')}>
                Bekor qilish
              </Button>
              <Button full onClick={confirmBuy}>
                ⭐ Stars bilan to‘lash
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Waiting modal (invoice is open in Telegram) */}
      <Modal open={phase === 'opening' || phase === 'waiting'} onClose={() => undefined} title="To‘lov">
        <div className="py-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center">
            <span className="h-10 w-10 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600" />
          </div>
          <p className="mt-3 font-extrabold">Telegram to‘lov oynasi ochildi</p>
          <p className="mt-1 text-sm text-muted">Oynada to‘lovni yakunlang — Coinlar darhol hisobga tushadi.</p>
        </div>
      </Modal>

      {/* Success modal */}
      <Modal open={phase === 'paid'} onClose={closeResult} title="To‘lov bajarildi!">
        <div className="relative py-2 text-center">
          <Confetti />
          <div className="pop-in text-7xl">🪙</div>
          <p className="mt-3 text-3xl font-black text-emerald-600 dark:text-emerald-300">+{fmt(reward)} Coin</p>
          <p className="mt-1 text-sm text-muted">Hisobingiz yangilandi — Do‘konda xohlagan narsangizni oling!</p>
          <Button className="mt-5" full onClick={closeResult}>
            Ajoyib!
          </Button>
        </div>
      </Modal>

      {/* Cancelled / failed modal */}
      <Modal open={phase === 'cancelled' || phase === 'failed'} onClose={closeResult} title={phase === 'cancelled' ? 'To‘lov bekor qilindi' : 'To‘lov amalga oshmadi'}>
        <div className="py-2 text-center">
          <div className="text-6xl">{phase === 'cancelled' ? '🤷' : '⚠️'}</div>
          <p className="mt-3 text-sm text-muted">
            {phase === 'cancelled'
              ? 'To‘lov oynasi yopildi — Stars sizdan yechilmagan. Xohlagan vaqtda qayta urinib ko‘ring.'
              : 'To‘lovni bajarib bo‘lmadi. Stars yechilmagan bo‘lishi kerak — muammo takrorlansa, bot orqali xabar bering.'}
          </p>
          <Button className="mt-4" variant="secondary" full onClick={closeResult}>
            Tushunarli
          </Button>
        </div>
      </Modal>

      <div className="mt-4 flex items-center gap-2 text-xs text-muted">
        <Icon name="info" className="h-4 w-4 shrink-0" />
        <p>
          To‘lovlar Telegram Stars (XTR) tizimi orqali rasmiy ravishda amalga oshiriladi. Hisob-faktura bot tomonidan tekshiriladi va har bir to‘lov faqat bir marta hisobga olinadi.
        </p>
      </div>
    </div>
  );
}
