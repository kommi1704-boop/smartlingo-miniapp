import { navigate } from '../lib/router';
import { useApp } from '../store/store';
import { Button, Card, LevelBadge } from '../components/ui';
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

const FAQ: { q: string; a: string }[] = [
  { q: 'Bu rasmiy CEFR imtihonimi?', a: 'Yo‘q. Daraja testi — qisqa dastlabki baho, rasmiy imtihon emas. Aniq daraja uchun rasmiy imtihonlardan o‘ting.' },
  { q: 'Lingo haqiqiy sun’iy intellektmi?', a: 'Server sozlangan bo‘lsa — ha, jonli AI. Aks holda Lingo “Demo rejim”da ishlaydi: tayyor javoblar va oddiy qoidalar. Ilova buni doim aniq ko‘rsatib turadi.' },
  { q: 'Ma’lumotlarim qayerda saqlanadi?', a: 'Hozirgi demo versiyada natijalaringiz faqat shu qurilmadagi brauzer xotirasida saqlanadi. Boshqa qurilmaga ko‘chmaydi.' },
  { q: 'Audio bormi?', a: 'Tinglash mashqlarida qurilmangizning matnni o‘qish (TTS) ovozi ishlatiladi — bu yozib olingan audio emas. Qurilma qo‘llamasa, mashq transkript asosida bajariladi.' },
  { q: 'Talaffuzimni tekshiradimi?', a: 'Hozircha yo‘q. Gaplashish bo‘limida namunalar, foydali iboralar va o‘zingizni baholash ro‘yxati bor.' },
  { q: 'Bepulmi?', a: 'Ha, demo tajriba to‘liq bepul va hech qanday obuna talab qilmaydi.' },
];

export function Landing() {
  const s = useApp();
  const start = () => navigate(s.profile ? '/' : '/onboarding');
  return (
    <div className="mx-auto min-h-dvh max-w-3xl px-4 pb-16 pt-6 sm:px-6">
      {/* Hero */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="./favicon.svg" alt="" className="h-9 w-9" />
          <span className="text-lg font-extrabold">SmartLingo AI</span>
        </div>
        {s.profile && (
          <Button variant="secondary" size="sm" onClick={() => navigate('/')}>
            Ilovaga qaytish
          </Button>
        )}
      </header>

      <section className="relative mt-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 p-6 text-white shadow-xl shadow-indigo-500/25 sm:p-9">
        <Sparkles />
        <div className="relative z-10 mb-2 flex justify-center sm:absolute sm:right-8 sm:top-8 sm:mb-0">
          <div className="rounded-[2rem] bg-white/15 p-3"><Mascot mood="cheer" size={118} /></div>
        </div>
        <p className="relative inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">8–17 yoshli o‘zbek o‘quvchilari uchun</p>
        <h1 className="relative mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:max-w-[62%] sm:text-4xl">Ingliz tilini o‘rganishning shaxsiy yo‘ldoshi</h1>
        <p className="mt-3 max-w-xl text-[15px] text-indigo-100">
          Your personal English-learning companion. Darajangizni aniqlang, shaxsiy reja oling va har kuni kichik qadamlar bilan oldinga yuring.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={start}
            className="rounded-2xl bg-white px-6 py-3.5 text-base font-extrabold text-indigo-700 shadow-lg transition hover:bg-indigo-50 active:scale-[0.98]"
          >
            {s.profile ? 'Davom etish' : 'O‘rganishni boshlash'} →
          </button>
          <span className="text-xs text-indigo-100">Ro‘yxatdan o‘tish shart emas · bepul demo</span>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[
            [`${VOCAB.length}`, 'ta so‘z'],
            [`${GRAMMAR.length}`, 'ta grammatika darsi'],
            ['7', 'ta CEFR darajasi'],
          ].map(([n, l]) => (
            <div key={l} className="rounded-2xl bg-white/10 px-2 py-3">
              <div className="text-2xl font-extrabold">{n}</div>
              <div className="text-[11px] text-indigo-100">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mt-10" aria-labelledby="f-title">
        <h2 id="f-title" className="text-xl font-extrabold">Imkoniyatlar</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <Card key={f.title} className="flex gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                <Icon name={f.icon} />
              </div>
              <div>
                <h3 className="font-bold">{f.title}</h3>
                <p className="mt-0.5 text-sm text-muted">{f.text}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mt-10" aria-labelledby="h-title">
        <h2 id="h-title" className="text-xl font-extrabold">Qanday ishlaydi?</h2>
        <ol className="mt-3 space-y-3">
          {STEPS.map((st) => (
            <li key={st.n} className="flex gap-3 rounded-3xl border border-line bg-surface p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-extrabold text-white">{st.n}</span>
              <div>
                <h3 className="font-bold">{st.title}</h3>
                <p className="text-sm text-muted">{st.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Levels */}
      <section className="mt-10" aria-labelledby="l-title">
        <h2 id="l-title" className="text-xl font-extrabold">Darajalar</h2>
        <p className="mt-1 text-sm text-muted">Xalqaro CEFR shkalasi asosida (taxminiy yo‘nalish, rasmiy baho emas).</p>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
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
      <section className="mt-10" aria-labelledby="b-title">
        <h2 id="b-title" className="text-xl font-extrabold">O‘quvchilar uchun foydasi</h2>
        <ul className="mt-3 space-y-2">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-start gap-2.5 rounded-2xl bg-surface2 px-4 py-3 text-sm font-medium">
              <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              {b}
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section className="mt-10" aria-labelledby="q-title">
        <h2 id="q-title" className="text-xl font-extrabold">Ko‘p beriladigan savollar</h2>
        <div className="mt-3 space-y-2">
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

      <div className="mt-10 text-center">
        <Button size="lg" onClick={start}>{s.profile ? 'Davom etish' : 'O‘rganishni boshlash'}</Button>
      </div>

      <footer className="mt-12 border-t border-line pt-6 text-center text-xs text-muted">
        <p className="font-bold text-ink">SmartLingo AI</p>
        <p className="mt-1">Your personal English-learning companion.</p>
        <p className="mt-3">Demo versiya · natijalar faqat sizning qurilmangizda saqlanadi · CEFR darajasi taxminiy baho.</p>
      </footer>
    </div>
  );
}
