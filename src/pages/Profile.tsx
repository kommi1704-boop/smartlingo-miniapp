import { useApp } from '../store/store';
import { equipAvatar, equipFrame, isOwnedActive, renewFrame } from '../store/actions';
import { BADGES, rankInfo, ratingOf, streakOf, xpProgress } from '../lib/gamification';
import { DEFAULT_AVATAR, FREE_AVATARS, FRAMES, PREMIUM_AVATARS, RATING_FRAMES, titleById } from '../lib/shop';
import { cx, fmt } from '../lib/utils';
import { haptic } from '../lib/telegram';
import { A, navigate } from '../lib/router';
import { Button, Card, Empty, PageHeader, Pill, ProgressBar, Section, StatTile } from '../components/ui';
import { Avatar, FramedEmoji } from '../components/Avatar';
import { Icon } from '../components/Icon';

function daysLeft(iso?: string): number {
  if (!iso) return 0;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / (24 * 3600 * 1000)));
}

export function Profile() {
  const s = useApp();
  const p = s.profile;
  if (!p) return null;

  const rating = ratingOf(s);
  const rank = rankInfo(rating);
  const xp = xpProgress(s.xp);
  const streak = streakOf(s.activity);
  const equippedAvatar = s.shop.equipped.avatar ?? DEFAULT_AVATAR;
  const equippedTitle = titleById(s.shop.equipped.title);
  const ownedFrames = FRAMES.filter((f) => s.shop.owned[f.id]);

  return (
    <div>
      <PageHeader emoji="🧑‍🚀" title="Profil" subtitle="Reyting, avatar va yutumlaringiz" />

      {/* Hero */}
      <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-indigo-600 to-violet-600 p-5 text-white shadow-lg shadow-indigo-500/25">
        <div className="flex items-center gap-4">
          <div className="rounded-3xl bg-white/15 p-1.5">
            <Avatar emoji={equippedAvatar} size={84} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-extrabold leading-tight">{p.name}</h1>
            {equippedTitle && <p className="mt-0.5 text-sm font-bold text-amber-200">{equippedTitle.name}</p>}
            <p className={cx('mt-1 text-sm font-extrabold', 'text-indigo-100')}>
              <span className="rounded-full bg-white/20 px-2.5 py-0.5">{rank.tier.name}</span>{' '}
              <span className="font-bold">{fmt(rating)} reyting</span>
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-100">
            <span>Tajriba darajasi {xp.level}</span>
            <span>{fmt(s.xp)} XP</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/25" role="progressbar" aria-valuenow={xp.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Keyingi tajriba darajasigacha">
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${xp.pct}%` }} />
          </div>
          {rank.next && (
            <p className="mt-1.5 text-[11px] text-indigo-100">
              Keyingi pog‘ona: <b>{rank.next.name}</b> — yana {fmt(rank.next.min - rating)} reyting
            </p>
          )}
        </div>
      </div>

      {/* Rating frames ladder */}
      <Section title="🏆 Reyting ramkalari" action={<A to="/shop" className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">Do‘kon →</A>}>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {RATING_FRAMES.map((tier) => {
            const unlocked = rating >= tier.min;
            const equipped = s.shop.equipped.frame === `rf-${tier.id}`;
            return (
              <Card key={tier.id} className={cx('!p-3.5 text-center', !unlocked && 'opacity-75')}>
                <div className="flex justify-center">
                  <FramedEmoji emoji={unlocked ? equippedAvatar : '🔒'} frameCls={tier.ring} size={64} className={unlocked ? '' : 'grayscale'} />
                </div>
                <p className={cx('mt-2 text-sm font-extrabold leading-tight', unlocked ? tier.text : 'text-muted')}>{tier.name}</p>
                <p className="mt-0.5 text-xs font-semibold text-muted">{fmt(tier.min)} reyting</p>
                <div className="mt-2.5">
                  {equipped ? (
                    <Button size="sm" variant="secondary" disabled icon="check">Taqilgan</Button>
                  ) : unlocked ? (
                    <Button size="sm" onClick={() => { haptic('success'); equipFrame(`rf-${tier.id}`); }}>Taqish</Button>
                  ) : (
                    <>
                      <Button size="sm" variant="secondary" disabled icon="lock">Yopiq</Button>
                      <p className="mt-1 text-[11px] font-semibold text-muted">yana {fmt(tier.min - rating)}</p>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
        {rank.next && (
          <Card className="mt-3">
            <div className="flex justify-between text-xs font-semibold">
              <span>{rank.tier.name}</span>
              <span className="text-muted">{rank.next.name} · {fmt(rank.next.min)}</span>
            </div>
            <ProgressBar value={rank.pct} className="mt-1.5" color="bg-gradient-to-r from-emerald-400 to-teal-500" label="Reyting progress" />
            <p className="mt-1.5 text-[11px] text-muted">Reyting = 1000 + XP÷3 + o‘yin yulduzlari + nishonlar + janglar natijasi. Darslar, testlar va do‘stona janglar bajarilganda oshadi.</p>
          </Card>
        )}
      </Section>

      {/* Avatars */}
      <Section title="😄 Avatrlar">
        <Card>
          <div className="flex flex-wrap gap-2">
            {FREE_AVATARS.map((e) => {
              const active = equippedAvatar === e;
              return (
                <button
                  key={e}
                  type="button"
                  onClick={() => { haptic('light'); equipAvatar(e); }}
                  aria-label={`Avatar: ${e}`}
                  className={cx(
                    'flex h-12 w-12 items-center justify-center rounded-full border-2 text-2xl transition',
                    active ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/20' : 'border-line hover:border-indigo-300',
                  )}
                >
                  {e}
                </button>
              );
            })}
            {PREMIUM_AVATARS.filter((a) => isOwnedActive(a.id)).map((a) => {
              const active = equippedAvatar === a.emoji;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => { haptic('light'); equipAvatar(a.emoji); }}
                  aria-label={`Premium avatar: ${a.name}`}
                  className={cx(
                    'flex h-12 w-12 items-center justify-center rounded-full border-2 text-2xl transition',
                    active ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/20' : 'border-amber-300/70 hover:border-indigo-300',
                  )}
                >
                  {a.emoji}
                </button>
              );
            })}
          </div>
          <p className="mt-2.5 text-xs text-muted">
            Do‘konda yana {PREMIUM_AVATARS.filter((a) => !isOwnedActive(a.id)).length} ta premium avatar bor — ajdar, bir shox va boshqalar!
          </p>
        </Card>
      </Section>

      {/* Owned frames */}
      <Section title="🎨 Ramkalarim">
        {ownedFrames.length === 0 ? (
          <Empty
            emoji="🛍️"
            title="Hali ramka sotib olinmagan"
            text="Do‘kondan bronza ramkadan boshlab xohlaganingizni tanlang — avatar kattaroq ko‘rinadi!"
            action={<Button onClick={() => navigate('/shop')}>Do‘konga o‘tish</Button>}
          />
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {ownedFrames.map((f) => {
              const active = isOwnedActive(f.id);
              const equipped = s.shop.equipped.frame === f.id;
              const left = daysLeft(s.shop.owned[f.id]?.expiresAt);
              return (
                <Card key={f.id} className={cx('!p-3.5 text-center', !active && 'opacity-70')}>
                  <div className="flex justify-center">
                    <FramedEmoji emoji={equippedAvatar} frameCls={active ? f.cls : 'frame-none'} size={56} />
                  </div>
                  <p className="mt-2 truncate text-sm font-bold">{f.name}</p>
                  <p className="mt-0.5 text-[11px] font-semibold text-muted">{active ? `${left} kun qoldi` : 'Muddati tugadi'}</p>
                  <div className="mt-2.5">
                    {equipped ? (
                      <Button size="sm" variant="secondary" disabled icon="check">Taqilgan</Button>
                    ) : active ? (
                      <Button size="sm" onClick={() => { haptic('success'); equipFrame(f.id); }}>Taqish</Button>
                    ) : (
                      <Button size="sm" onClick={() => renewFrame(f)}>Yangilash</Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Section>

      {/* Quick stats */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <StatTile icon="flame" tone="amber" label="Kunlik seriya" value={`${streak} kun`} />
        <StatTile icon="trophy" tone="violet" label="Nishonlar" value={`${Object.keys(s.badges).length}/${BADGES.length}`} />
        <StatTile icon="swords" tone="emerald" label="Jang g‘alibalari" value={s.battle.wins} hint={`${s.battle.losses} mag‘lubiyat · ${s.battle.draws} durrang`} />
        <StatTile icon="chart" tone="indigo" label="Janglar reytingi" value={`${s.battle.ratingDelta >= 0 ? '+' : ''}${fmt(s.battle.ratingDelta)}`} hint="do‘stona janglardan" />
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <A to="/leaderboard" className="flex items-center gap-3 rounded-3xl border border-line bg-surface p-4 transition hover:border-indigo-300">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300">
            <Icon name="trophy" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold">Reyting jadvali</span>
            <span className="block truncate text-xs text-muted">Boshqa o‘quvchilar bilan solishtiring</span>
          </span>
          <Icon name="right" className="h-4 w-4 text-muted" />
        </A>
        <A to="/progress" className="flex items-center gap-3 rounded-3xl border border-line bg-surface p-4 transition hover:border-indigo-300">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
            <Icon name="chart" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold">To‘liq progress</span>
            <span className="block truncate text-xs text-muted">Testlar, xatolar daftari va barcha nishonlar</span>
          </span>
          <Icon name="right" className="h-4 w-4 text-muted" />
        </A>
      </div>
      {s.coins.balance > 0 && (
        <div className="mt-3">
          <Pill tone="amber" className="!px-3 !py-1.5">🪙 {fmt(s.coins.balance)} Coin — do‘konda sarflang</Pill>
        </div>
      )}
    </div>
  );
}
