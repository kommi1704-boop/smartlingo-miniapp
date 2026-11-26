import { useEffect, useRef, useState, type ReactNode } from 'react';
import { LEVELS } from '../types';
import { useApp } from '../store/store';
import { isOwnedActive, resetAll, updateProfile, updateSettings } from '../store/actions';
import { navigate } from '../lib/router';
import { tutorIsLive } from '../lib/api';
import { deleteOnline, setSyncEnabled, syncUserDisabled, useSync } from '../lib/sync';
import { hasSession, isTelegram, isWebSession, shareToTelegram } from '../lib/telegram';
import { WebLogin } from '../components/WebLogin';
import { Button, Card, Chip, Modal, Notice, PageHeader, Pill, Section } from '../components/ui';
import { Icon } from '../components/Icon';
import { ACCENTS, BACKGROUNDS } from '../lib/theme';
import { VoicePicker } from '../components/VoicePicker';
import { MINUTES } from '../data/options';
import { toast } from '../store/ui';
import { cx, fileToBgDataUrl } from '../lib/utils';

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx('relative h-7 w-12 shrink-0 rounded-full transition', checked ? 'bg-accent' : 'bg-line')}
    >
      <span className={cx('absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all', checked ? 'left-[1.4rem]' : 'left-0.5')} />
    </button>
  );
}

function SyncBlock() {
  const sy = useSync();
  const off = syncUserDisabled();
  if (!isTelegram() && !hasSession()) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted">Natijalaringiz hozircha shu brauzer xotirasida saqlanadi.</p>
        <WebLogin />
      </div>
    );
  }
  if (sy.status === 'unavailable') {
    return <p className="text-sm text-muted">Natijalaringiz shu qurilmada saqlanadi. Onlayn saqlash serverda hali yoqilmagan.</p>;
  }
  const text = off
    ? 'O‘chiq. Natijalar faqat shu qurilmada.'
    : sy.status === 'synced' ? `Saqlandi ✓${sy.at ? ' · ' + new Date(sy.at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : ''}`
    : sy.status === 'saving' ? 'Saqlanmoqda…'
    : sy.status === 'connecting' ? 'Ulanmoqda…'
    : sy.status === 'error' ? 'Saqlab bo‘lmadi. Internetni tekshiring, qayta urinamiz.'
    : 'Yoqilgan';
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="font-bold">Onlayn saqlash</div>
        <div className="text-xs text-muted">{text}</div>
        <div className="mt-1 text-xs text-muted">Natija (XP, so‘zlar, nishonlar) Telegram hisobingiz bilan bog‘lab saqlanadi. Telefon almashsangiz, tiklanadi. O‘chirsangiz, onlayn nusxa o‘chiriladi.</div>
      </div>
      <Switch checked={!off} onChange={(v) => void setSyncEnabled(v)} label="Onlayn saqlash" />
    </div>
  );
}

function Row({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <p className="font-semibold">{title}</p>
        {hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

export function Settings() {
  const s = useApp();
  const p = s.profile!;
  const [name, setName] = useState(p.name);
  const [live, setLive] = useState<boolean | null>(null);
  const [confirm, setConfirm] = useState(false);
  const bgFileRef = useRef<HTMLInputElement>(null);

  /** Pick + downscale the learner's own backdrop photo (bg-custom shop item). */
  async function onBgPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking the same file
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast('Faqat rasm faylini tanlang', 'warn');
      return;
    }
    try {
      const dataUrl = await fileToBgDataUrl(file);
      updateSettings({ bg: 'custom', customBg: dataUrl });
      toast('Shaxsiy fon o‘rnatildi! 🖼️', 'success');
    } catch {
      toast('Rasmni yuklab bo‘lmadi — kichikroq rasm tanlang', 'warn');
    }
  }

  useEffect(() => {
    tutorIsLive().then(setLive);
  }, []);

  const botUser = (import.meta.env?.VITE_BOT_USERNAME as string | undefined) ?? '';

  function saveName() {
    const n = name.trim();
    if (n.length < 2 || n.length > 30) return toast('Ism 2–30 ta belgidan iborat bo‘lsin', 'warn');
    updateProfile({ name: n });
    toast('Saqlandi', 'success');
  }

  return (
    <div>
      <PageHeader emo="gear" title="Sozlamalar" />

      <Section title="Profil">
        <Card>
          <label htmlFor="s-name" className="text-sm font-semibold">Ism yoki laqab</label>
          <div className="mt-1.5 flex gap-2">
            <input id="s-name" value={name} maxLength={30} onChange={(e) => setName(e.target.value)} className="min-w-0 flex-1 rounded-2xl border-2 border-line bg-surface px-3.5 py-2.5 outline-none focus:border-sky-500" />
            <Button variant="secondary" onClick={saveName}>Saqlash</Button>
          </div>
          <div className="mt-4 text-sm">
            <p>Taxminiy daraja: <b>{p.estimatedLevel}</b> · Maqsad: <b>{p.targetLevel}</b></p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" icon="refresh" onClick={() => navigate('/onboarding')}>Maqsad va ma’lumotlarni o‘zgartirish</Button>
              <Button size="sm" variant="secondary" icon="target" onClick={() => navigate('/assessment')}>Darajani qayta aniqlash</Button>
            </div>
          </div>
        </Card>
      </Section>

      <Section title="O‘qish rejasi">
        <Card>
          <p className="text-sm font-semibold">Kuniga necha daqiqa</p>
          <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
            {MINUTES.map((m) => <Chip key={m} active={p.dailyMinutes === m} onClick={() => updateProfile({ dailyMinutes: m })}>{m} daq</Chip>)}
          </div>
          <p className="mt-4 text-sm font-semibold">Kunlik so‘z maqsadi</p>
          <div className="mt-2 flex gap-2">
            {[5, 10, 15, 20].map((g) => <Chip key={g} active={s.settings.dailyWordGoal === g} onClick={() => updateSettings({ dailyWordGoal: g })}>{g} ta</Chip>)}
          </div>
          <p className="mt-4 text-sm font-semibold">Maqsad darajasi</p>
          <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
            {LEVELS.filter((l) => LEVELS.indexOf(l) >= LEVELS.indexOf(p.estimatedLevel)).map((l) => (
              <Chip key={l} active={p.targetLevel === l} onClick={() => updateProfile({ targetLevel: l })}>{l}</Chip>
            ))}
          </div>
        </Card>
      </Section>

      <Section title="Ko‘rinish va qulaylik">
        <Card className="divide-y divide-line !py-1">
          <div className="py-2.5">
            <p className="font-semibold">Mavzu</p>
            <div className="mt-2 flex gap-2">
              {([['auto', '🌓 Avto'], ['light', '☀️ Yorug‘'], ['dark', '🌙 Qorong‘i']] as const).map(([v, l]) => (
                <Chip key={v} active={s.settings.theme === v} onClick={() => updateSettings({ theme: v })}>{l}</Chip>
              ))}
            </div>
            <p className="mt-1 text-xs text-muted">“Avto” Telegram yoki qurilma mavzusiga mos keladi.</p>
          </div>
          <div className="py-2.5">
            <p className="font-semibold">Mavzu rangi</p>
            <p className="mt-0.5 text-xs text-muted">Butun interfeys — tugmalar, XP, maskot — tanlangan rangga o‘zgaradi.</p>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {ACCENTS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => updateSettings({ accent: a.id })}
                  aria-pressed={s.settings.accent === a.id}
                  aria-label={a.name}
                  className={cx(
                    'flex flex-col items-center gap-1.5 rounded-2xl border-2 p-2 transition',
                    s.settings.accent === a.id ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/10' : 'border-line hover:border-sky-300',
                  )}
                >
                  <span
                    className="h-10 w-10 rounded-full border border-line shadow-inner"
                    style={{ background: a.swatch }}
                  />
                  <span className="text-xs font-semibold">{a.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="py-2.5">
            <p className="font-semibold">Orqa fon</p>
            <p className="mt-0.5 text-xs text-muted">Ilova fon uslubi — yorug‘ va tun rejimida alohida ko‘rinishga ega.</p>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {BACKGROUNDS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    if ((b.id === 'aurora' || b.id === 'nebula' || b.id === 'custom') && !isOwnedActive(`bg-${b.id}`)) {
                      toast('Bu premium fon — Do‘kondan ochib oling! 🎨', 'warn');
                      navigate('/shop');
                      return;
                    }
                    if (b.id === 'custom' && !s.settings.customBg) {
                      bgFileRef.current?.click();
                      return;
                    }
                    updateSettings({ bg: b.id });
                  }}
                  aria-pressed={s.settings.bg === b.id}
                  aria-label={b.name}
                  className={cx(
                    'flex flex-col items-center gap-1.5 rounded-2xl border-2 p-2 transition',
                    s.settings.bg === b.id ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/10' : 'border-line hover:border-sky-300',
                  )}
                >
                  <span
                    className="h-10 w-full rounded-xl border border-line bg-cover bg-center"
                    style={b.id === 'custom' && s.settings.customBg ? { backgroundImage: `url(${s.settings.customBg})` } : { background: b.preview }}
                  />
                  <span className="text-xs font-semibold">{b.name}</span>
                </button>
              ))}
            </div>
            {s.settings.bg === 'custom' && (
              <div className="mt-2 flex items-center gap-2">
                <Button size="sm" icon="user" onClick={() => bgFileRef.current?.click()}>Boshqa rasm yuklash</Button>
                <p className="text-xs text-muted">Rasm faqat sizning qurilmangizda saqlanadi.</p>
              </div>
            )}
            <input ref={bgFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => void onBgPicked(e)} />
          </div>
          <Row title="Tarjima doim ko‘rinsin" hint="Kartochkalarda o‘zbekcha ma’no darhol ochiladi">
            <Switch checked={s.settings.showTranslation} onChange={(v) => updateSettings({ showTranslation: v })} label="Tarjima doim ko‘rinsin" />
          </Row>
          <Row title="Tebranish (haptik)" hint="Javob to‘g‘ri/noto‘g‘ri bo‘lganda (Telegram ichida)">
            <Switch checked={s.settings.haptics} onChange={(v) => updateSettings({ haptics: v })} label="Haptik signal" />
          </Row>
          <Row title="Qisqa ovozli signallar" hint="To‘g‘ri/noto‘g‘ri javob va yangi daraja uchun">
            <Switch checked={s.settings.sound} onChange={(v) => updateSettings({ sound: v })} label="Ovozli signallar" />
          </Row>
        </Card>
      </Section>

      <Section title="Inglizcha o‘qish ovozi">
        <Card>
          <VoicePicker />
        </Card>
      </Section>

      <Section title="Lingo (AI repetitor)">
        <Card>
          <div className="flex items-center gap-2">
            <p className="font-semibold">Holat:</p>
            {live === null ? <Pill>Tekshirilmoqda…</Pill> : live ? <Pill tone="green">Jonli AI ulangan</Pill> : <Pill tone="amber">Demo rejim</Pill>}
          </div>
          <p className="mt-2 text-sm text-muted">
            {live
              ? 'Lingo server orqali sun’iy intellekt bilan ishlayapti. Maxfiy kalit brauzerda saqlanmaydi.'
              : 'Jonli AI ulanmagan, shuning uchun Lingo tayyor javoblar va oddiy qoidalar bilan ishlaydi. README faylida AI ni ulash yo‘riqnomasi bor.'}
          </p>
        </Card>
      </Section>

      <Section title="Bildirishnomalar">
        <Card
          onClick={() => navigate('/notify')}
          className="flex cursor-pointer items-center gap-3 transition hover:border-accent/40"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent dark:bg-accent/20 dark:text-[#7ee2a8]">
            <Icon name="bell" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold">Bildirishnoma sozlamalari</span>
            <span className="block text-xs text-muted">Turlari, tinch soatlari, pauza va tarix</span>
          </span>
          <Icon name="right" className="h-4 w-4 text-muted" />
        </Card>
      </Section>

      <Section title="Ma’lumotlar">
        <Card>
          {isWebSession() && (
            <div className="mb-3 border-b border-line pb-3">
              <WebLogin />
            </div>
          )}
          <SyncBlock />
          <p className="mt-3 text-sm text-muted">Suhbatlar va yozgan matnlaringiz faqat shu qurilmada qoladi.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {botUser && <Button size="sm" variant="secondary" icon="share" onClick={() => shareToTelegram(`https://t.me/${botUser}`, 'SmartLingo AI bilan ingliz tilini o‘rganamiz! 🚀')}>Do‘stlarga ulashish</Button>}
            <Button size="sm" variant="secondary" icon="info" onClick={() => navigate('/welcome')}>SmartLingo haqida</Button>
            <Button size="sm" variant="danger" icon="trash" onClick={() => setConfirm(true)}>Barcha ma’lumotni o‘chirish</Button>
          </div>
        </Card>
      </Section>

      <div className="mt-5"><Notice>SmartLingo AI demo v1.0 · Daraja natijasi taxminiy baho bo‘lib, rasmiy CEFR imtihoni emas.</Notice></div>

      <Modal open={confirm} onClose={() => setConfirm(false)} title="Hammasini o‘chiramizmi?">
        <p className="text-sm text-muted">Profil, XP, so‘zlar, natijalar, xatolar daftari va suhbatlar o‘chiriladi. Buni qaytarib bo‘lmaydi.</p>
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" full onClick={() => setConfirm(false)}>Bekor qilish</Button>
          <Button variant="danger" full onClick={() => { void deleteOnline(); resetAll(); setConfirm(false); navigate('/welcome', { replace: true }); }}>O‘chirish</Button>
        </div>
      </Modal>
    </div>
  );
}
