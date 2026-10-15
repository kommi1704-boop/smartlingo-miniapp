import { useEffect, useState, type ReactNode } from 'react';
import { LEVELS } from '../types';
import { useApp } from '../store/store';
import { resetAll, updateProfile, updateSettings } from '../store/actions';
import { navigate } from '../lib/router';
import { tutorIsLive } from '../lib/api';
import { isTelegram, shareToTelegram } from '../lib/telegram';
import { Button, Card, Chip, Modal, Notice, PageHeader, Pill, Section } from '../components/ui';
import { MINUTES } from '../data/options';
import { toast } from '../store/ui';
import { cx } from '../lib/utils';

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx('relative h-7 w-12 shrink-0 rounded-full transition', checked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600')}
    >
      <span className={cx('absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all', checked ? 'left-[1.4rem]' : 'left-0.5')} />
    </button>
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
      <PageHeader emoji="⚙️" title="Sozlamalar" />

      <Section title="Profil">
        <Card>
          <label htmlFor="s-name" className="text-sm font-semibold">Ism yoki laqab</label>
          <div className="mt-1.5 flex gap-2">
            <input id="s-name" value={name} maxLength={30} onChange={(e) => setName(e.target.value)} className="min-w-0 flex-1 rounded-2xl border-2 border-line bg-surface px-3.5 py-2.5 outline-none focus:border-indigo-500" />
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
          <Row title="Tarjima doim ko‘rinsin" hint="Kartochkalarda o‘zbekcha ma’no darhol ochiladi">
            <Switch checked={s.settings.showTranslation} onChange={(v) => updateSettings({ showTranslation: v })} label="Tarjima doim ko‘rinsin" />
          </Row>
          <Row title="Tebranish (haptik)" hint="Javob to‘g‘ri/noto‘g‘ri bo‘lganda (Telegram ichida)">
            <Switch checked={s.settings.haptics} onChange={(v) => updateSettings({ haptics: v })} label="Haptik signal" />
          </Row>
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

      <Section title="Ma’lumotlar">
        <Card>
          <p className="text-sm text-muted">Natijalaringiz faqat shu qurilmadagi brauzer xotirasida saqlanadi{isTelegram() ? ' (Telegram ichida ham)' : ''}.</p>
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
          <Button variant="danger" full onClick={() => { resetAll(); setConfirm(false); navigate('/welcome', { replace: true }); }}>O‘chirish</Button>
        </div>
      </Modal>
    </div>
  );
}
