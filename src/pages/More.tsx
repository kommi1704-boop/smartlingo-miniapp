import { A } from '../lib/router';
import { NAV_ALL } from '../components/Shell';
import { PageHeader } from '../components/ui';
import { Icon } from '../components/Icon';
import { GRAMMAR } from '../data/grammar';
import { READING } from '../data/reading';
import { LISTENING } from '../data/listening';
import { SPEAKING } from '../data/speaking';
import { WRITING } from '../data/writing';
import { RESOURCES } from '../data/resources';
import { GAMES } from '../lib/games';

// Every content number below is derived from the REAL data arrays, so adding new
// material to the data files updates these hints automatically. The old version
// hardcoded "10 ta matn" / "5 ta mashq" / "14 ta dars" — when new reading and
// listening content was added, this menu kept showing the stale numbers
// (user report: "bu joyda ham raqamlar xato ko'rsatyapti").
const HINT: Record<string, string> = {
  '/games': `${GAMES.length} ta o‘yin, yulduzlar va kunlik challenge`,
  '/battle': 'Do‘stona jang — raqib yoki Lingo AI, reyting uchun',
  '/friendquiz': 'Do‘stlarga quiz yuboring, jadvalda bellashing',
  '/notify': 'Qaysi xabarlar kelishini o‘zingiz tanlang',
  '/leaderboard': 'Reyting jadvali — eng kuchli o‘quvchilar',
  '/shop': 'Coin do‘koni — ramkalar, avatrlar, sovg‘alar',
  '/stars': 'Telegram Stars bilan Coin olish',
  '/roadmap': 'Bosqichma-bosqich reja',
  '/grammar': `${GRAMMAR.length} ta dars va ${GRAMMAR.reduce((a, l) => a + l.quiz.length, 0)} ta test savoli`,
  '/reading': `${READING.length} ta matn`,
  '/listening': `${LISTENING.length} ta mashq`,
  '/speaking': `${SPEAKING.length} ta mavzu — suhbat va IELTS`,
  '/writing': `${WRITING.length} ta mavzu — matn yozish va tekshirish`,
  '/resources': `${RESOURCES.length} ta tanlangan manba`,
  '/progress': 'Natijalar, xatolar daftari',
  '/profile': 'Reyting, avatar va ramkalar',
  '/settings': 'Mavzu, maqsadlar, reset',
};

export function More() {
  // tab roots are reachable from the bottom navigation — everything else lives here
  const items = NAV_ALL.filter((n) => !['/', '/universe', '/tutor', '/learning', '/profile'].includes(n.path));
  return (
    <div>
      <PageHeader emoji="🧰" title="Boshqa bo‘limlar" subtitle="Barcha o‘quv vositalari" />
      <div className="grid gap-2.5 sm:grid-cols-2">
        {items.map((n) => (
          <A key={n.path} to={n.path} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 transition hover:border-accent/40">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/12 text-accent dark:bg-accent/20 dark:text-[#b3a4ff]">
              <Icon name={n.icon} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold">{n.label}</span>
              <span className="block truncate text-xs text-muted">{HINT[n.path]}</span>
            </span>
            <Icon name="right" className="h-4 w-4 text-muted" />
          </A>
        ))}
        <A to="/welcome" className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 transition hover:border-accent/40">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/12 text-accent dark:bg-accent/20 dark:text-[#b3a4ff]"><Icon name="info" /></span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold">SmartLingo haqida</span>
            <span className="block truncate text-xs text-muted">Imkoniyatlar va savol-javoblar</span>
          </span>
          <Icon name="right" className="h-4 w-4 text-muted" />
        </A>
      </div>
    </div>
  );
}
