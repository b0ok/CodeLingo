// The game economy in one place: XP measures learning, levels show long-term progress,
// gold rings are what learners spend. Numbers match the business plan's economy table.

export const ECONOMY = {
  lesson: { baseXp: 10, xpPerStar: 5, replayXp: 5, rings: 5, perfectBonusRings: 5 },
  dailyGoalRings: 10,
  levelUpRings: 20,
  streakMilestoneRings: { 3: 15, 7: 30, 14: 50, 30: 100 } as Record<number, number>,
  badgeRings: 25,
  checkin: { xp: 30, rings: 10 },
  prices: { refill: 20, streakFreeze: 50, shopAvatar: 100, shopFrame: 150, shopBanner: 200, taskReroll: 10 },
  levels: { first: 50, step: 25 }, // level 1 -> 2 takes 50 XP, each next level 25 XP more
};

// First completion pays by stars; replays pay a little XP and no rings, so lessons can't be farmed.
export function lessonReward(stars: number, firstTime: boolean): { xp: number; rings: number } {
  const L = ECONOMY.lesson;
  if (!firstTime) return { xp: L.replayXp, rings: 0 };
  return { xp: L.baseXp + L.xpPerStar * stars, rings: L.rings + (stars === 3 ? L.perfectBonusRings : 0) };
}

export function xpForNextLevel(level: number): number {
  return ECONOMY.levels.first + ECONOMY.levels.step * (level - 1);
}

// Level from total XP, plus progress through the current level.
export function levelFromXp(totalXp: number): { level: number; intoLevel: number; needed: number } {
  let level = 1;
  let rest = Math.max(0, totalXp);
  while (rest >= xpForNextLevel(level)) {
    rest -= xpForNextLevel(level);
    level++;
  }
  return { level, intoLevel: rest, needed: xpForNextLevel(level) };
}

// Rings earned when XP goes from `before` to `after` in one award (level-ups, daily goal, streak milestones).
export function bonusRings(opts: {
  xpBefore: number; xpAfter: number;
  todayBefore: number; todayAfter: number; dailyGoal: number;
  streakBefore: number; streakAfter: number;
}): { rings: number; events: { title: string; rings: number }[] } {
  const events: { title: string; rings: number }[] = [];
  const levelBefore = levelFromXp(opts.xpBefore).level;
  const levelAfter = levelFromXp(opts.xpAfter).level;
  for (let l = levelBefore + 1; l <= levelAfter; l++) events.push({ title: `Level ${l}!`, rings: ECONOMY.levelUpRings });
  if (opts.todayBefore < opts.dailyGoal && opts.todayAfter >= opts.dailyGoal) {
    events.push({ title: 'Daily goal reached', rings: ECONOMY.dailyGoalRings });
  }
  if (opts.streakAfter > opts.streakBefore && ECONOMY.streakMilestoneRings[opts.streakAfter]) {
    events.push({ title: `${opts.streakAfter}-day streak`, rings: ECONOMY.streakMilestoneRings[opts.streakAfter] });
  }
  return { rings: events.reduce((sum, e) => sum + e.rings, 0), events };
}
