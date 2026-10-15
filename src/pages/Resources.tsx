import { useMemo, useState } from 'react';
import type { ResourceCategory } from '../types';
import { RESOURCES } from '../data/resources';
import { Button, Card, Chip, Empty, Notice, PageHeader, Pill } from '../components/ui';
import { Icon } from '../components/Icon';
import { openExternal } from '../lib/telegram';

const CATS: { id: ResourceCategory | 'all'; label: string; emoji: string }[] = [
  { id: 'all', label: 'Barchasi', emoji: '🌐' },
  { id: 'youtube', label: 'YouTube darslari', emoji: '▶️' },
  { id: 'listening', label: 'Tinglash', emoji: '🎧' },
  { id: 'reading', label: 'O‘qish maqolalari', emoji: '📰' },
  { id: 'grammar', label: 'Grammatika', emoji: '🧩' },
  { id: 'vocabulary', label: 'So‘zlar', emoji: '🃏' },
  { id: 'books', label: 'Kitob va saytlar', emoji: '📚' },
];

export function Resources() {
  const [cat, setCat] = useState<ResourceCategory | 'all'>('all');
  const [q, setQ] = useState('');
  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return RESOURCES.filter((r) => (cat === 'all' || r.category === cat) && (!t || `${r.title} ${r.desc} ${r.level}`.toLowerCase().includes(t)));
  }, [cat, q]);

  return (
    <div>
      <PageHeader emoji="🌐" title="Resurslar kutubxonasi" subtitle={`${RESOURCES.length} ta tanlangan manba`} />
      <div className="relative">
        <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Resurslarni qidirish"
          placeholder="Qidirish…"
          className="w-full rounded-2xl border border-line bg-surface py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-500"
        />
      </div>
      <div className="no-scrollbar my-3 flex gap-2 overflow-x-auto pb-1">
        {CATS.map((c) => <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>{c.emoji} {c.label}</Chip>)}
      </div>

      {shown.length === 0 ? (
        <Empty emoji="🔍" title="Hech narsa topilmadi" text="Qidiruv so‘zini yoki toifani o‘zgartiring." />
      ) : (
        <ul className="space-y-3">
          {shown.map((r) => {
            const c = CATS.find((x) => x.id === r.category)!;
            return (
              <li key={r.id}>
                <Card>
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-xl dark:bg-indigo-500/20">{c.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold leading-snug">{r.title}</p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <Pill tone="indigo">{c.label}</Pill>
                        <Pill>{r.level}</Pill>
                      </div>
                      <p className="mt-2 text-sm text-muted">{r.desc}</p>
                      <div className="mt-3">
                        {r.url ? (
                          <Button size="sm" variant="secondary" icon="link" onClick={() => openExternal(r.url!)}>Ochish</Button>
                        ) : (
                          <Pill tone="amber">Havola tasdiqlanmagan</Pill>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
      <div className="mt-5"><Notice>Havolalar tashqi saytlarga olib boradi va Telegramdan tashqarida ochilishi mumkin. Faqat tekshirilgan havolalar ko‘rsatiladi; tekshirilmagan manbalar havolasiz qoldirilgan.</Notice></div>
    </div>
  );
}
