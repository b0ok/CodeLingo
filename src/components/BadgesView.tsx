import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Badge } from '../types';
import { Award, Flame, Terminal, Box, GitBranch, Repeat, Layers, Sparkles, ShieldAlert, Heart, Trophy, Lock, Check } from 'lucide-react';

export const BadgesView: React.FC = () => {
  const { badges } = useGame();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [inspectBadge, setInspectBadge] = useState<Badge | null>(null);

  const filteredBadges = badges.filter((b) => {
    if (selectedFilter === 'unlocked') return b.isUnlocked;
    if (selectedFilter === 'locked') return !b.isUnlocked;
    return true;
  });

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;

  const renderBadgeIcon = (iconType: string, className: string = 'w-6 h-6') => {
    switch (iconType) {
      case 'terminal': return <Terminal className={className} />;
      case 'flame': return <Flame className={className} />;
      case 'flame-silver': return <Flame className={className} />;
      case 'box': return <Box className={className} />;
      case 'git-branch': return <GitBranch className={className} />;
      case 'repeat': return <Repeat className={className} />;
      case 'layers': return <Layers className={className} />;
      case 'sparkles': return <Sparkles className={className} />;
      case 'shield-alert': return <ShieldAlert className={className} />;
      case 'heart': return <Heart className={className} />;
      case 'trophy': return <Trophy className={className} />;
      default: return <Award className={className} />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 md:pb-12">
      
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-white border border-amber-200/80 rounded-3xl shadow-sm flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
            Concept Mastery & Achievements
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Developer Trophy Room
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Unlock badges as you master programming building blocks and build coding consistency.
          </p>
        </div>

        <div className="text-center bg-white p-4 rounded-2xl border border-amber-200 shadow-sm shrink-0">
          <div className="text-2xl font-black text-amber-600 tabular-nums">
            {unlockedCount} / {badges.length}
          </div>
          <div className="text-[11px] font-bold text-slate-500 uppercase mt-0.5">Unlocked</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl max-w-xs">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            selectedFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          All ({badges.length})
        </button>
        <button
          onClick={() => setSelectedFilter('unlocked')}
          className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            selectedFilter === 'unlocked' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Unlocked ({unlockedCount})
        </button>
        <button
          onClick={() => setSelectedFilter('locked')}
          className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            selectedFilter === 'locked' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Locked ({badges.length - unlockedCount})
        </button>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredBadges.map((badge) => {
          const progressPercent = Math.min(100, (badge.currentProgress / badge.maxProgress) * 100);

          return (
            <div
              key={badge.id}
              onClick={() => setInspectBadge(badge)}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative group ${
                badge.isUnlocked
                  ? 'bg-white border-amber-300 hover:border-amber-400 shadow-sm hover:shadow-md'
                  : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 opacity-90'
              }`}
            >
              {/* Top Medal Crest */}
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                    badge.isUnlocked
                      ? badge.tier === 'gold'
                        ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-white shadow-amber-500/20'
                        : badge.tier === 'silver'
                        ? 'bg-gradient-to-tr from-slate-400 to-slate-200 text-slate-900 shadow-slate-400/20'
                        : 'bg-gradient-to-tr from-amber-700 to-amber-500 text-white shadow-amber-700/20'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {renderBadgeIcon(badge.iconType, 'w-6 h-6')}
                </div>

                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    badge.isUnlocked
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {badge.tier}
                </span>
              </div>

              {/* Title & Desc */}
              <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                {badge.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {badge.description}
              </p>

              {/* Progress bar */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                  <span>Progress</span>
                  <span className="tabular-nums">
                    {badge.currentProgress} / {badge.maxProgress}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      badge.isUnlocked ? 'bg-amber-500' : 'bg-slate-300'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspect Badge Modal */}
      {inspectBadge && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 text-center space-y-5 shadow-2xl relative">
            <div
              className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center shadow-lg ${
                inspectBadge.isUnlocked
                  ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-white'
                  : 'bg-slate-200 text-slate-400'
              }`}
            >
              {renderBadgeIcon(inspectBadge.iconType, 'w-10 h-10')}
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase text-amber-700 tracking-wider">
                {inspectBadge.tier} Tier · {inspectBadge.category}
              </span>
              <h3 className="text-2xl font-black text-slate-900">{inspectBadge.name}</h3>
              <p className="text-xs text-slate-600">{inspectBadge.description}</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
              <div className="font-semibold text-slate-700">Requirement:</div>
              <div className="text-slate-500">{inspectBadge.requirement}</div>
              <div className="font-bold text-emerald-600 pt-1">
                {inspectBadge.isUnlocked ? '✓ Unlocked!' : `Current: ${inspectBadge.currentProgress} / ${inspectBadge.maxProgress}`}
              </div>
            </div>

            <button
              onClick={() => setInspectBadge(null)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
