import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { LEAGUE_CONFIG } from '../data/leaderboard';
import { BadgesView } from './BadgesView';
import { AccountDialog } from './Onboarding';
import { supabase, useSession } from '../utils/supabase';

export const ProfileView: React.FC = () => {
  const { stats, leaderboard, currentLeague } = useGame();
  const me = leaderboard.find((u) => u.isUser);
  const unlimited = stats.subscriptionTier === 'novice' || stats.subscriptionTier === 'pro';
  const session = useSession();
  const [accountMode, setAccountMode] = useState<'create' | 'signin' | null>(null);

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

      {supabase && (
        <section aria-labelledby="account-heading" className="max-w-3xl mx-auto p-5 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 id="account-heading" className="font-extrabold text-slate-900">Account</h3>
            <p className="text-sm text-slate-600 [overflow-wrap:anywhere]">
              {session ? `Signed in as ${session.user.email}` : 'Create a free account to keep your progress safe.'}
            </p>
          </div>
          {session ? (
            <button onClick={() => supabase!.auth.signOut()} className="px-4 py-2 border-2 border-slate-300 rounded-xl font-bold text-slate-800 hover:bg-slate-50 cursor-pointer">
              Sign out
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setAccountMode('signin')} className="px-4 py-2 border-2 border-slate-300 rounded-xl font-bold text-slate-800 hover:bg-slate-50 cursor-pointer">Sign in</button>
              <button onClick={() => setAccountMode('create')} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer">Create account</button>
            </div>
          )}
        </section>
      )}
      {accountMode && <AccountDialog mode={accountMode} onClose={() => setAccountMode(null)} />}

      <BadgesView />
    </div>
  );
};
