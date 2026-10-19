// Checks the game economy math: lesson rewards, the level curve and bonus rings.
import assert from 'node:assert/strict';
import { lessonReward, levelFromXp, xpForNextLevel, bonusRings } from '../src/data/economy';

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

console.log('economy checks passed');
