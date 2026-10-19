import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { PytoMascot } from './PytoMascot';
import { sound } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { Award, Gem, Sparkles, X } from 'lucide-react';

export const BadgeUnlockModal: React.FC = () => {
  const { newlyUnlockedBadge, dismissBadgeNotification } = useGame();

  useEffect(() => {
    if (newlyUnlockedBadge) {
      sound.playVictory();
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#10b981', '#06b6d4'],
      });
    }
  }, [newlyUnlockedBadge]);

  if (!newlyUnlockedBadge) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border-2 border-amber-300 rounded-3xl max-w-sm w-full p-6 text-center space-y-5 shadow-2xl relative animate-fadeIn">
        <button
          onClick={dismissBadgeNotification}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <PytoMascot mood="celebrating" size="md" className="justify-center" />

        <div className="space-y-1">
          <span className="text-xs font-black uppercase text-amber-600 tracking-wider flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Badge Unlocked!</span>
          </span>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            {newlyUnlockedBadge.name}
          </h3>
          <p className="text-xs text-slate-600">
            {newlyUnlockedBadge.description}
          </p>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-amber-900">
          <Gem className="w-4 h-4 text-cyan-500 fill-cyan-400" />
          <span>Reward: +25 Gems credited to your vault!</span>
        </div>

        <button
          onClick={dismissBadgeNotification}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-extrabold text-sm rounded-xl shadow-md cursor-pointer"
        >
          Claim & Keep Going!
        </button>
      </div>
    </div>
  );
};
