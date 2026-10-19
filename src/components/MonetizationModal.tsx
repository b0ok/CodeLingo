import React from 'react';
import { Modal } from './Modal';
import { useGame } from '../context/GameContext';
import { SubscriptionTier } from '../types';
import { sound } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { X, Check, Sparkles, Zap, Flame, Crown, Terminal, ShieldCheck, Heart } from 'lucide-react';

interface MonetizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MonetizationModal: React.FC<MonetizationModalProps> = ({ isOpen, onClose }) => {
  const { stats, setSubscriptionTier } = useGame();

  if (!isOpen) return null;

  const handleSelectTier = (tier: SubscriptionTier) => {
    sound.playVictory();
    setSubscriptionTier(tier);
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
    });
    onClose();
  };

  const tiers: Array<{
    id: SubscriptionTier;
    name: string;
    price: string;
    badge: string;
    description: string;
    popular?: boolean;
    color: string;
    features: string[];
    cta: string;
  }> = [
    {
      id: 'free',
      name: 'Free Starter',
      price: '$0',
      badge: 'Current Standard',
      description: 'Everything you need to build a consistent coding habit.',
      color: 'border-slate-200 bg-white',
      features: [
        '5 Hearts / day with practice refill drills',
        'Full access to all 4 Language Pathways (Python, JS, SQL, Web)',
        'Weekly Competitive Bronze-Diamond Leagues',
        'Standard Sandbox Playground',
        'Daily Streak & Goal Tracker',
      ],
      cta: stats.subscriptionTier === 'free' ? 'Current Plan' : 'Downgrade to Free',
    },
    {
      id: 'novice',
      name: 'Novice Coder',
      price: '$4.99/mo',
      badge: 'Most Popular',
      popular: true,
      description: 'Zero heart anxiety, personalized review drills, and fast progress.',
      color: 'border-amber-400 bg-gradient-to-b from-amber-50/50 to-white shadow-md ring-2 ring-amber-400/40',
      features: [
        '♾️ UNLIMITED Hearts — never fail or wait to practice',
        '1 Free Streak Freeze recharged every week',
        'Bug Slaying & Syntax Sprint Practice Gauntlets',
        'Novice Timed Challenge Mode (+50% XP Boost)',
        'Personalized Mistake Review Drills',
      ],
      cta: stats.subscriptionTier === 'novice' ? 'Active Plan' : 'Upgrade to Novice',
    },
    {
      id: 'pro',
      name: 'Pro "LET ME COOK"',
      price: '$11.99/mo',
      badge: 'Ultimate Dev Power',
      description: 'The hardcore developer tier for mastery, clean code grading, and speed.',
      color: 'border-emerald-500 bg-gradient-to-b from-emerald-50/60 to-white shadow-lg ring-2 ring-emerald-500/40',
      features: [
        '♾️ Unlimited Hearts & Double XP Multiplier',
        '👨‍🍳 Exclusive "LET ME COOK" Terminal Matrix Arena',
        'Automated Cleanliness & Algorithmic Efficiency Scorecard',
        'PEP8 & Cyclomatic Complexity Code Analysis',
        'Weekly Boss & Monthly Grand Tournament Access',
        'Verified Shareable Mastery Certificates',
      ],
      cta: stats.subscriptionTier === 'pro' ? 'Active Plan' : 'Unlock Pro Cook',
    },
  ];

  return (
    <Modal className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" label="Membership and pricing" onClose={onClose}>
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-6 pb-2 sm:p-8 sm:pb-4 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
              <Crown className="w-4 h-4 text-amber-500" />
              <span>Membership & Pricing</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Fuel Your Coding Journey
            </h2>
            <p className="text-sm text-slate-500 max-w-xl">
              Learn for free forever, or upgrade for unlimited hearts, personalized review drills, and the hardcore <strong>LET ME COOK</strong> efficiency arena.
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 text-slate-500 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plan Cards Grid */}
        <div className="p-6 sm:p-8 pt-4 grid grid-cols-1 md:grid-cols-3 gap-5">
          {tiers.map((tier) => {
            const isCurrent = stats.subscriptionTier === tier.id;

            return (
              <div
                key={tier.id}
                className={`rounded-2xl p-6 border flex flex-col justify-between transition relative ${tier.color}`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white font-extrabold text-xs uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                    {tier.badge}
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-slate-900">{tier.name}</h3>
                    {tier.id === 'pro' && <Terminal className="w-5 h-5 text-emerald-600" />}
                    {tier.id === 'novice' && <Zap className="w-5 h-5 text-amber-500" />}
                    {tier.id === 'free' && <ShieldCheck className="w-5 h-5 text-slate-500" />}
                  </div>

                  <div className="flex items-baseline gap-1 my-3">
                    <span className="text-3xl font-extrabold text-slate-900">{tier.price}</span>
                    {tier.price !== '$0' && <span className="text-xs text-slate-500 font-medium">/ month</span>}
                  </div>

                  <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                    {tier.description}
                  </p>

                  <div className="space-y-2.5 border-t border-slate-200/80 pt-4 mb-6">
                    {tier.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleSelectTier(tier.id)}
                  disabled={isCurrent}
                  className={`w-full py-3 rounded-xl font-bold text-xs tracking-wide transition cursor-pointer min-h-[44px] ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-500 cursor-default border border-slate-200'
                      : tier.id === 'pro'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 active:scale-95'
                      : tier.id === 'novice'
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 active:scale-95'
                      : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-95'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : tier.cta}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Guarantee */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 rounded-b-3xl flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>Interactive prototype mode: Click any tier to switch plans instantly and test features!</span>
          </div>
          <span className="font-semibold text-slate-700">Cancel or switch anytime</span>
        </div>

      </div>
    </Modal>
  );
};
