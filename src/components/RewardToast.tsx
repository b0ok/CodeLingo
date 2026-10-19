import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { Circle, X } from 'lucide-react';

// Level-ups, the daily goal and streak milestones: a short note with the rings they paid.
export const RewardToast: React.FC = () => {
  const { rewardEvents, dismissRewardEvents } = useGame();

  // Wait while a lesson or popup is open (they sit above the page), then show for 5 seconds.
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!rewardEvents.length) { setVisible(false); return; }
    let shownFor = 0;
    const timer = setInterval(() => {
      if (document.querySelector('dialog[open]')) return;
      setVisible(true);
      shownFor += 250;
      if (shownFor >= 5000) dismissRewardEvents();
    }, 250);
    return () => clearInterval(timer);
  }, [rewardEvents, dismissRewardEvents]);

  return (
    <div role="status" aria-live="polite" className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] w-full max-w-sm px-4 pointer-events-none">
      {visible && rewardEvents.length > 0 && (
        <div className="pointer-events-auto p-4 bg-white border-2 border-amber-300 rounded-2xl shadow-xl flex items-start gap-3">
          <ul className="flex-1 space-y-1">
            {rewardEvents.map((e) => (
              <li key={e.title} className="flex items-center justify-between gap-3">
                <span className="font-extrabold text-slate-900">{e.title}</span>
                <span className="flex items-center gap-1 text-sm font-bold text-amber-700 tabular-nums">
                  <Circle strokeWidth={3} className="w-3.5 h-3.5 text-yellow-500" aria-hidden="true" />+{e.rings} gold rings
                </span>
              </li>
            ))}
          </ul>
          <button onClick={dismissRewardEvents} aria-label="Dismiss" className="p-1 text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
