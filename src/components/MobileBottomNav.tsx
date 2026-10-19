import React from 'react';
import { BookOpen, Dumbbell, Trophy, Award, Terminal, ChefHat } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'learn' | 'practice' | 'challenges' | 'leagues' | 'badges' | 'playground';
  setActiveTab: (tab: 'learn' | 'practice' | 'challenges' | 'leagues' | 'badges' | 'playground') => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const items = [
    { id: 'learn' as const, label: 'Learn', icon: BookOpen },
    { id: 'practice' as const, label: 'Practice', icon: Dumbbell },
    { id: 'challenges' as const, label: 'Cook', icon: ChefHat },
    { id: 'leagues' as const, label: 'Leagues', icon: Trophy },
    { id: 'badges' as const, label: 'Badges', icon: Award },
    { id: 'playground' as const, label: 'Sandbox', icon: Terminal },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200">
      <div className="grid grid-cols-6 items-center h-16 max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] py-1 cursor-pointer transition-colors relative ${
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
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
