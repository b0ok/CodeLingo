import { LeaderboardEntry, LeagueTier } from '../types';

export const LEAGUE_CONFIG: Record<LeagueTier, { name: LeagueTier; color: string; minXp: number; promotionSlots: number; demotionSlots: number; icon: string }> = {
  Bronze: { name: 'Bronze', color: 'from-amber-700 to-amber-900', minXp: 0, promotionSlots: 5, demotionSlots: 0, icon: '🥉' },
  Silver: { name: 'Silver', color: 'from-slate-400 to-slate-600', minXp: 300, promotionSlots: 5, demotionSlots: 3, icon: '🥈' },
  Gold: { name: 'Gold', color: 'from-amber-400 to-yellow-600', minXp: 800, promotionSlots: 5, demotionSlots: 4, icon: '🥇' },
  Sapphire: { name: 'Sapphire', color: 'from-blue-500 to-indigo-700', minXp: 1500, promotionSlots: 3, demotionSlots: 5, icon: '💎' },
  Ruby: { name: 'Ruby', color: 'from-rose-500 to-red-700', minXp: 2500, promotionSlots: 3, demotionSlots: 5, icon: '🩸' },
  Diamond: { name: 'Diamond', color: 'from-cyan-400 to-teal-500', minXp: 4000, promotionSlots: 1, demotionSlots: 5, icon: '💠' },
  Legend: { name: 'Legend', color: 'from-fuchsia-500 to-purple-700', minXp: 6000, promotionSlots: 0, demotionSlots: 5, icon: '👑' },
};

export const INITIAL_LEADERBOARD_USERS: LeaderboardEntry[] = [
  { id: 'bot-1', name: 'DevDan', username: '@dancodes', avatarSeed: 'Felix', xp: 480, streak: 9, league: 'Bronze', isUser: false, rankChange: 'same', cheerCount: 4 },
  { id: 'bot-2', name: 'Elena Rostova', username: '@py_elena', avatarSeed: 'Aneka', xp: 420, streak: 6, league: 'Bronze', isUser: false, rankChange: 'up', cheerCount: 7 },
  { id: 'bot-3', name: 'GuidoFan24', username: '@guido_fan', avatarSeed: 'Jocelyn', xp: 390, streak: 12, league: 'Bronze', isUser: false, rankChange: 'up', cheerCount: 2 },
  { id: 'bot-4', name: 'ByteMaster', username: '@byte_ninja', avatarSeed: 'Caleb', xp: 350, streak: 4, league: 'Bronze', isUser: false, rankChange: 'down', cheerCount: 5 },
  { id: 'bot-5', name: 'Maya Lin', username: '@maya_code', avatarSeed: 'Sara', xp: 310, streak: 5, league: 'Bronze', isUser: false, rankChange: 'same', cheerCount: 1 },
  { id: 'user-player', name: 'You (Python Explorer)', username: '@you', avatarSeed: 'Zack', xp: 180, streak: 3, league: 'Bronze', isUser: true, rankChange: 'up', cheerCount: 8 },
  { id: 'bot-6', name: 'Sam Chen', username: '@chensam', avatarSeed: 'Aiden', xp: 160, streak: 2, league: 'Bronze', isUser: false, rankChange: 'down', cheerCount: 0 },
  { id: 'bot-7', name: 'Kavita Patel', username: '@kavita_p', avatarSeed: 'Jessica', xp: 140, streak: 3, league: 'Bronze', isUser: false, rankChange: 'same', cheerCount: 3 },
  { id: 'bot-8', name: 'Lucas Rossi', username: '@lucas_dev', avatarSeed: 'Brian', xp: 110, streak: 1, league: 'Bronze', isUser: false, rankChange: 'down', cheerCount: 0 },
  { id: 'bot-9', name: 'Chloe Kim', username: '@chloe_py', avatarSeed: 'Kim', xp: 80, streak: 0, league: 'Bronze', isUser: false, rankChange: 'same', cheerCount: 1 },
];
