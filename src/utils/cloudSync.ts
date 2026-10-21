// Cloud progress: maps the app's local stats to the Supabase tables and back.
// The pure functions here are checked by scripts/check-sync.ts.
import type { SupabaseClient } from '@supabase/supabase-js';
import { ProfileCustomization, UserStats } from '../types';

const DEFAULT_PROFILE: ProfileCustomization = {
  displayName: '', avatar: 'snake', bio: '', banner: 'emerald', featuredBadges: [],
  frame: 'none', status: '', snippetLanguage: 'python', snippetCode: '',
  showcaseStats: [], spaceHtml: '', spaceCss: '', layout: 'standard',
};

// The synced slice of UserStats. Everything else (quests, sounds of the day, feed) stays on the device.
export type CloudState = Pick<
  UserStats,
  | 'xp' | 'gems' | 'hearts' | 'streak' | 'highestStreak' | 'streakFreeze' | 'currentLeague' | 'leagueWeeklyXp'
  | 'lastActiveDate' | 'completedLessons' | 'nodeStars' | 'history' | 'unlockedBadgeIds' | 'checkedInNodes'
  | 'completedChallenges' | 'ownedItems' | 'activeLanguage' | 'targetCareerTrack' | 'soundEnabled' | 'dailyGoalTarget' | 'dailyRoutineTime'
> & { profile: ProfileCustomization };

export function pick(s: UserStats): CloudState {
  return {
    xp: s.xp, gems: s.gems, hearts: s.hearts, streak: s.streak, highestStreak: s.highestStreak,
    streakFreeze: s.streakFreeze, currentLeague: s.currentLeague, leagueWeeklyXp: s.leagueWeeklyXp,
    lastActiveDate: s.lastActiveDate, completedLessons: s.completedLessons, nodeStars: s.nodeStars,
    history: s.history, unlockedBadgeIds: s.unlockedBadgeIds, checkedInNodes: s.checkedInNodes || [],
    completedChallenges: s.completedChallenges || [], ownedItems: s.ownedItems || [], activeLanguage: s.activeLanguage,
    targetCareerTrack: s.targetCareerTrack, soundEnabled: s.soundEnabled,
    dailyGoalTarget: s.dailyGoalTarget, dailyRoutineTime: s.dailyRoutineTime,
    profile: { ...DEFAULT_PROFILE, ...s.profile },
  };
}

export function hasProgress(s: Pick<CloudState, 'xp' | 'completedLessons'>) {
  return s.xp > 0 || s.completedLessons.length > 0;
}

const union = (a: string[] = [], b: string[] = []) => [...new Set([...a, ...b])];
const laterDate = (a: string, b: string) => (a > b ? a : b);

// "Combine them": nothing either side earned is lost.
export function merge(a: CloudState, b: CloudState): CloudState {
  const nodeStars = { ...a.nodeStars };
  for (const [id, s] of Object.entries(b.nodeStars)) nodeStars[id] = Math.max(nodeStars[id] || 0, s);
  const history = { ...a.history };
  for (const [day, xp] of Object.entries(b.history)) history[day] = Math.max(history[day] || 0, xp);
  const newer = a.lastActiveDate > b.lastActiveDate ? a : b; // on a tie, the second side (the account) wins
  return {
    ...newer, // settings, life points and league come from whichever side was used most recently
    xp: Math.max(a.xp, b.xp),
    gems: Math.max(a.gems, b.gems),
    streak: Math.max(a.streak, b.streak),
    highestStreak: Math.max(a.highestStreak, b.highestStreak),
    streakFreeze: Math.max(a.streakFreeze, b.streakFreeze),
    leagueWeeklyXp: Math.max(a.leagueWeeklyXp, b.leagueWeeklyXp),
    lastActiveDate: laterDate(a.lastActiveDate, b.lastActiveDate),
    completedLessons: union(a.completedLessons, b.completedLessons),
    nodeStars,
    history,
    unlockedBadgeIds: union(a.unlockedBadgeIds, b.unlockedBadgeIds),
    checkedInNodes: union(a.checkedInNodes, b.checkedInNodes),
    completedChallenges: union(a.completedChallenges, b.completedChallenges),
    ownedItems: union(a.ownedItems, b.ownedItems),
  };
}

// ---------- Rows ----------

export interface Rows {
  progress: Record<string, unknown>;
  profile: Record<string, unknown>;
  lessons: { lesson_id: string; stars: number }[];
  achievements: { kind: 'badge' | 'milestone' | 'challenge' | 'item'; item_id: string }[];
  xpLog: { day: string; xp: number }[];
}

export function toRows(s: CloudState): Rows {
  return {
    progress: {
      xp: s.xp, gold_rings: s.gems, life_points: Math.min(5, Math.max(0, s.hearts)), streak: s.streak,
      best_streak: s.highestStreak, streak_freezes: s.streakFreeze, league: s.currentLeague,
      league_weekly_xp: s.leagueWeeklyXp, last_active_date: s.lastActiveDate || null,
    },
    profile: {
      active_language: s.activeLanguage, career_goal: s.targetCareerTrack ?? null, sound_enabled: s.soundEnabled,
      daily_goal_xp: Math.min(500, Math.max(10, s.dailyGoalTarget)), reminder_time: s.dailyRoutineTime || null,
      display_name: s.profile.displayName.slice(0, 40) || null, avatar: s.profile.avatar, bio: s.profile.bio.slice(0, 160),
      banner: s.profile.banner, featured_badges: s.profile.featuredBadges.slice(0, 6),
      frame: s.profile.frame || 'none', status: (s.profile.status || '').slice(0, 40),
      snippet_language: s.profile.snippetLanguage || 'python', snippet_code: (s.profile.snippetCode || '').slice(0, 600),
      showcase_stats: (s.profile.showcaseStats || []).slice(0, 8),
      space_html: (s.profile.spaceHtml || '').slice(0, 5000), space_css: (s.profile.spaceCss || '').slice(0, 5000),
      profile_layout: s.profile.layout === 'custom' ? 'custom' : 'standard',
    },
    lessons: s.completedLessons.map((id) => ({ lesson_id: id, stars: Math.min(3, Math.max(1, s.nodeStars[id] || 1)) })),
    achievements: [
      ...s.unlockedBadgeIds.map((id) => ({ kind: 'badge' as const, item_id: id })),
      ...(s.checkedInNodes || []).map((id) => ({ kind: 'milestone' as const, item_id: id })),
      ...s.completedChallenges.map((id) => ({ kind: 'challenge' as const, item_id: id })),
      ...(s.ownedItems || []).map((id) => ({ kind: 'item' as const, item_id: id })),
    ],
    xpLog: Object.entries(s.history).map(([day, xp]) => ({ day, xp: Math.max(0, Math.round(xp)) })),
  };
}

type Row = Record<string, any>;

export function fromRows(r: { progress: Row; profile: Row; lessons: Row[]; achievements: Row[]; xpLog: Row[] }): CloudState {
  const kind = (k: string) => r.achievements.filter((a) => a.kind === k).map((a) => a.item_id as string);
  return {
    xp: r.progress.xp, gems: r.progress.gold_rings, hearts: r.progress.life_points, streak: r.progress.streak,
    highestStreak: r.progress.best_streak, streakFreeze: r.progress.streak_freezes, currentLeague: r.progress.league,
    leagueWeeklyXp: r.progress.league_weekly_xp, lastActiveDate: r.progress.last_active_date || '',
    completedLessons: r.lessons.map((l) => l.lesson_id),
    nodeStars: Object.fromEntries(r.lessons.map((l) => [l.lesson_id, l.stars])),
    history: Object.fromEntries(r.xpLog.map((x) => [x.day, x.xp])),
    unlockedBadgeIds: kind('badge'), checkedInNodes: kind('milestone'), completedChallenges: kind('challenge'), ownedItems: kind('item'),
    activeLanguage: r.profile.active_language, targetCareerTrack: r.profile.career_goal ?? undefined,
    soundEnabled: r.profile.sound_enabled, dailyGoalTarget: r.profile.daily_goal_xp,
    dailyRoutineTime: (r.profile.reminder_time || '20:00').slice(0, 5),
    profile: {
      displayName: r.profile.display_name || '', avatar: r.profile.avatar ?? DEFAULT_PROFILE.avatar, bio: r.profile.bio ?? '',
      banner: r.profile.banner ?? DEFAULT_PROFILE.banner, featuredBadges: r.profile.featured_badges ?? [],
      username: r.profile.username || '',
      frame: r.profile.frame ?? 'none', status: r.profile.status ?? '',
      snippetLanguage: r.profile.snippet_language ?? 'python', snippetCode: r.profile.snippet_code ?? '',
      showcaseStats: r.profile.showcase_stats ?? [], spaceHtml: r.profile.space_html ?? '', spaceCss: r.profile.space_css ?? '',
      layout: r.profile.profile_layout === 'custom' ? 'custom' : 'standard',
    },
  };
}

// Only rows that changed since the last push are sent.
export function changedRows(next: Rows, prev: Rows | null): Partial<Rows> {
  const key = (o: unknown) => JSON.stringify(o);
  const seen = (list: unknown[] = []) => new Set(list.map(key));
  const out: Partial<Rows> = {};
  if (!prev || key(next.progress) !== key(prev.progress)) out.progress = next.progress;
  if (!prev || key(next.profile) !== key(prev.profile)) out.profile = next.profile;
  const lessons = next.lessons.filter((x) => !seen(prev?.lessons).has(key(x)));
  if (lessons.length) out.lessons = lessons;
  const achievements = next.achievements.filter((x) => !seen(prev?.achievements).has(key(x)));
  if (achievements.length) out.achievements = achievements;
  const xpLog = next.xpLog.filter((x) => !seen(prev?.xpLog).has(key(x)));
  if (xpLog.length) out.xpLog = xpLog;
  return out;
}

// ---------- Network ----------

export async function pull(db: SupabaseClient, userId: string): Promise<CloudState> {
  const [progress, profile, lessons, achievements, xpLog] = await Promise.all([
    db.from('progress').select('*').eq('user_id', userId).single(),
    db.from('profiles').select('*').eq('id', userId).single(),
    db.from('lesson_results').select('lesson_id, stars').eq('user_id', userId),
    db.from('achievements').select('kind, item_id').eq('user_id', userId),
    db.from('xp_log').select('day, xp').eq('user_id', userId),
  ]);
  const failed = [progress, profile, lessons, achievements, xpLog].find((r) => r.error);
  if (failed) throw failed.error;
  return fromRows({ progress: progress.data!, profile: profile.data!, lessons: lessons.data!, achievements: achievements.data!, xpLog: xpLog.data! });
}

export async function push(db: SupabaseClient, userId: string, rows: Partial<Rows>) {
  const now = new Date().toISOString();
  const withUser = <T extends object>(list: T[]) => list.map((x) => ({ ...x, user_id: userId }));
  const results = await Promise.all([
    rows.progress && db.from('progress').update({ ...rows.progress, updated_at: now }).eq('user_id', userId),
    rows.profile && db.from('profiles').update({ ...rows.profile, updated_at: now }).eq('id', userId),
    rows.lessons && db.from('lesson_results').upsert(withUser(rows.lessons)),
    rows.achievements && db.from('achievements').upsert(withUser(rows.achievements), { ignoreDuplicates: true }),
    rows.xpLog && db.from('xp_log').upsert(withUser(rows.xpLog)),
  ]);
  // A name or bio typed while signed out can trip the database word filter; keep syncing everything else.
  if (rows.profile && results[1]?.error?.code === '23514') {
    const { display_name: _n, bio: _b, status: _s, ...rest } = rows.profile;
    const retry = await db.from('profiles').update({ ...rest, updated_at: now }).eq('id', userId);
    if (retry.error) throw retry.error;
    results[1] = undefined;
  }
  const failed = results.find((r) => r && r.error);
  if (failed && failed.error) throw failed.error;
}
