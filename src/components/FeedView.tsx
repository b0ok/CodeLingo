import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { Hand } from 'lucide-react';

// ponytail: posts and high-fives live in this browser only; move to the database with sign-in (build plan Phase 2).
const FEED_KEY = 'codelingo_feed_v1';

interface FeedItem {
  id: string;
  author: string;
  text: string;
  when: string;
  mine?: boolean;
}

interface FeedState {
  posts: FeedItem[];
  highFived: string[];
}

function loadFeed(): FeedState {
  try {
    const saved = JSON.parse(localStorage.getItem(FEED_KEY) || '');
    if (Array.isArray(saved.posts) && Array.isArray(saved.highFived)) return saved;
  } catch { /* first visit or blocked storage */ }
  return { posts: [], highFived: [] };
}

export const FeedView: React.FC = () => {
  const { stats, badges, leaderboard, trackActivity } = useGame();
  const [feed, setFeed] = useState<FeedState>(loadFeed);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    try { localStorage.setItem(FEED_KEY, JSON.stringify(feed)); } catch { /* storage full or blocked */ }
  }, [feed]);

  const post = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const item = { id: `post-${Date.now()}`, author: 'You', text, when: new Date().toLocaleDateString(), mine: true };
    setFeed((f) => ({ ...f, posts: [item, ...f.posts] }));
    setDraft('');
  };

  const toggleHighFive = (id: string) => {
    if (!feed.highFived.includes(id)) trackActivity('cheers');
    setFeed((f) => ({
      ...f,
      highFived: f.highFived.includes(id) ? f.highFived.filter((x) => x !== id) : [...f.highFived, id],
    }));
  };

  // Activity cards built from progress that already exists
  const activity: FeedItem[] = [
    ...badges
      .filter((b) => b.isUnlocked)
      .map((b) => ({ id: `badge-${b.id}`, author: 'You', text: `Unlocked the ${b.name} badge 🏅`, when: b.unlockedDate || 'Recently', mine: true })),
    ...(stats.streak >= 3
      ? [{ id: `streak-me-${stats.streak}`, author: 'You', text: `Is on a ${stats.streak}-day streak 🔥`, when: 'Today', mine: true }]
      : []),
    ...leaderboard
      .filter((u) => !u.isUser)
      .flatMap((u) => [
        ...(u.streak >= 5 ? [{ id: `streak-${u.id}-${u.streak}`, author: u.name, text: `Is on a ${u.streak}-day streak 🔥`, when: 'This week' }] : []),
        { id: `xp-${u.id}-${u.xp}`, author: u.name, text: `Earned ${u.xp} XP in the ${stats.currentLeague} League this week`, when: 'This week' },
      ]),
  ];
  const items = [...feed.posts, ...activity];

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 xl:pb-12">
      <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Feed</h2>

      <form onSubmit={post} className="p-4 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-3">
        <label htmlFor="feed-draft" className="text-sm font-bold text-slate-700">Share an update</label>
        <textarea
          id="feed-draft"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={280}
          rows={3}
          placeholder="Just finished my first SQL join…"
          className="w-full p-3 border border-slate-300 rounded-2xl text-base resize-none focus-visible:outline-2 focus-visible:outline-emerald-500"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 tabular-nums">{draft.length} / 280</span>
          <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl cursor-pointer">
            Post update
          </button>
        </div>
      </form>

      <ul className="space-y-3">
        {items.map((item) => {
          const fived = feed.highFived.includes(item.id);
          return (
            <li key={item.id} className="p-4 bg-white border border-slate-200 rounded-3xl shadow-sm flex gap-3">
              <div
                aria-hidden="true"
                className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold shrink-0 ${
                  item.mine ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {item.author.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <strong className="text-slate-900">{item.author}</strong>{' '}
                  <span className="text-slate-500">· {item.when}</span>
                </p>
                <p className="text-slate-800 mt-0.5 [overflow-wrap:anywhere]">{item.text}</p>
                {!item.mine && (
                  <button
                    onClick={() => toggleHighFive(item.id)}
                    aria-pressed={fived}
                    className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border cursor-pointer ${
                      fived ? 'bg-amber-50 border-amber-300 text-amber-800' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Hand className="w-3.5 h-3.5" aria-hidden="true" />
                    {fived ? 'High-fived' : 'High five'}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
