import React from 'react';
import { useGame } from '../context/GameContext';
import { LEAGUE_CONFIG } from '../data/leaderboard';
import { BadgesView } from './BadgesView';

export const ProfileView: React.FC = () => {
  const { stats, leaderboard, currentLeague } = useGame();
  const me = leaderboard.find((u) => u.isUser);
  const unlimited = stats.subscriptionTier === 'novice' || stats.subscriptionTier === 'pro';

  const tiles = [
    { label: 'Total XP', value: stats.xp.toLocaleString() },
    { label: 'Day streak', value: `${stats.streak} (best ${stats.highestStreak})` },
    { label: 'League', value: `${LEAGUE_CONFIG[currentLeague].icon} ${currentLeague}` },
    { label: 'Gold rings', value: stats.gems.toLocaleString() },
    { label: 'Life points', value: unlimited ? '∞' : `${stats.hearts} / ${stats.maxHearts}` },
    { label: 'Lessons done', value: stats.completedLessons.length.toLocaleString() },
  ];

  return (
    <div className="space-y-6">
      <section aria-labelledby="profile-heading" className="max-w-3xl mx-auto p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-extrabold shrink-0" aria-hidden="true">
            {(me?.name || 'You').charAt(0)}
          </div>
          <div className="min-w-0">
            <h2 id="profile-heading" className="text-2xl font-extrabold text-slate-900 tracking-tight truncate">
              {me?.name || 'You'}
            </h2>
            <p className="text-sm text-slate-500">{me?.username}</p>
          </div>
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
          {tiles.map((t) => (
            <div key={t.label} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <dt className="text-xs font-bold text-slate-500 uppercase">{t.label}</dt>
              <dd className="text-lg font-extrabold text-slate-900 tabular-nums mt-0.5">{t.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <BadgesView />
    </div>
  );
};
