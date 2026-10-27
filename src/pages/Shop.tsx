import { useState } from 'react';
import { useApp } from '../store/store';
import { buyAvatar, buyFrame, buyFreeze, buyTitle, buyXpBoost, claimQuest, equipAvatar, equipTitle, isOwnedActive, isXpBoosted, openChest, renewFrame } from '../store/actions';
import {
  CHEST_PRICE, FREEZE_PRICE, FRAME_DAYS, FRAMES, FREE_AVATARS, PREMIUM_AVATARS, TITLES, XP_BOOST_HOURS, XP_BOOST_PRICE,
  chestRewardText, questStateOf, todaysQuests,
  type ChestReward, type FrameItem,
} from '../lib/shop';
import { pct, cx, fmt } from '../lib/utils';
import { haptic } from '../lib/telegram';
import { Button, Card, Modal, PageHeader, Pill, ProgressBar, Section, Tabs } from '../components/ui';
import { FramedEmoji } from '../components/Avatar';
import { Icon } from '../components/Icon';
import { Confetti } from '../components/Mascot';

type TabId = 'frames' | 'avatars' | 'titles' | 'gifts';

const REWARD_EMOJI: Record<ChestReward['kind'], string> = { coins: '🪙', xp: '⭐', freeze: '🧊' };

function CoinPill({ price }: { price: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-extrabold text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
      🪙 {fmt(price)}
    </span>
  );
}

function FrameCard({ item, avatarEmoji }: { item: FrameItem; avatarEmoji: string }) {
  const s = useApp();
  const owned = isOwnedActive(item.id);
  const expired = !!s.shop.owned[item.id] && !owned;
  const equipped = s.shop.equipped.frame === item.id;
  const affordable = s.coins.balance >= item.price;

  let action;
  if (owned && equipped) {
    action = <Button size="sm" variant="secondary" disabled icon="check">Taqilgan</Button>;
  } else if (owned) {
    action = <Button size="sm" variant="secondary" onClick={() => buyFrame(item)}>Taqish</Button>;
  } else if (expired) {
    action = <Button size="sm" onClick={() => renewFrame(item)} disabled={!affordable}>{affordable ? 'Yangilash' : <><Icon name="lock" className="h-3.5 w-3.5" /> Yangilash</>}</Button>;
  } else {
    action = (
      <Button size="sm" onClick={() => buyFrame(item)} disabled={!affordable}>
        {affordable ? 'Sotib olish' : <><Icon name="lock" className="h-3.5 w-3.5" /> Yopiq</>}
      </Button>
    );
  }

  return (
    <Card className="!p-3.5 text-center">
      <div className="flex justify-center">
        <FramedEmoji emoji={avatarEmoji} frameCls={item.cls} size={72} />
      </div>
      <p className="mt-2 truncate text-sm font-bold">{item.name}</p>
      <div className="mt-1.5 flex items-center justify-center gap-1.5">
        <CoinPill price={item.price} />
        <Pill tone="neutral">7 kun</Pill>
      </div>
      <div className="mt-3">{action}</div>
    </Card>
  );
}

export function Shop() {
  const s = useApp();
  const [tab, setTab] = useState<TabId>('frames');
  const [chest, setChest] = useState<{ phase: 'shake' | 'done'; reward: ChestReward } | null>(null);

  const balance = s.coins.balance;
  const avatarEmoji = s.shop.equipped.avatar ?? '🙂';
  const quests = todaysQuests();
  const qs = questStateOf(s);
  const boosted = isXpBoosted(s);
  const boostLeft = boosted && s.shop.xpBoostUntil ? Math.max(1, Math.ceil((new Date(s.shop.xpBoostUntil).getTime() - Date.now()) / 3600000)) : 0;

  function handleOpenChest() {
    const reward = openChest();
    if (!reward) return;
    setChest({ phase: 'shake', reward });
    window.setTimeout(() => setChest((c) => (c ? { ...c, phase: 'done' } : null)), 950);
  }

  return (
    <div>
      <PageHeader emoji="🛒" title="Do‘kon" subtitle="Coin yig‘ing va o‘zingizni yangilang!" />

      {/* Balance hero */}
      <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-amber-400 to-orange-500 p-5 text-white shadow-lg shadow-amber-500/25">
        <div className="pointer-events-none absolute -right-4 -top-6 text-[7rem] opacity-20 select-none">🪙</div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-amber-100">Sizning hisobingiz</div>
            <div className="mt-1 text-4xl font-black leading-none">{fmt(balance)} 🪙</div>
            <div className="mt-1 text-sm text-amber-100">Coin · vazifalar va o‘yinlarda yig‘iladi</div>
          </div>
          <div className="text-right text-xs font-semibold text-amber-100">
            <div>🎁 {s.shop.chestsOpened} quti ochilgan</div>
            <div className="mt-1">🧊 {s.shop.streakFreezes} muzlatgich</div>
            {boosted && <div className="mt-1">⚡ 2x XP · {boostLeft} soat</div>}
          </div>
        </div>
      </div>

      {/* Daily quests */}
      <Section title="📋 Kunlik vazifalar" action={<Pill tone="amber">Har kuni yangilanadi</Pill>}>
        <div className="space-y-2.5">
          {quests.map((q) => {
            const done = (qs.progress[q.counter] ?? 0) >= q.target;
            const claimed = qs.claimed.includes(q.id);
            return (
              <Card key={q.id} className={cx('!p-3.5', claimed && 'opacity-70')}>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-2xl dark:bg-amber-500/20">{q.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{q.title}</p>
                    <ProgressBar
                      value={pct(Math.min(qs.progress[q.counter] ?? 0, q.target), q.target)}
                      className="mt-1.5 h-2"
                      color="bg-gradient-to-r from-amber-400 to-orange-400"
                      label={q.title}
                    />
                    <p className="mt-1 text-[11px] font-semibold text-muted">{Math.min(qs.progress[q.counter] ?? 0, q.target)}/{q.target}</p>
                  </div>
                  <div className="shrink-0 text-center">
                    <CoinPill price={q.coins} />
                    <Button
                      size="sm"
                      variant={claimed ? 'secondary' : 'success'}
                      className="mt-2"
                      disabled={claimed || !done}
                      icon={claimed ? 'check' : undefined}
                      onClick={() => claimQuest(q.id)}
                    >
                      {claimed ? 'Olingan' : 'Olish'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* Catalog */}
      <Section title="🎁 Katalog">
        <Tabs<TabId>
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'frames', label: 'Ramkalar', icon: 'sparkles' },
            { id: 'avatars', label: 'Avatrlar', icon: 'user' },
            { id: 'titles', label: 'Titullar', icon: 'trophy' },
            { id: 'gifts', label: 'Sovg‘alar', icon: 'gift' },
          ]}
        />

        {tab === 'frames' && (
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wide text-muted">Oddiy</h3>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {FRAMES.filter((f) => f.tier === 'oddiy').map((f) => <FrameCard key={f.id} item={f} avatarEmoji={avatarEmoji} />)}
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wide text-muted">Premium ✨</h3>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {FRAMES.filter((f) => f.tier === 'premium').map((f) => <FrameCard key={f.id} item={f} avatarEmoji={avatarEmoji} />)}
              </div>
            </div>
            <p className="text-xs text-muted">Ramkalar {FRAME_DAYS} kun davom etadi. Muddati tugasa, bir xil narxga “Yangilash” mumkin. Reyting ramkalari esa Profil sahifasida — ular Coin bilan sotilmaydi, reyting yetganda o‘zi ochiladi.</p>
          </div>
        )}

        {tab === 'avatars' && (
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wide text-muted">Bepul</h3>
              <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-8">
                {FREE_AVATARS.map((e) => {
                  const active = (s.shop.equipped.avatar ?? '🙂') === e;
                  return (
                    <button
                      key={e}
                      type="button"
                      onClick={() => { haptic('light'); equipAvatar(e); }}
                      className={cx(
                        'flex flex-col items-center gap-1 rounded-2xl border p-2.5 text-center transition',
                        active ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/15' : 'border-line bg-surface hover:border-indigo-300',
                      )}
                    >
                      <FramedEmoji emoji={e} frameCls="frame-none" size={44} />
                      <span className="text-[10px] font-bold">{active ? 'Tanlangan' : 'Tanlash'}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wide text-muted">Premium</h3>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {PREMIUM_AVATARS.map((a) => {
                  const owned = isOwnedActive(a.id);
                  const equipped = s.shop.equipped.avatar === a.emoji;
                  const affordable = s.coins.balance >= a.price;
                  return (
                    <Card key={a.id} className="!p-3.5 text-center">
                      <div className="flex justify-center"><FramedEmoji emoji={a.emoji} frameCls="frame-none" size={60} /></div>
                      <p className="mt-2 truncate text-sm font-bold">{a.name}</p>
                      <div className="mt-1.5 flex justify-center"><CoinPill price={a.price} /></div>
                      <div className="mt-3">
                        {owned ? (
                          <Button size="sm" variant="secondary" disabled={equipped} icon={equipped ? 'check' : undefined} onClick={() => { haptic('light'); equipAvatar(a.emoji); }}>
                            {equipped ? 'Tanlangan' : 'Tanlash'}
                          </Button>
                        ) : (
                          <Button size="sm" disabled={!affordable} onClick={() => buyAvatar(a)}>
                            {affordable ? 'Sotib olish' : <><Icon name="lock" className="h-3.5 w-3.5" /> Yopiq</>}
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === 'titles' && (
          <div className="mt-4 space-y-2.5">
            <p className="text-xs text-muted">Titul Profil sahifasida ismingiz ostida ko‘rinadi. Faqat bittasini taqish mumkin.</p>
            {TITLES.map((t) => {
              const owned = isOwnedActive(t.id);
              const equipped = s.shop.equipped.title === t.id;
              const affordable = s.coins.balance >= t.price;
              return (
                <Card key={t.id} className="flex items-center gap-3 !p-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{t.name}</p>
                    <div className="mt-1"><CoinPill price={t.price} /></div>
                  </div>
                  {owned ? (
                    equipped ? (
                      <Button size="sm" variant="secondary" disabled icon="check">Taqilgan</Button>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => { haptic('light'); equipTitle(t.id); }}>Taqish</Button>
                    )
                  ) : (
                    <Button size="sm" disabled={!affordable} onClick={() => buyTitle(t)}>
                      {affordable ? 'Sotib olish' : <><Icon name="lock" className="h-3.5 w-3.5" /> Yopiq</>}
                    </Button>
                  )}
                </Card>
              );
            })}
            {s.shop.equipped.title && (
              <Button variant="ghost" size="sm" onClick={() => { haptic('light'); equipTitle(undefined); }}>
                Titulni yechish
              </Button>
            )}
          </div>
        )}

        {tab === 'gifts' && (
          <div className="mt-4 space-y-3">
            {/* Mystery chest */}
            <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-fuchsia-500 to-purple-600 p-5 text-white shadow-lg shadow-purple-500/25">
              <div className="flex items-center gap-4">
                <div className="bounce-soft text-6xl">🎁</div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-extrabold">Sirli quti</h3>
                  <p className="text-sm text-purple-100">Ichida nima bor? Coin, XP yoki muzlatgich chiqishi mumkin!</p>
                  <div className="mt-2 flex items-center gap-2">
                    <CoinPill price={CHEST_PRICE} />
                    <Button size="sm" variant="secondary" className="!bg-white/20 !text-white border-0 hover:!bg-white/30" disabled={s.coins.balance < CHEST_PRICE} onClick={handleOpenChest}>
                      {s.coins.balance < CHEST_PRICE ? <><Icon name="lock" className="h-3.5 w-3.5" /> Yopiq</> : 'Ochish'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* 2x XP booster */}
            <Card className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-2xl dark:bg-amber-500/20">⚡</span>
              <div className="min-w-0 flex-1">
                <p className="font-bold">2x XP — {XP_BOOST_HOURS} soat</p>
                <p className="text-xs text-muted">Barcha mashqlardan olinadigan XP ikki barobar bo‘ladi.</p>
                {boosted && <Pill tone="green" className="mt-1">Faol · {boostLeft} soat qoldi</Pill>}
              </div>
              <div className="shrink-0 text-right">
                <CoinPill price={XP_BOOST_PRICE} />
                <Button size="sm" className="mt-2" disabled={boosted || s.coins.balance < XP_BOOST_PRICE} onClick={buyXpBoost}>
                  {boosted ? 'Faol' : 'Yoqish'}
                </Button>
              </div>
            </Card>

            {/* Streak freeze */}
            <Card className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-2xl dark:bg-sky-500/20">🧊</span>
              <div className="min-w-0 flex-1">
                <p className="font-bold">Kunlik seriya muzlatgichi</p>
                <p className="text-xs text-muted">Bir kun o‘qimasangiz ham seriyangiz uzilmaydi (avtomatik ishlaydi). Hozirda: <b>{s.shop.streakFreezes} ta</b></p>
              </div>
              <div className="shrink-0 text-right">
                <CoinPill price={FREEZE_PRICE} />
                <Button size="sm" className="mt-2" disabled={s.coins.balance < FREEZE_PRICE} onClick={buyFreeze}>Sotib olish</Button>
              </div>
            </Card>
          </div>
        )}
      </Section>

      {/* Chest opening modal */}
      <Modal open={!!chest} onClose={() => setChest(null)} title={chest?.phase === 'done' ? 'Qutidan chiqdi!' : 'Quti ochildi'}>
        {chest && (
          <div className="py-2 text-center">
            {chest.phase === 'shake' ? (
              <div className="chest-shake mx-auto text-8xl">🎁</div>
            ) : (
              <>
                <Confetti />
                <div className="pop-in mx-auto text-8xl">{REWARD_EMOJI[chest.reward.kind]}</div>
                <p className="mt-3 text-2xl font-black">{chestRewardText(chest.reward)}</p>
                <p className="mt-1 text-sm text-muted">Omadingiz keldi! Ertaga yana bir quti ochingiz bo‘ladi 😉</p>
                <Button className="mt-5" full onClick={() => setChest(null)}>Ajoyib!</Button>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
