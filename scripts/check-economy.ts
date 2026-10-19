// Checks the game economy math: lesson rewards, the level curve and bonus rings.
import assert from 'node:assert/strict';
import { lessonReward, levelFromXp, xpForNextLevel, bonusRings } from '../src/data/economy';
import { TASK_POOL, freshDay, reroll, progressOf, DailyTasksState } from '../src/data/dailyTasks';

// Lessons: first time pays by stars, replays can't be farmed for rings.
assert.deepEqual(lessonReward(1, true), { xp: 15, rings: 5 });
assert.deepEqual(lessonReward(3, true), { xp: 25, rings: 10 });
assert.deepEqual(lessonReward(3, false), { xp: 5, rings: 0 });

// Levels: 50 XP to level 2, then 25 more per level; level 10 at 1,350 XP.
assert.equal(xpForNextLevel(1), 50);
assert.equal(xpForNextLevel(2), 75);
assert.deepEqual(levelFromXp(0), { level: 1, intoLevel: 0, needed: 50 });
assert.deepEqual(levelFromXp(49), { level: 1, intoLevel: 49, needed: 50 });
assert.deepEqual(levelFromXp(50), { level: 2, intoLevel: 0, needed: 75 });
assert.deepEqual(levelFromXp(130), { level: 3, intoLevel: 5, needed: 100 });
assert.equal(levelFromXp(1349).level, 9);
assert.equal(levelFromXp(1350).level, 10);

const base = { xpBefore: 40, xpAfter: 45, todayBefore: 0, todayAfter: 5, dailyGoal: 50, streakBefore: 1, streakAfter: 1 };
assert.deepEqual(bonusRings(base), { rings: 0, events: [] });

// One award can cross a level, the daily goal and a streak milestone together.
const big = bonusRings({ ...base, xpAfter: 140, todayBefore: 40, todayAfter: 60, streakBefore: 2, streakAfter: 3 });
assert.deepEqual(big.events.map((e) => e.title), ['Level 2!', 'Level 3!', 'Daily goal reached', '3-day streak']);
assert.equal(big.rings, 20 + 20 + 10 + 15);

// The daily goal pays once: already past it before this award means no bonus.
assert.equal(bonusRings({ ...base, todayBefore: 55, todayAfter: 70 }).rings, 0);

// Daily tasks: three a day; rerolls keep claimed tasks and swap the rest for different ones.
const day: DailyTasksState = { ...freshDay(), ids: ['cheer-1', 'sandbox-1', 'lessons-2'], claimed: ['cheer-1'], counts: { cheers: 1, lessons: 1 } };
assert.equal(freshDay().ids.length, 3);
const next = reroll(day)!;
assert.equal(next.ids.length, 3);
assert.equal(next.ids[0], 'cheer-1');
assert.ok(!next.ids.includes('sandbox-1') && !next.ids.includes('lessons-2'));
// Progress comes from today's activity, capped at the target; the XP task reads today's XP.
const task = (id: string) => TASK_POOL.find((t) => t.id === id)!;
assert.equal(progressOf(task('lessons-2'), day, 0), 1);
assert.equal(progressOf(task('xp-30'), day, 45), 30);
// Once every task has been shown, there's nothing left to reroll into.
assert.equal(reroll({ ...day, ids: TASK_POOL.slice(0, 3).map((t) => t.id), claimed: TASK_POOL.slice(3).map((t) => t.id) }), null);

console.log('economy checks passed');
