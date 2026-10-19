import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { LeagueTier } from '../types';
import { LEAGUE_CONFIG } from '../data/leaderboard';
import { Trophy, Flame, ChevronUp, ChevronDown, Minus, HeartHandshake, ShieldAlert } from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const { leaderboard, currentLeague, stats, cheerLeaderboardUser } = useGame();
  const [selectedLeague, setSelectedLeague] = useState<LeagueTier>(currentLeague);

  const leagueTiers: LeagueTier[] = ['Bronze', 'Silver', 'Gold', 'Sapphire', 'Ruby', 'Diamond'];
  const leagueInfo = LEAGUE_CONFIG[selectedLeague];

  // User rank in the current leaderboard
  const userRank = leaderboard.findIndex((u) => u.isUser) + 1;
  const userEntry = leaderboard.find((u) => u.isUser);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 xl:pb-12">
      
      {/* League Header Card */}
      <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl shadow-lg border border-slate-700/60 relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Weekly Tournament</span>
              <span>·</span>
              <span>Season 14</span>
            </span>

            <span className="text-xs font-semibold text-slate-300 tabular-nums">
              Ends in 2d 16h
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-4xl">{leagueInfo.icon}</div>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
                <span>{selectedLeague} League</span>
              </h2>
              <p className="text-xs text-slate-300">
                Top {leagueInfo.promotionSlots} Pythonistas advance to the next league on Sunday!
              </p>
            </div>
          </div>

          {/* Promotion / Position Status Banner */}
          {userRank > 0 && (
            <div className={`p-3 rounded-2xl flex items-center justify-between text-xs font-bold ${
              userRank <= leagueInfo.promotionSlots
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-800/80 text-slate-300 border border-slate-700'
            }`}>
              <div className="flex items-center gap-2">
                {userRank <= leagueInfo.promotionSlots ? (
                  <>
                    <ChevronUp className="w-4 h-4 text-emerald-400" />
                    <span>You're in the Promotion Zone! (Rank #{userRank})</span>
                  </>
                ) : (
                  <>
                    <Minus className="w-4 h-4 text-slate-500" />
                    <span>Current Rank: #{userRank} · Earn {leaderboard[leagueInfo.promotionSlots - 1]?.xp - (userEntry?.xp || 0) + 10} more XP to reach top 5</span>
                  </>
                )}
              </div>
              <span className="tabular-nums font-mono">{userEntry?.xp} XP</span>
            </div>
          )}
        </div>
      </div>

      {/* League Tier Horizontal Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl overflow-x-auto">
        {leagueTiers.map((tier) => {
          const isSelected = selectedLeague === tier;
          const isUserLeague = currentLeague === tier;
          return (
            <button
              key={tier}
              onClick={() => setSelectedLeague(tier)}
              className={`flex-1 min-w-[85px] py-2 px-3 text-xs font-bold rounded-xl transition whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 ${
                isSelected
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>{LEAGUE_CONFIG[tier].icon}</span>
              <span>{tier}</span>
              {isUserLeague && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="flex items-center gap-4">
            <span className="w-6 text-center">#</span>
            <span>Student</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden sm:inline">Streak</span>
            <span>Weekly XP</span>
            <span>Cheer</span>
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-100">
          {leaderboard.map((player, idx) => {
            const rank = idx + 1;
            const isPromotion = rank <= leagueInfo.promotionSlots;
            const isDemotion = rank > leaderboard.length - leagueInfo.demotionSlots && leagueInfo.demotionSlots > 0;

            return (
              <div
                key={player.id}
                className={`flex items-center justify-between px-5 py-4 transition-colors ${
                  player.isUser
                    ? 'bg-emerald-50/80 hover:bg-emerald-50'
                    : 'hover:bg-slate-50/80'
                }`}
              >
                {/* Left: Rank & Avatar & Name */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  {/* Rank number or medal */}
                  <div className="w-6 flex items-center justify-center font-extrabold text-sm tabular-nums">
                    {rank === 1 ? (
                      <span className="text-amber-500 text-base">🥇</span>
                    ) : rank === 2 ? (
                      <span className="text-slate-400 text-base">🥈</span>
                    ) : rank === 3 ? (
                      <span className="text-amber-700 text-base">🥉</span>
                    ) : (
                      <span className={player.isUser ? 'text-emerald-700' : 'text-slate-500'}>
                        {rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${
                    player.isUser
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                      : rank === 1
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {player.name.charAt(0)}
                  </div>

                  {/* Name and Promotion status */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold truncate ${
                        player.isUser ? 'text-emerald-900 font-extrabold' : 'text-slate-800'
                      }`}>
                        {player.name}
                      </span>
                      {player.isUser && (
                        <span className="px-1.5 py-0.5 bg-emerald-200 text-emerald-800 text-xs font-extrabold rounded-md uppercase">
                          YOU
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{player.username}</span>
                      {isPromotion && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-600 font-semibold">Promotion</span>
                        </>
                      )}
                      {isDemotion && (
                        <>
                          <span>·</span>
                          <span className="text-rose-500 font-semibold">Danger</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Streak & XP & Cheer */}
                <div className="flex items-center gap-5 sm:gap-6 shrink-0">
                  {/* Streak */}
                  <div className="hidden sm:flex items-center gap-1 text-orange-600 font-bold text-xs">
                    <Flame className="w-3.5 h-3.5 fill-orange-500" />
                    <span className="tabular-nums">{player.streak}d</span>
                  </div>

                  {/* XP */}
                  <div className="text-right min-w-[65px]">
                    <div className={`text-sm font-extrabold tabular-nums ${
                      player.isUser ? 'text-emerald-700' : 'text-slate-900'
                    }`}>
                      {player.xp}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">XP</div>
                  </div>

                  {/* Cheer button */}
                  <button
                    onClick={() => cheerLeaderboardUser(player.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-50 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Send friendly cheer!"
                  >
                    <HeartHandshake className="w-4 h-4" />
                    {player.cheerCount > 0 && (
                      <span className="text-xs font-bold text-slate-500 tabular-nums">
                        {player.cheerCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info strip */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
          Climb the leaderboard by completing lessons, daily quests, and bug fixes!
        </div>
      </div>
    </div>
  );
};
