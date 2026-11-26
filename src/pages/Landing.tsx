import { useState } from 'react';
import { navigate } from '../lib/router';
import { WebLogin } from '../components/WebLogin';
import { hasSession, isTelegram } from '../lib/telegram';
import { useApp } from '../store/store';
import { Button, Card, LevelBadge, Modal } from '../components/ui';
import { Icon, type IconName } from '../components/Icon';
import { Mascot, Sparkles } from '../components/Mascot';
import { LEVELS } from '../types';
import { LEVEL_DESC } from '../data/options';
import { VOCAB } from '../data/vocab';
import { GRAMMAR } from '../data/grammar';

const FEATURES: { icon: IconName; title: string; text: string }[] = [
  { icon: 'target', title: 'Daraja aniqlash', text: 'Qisqa test orqali taxminiy CEFR darajangizni bilib oling.' },
  { icon: 'map', title: 'Shaxsiy yo‘l xaritasi', text: 'Maqsad va vaqtingizga mos bosqichma-bosqich reja.' },
  { icon: 'chat', title: 'Lingo — AI repetitor', text: 'O‘zbekcha tushuntirish, inglizcha suhbat va gap tuzatish.' },
  { icon: 'cards', title: 'So‘zlar va takrorlash', text: 'Kartochkalar, testlar, o‘yinlar va oraliq takrorlash tizimi.' },
  { icon: 'bulb', title: 'Grammatika darslari', text: 'Oddiy tushuntirish, misollar, keng tarqalgan xatolar va test.' },
  { icon: 'headphones', title: 'O‘qish, tinglash, gaplashish, yozish', text: 'Barcha ko‘nikmalar uchun mashqlar va xatolar daftari.' },
];

const STEPS = [
  { n: 1, title: 'O‘zingiz haqingizda ayting', text: 'Ism, yosh, maqsad va kuniga qancha vaqt ajratishingizni tanlang.' },
  { n: 2, title: 'Qisqa testdan o‘ting', text: '21 tagacha savol: so‘zlar, grammatika va o‘qish.' },
  { n: 3, title: 'Reja oling', text: 'Shaxsiy yo‘l xaritasi va kunlik mashqlar tayyor bo‘ladi.' },
  { n: 4, title: 'Har kuni biroz o‘rganing', text: 'XP to‘plang, seriyani saqlang, xatolaringizni to‘g‘rilang.' },
];

const BENEFITS = [
  'Butun interfeys va tushuntirishlar o‘zbek tilida',
  'Qisqa mashqlar — kuniga 5 daqiqadan boshlash mumkin',
  'Bosim va raqobatsiz: o‘z tezligingizda o‘rganasiz',
  'Xatolar daftari: xato qilgan savollaringizga qaytasiz',
  'Hammasi telefoningizda, Telegram ichida',
];

const TONES = [
  'bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300',
  'bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300',
  'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300',
  'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300',
  'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300',
  'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300',
];

const FAQ: { q: string; a: string }[] = [
  { q: 'Bu rasmiy CEFR imtihonimi?', a: 'Yo‘q. Daraja testi — qisqa dastlabki baho, rasmiy imtihon emas. Aniq daraja uchun rasmiy imtihonlardan o‘ting.' },
  { q: 'Lingo haqiqiy sun’iy intellektmi?', a: 'Server sozlangan bo‘lsa — ha, jonli AI. Aks holda Lingo “Demo rejim”da ishlaydi: tayyor javoblar va oddiy qoidalar. Ilova buni doim aniq ko‘rsatib turadi.' },
  { q: 'Ma’lumotlarim qayerda saqlanadi?', a: 'Progress qurilmangizda saqlanadi. Sozlamalarda "Onlayn saqlash" yoqilsa — reyting va seriya uchun faqat umumiy statistika (ism, XP, daraja) xavfsiz serverga saqlanadi; chat va yozuvlar hech qachon yuborilmaydi.' },
  { q: 'Audio bormi?', a: 'Tinglash mashqlarida qurilmangizning matnni o‘qish (TTS) ovozi ishlatiladi — bu yozib olingan audio emas. Qurilma qo‘llamasa, mashq transkript asosida bajariladi.' },
  { q: 'Talaffuzimni tekshiradimi?', a: 'Hozircha yo‘q. Gaplashish bo‘limida namunalar, foydali iboralar va o‘zingizni baholash ro‘yxati bor.' },
  { q: 'Bepulmi?', a: 'Ha, demo tajriba to‘liq bepul va hech qanday obuna talab qilmaydi.' },
];

function SectionTitle({ id, title, sub }: { id: string; title: string; sub?: string }) {
  return (
    <div className="mb-5 text-center">
      <h2 id={id} className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>
      {sub && <p className="mx-auto mt-1.5 max-w-xl text-sm text-muted">{sub}</p>}
    </div>
  );
}

export function Landing() {
  const s = useApp();
  const [loginOpen, setLoginOpen] = useState(false);
  const start = () => navigate(s.profile ? '/' : '/onboarding');
  const canLogin = !isTelegram() && !hasSession();
  const cta = s.profile ? 'Davom etish' : 'O‘rganishni boshlash';
  return (
    <div className="min-h-dvh pb-16">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="" className="h-8 w-8" />
            <span className="text-lg font-extrabold">SmartLingo AI</span>
          </div>
          {s.profile ? (
            <Button variant="secondary" size="sm" onClick={() => navigate('/')}>Ilovaga qaytish</Button>
          ) : (
            canLogin && <Button variant="secondary" size="sm" onClick={() => setLoginOpen(true)}>Kirish</Button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Hero */}
        <section className="relative mt-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-600 via-sky-600 to-violet-600 p-6 text-white shadow-xl shadow-sky-500/25 sm:p-10">
          <Sparkles />
          <div className="relative z-10 grid items-center gap-6 md:grid-cols-[1.25fr_1fr]">
            <div className="order-2 text-center md:order-1 md:text-left">
              <p className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">8–17 yoshli o‘zbek o‘quvchilari uchun</p>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">Ingliz tilini o‘rganishning shaxsiy yo‘ldoshi</h1>
              <p className="mx-auto mt-3 max-w-xl text-[15px] text-sky-100 md:mx-0">
                Darajangizni aniqlang, shaxsiy reja oling va har kuni kichik qadamlar bilan oldinga yuring.
              </p>
              <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center md:justify-start">
                <button
                  type="button"
                  onClick={start}
                  className="rounded-2xl bg-white px-7 py-3.5 text-base font-extrabold text-sky-700 shadow-lg transition hover:bg-sky-50 active:scale-[0.98]"
                >
                  {cta} →
                </button>
                {canLogin && !s.profile && (
                  <button
                    type="button"
                    onClick={() => setLoginOpen(true)}
                    className="rounded-2xl border-2 border-white/60 px-7 py-3.5 text-base font-bold text-white transition hover:bg-white/10 active:scale-[0.98]"
                  >
                    Menda hisob bor
                  </button>
                )}
              </div>
              <p className="mt-3 text-xs text-sky-100">Ro‘yxatdan o‘tish shart emas · bepul demo</p>
            </div>
            <div className="order-1 flex justify-center md:order-2">
              <div className="rounded-[2.5rem] bg-white/15 p-5"><Mascot mood="cheer" size={170} /></div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="-mt-5 px-3 sm:px-8" aria-label="Raqamlarda">
          <div className="relative z-10 grid grid-cols-3 divide-x divide-line rounded-3xl border border-line bg-surface p-4 text-center shadow-lg">
            {[
              [`${VOCAB.length}`, 'ta so‘z'],
              [`${GRAMMAR.length}`, 'ta grammatika darsi'],
              ['7', 'ta CEFR darajasi'],
            ].map(([n, l]) => (
              <div key={l} className="px-2">
                <div className="text-2xl font-extrabold text-sky-600 dark:text-sky-300 sm:text-3xl">{n}</div>
                <div className="text-[11px] text-muted sm:text-xs">{l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mt-14" aria-labelledby="h-title">
          <SectionTitle id="h-title" title="Qanday ishlaydi?" sub="To‘rt oddiy qadam — va siz o‘rganishni boshlaysiz." />
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((st) => (
              <li key={st.n} className="rounded-3xl border border-line bg-surface p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-600 to-violet-600 text-base font-extrabold text-white">{st.n}</span>
                <h3 className="mt-3 font-bold">{st.title}</h3>
                <p className="mt-1 text-sm text-muted">{st.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Features */}
        <section className="mt-14" aria-labelledby="f-title">
          <SectionTitle id="f-title" title="Imkoniyatlar" sub="Ingliz tilini o‘rganish uchun kerak bo‘lgan hamma narsa bir joyda." />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Card key={f.title} className="h-full">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${TONES[i % TONES.length]}`}>
                  <Icon name={f.icon} />
                </div>
                <h3 className="mt-3 font-bold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted">{f.text}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Levels */}
        <section className="mt-14" aria-labelledby="l-title">
          <SectionTitle id="l-title" title="Darajalar" sub="Xalqaro CEFR shkalasi asosida (taxminiy yo‘nalish, rasmiy baho emas)." />
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {LEVELS.map((l) => (
              <div key={l} className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-3.5">
                <LevelBadge level={l} className="mt-0.5 min-w-[3.25rem] justify-center" />
                <div>
                  <div className="text-sm font-bold">{LEVEL_DESC[l].title}</div>
                  <div className="text-xs text-muted">{LEVEL_DESC[l].desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="mt-14" aria-labelledby="b-title">
          <SectionTitle id="b-title" title="Nega SmartLingo?" />
          <ul className="mx-auto grid max-w-3xl gap-2.5 sm:grid-cols-2">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-2.5 rounded-2xl bg-surface2 px-4 py-3 text-sm font-medium">
                <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                {b}
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section className="mt-14" aria-labelledby="q-title">
          <SectionTitle id="q-title" title="Ko‘p beriladigan savollar" />
          <div className="mx-auto max-w-3xl space-y-2">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-line bg-surface px-4 py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold">
                  {f.q}
                  <Icon name="down" className="h-4 w-4 shrink-0 transition group-open:rotate-180" />
                </summary>
                <p className="mt-2 text-sm text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mt-14 rounded-[2rem] bg-gradient-to-br from-violet-600 to-sky-600 p-8 text-center text-white">
          <h2 className="text-2xl font-extrabold sm:text-3xl">Bugun boshlang — 5 daqiqadan</h2>
          <p className="mt-2 text-sm text-sky-100">Qisqa test, shaxsiy reja va birinchi mashq tayyor.</p>
          <button type="button" onClick={start} className="mt-5 rounded-2xl bg-white px-7 py-3.5 text-base font-extrabold text-sky-700 shadow-lg transition hover:bg-sky-50 active:scale-[0.98]">
            {cta} →
          </button>
        </section>

        <footer className="mt-12 border-t border-line pt-6 text-center text-xs text-muted">
          <p className="font-bold text-ink">SmartLingo AI</p>
          <p className="mt-1">Your personal English-learning companion.</p>
          <p className="mt-3">Demo versiya · natijalar faqat sizning qurilmangizda saqlanadi · CEFR darajasi taxminiy baho.</p>
        </footer>
      </main>

      <Modal open={loginOpen} onClose={() => setLoginOpen(false)} title="Kirish">
        {loginOpen && <WebLogin compact />}
      </Modal>
    </div>
  );
}
