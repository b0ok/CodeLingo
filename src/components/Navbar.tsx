import React from 'react';
import { Flame, Gem, Heart, Volume2, VolumeX, ShoppingBag } from 'lucide-react';
import { useGame } from '../context/GameContext';

export type ActiveTab = 'learn' | 'practice' | 'leaderboard' | 'badges' | 'playground';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenShop: () => void;
  onOpenHeartRefill: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenShop,
  onOpenHeartRefill,
}) => {
  const { stats, toggleSound } = useGame();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2 shrink-0 cursor-pointer" onClick={() => setActiveTab('learn')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-sm text-white">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" stroke="none">
              <path d="M11.95 2C6.44 2 6.8 4.39 6.8 4.39L6.81 6.86H12.1V7.61H4.41S2 7.33 2 12.87C2 18.41 4.1 18.14 4.1 18.14H6.28V15.71C6.28 12.39 8.99 12.48 8.99 12.48H14.28V11.73H8.99V10.22H16.89S21.6 10.5 21.6 4.96C21.6-.58 19.49-.3 19.49-.3L17.31-.3V2.13C17.31 5.45 14.6 5.36 14.6 5.36H9.31V6.11H14.6V7.62H6.71V6.86H11.95V2M9.16 3.42C9.69 3.42 10.12 3.85 10.12 4.38C10.12 4.91 9.69 5.34 9.16 5.34C8.63 5.34 8.2 4.91 8.2 4.38C8.2 3.85 8.63 3.42 9.16 3.42M14.84 20.58C14.31 20.58 13.88 20.15 13.88 19.62C13.88 19.09 14.31 18.66 14.84 18.66C15.37 18.66 15.8 19.09 15.8 19.62C15.8 20.15 15.37 20.58 14.84 20.58Z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap">
            Py<span className="text-emerald-600">Lingo</span>
          </span>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('learn')}
            className={`transition-colors whitespace-nowrap py-1 ${
              activeTab === 'learn'
                ? 'text-emerald-600 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-slate-900'
            }`}
          >
            Learn
          </button>
          <button
            onClick={() => setActiveTab('practice')}
            className={`transition-colors whitespace-nowrap py-1 ${
              activeTab === 'practice'
                ? 'text-emerald-600 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-slate-900'
            }`}
          >
            Practice
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`transition-colors whitespace-nowrap py-1 ${
              activeTab === 'leaderboard'
                ? 'text-emerald-600 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-slate-900'
            }`}
          >
            Leagues
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`transition-colors whitespace-nowrap py-1 ${
              activeTab === 'badges'
                ? 'text-emerald-600 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-slate-900'
            }`}
          >
            Badges
          </button>
          <button
            onClick={() => setActiveTab('playground')}
            className={`transition-colors whitespace-nowrap py-1 ${
              activeTab === 'playground'
                ? 'text-emerald-600 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-slate-900'
            }`}
          >
            Playground
          </button>
        </nav>

        {/* Zone 3: Gamified Stats & Actions */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Streak Indicator */}
          <div
            className="flex items-center gap-1.5 text-sm font-bold text-amber-600 cursor-pointer hover:opacity-80 transition-opacity"
            title={`${stats.streak}-day streak!`}
          >
            <Flame className="w-5 h-5 fill-amber-500 text-amber-500 animate-pulse" />
            <span className="tabular-nums">{stats.streak}</span>
          </div>

          {/* Gems */}
          <div
            onClick={onOpenShop}
            className="flex items-center gap-1.5 text-sm font-bold text-cyan-600 cursor-pointer hover:opacity-80 transition-opacity"
            title={`${stats.gems} gems - Click to visit shop`}
          >
            <Gem className="w-5 h-5 fill-cyan-500 text-cyan-500" />
            <span className="tabular-nums">{stats.gems}</span>
          </div>

          {/* Hearts */}
          <div
            onClick={onOpenHeartRefill}
            className="flex items-center gap-1.5 text-sm font-bold text-rose-500 cursor-pointer hover:opacity-80 transition-opacity"
            title={`${stats.hearts}/${stats.maxHearts} hearts - Click to refill`}
          >
            <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            <span className="tabular-nums">{stats.hearts}</span>
          </div>

          {/* Audio Sound Toggle */}
          <button
            onClick={toggleSound}
            aria-label="Toggle Sound"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {stats.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Shop Button */}
          <button
            onClick={onOpenShop}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Shop</span>
          </button>
        </div>
      </div>
    </header>
  );
};
