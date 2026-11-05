import { useEffect, useState } from 'react';
import { fetchPublicProfile, profileNotConfigured, type PublicProfile } from '../lib/profileApi';
import { BADGES, rankInfo } from '../lib/gamification';
import { FRAMES, PREMIUM_AVATARS, RANK_TIERS, NAME_COLORS, NAME_FXS, TITLES, nameColorById, nameFxById } from '../lib/shop';
import { xpProgress } from '../lib/gamification';
import { BACKGROUNDS } from '../lib/theme';
import type { Level } from '../types';
import { cx, fmt } from '../lib/utils';
import { prettyDate } from '../lib/dates';
import { tgUser, haptic } from '../lib/telegram';
import { navigate } from '../lib/router';
import { Button, Card, Empty, LevelBadge, Notice, PageHeader, Pill, Section, StatTile } from '../components/ui';
import { FramedEmoji } from '../components/Avatar';
import { Icon } from '../components/Icon';

/** Ring class for a server-validated equipped frame id (same mapping as the leaderboard). */
function ringFor(frame?: string): string {
  if (!frame) return 'frame-none';
  if (frame.startsWith('rf-')) return RANK_TIERS.find((t) => `rf-${t.id}` === frame)?.ring ?? 'frame-none';
  return FRAMES.find((f) => f.id === frame)?.cls ?? 'frame-none';
}

/** Public name styles: the server already checked the rentals are active. */
function publicNameStyle(p: PublicProfile): string {
  const parts: string[] = [];
  const color = p.nameColor ? nameColorById(p.nameColor)?.cls : undefined;
  const fx = p.nameFx ? nameFxById(p.nameFx)?.cls : undefined;
  if (color) parts.push('nm-grad', color);
  if (fx) parts.push(fx);
  return parts.join(' ');
}

const HERO_BG: Record<string, string> = {
  doodle: 'from-indigo-600 to-violet-600',
  plain: 'from-slate-600 to-slate-500',
  mesh: 'from-indigo-600 via-cyan-500 to-fuchsia-600',
  sunset: 'from-orange-500 to-pink-600',
  mint: 'from-teal-500 to-sky-600',
  grid: 'from-blue-600 to-indigo-700',
};

type State = 'loading' | 'ok' | 'notfound' | 'off' | 'auth' | 'error';

export function PublicProfile({ uid }: { uid: string }) {
  const [p, setP] = useState<PublicProfile | null>(null);
  const [state, setState] = useState<State>('loading');

  useEffect(() => {
    let alive = true;
    setState('loading');
    fetchPublicProfile(uid)
      .then((j) => {
        if (alive) {
          setP(j);
          setState('ok');
        }
      })
      .catch((e: unknown) => {
        if (!alive) return;
        const msg = e instanceof Error ? e.message : '';
        if (msg === 'not_found' || msg === 'bad_uid' || msg === 'http_404') setState('notfound');
        else if (profileNotConfigured(e)) setState('off');
        else if (msg === 'unauthorized' || msg === 'http_401') setState('auth');
        else setState('error');
      });
    return () => {
      alive = false;
    };
  }, [uid]);

  const myId = String(tgUser()?.id ?? '');
  const isMe = myId === uid;

  if (state === 'loading') {
    return (
      <div>
        <PageHeader emoji="🧑‍🚀" title="Profil" back />
        <div className="h-44 animate-pulse rounded-[1.75rem] bg-surface2" />
        <div className="mt-3 grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-3xl bg-surface2" />
          ))}
        </div>
      </div>
    );
  }

  if (state === 'notfound') {
    return (
      <div>
        <PageHeader emoji="🔍" title="Profil topilmadi" back />
        <Empty emoji="🕵️" title="Bunday o‘quvchi yo‘q" text="Bu o‘quvchi hali onlayn saqlashni yoqib, appni ochmagan bo‘lishi mumkin." />
      </div>
    );
  }

  if (state === 'off' || state === 'auth' || state === 'error') {
    return (
      <div>
        <PageHeader emoji="🧑‍🚀" title="Profil" back />
        {state === 'off' && (
          <Notice tone="warn">
            Profillar onlayn rejada ko‘rinadi: serverda <b>/api/profile</b> + Supabase sozlanishi kerak.
          </Notice>
        )}
        {state === 'auth' && <Notice tone="warn">Profilni ko‘rish faqat Telegram ichida ishlaydi — ilovani bot orqali oching.</Notice>}
        {state === 'error' && <Notice tone="warn">Ma’lumotni yuklab bo‘lmadi — internetni tekshirib, qayta urinib ko‘ring.</Notice>}
      </div>
    );
  }

  if (!p) return null;

  const rank = rankInfo(p.rating);
  const xp = xpProgress(p.xp);
  const bgName = BACKGROUNDS.find((b) => b.id === p.bg)?.name ?? 'Klassik';

  return (
    <div>
      <PageHeader emoji="🧑‍🚀" title="O‘quvchi profili" subtitle="Ochiq (jamoa) sahifa" back />

      {/* Hero */}
      <div className={cx('relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br p-5 text-white shadow-lg shadow-indigo-500/25', HERO_BG[p.bg] ?? HERO_BG.doodle)}>
        <div className="pointer-events-none absolute -right-3 -top-5 text-[6.5rem] opacity-15 select-none">{p.avatar ?? '🙂'}</div>
        <div className="flex items-center gap-4">
          <div className="rounded-3xl bg-white/15 p-1.5">
            <FramedEmoji emoji={p.avatar ?? '🙂'} frameCls={ringFor(p.frame)} size={84} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className={cx('truncate text-2xl font-extrabold leading-tight', publicNameStyle(p) || undefined)}>{p.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {p.username && <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold">@{p.username}</span>}
              {p.title && <span className="text-xs font-bold text-amber-200">{TITLES.find((t) => t.id === p.title)?.name ?? ''}</span>}
              {isMe && <Pill tone="amber">siz</Pill>}
            </div>
            <p className="mt-1.5 text-sm font-extrabold">
              <span className="rounded-full bg-white/20 px-2.5 py-0.5">{rank.tier.name}</span> <span className="font-bold">{fmt(p.rating)} reyting</span>
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-100">
            <span>Tajriba darajasi {xp.level}</span>
            <span>{fmt(p.xp)} XP</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/25" role="progressbar" aria-valuenow={xp.pct} aria-valuemin={0} aria-valuemax={100} aria-label="XP progress">
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${xp.pct}%` }} />
          </div>
        </div>
      </div>

      {/* CEFR + background chips */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {p.cefr ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="text-xs font-bold text-muted">Daraja:</span>
            <LevelBadge level={p.cefr as Level} />
          </span>
        ) : (
          <Pill>Daraja aniqlanmagan</Pill>
        )}
        <Pill tone="indigo">🎨 Fon uslubi: {bgName}</Pill>
        {p.lastActive && <Pill>Oxirgi faollik: {prettyDate(p.lastActive)}</Pill>}
      </div>

      {isMe && (
        <div className="mt-3">
          <Card className="flex items-center gap-3 !p-3.5">
            <Icon name="user" className="h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-300" />
            <p className="min-w-0 flex-1 text-sm text-muted">Bu sizning ochiq profilingiz — boshqa o‘quvchilar shunday ko‘radi.</p>
            <Button size="sm" variant="secondary" onClick={() => navigate('/profile')}>
              Tahrirlash
            </Button>
          </Card>
        </div>
      )}

      {/* Ranks */}
      <Section title="🏅 Reytinglar">
        <div className="grid grid-cols-2 gap-3">
          <StatTile icon="trophy" tone="violet" label="Global reyting (janglar)" value={p.rankGlobal ? `#${p.rankGlobal}` : '—'} hint={`${fmt(p.rating)} ball`} />
          <StatTile icon="flame" tone="amber" label="Haftalik reyting (XP)" value={p.rankWeek ? `#${p.rankWeek}` : '—'} hint={`${fmt(p.xpWeek)} XP · 7 kun`} />
          <StatTile icon="chart" tone="emerald" label="Oylik reyting (XP)" value={p.rankMonth ? `#${p.rankMonth}` : '—'} hint={`${fmt(p.xpMonth)} XP · 30 kun`} />
          <StatTile icon="star" tone="indigo" label="Umumiy XP" value={fmt(p.xp)} hint={`${xp.level}-daraja`} />
        </div>
      </Section>

      {/* Learning stats */}
      <Section title="📚 O‘qish natijalari">
        <div className="grid grid-cols-2 gap-3">
          <StatTile icon="flame" tone="amber" label="Kunlik seriya" value={`${p.streak} kun`} />
          <StatTile icon="cards" tone="indigo" label="O‘rganilgan so‘zlar" value={fmt(p.words)} />
          <StatTile icon="book" tone="emerald" label="Tugallangan darslar" value={fmt(p.lessons)} />
          <StatTile icon="swords" tone="violet" label="Jang g‘alabalari" value={p.wins} hint={`${p.losses} mag‘lubiyat · ${p.draws} durrang`} />
        </div>
      </Section>

      {/* Badges */}
      <Section title="🎖 Nishonlar" action={<Pill tone="indigo">{p.badges.length} ta</Pill>}>
        {p.badges.length === 0 ? (
          <p className="text-sm text-muted">Hali nishon yo‘q — birinchi mashqlarni bajarib yutib oling!</p>
        ) : (
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
            {p.badges.map((b) => {
              const meta = BADGES.find((x) => x.id === b.id);
              if (!meta) return null; // unknown/retired badge id — never invent one
              return (
                <Card key={b.id} className="!p-3 text-center">
                  <div className="text-2xl">{meta.emoji}</div>
                  <p className="mt-1 truncate text-[11px] font-extrabold">{meta.title}</p>
                  {b.date && <p className="text-[10px] text-muted">{prettyDate(b.date)}</p>}
                </Card>
              );
            })}
          </div>
        )}
      </Section>

      {/* Collectibles */}
      <Section title="🛍 Koleksiyasi" action={<Pill tone="amber">🎁 {p.chestsOpened} quti</Pill>}>
        {p.collectibles.length === 0 ? (
          <p className="text-sm text-muted">Do‘kondan hali buyumlar olinmagan.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {p.collectibles.map((c) => {
              const label =
                c.kind === 'frame'
                  ? FRAMES.find((f) => f.id === c.id)?.name
                  : c.kind === 'avatar'
                    ? PREMIUM_AVATARS.find((a) => a.id === c.id)?.emoji
                    : c.kind === 'title'
                      ? TITLES.find((t) => t.id === c.id)?.name
                      : c.kind === 'nameColor'
                        ? NAME_COLORS.find((n) => n.id === c.id)?.name
                        : NAME_FXS.find((f) => f.id === c.id)?.name;
              if (!label) return null;
              return (
                <span key={`${c.kind}:${c.id}`} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-bold">
                  {c.kind === 'avatar' && <span className="text-base leading-none">{label}</span>}
                  {c.kind === 'frame' && <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400" />}
                  {c.kind !== 'avatar' && <span>{label}</span>}
                </span>
              );
            })}
          </div>
        )}
      </Section>

      <div className="mt-4 flex items-center gap-2 text-xs text-muted">
        <Icon name="info" className="h-4 w-4 shrink-0" />
        <p>Bu sahifada faqat ochiq ma’lumotlar ko‘rsatiladi: ism, @username va o‘qish yutuqlari. Yoshi, maqsadi va shaxsiy materiallari hech qachon ko‘rinmaydi.</p>
      </div>
      <div className="h-2" />
      <Button variant="secondary" full onClick={() => { haptic('light'); navigate('/leaderboard'); }}>
        🏆 Reyting jadvaliga qaytish
      </Button>
    </div>
  );
}
