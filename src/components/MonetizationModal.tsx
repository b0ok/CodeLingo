import React, { useState } from 'react';
import { Modal } from './Modal';
import { useGame } from '../context/GameContext';
import { sound } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { X, Check, Crown, ShieldCheck, Info } from 'lucide-react';

interface MonetizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Prices from the business plan (US dollars). Stripe replaces the test switch in build plan PR 9.
const PRICES = {
  monthly: { amount: '$6.99', per: '/ month', note: 'Billed monthly' },
  yearly: { amount: '$49.99', per: '/ year', note: 'Just $4.17 a month, save 40%' },
};

const FREE_FEATURES = [
  'Every lesson in all 4 courses',
  '5 life points that refill, plus free practice drills',
  '3 AI check-ins a week',
  'Leagues, streaks, the Feed and the Sandbox',
  'A profile with 20 avatars, 6 banners and 3 featured badges',
];

const PRO_FEATURES = [
  'Unlimited life points',
  '30 AI check-ins a month',
  'Streak repair',
  'Pro profile: gradient banners, avatar frames, status line, pinned code snippet, 6 featured badges',
  'Early access to new courses',
];

export const MonetizationModal: React.FC<MonetizationModalProps> = ({ isOpen, onClose }) => {
  const { stats, setSubscriptionTier } = useGame();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly');

  if (!isOpen) return null;

  const isPro = stats.subscriptionTier === 'pro' || stats.subscriptionTier === 'novice'; // novice: retired plan name
  const price = PRICES[billing];

  const choose = (tier: 'free' | 'pro') => {
    setSubscriptionTier(tier);
    if (tier === 'pro') {
      sound.playVictory();
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 }, disableForReducedMotion: true });
    }
    onClose();
  };

  return (
    <Modal className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" label="Plans" onClose={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-3xl w-full max-h-dvh sm:max-h-[90vh] overflow-y-auto overscroll-contain shadow-2xl">
        <div className="p-6 sm:p-8 pb-2 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Plans</h2>
            <p className="text-slate-600">Learn free forever, or go Pro to remove the limits.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-2 text-slate-500 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Billing period */}
        <div className="px-6 sm:px-8 pt-2">
          <div role="group" aria-label="Billing period" className="inline-flex p-1 bg-slate-100 rounded-2xl">
            {(['monthly', 'yearly'] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                aria-pressed={billing === b}
                className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer ${billing === b ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
              >
                {b === 'monthly' ? 'Monthly' : 'Yearly · save 40%'}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-8 pt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Free */}
          <div className="rounded-2xl p-6 border border-slate-200 flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-slate-900">Free</h3>
              <ShieldCheck className="w-5 h-5 text-slate-500" aria-hidden="true" />
            </div>
            <p className="my-3"><span className="text-3xl font-extrabold text-slate-900 tabular-nums">$0</span></p>
            <ul className="space-y-2.5 border-t border-slate-200 pt-4 mb-6 flex-1">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" /> {f}
                </li>
              ))}
            </ul>
            {isPro ? (
              <button onClick={() => choose('free')} className="w-full py-3 rounded-xl font-bold text-sm border-2 border-slate-300 text-slate-800 hover:bg-slate-50 cursor-pointer">
                Switch to Free
              </button>
            ) : (
              <p className="w-full py-3 rounded-xl font-bold text-sm text-center bg-slate-100 text-slate-600">Your current plan</p>
            )}
          </div>

          {/* Pro */}
          <div className="rounded-2xl p-6 border-2 border-emerald-500 bg-emerald-50/40 flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-slate-900">Pro</h3>
              <Crown className="w-5 h-5 text-emerald-600" aria-hidden="true" />
            </div>
            <p className="mt-3">
              <span className="text-3xl font-extrabold text-slate-900 tabular-nums">{price.amount}</span>
              <span className="text-sm text-slate-600"> {price.per}</span>
            </p>
            <p className="text-sm text-slate-600 mb-3">{price.note}. 7-day free trial.</p>
            <ul className="space-y-2.5 border-t border-emerald-200 pt-4 mb-6 flex-1">
              <li className="text-sm font-bold text-slate-900">Everything in Free, plus:</li>
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" /> {f}
                </li>
              ))}
            </ul>
            {isPro ? (
              <p className="w-full py-3 rounded-xl font-bold text-sm text-center bg-emerald-100 text-emerald-800">Your current plan</p>
            ) : (
              <button onClick={() => choose('pro')} className="w-full py-3 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer">
                Start 7-day free trial
              </button>
            )}
          </div>
        </div>

        {/* Founder offer */}
        <div className="mx-6 sm:mx-8 mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-900">
          <p className="font-extrabold">Founding member offer</p>
          <p>
            The first 100 subscribers get Pro for <strong>$39.99 a year</strong> <span className="line-through">$49.99</span>, locked in for as long as they stay, plus a permanent Founder badge.
          </p>
        </div>

        <div className="p-5 bg-slate-50 border-t border-slate-200 sm:rounded-b-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-slate-600">
          <p className="flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>Test mode: payments aren't connected yet, so these buttons switch plans instantly with no charge.</span>
          </p>
          <span className="font-bold text-slate-700 shrink-0">Cancel anytime</span>
        </div>
      </div>
    </Modal>
  );
};
