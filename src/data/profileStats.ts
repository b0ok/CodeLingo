// Stats a learner can showcase on their profile. Every value is computed from real progress.
import { Badge, LanguageId, UserStats } from '../types';
import { PATHWAYS_DATA } from './curriculum';
import { LEAGUE_CONFIG } from './leaderboard';

export interface ShowcaseStat { id: string; label: string; value: string; detail?: string }

// Level isn't a choice: the profile always shows it with a progress bar.
export const DEFAULT_SHOWCASE = ['streak', 'lessons', 'perfect', 'badges'];

export function showcaseStats(stats: UserStats, badges: Badge[]): ShowcaseStat[] {
  const days = Object.values(stats.history).filter((xp) => xp > 0).length;
  const weekXp = Array.from({ length: 7 }, (_, i) => new Date(Date.now() - i * 86400000).toISOString().split('T')[0])
    .reduce((sum, d) => sum + (stats.history[d] || 0), 0);
  const perfect = Object.values(stats.nodeStars).filter((s) => s === 3).length;

  // The course with the most finished lessons, and how far through it they are.
  const courses = (Object.keys(PATHWAYS_DATA) as LanguageId[]).map((id) => {
    const lessons = PATHWAYS_DATA[id].units.flatMap((u) => u.nodes.map((n) => n.id));
    const done = lessons.filter((l) => stats.completedLessons.includes(l)).length;
    return { id, done, pct: lessons.length ? Math.round((done / lessons.length) * 100) : 0 };
  });
  const top = [...courses].sort((a, b) => b.done - a.done)[0];
  const started = courses.filter((c) => c.done > 0).length;

  return [
    { id: 'xp', label: 'Total XP', value: stats.xp.toLocaleString() },
    { id: 'streak', label: 'Day streak', value: String(stats.streak) },
    { id: 'bestStreak', label: 'Best streak', value: `${stats.highestStreak} days` },
    { id: 'lessons', label: 'Lessons done', value: stats.completedLessons.length.toLocaleString() },
    { id: 'perfect', label: 'Perfect lessons', value: perfect.toLocaleString(), detail: 'No mistakes' },
    { id: 'badges', label: 'Badges', value: `${badges.filter((b) => b.isUnlocked).length} / ${badges.length}` },
    { id: 'daysActive', label: 'Days active', value: days.toLocaleString() },
    { id: 'weekXp', label: 'XP this week', value: weekXp.toLocaleString() },
    { id: 'topCourse', label: 'Top course', value: top && top.done > 0 ? PATHWAYS_DATA[top.id].name : 'Not started', detail: top && top.done > 0 ? `${top.pct}% complete` : undefined },
    { id: 'courses', label: 'Courses started', value: `${started} / 4` },
    { id: 'challenges', label: 'Challenges solved', value: (stats.completedChallenges || []).length.toLocaleString() },
    { id: 'milestones', label: 'Milestones verified', value: (stats.checkedInNodes || []).length.toLocaleString(), detail: 'Agent check-ins' },
    { id: 'league', label: 'League', value: `${LEAGUE_CONFIG[stats.currentLeague].icon} ${stats.currentLeague}` },
    { id: 'rings', label: 'Gold rings', value: stats.gems.toLocaleString() },
  ];
}
