import React from 'react';
import { BookOpen, Dumbbell, Trophy, UserRound, ChefHat } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'learn' | 'practice' | 'challenges' | 'leagues' | 'profile';
  setActiveTab: (tab: 'learn' | 'practice' | 'challenges' | 'leagues' | 'profile') => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const items = [
    { id: 'learn' as const, label: 'Learn', icon: BookOpen },
    { id: 'practice' as const, label: 'Practice', icon: Dumbbell },
    { id: 'challenges' as const, label: 'Challenges', icon: ChefHat },
    { id: 'leagues' as const, label: 'Leagues', icon: Trophy },
    { id: 'profile' as const, label: 'Profile', icon: UserRound },
  ];

  return (
    <nav aria-label="Main" className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200">
      <div className="flex items-stretch justify-around h-16 max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex-auto flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-1 py-1 cursor-pointer transition-colors relative ${
                isActive
                  ? 'text-emerald-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                )}
              </div>
              <span className="text-xs mt-1 tracking-tight whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
