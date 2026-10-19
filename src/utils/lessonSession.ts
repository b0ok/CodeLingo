import { Challenge } from '../types';

// How many challenges one lesson session draws from the lesson's pool.
export const SESSION_SIZE = 5;

export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Draws a session from a lesson's challenge pool so learners (and repeat runs) see
// different exercises. Picks round-robin across challenge types for a varied mix,
// always includes a code exercise when the pool has one, and returns the picks in
// authored order so the session still builds from easier to harder.
export function pickChallenges(pool: Challenge[], size: number = SESSION_SIZE, random: () => number = Math.random): Challenge[] {
  if (pool.length <= size) return pool;
  const byType = new Map<string, Challenge[]>();
  for (const c of shuffle(pool, random)) byType.set(c.type, [...(byType.get(c.type) || []), c]);
  const types = shuffle([...byType.keys()], random).sort(
    (a, b) => Number(b === 'code_runner') - Number(a === 'code_runner')
  );
  const picked = new Set<Challenge>();
  while (picked.size < size) {
    for (const type of types) {
      const next = byType.get(type)!.shift();
      if (next && picked.size < size) picked.add(next);
    }
  }
  return pool.filter((c) => picked.has(c));
}
