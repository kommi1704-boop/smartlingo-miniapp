import { A } from '../lib/router';
import { NAV_ALL } from '../components/Shell';
import { PageHeader } from '../components/ui';
import { Icon } from '../components/Icon';

const HINT: Record<string, string> = {
  '/games': '5 ta o‘yin, yulduzlar va kunlik challenge',
  '/battle': 'Do‘stona jang — raqib yoki Lingo AI, reyting uchun',
  '/leaderboard': 'Reyting jadvali — eng kuchli o‘quvchilar',
  '/shop': 'Coin do‘koni — ramkalar, avatrlar, sovg‘alar',
  '/roadmap': 'Bosqichma-bosqich reja',
  '/grammar': '14 ta dars va testlar',
  '/reading': '10 ta matn',
  '/listening': '5 ta mashq',
  '/speaking': 'Suhbat va IELTS',
  '/writing': 'Matn yozish va tekshirish',
  '/resources': 'Foydali havolalar',
  '/progress': 'Natijalar, xatolar daftari',
  '/profile': 'Reyting, avatar va ramkalar',
  '/settings': 'Mavzu, maqsadlar, reset',
};

export function More() {
  const items = NAV_ALL.filter((n) => !['/', '/plan', '/tutor', '/vocab'].includes(n.path));
  return (
    <div>
      <PageHeader emoji="🧰" title="Boshqa bo‘limlar" subtitle="Barcha o‘quv vositalari" />
      <div className="grid gap-2.5 sm:grid-cols-2">
        {items.map((n) => (
          <A key={n.path} to={n.path} className="flex items-center gap-3 rounded-3xl border border-line bg-surface p-4 transition hover:border-indigo-300">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
              <Icon name={n.icon} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold">{n.label}</span>
              <span className="block truncate text-xs text-muted">{HINT[n.path]}</span>
            </span>
            <Icon name="right" className="h-4 w-4 text-muted" />
          </A>
        ))}
        <A to="/welcome" className="flex items-center gap-3 rounded-3xl border border-line bg-surface p-4 transition hover:border-indigo-300">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300"><Icon name="info" /></span>
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
