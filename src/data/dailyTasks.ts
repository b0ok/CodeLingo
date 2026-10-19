// Daily tasks fill from what the learner actually does today. Three are drawn each day;
// rerolling costs gold rings and only swaps unclaimed tasks.

export type ActivityKind = 'lessons' | 'practiceMinutes' | 'perfect' | 'bugs' | 'sandboxRuns' | 'cheers';

export interface DailyTaskDef {
  id: string;
  title: string;
  target: number;
  rewardGems: number;
  rewardXp: number;
  kind: ActivityKind | 'xp'; // 'xp' reads today's XP from history
}

export const TASK_POOL: DailyTaskDef[] = [
  { id: 'lessons-2', title: 'Finish 2 lessons', target: 2, rewardGems: 15, rewardXp: 20, kind: 'lessons' },
  { id: 'practice-5', title: 'Practice for 5 minutes', target: 5, rewardGems: 15, rewardXp: 15, kind: 'practiceMinutes' },
  { id: 'perfect-1', title: 'Finish a lesson with no mistakes', target: 1, rewardGems: 20, rewardXp: 20, kind: 'perfect' },
  { id: 'bug-1', title: 'Spot 1 bug', target: 1, rewardGems: 10, rewardXp: 15, kind: 'bugs' },
  { id: 'sandbox-1', title: 'Run code in the Sandbox', target: 1, rewardGems: 15, rewardXp: 15, kind: 'sandboxRuns' },
  { id: 'xp-30', title: 'Earn 30 XP today', target: 30, rewardGems: 15, rewardXp: 20, kind: 'xp' },
  { id: 'cheer-1', title: 'Cheer or high-five another learner', target: 1, rewardGems: 10, rewardXp: 10, kind: 'cheers' },
];

export interface DailyTasksState {
  date: string; // YYYY-MM-DD; a new day draws new tasks and clears the counts
  ids: string[];
  claimed: string[];
  counts: Partial<Record<ActivityKind, number>>;
}

export const todayKey = () => new Date().toISOString().split('T')[0];

const shuffle = <T,>(list: T[]) => [...list].sort(() => Math.random() - 0.5);

export function freshDay(): DailyTasksState {
  return { date: todayKey(), ids: shuffle(TASK_POOL).slice(0, 3).map((t) => t.id), claimed: [], counts: {} };
}

// Keeps claimed tasks; swaps the rest for tasks not currently shown and not claimed today. Null when there's nothing to draw.
export function reroll(state: DailyTasksState): DailyTasksState | null {
  const keep = state.ids.filter((id) => state.claimed.includes(id));
  const pool = TASK_POOL.filter((t) => !state.ids.includes(t.id) && !state.claimed.includes(t.id));
  if (!pool.length) return null;
  const drawn = shuffle(pool).slice(0, 3 - keep.length).map((t) => t.id);
  return { ...state, ids: [...keep, ...drawn] };
}

export function progressOf(task: DailyTaskDef, state: DailyTasksState, xpToday: number): number {
  const done = task.kind === 'xp' ? xpToday : state.counts[task.kind] || 0;
  return Math.min(task.target, done);
}
