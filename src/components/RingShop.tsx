import React, { useState } from 'react';
import { Modal } from './Modal';
import { useGame } from '../context/GameContext';
import { ECONOMY } from '../data/economy';
import { AVATARS, BANNERS, FRAMES, SHOP_PRICES } from '../data/profileOptions';
import { Check, Circle, Heart, ShieldCheck, X } from 'lucide-react';

const Rings: React.FC<{ n: number }> = ({ n }) => (
  <span className="inline-flex items-center gap-1 tabular-nums">
    <Circle strokeWidth={3} className="w-3.5 h-3.5 text-yellow-500" aria-hidden="true" />
    {n}
  </span>
);

export const RingShop: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { stats, buyItem, updateProfile, refillHeartsWithGems, buyStreakFreeze } = useGame();
  const owned = stats.ownedItems || [];
  const [confirming, setConfirming] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const unlimitedLife = stats.subscriptionTier !== 'free';

  // Two taps to spend: the first turns the price into a confirm, the second buys. One button, so focus stays put.
  const buyButton = (id: string, label: string, price: number, onBought: () => void) => {
    if (stats.gems < price) {
      return <p className="text-xs font-bold text-slate-600 tabular-nums">Need {price - stats.gems} more</p>;
    }
    const armed = confirming === id;
    return (
      <button
        onClick={() => { if (armed) { setConfirming(null); onBought(); } else setConfirming(id); }}
        onBlur={() => armed && setConfirming(null)}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${armed ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'border-2 border-amber-300 text-amber-900 hover:bg-amber-50'}`}
        aria-label={armed ? `Confirm: spend ${price} gold rings on ${label}` : `Buy ${label} for ${price} gold rings`}
      >
        {armed ? 'Confirm ' : ''}<Rings n={price} />
      </button>
    );
  };

  const cosmetic = (kind: 'avatar' | 'frame' | 'banner', item: { id: string; label: string }, preview: React.ReactNode) => {
    const has = owned.includes(item.id);
    const equip = () => {
      updateProfile(kind === 'avatar' ? { avatar: item.id } : kind === 'frame' ? { frame: item.id } : { banner: item.id });
      setNote(`${item.label} is on your profile now.`);
    };
    return (
      <li key={item.id} className="p-3 bg-white border border-slate-200 rounded-2xl flex flex-col items-center gap-2 text-center">
        {preview}
        <p className="text-sm font-bold text-slate-900">{item.label}</p>
        {has ? (
          <button onClick={equip} aria-label={`Owned. Use ${item.label}`} className="px-3 py-1.5 rounded-xl text-xs font-bold border-2 border-slate-300 text-slate-800 hover:bg-slate-50 cursor-pointer inline-flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" /> Use
          </button>
        ) : (
          buyButton(item.id, item.label, SHOP_PRICES[kind], () => {
            if (buyItem(item.id, SHOP_PRICES[kind])) setNote(`You bought ${item.label}. Tap "Use" to put it on your profile.`);
          })
        )}
      </li>
    );
  };

  return (
    <Modal className="fixed inset-0 z-50 bg-slate-900/60 flex items-end sm:items-center justify-center p-0 sm:p-4" label="Ring shop" onClose={onClose}>
      <div className="w-full max-w-2xl bg-slate-50 rounded-t-3xl sm:rounded-3xl max-h-dvh sm:max-h-[90vh] overflow-y-auto overscroll-contain">
        <div className="sticky top-0 z-10 p-5 bg-white border-b border-slate-200 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Ring shop</h2>
            <p className="text-sm text-slate-600">Earn gold rings by learning. Spend them here.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl font-extrabold text-amber-900" aria-label={`You have ${stats.gems} gold rings`}>
              <Rings n={stats.gems} />
            </span>
            <button onClick={onClose} aria-label="Close" className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {note && <p role="status" className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-bold text-emerald-800">{note}</p>}

          <section aria-labelledby="shop-powerups" className="space-y-2">
            <h3 id="shop-powerups" className="font-extrabold text-slate-900">Power-ups</h3>
            <ul className="grid sm:grid-cols-2 gap-3">
              <li className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-3">
                <Heart className="w-6 h-6 text-rose-500 fill-rose-500 shrink-0" aria-hidden="true" />
                <div className="flex-1">
                  <p className="font-bold text-slate-900">Refill life points</p>
                  <p className="text-xs text-slate-600 tabular-nums">{unlimitedLife ? 'Unlimited with Pro' : `${stats.hearts} of ${stats.maxHearts} now`}</p>
                </div>
                {!unlimitedLife && stats.hearts < stats.maxHearts ? (
                  buyButton('refill', 'a life point refill', ECONOMY.prices.refill, () => { if (refillHeartsWithGems()) setNote('Life points refilled.'); })
                ) : (
                  <p className="text-xs font-bold text-slate-600">Full</p>
                )}
              </li>
              <li className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-sky-600 shrink-0" aria-hidden="true" />
                <div className="flex-1">
                  <p className="font-bold text-slate-900">Streak freeze</p>
                  <p className="text-xs text-slate-600 tabular-nums">Saves your streak on a missed day · {stats.streakFreeze} owned</p>
                </div>
                {buyButton('freeze', 'a streak freeze', ECONOMY.prices.streakFreeze, () => { if (buyStreakFreeze()) setNote('Streak freeze added.'); })}
              </li>
            </ul>
          </section>

          <section aria-labelledby="shop-avatars" className="space-y-2">
            <h3 id="shop-avatars" className="font-extrabold text-slate-900">Avatars</h3>
            <ul className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {AVATARS.filter((a) => a.shop).map((a) => cosmetic('avatar', a, <span className="text-4xl" aria-hidden="true">{a.emoji}</span>))}
            </ul>
          </section>

          <section aria-labelledby="shop-frames" className="space-y-2">
            <h3 id="shop-frames" className="font-extrabold text-slate-900">Avatar frames</h3>
            <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {FRAMES.filter((f) => f.shop).map((f) => cosmetic('frame', f, <span className={`w-10 h-10 m-1 rounded-full bg-slate-100 ${f.className}`} aria-hidden="true" />))}
            </ul>
          </section>

          <section aria-labelledby="shop-banners" className="space-y-2">
            <h3 id="shop-banners" className="font-extrabold text-slate-900">Banners</h3>
            <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {BANNERS.filter((b) => b.shop).map((b) => cosmetic('banner', b, <span className={`w-full h-10 rounded-xl ${b.className}`} aria-hidden="true" />))}
            </ul>
          </section>

          <p className="text-xs text-slate-600">Gold rings can't be bought with money. Shop items are separate from Pro's gradients and frames.</p>
        </div>
      </div>
    </Modal>
  );
};
