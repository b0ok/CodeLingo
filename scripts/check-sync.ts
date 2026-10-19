// Checks the cloud progress mapping: combining never loses progress, and rows round-trip.
import assert from 'node:assert/strict';
import { CloudState, merge, toRows, fromRows, changedRows, hasProgress } from '../src/utils/cloudSync';

const base: CloudState = {
  xp: 0, gems: 0, hearts: 5, streak: 0, highestStreak: 0, streakFreeze: 0, currentLeague: 'Bronze',
  leagueWeeklyXp: 0, lastActiveDate: '', completedLessons: [], nodeStars: {}, history: {},
  unlockedBadgeIds: [], checkedInNodes: [], completedChallenges: [], ownedItems: [], activeLanguage: 'python',
  targetCareerTrack: 'ai-ml', soundEnabled: true, dailyGoalTarget: 50, dailyRoutineTime: '20:00',
  profile: {
    displayName: '', avatar: 'snake', bio: '', banner: 'emerald', featuredBadges: [], frame: 'none', status: '',
    snippetLanguage: 'python', snippetCode: '', showcaseStats: [], spaceHtml: '', spaceCss: '',
  },
};

const phone: CloudState = {
  ...base, xp: 120, gems: 40, streak: 3, highestStreak: 5, lastActiveDate: '2026-10-18',
  completedLessons: ['lesson-1-1', 'lesson-1-2'], nodeStars: { 'lesson-1-1': 2, 'lesson-1-2': 3 },
  history: { '2026-10-18': 60 }, unlockedBadgeIds: ['first_strike'], activeLanguage: 'javascript',
};
const laptop: CloudState = {
  ...base, xp: 90, gems: 70, hearts: 2, streak: 4, highestStreak: 4, lastActiveDate: '2026-10-19',
  completedLessons: ['lesson-1-1', 'lesson-2-1'], nodeStars: { 'lesson-1-1': 3, 'lesson-2-1': 1 },
  history: { '2026-10-18': 30, '2026-10-19': 50 }, completedChallenges: ['cook-1'], ownedItems: ['dino'], dailyGoalTarget: 100,
  profile: {
    displayName: 'T3', avatar: 'fox', bio: 'Learning SQL', banner: 'sunset', featuredBadges: ['first_strike'],
    frame: 'gold', status: 'Cooking SQL', snippetLanguage: 'sql', snippetCode: 'SELECT 1;',
    showcaseStats: ['streak', 'perfect'], spaceHtml: '<h1>Hi</h1>', spaceCss: 'h1 { color: red; }',
  },
};

// Combining keeps the best of both, in either order.
const m = merge(phone, laptop);
assert.deepEqual(merge(laptop, phone).completedLessons.sort(), m.completedLessons.sort());
assert.equal(m.xp, 120);
assert.equal(m.gems, 70);
assert.equal(m.streak, 4);
assert.equal(m.highestStreak, 5);
assert.deepEqual(m.completedLessons.sort(), ['lesson-1-1', 'lesson-1-2', 'lesson-2-1']);
assert.equal(m.nodeStars['lesson-1-1'], 3);
assert.deepEqual(m.history, { '2026-10-18': 60, '2026-10-19': 50 });
assert.deepEqual(m.unlockedBadgeIds, ['first_strike']);
assert.deepEqual(m.completedChallenges, ['cook-1']);
assert.deepEqual(m.ownedItems, ['dino']); // ring shop purchases are never lost when combining
// Settings and life points come from the most recently used side (the laptop).
assert.equal(m.dailyGoalTarget, 100);
assert.equal(m.hearts, 2);
assert.equal(m.lastActiveDate, '2026-10-19');
assert.equal(m.profile.avatar, 'fox'); // profile comes from the most recently used side too

// Rows round-trip through the table shapes.
const r = toRows(m);
const back = fromRows({
  progress: r.progress as any,
  profile: r.profile as any,
  lessons: r.lessons,
  achievements: r.achievements,
  xpLog: r.xpLog,
});
// The username is claimed on the server, so sync reads it but never sends it.
assert.equal('username' in r.profile, false);
assert.deepEqual(
  { ...back, completedLessons: back.completedLessons.sort() },
  { ...m, completedLessons: m.completedLessons.sort(), profile: { ...m.profile, username: '' } },
);

// Only changes are re-sent.
assert.deepEqual(changedRows(r, r), {});
const more = toRows({ ...m, completedLessons: [...m.completedLessons, 'lesson-2-2'], nodeStars: { ...m.nodeStars, 'lesson-2-2': 3 }, xp: 140 });
const diff = changedRows(more, r);
assert.deepEqual(diff.lessons, [{ lesson_id: 'lesson-2-2', stars: 3 }]);
assert.equal((diff.progress as any).xp, 140);
assert.equal(diff.profile, undefined);

assert.equal(hasProgress(base), false);
assert.equal(hasProgress(phone), true);
console.log('sync checks passed');
