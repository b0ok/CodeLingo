import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { LEAGUE_CONFIG } from '../data/leaderboard';
import { AVATARS, BANNERS, FRAMES, LIMITS, PRO_EXTRAS, SHOP_PRICES, avatarEmoji, bannerClass, canUse, frameClass, isProTier } from '../data/profileOptions';
import { PATHWAYS_DATA } from '../data/curriculum';
import { levelFromXp } from '../data/economy';
import { DEFAULT_SHOWCASE, showcaseStats } from '../data/profileStats';
import { SPACE_LIMITS, SPACE_TAGS, SPACE_TEMPLATES, SpaceData, spaceDocument } from '../utils/profileSpace';
import { Badge, UserStats } from '../types';
import { LanguageId } from '../types';
import { ProfileCustomization } from '../types';
import { BadgesView } from './BadgesView';
import { Modal } from './Modal';
import { Check, Crown, Lock, Pencil } from 'lucide-react';
import { supabase, useSession } from '../utils/supabase';
import { UsernameField, useUsernameCheck } from './UsernameField';

// The live values {{tags}} in My Space fill in with.
function spaceData(profile: ProfileCustomization, stats: UserStats, badges: Badge[], pro: boolean): SpaceData {
  const owned = stats.ownedItems || [];
  const all = showcaseStats(stats, badges);
  const chosen = profile.showcaseStats && profile.showcaseStats.length ? profile.showcaseStats : DEFAULT_SHOWCASE;
  return {
    displayName: profile.displayName || 'Learner',
    username: profile.username || '',
    avatar: avatarEmoji(profile.avatar, pro, owned),
    bio: profile.bio,
    status: profile.status || '',
    level: levelFromXp(stats.xp).level,
    xp: stats.xp,
    streak: stats.streak,
    bestStreak: stats.highestStreak,
    league: stats.currentLeague,
    lessons: stats.completedLessons.length,
    stats: chosen.map((id) => all.find((s) => s.id === id)).filter((s): s is NonNullable<typeof s> => !!s).slice(0, (pro ? LIMITS.pro : LIMITS.free).showcase),
    featuredBadges: profile.featuredBadges.map((id) => badges.find((b) => b.id === id && b.isUnlocked)?.name).filter((n): n is string => !!n),
  };
}

const DEFAULT_PROFILE: ProfileCustomization = {
  displayName: '', avatar: 'snake', bio: '', banner: 'emerald', featuredBadges: [],
  frame: 'none', status: '', snippetLanguage: 'python', snippetCode: '',
};

export const ProfileView: React.FC<{ onOpenPlans: () => void; onOpenShop: () => void }> = ({ onOpenPlans, onOpenShop }) => {
  const { stats, badges, currentLeague } = useGame();
  const session = useSession();
  const [editing, setEditing] = useState(false);
  const profile = { ...DEFAULT_PROFILE, ...stats.profile };
  const pro = isProTier(stats.subscriptionTier);
  const lv = levelFromXp(stats.xp);
  const owned = stats.ownedItems || [];
  const featured = profile.featuredBadges
    .map((id) => badges.find((b) => b.id === id && b.isUnlocked))
    .filter((b): b is NonNullable<typeof b> => !!b);

  // The stats this learner chose to show (Pro shows up to 8, free up to 4).
  const allStats = showcaseStats(stats, badges);
  const chosen = profile.showcaseStats && profile.showcaseStats.length ? profile.showcaseStats : DEFAULT_SHOWCASE;
  const tiles = chosen
    .map((id) => allStats.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => !!s)
    .slice(0, (pro ? LIMITS.pro : LIMITS.free).showcase);

  const editor = editing && (
    <ProfileEditor profile={profile} onClose={() => setEditing(false)} onOpenPlans={() => { setEditing(false); onOpenPlans(); }} onOpenShop={() => { setEditing(false); onOpenShop(); }} />
  );

  // Pro custom page: the learner's own HTML and CSS is the whole profile.
  if (pro && profile.layout === 'custom' && profile.spaceHtml) {
    return (
      <div className="max-w-3xl mx-auto space-y-3 pb-24 xl:pb-12">
        <div className="flex items-center justify-between gap-3">
          <h2 id="profile-heading" className="text-lg font-extrabold text-slate-900 [overflow-wrap:anywhere]">{profile.displayName || 'Learner'}'s page</h2>
          <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-4 py-2 border-2 border-slate-300 bg-white rounded-xl font-bold text-slate-800 hover:bg-slate-50 cursor-pointer shrink-0">
            <Pencil className="w-4 h-4" aria-hidden="true" />
            Edit profile
          </button>
        </div>
        <iframe
          title={`${profile.displayName || 'Learner'}'s profile page`}
          sandbox=""
          srcDoc={spaceDocument(profile.spaceHtml, profile.spaceCss || '', spaceData(profile, stats, badges, pro))}
          className="w-full h-[75dvh] min-h-[480px] bg-white border border-slate-200 rounded-3xl"
        />
        {editor}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section aria-labelledby="profile-heading" className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className={`h-24 ${bannerClass(profile.banner, pro, owned)}`} aria-hidden="true" />
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between gap-3 -mt-10">
            <div className={`w-20 h-20 rounded-full bg-white border-4 border-white shadow flex items-center justify-center text-4xl ${frameClass(profile.frame, pro, owned)}`} role="img" aria-label={`Avatar: ${AVATARS.find((a) => a.id === profile.avatar)?.label ?? 'Snake'}`}>
              {avatarEmoji(profile.avatar, pro, owned)}
            </div>
            <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-4 py-2 border-2 border-slate-300 bg-white rounded-xl font-bold text-slate-800 hover:bg-slate-50 cursor-pointer">
              <Pencil className="w-4 h-4" aria-hidden="true" />
              Edit profile
            </button>
          </div>
          <h2 id="profile-heading" className="mt-3 text-2xl font-extrabold text-slate-900 tracking-tight [overflow-wrap:anywhere] flex flex-wrap items-center gap-2">
            {profile.displayName || 'Learner'}
            {pro && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full tracking-normal">
                <Crown className="w-3.5 h-3.5" aria-hidden="true" /> Pro
              </span>
            )}
          </h2>
          {profile.username ? (
            <p className="text-slate-600">@{profile.username}</p>
          ) : (
            session && (
              <button onClick={() => setEditing(true)} className="text-sm font-bold text-emerald-700 underline cursor-pointer">
                Claim your @username
              </button>
            )
          )}
          {pro && profile.status && <p className="mt-1 font-bold text-slate-800 [overflow-wrap:anywhere]">{profile.status}</p>}
          {profile.bio ? (
            <p className="mt-1 text-slate-700 [overflow-wrap:anywhere]">{profile.bio}</p>
          ) : (
            <p className="mt-1 text-slate-600">No bio yet. Add one with Edit profile.</p>
          )}
          {featured.length > 0 && (
            <ul aria-label="Featured badges" className="mt-3 flex flex-wrap gap-2">
              {featured.map((b) => (
                <li key={b.id} className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 text-sm font-bold rounded-full">🏅 {b.name}</li>
              ))}
            </ul>
          )}

          {pro && profile.snippetCode && (
            <figure className="mt-4">
              <figcaption className="text-xs font-bold text-slate-600 uppercase mb-1">Pinned {PATHWAYS_DATA[profile.snippetLanguage || 'python'].name} snippet</figcaption>
              <pre className="p-4 bg-slate-900 text-emerald-300 rounded-2xl text-sm overflow-x-auto"><code>{profile.snippetCode}</code></pre>
            </figure>
          )}

          <div className="mt-5 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-lg font-extrabold text-slate-900">Level {lv.level}</p>
              <p className="text-sm text-slate-600 tabular-nums">{lv.intoLevel} / {lv.needed} XP to level {lv.level + 1}</p>
            </div>
            <div
              role="progressbar"
              aria-label={`Progress to level ${lv.level + 1}`}
              aria-valuemin={0}
              aria-valuemax={lv.needed}
              aria-valuenow={lv.intoLevel}
              className="mt-2 h-2.5 bg-slate-200 rounded-full overflow-hidden"
            >
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(lv.intoLevel / lv.needed) * 100}%` }} />
            </div>
          </div>

          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
            {tiles.map((t) => (
              <div key={t.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <dt className="text-xs font-bold text-slate-600 uppercase">{t.label}</dt>
                <dd className="text-lg font-extrabold text-slate-900 tabular-nums mt-0.5 [overflow-wrap:anywhere]">{t.value}</dd>
                {t.detail && <dd className="text-xs text-slate-600">{t.detail}</dd>}
              </div>
            ))}
          </dl>
        </div>
      </section>

      {pro && profile.spaceHtml && (
        <section aria-labelledby="my-space-heading" className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <h3 id="my-space-heading" className="px-6 pt-5 pb-3 font-extrabold text-slate-900">My space</h3>
          <iframe
            title={`${profile.displayName || 'Learner'}'s space`}
            sandbox=""
            srcDoc={spaceDocument(profile.spaceHtml, profile.spaceCss || '', spaceData(profile, stats, badges, pro))}
            className="w-full h-[360px] border-t border-slate-200 bg-white"
          />
        </section>
      )}

      <BadgesView />

      {editor}
    </div>
  );
};

const ProfileEditor: React.FC<{ profile: ProfileCustomization; onClose: () => void; onOpenPlans: () => void; onOpenShop: () => void }> = ({ profile, onClose, onOpenPlans, onOpenShop }) => {
  const { badges, updateProfile, stats } = useGame();
  const session = useSession();
  const pro = isProTier(stats.subscriptionTier);
  const owned = stats.ownedItems || [];
  const [draft, setDraft] = useState({
    ...profile,
    showcaseStats: profile.showcaseStats && profile.showcaseStats.length ? profile.showcaseStats : DEFAULT_SHOWCASE,
  });
  const allStats = showcaseStats(stats, badges);
  const [username, setUsername] = useState(profile.username || '');
  const { status: usernameStatus, suggestions } = useUsernameCheck(session ? username : '', profile.username || undefined);
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [proNote, setProNote] = useState<string | null>(null);
  const limits = pro ? LIMITS.pro : LIMITS.free;
  const unlocked = badges.filter((b) => b.isUnlocked);
  const set = (patch: Partial<ProfileCustomization>) => setDraft((d) => ({ ...d, ...patch }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setTriedSubmit(true);
    setSaveError(null);
    const changedName = !!session && !!username && username !== (profile.username || '');
    if (changedName) {
      if (usernameStatus !== 'ok') {
        document.getElementById('username')?.focus();
        return;
      }
      // Claimed directly on the server, which has the final say on uniqueness and the word filter.
      setSaving(true);
      const { error } = await supabase!.from('profiles').update({ username }).eq('id', session!.user.id);
      setSaving(false);
      if (error) {
        setSaveError(
          error.code === '23505' ? 'Someone just took that username. Pick another one.'
            : error.code === '23514' ? "That username isn't allowed. Pick another one."
            : "Your username couldn't be saved. Check your connection and try again.",
        );
        document.getElementById('username')?.focus();
        return;
      }
    }
    updateProfile({
      ...(changedName ? { username } : {}),
      displayName: draft.displayName.trim().slice(0, 40),
      bio: draft.bio.trim().slice(0, limits.bio),
      avatar: draft.avatar,
      banner: draft.banner,
      featuredBadges: draft.featuredBadges.filter((id) => unlocked.some((b) => b.id === id)).slice(0, limits.featuredBadges),
      showcaseStats: (draft.showcaseStats || []).slice(0, limits.showcase),
      ...(pro
        ? {
            layout: draft.layout === 'custom' ? 'custom' : 'standard',
            frame: draft.frame, status: (draft.status || '').trim().slice(0, 40), snippetLanguage: draft.snippetLanguage, snippetCode: (draft.snippetCode || '').slice(0, 600),
            spaceHtml: (draft.spaceHtml || '').slice(0, SPACE_LIMITS.html), spaceCss: (draft.spaceCss || '').slice(0, SPACE_LIMITS.css),
          }
        : {}),
    });
    onClose();
  };

  const shopLock = (price: number) => (
    <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-0.5 bg-black/45 text-white text-[11px] font-bold rounded-b-xl py-0.5 tabular-nums">
      <Lock className="w-2.5 h-2.5" aria-hidden="true" /> {price}
    </span>
  );

  const swatch = 'relative cursor-pointer rounded-xl has-[:checked]:ring-4 has-[:checked]:ring-slate-900/80 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-emerald-600';

  return (
    <Modal className="fixed inset-0 z-50 bg-slate-900/60 flex items-end sm:items-center justify-center p-0 sm:p-4" label="Edit profile" onClose={onClose}>
      <form onSubmit={save} className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-dvh overflow-y-auto overscroll-contain">
        <div className="p-6 space-y-6">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Edit profile</h2>

          {/* Live preview */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden" aria-hidden="true">
            <div className={`h-14 ${bannerClass(draft.banner, pro, owned)}`} />
            <div className="px-4 pb-3 -mt-6 flex items-end gap-3">
              <div className={`w-12 h-12 rounded-full bg-white border-4 border-white shadow flex items-center justify-center text-2xl ${frameClass(draft.frame, pro, owned)}`}>{avatarEmoji(draft.avatar, pro, owned)}</div>
              <p className="font-extrabold text-slate-900 truncate">{draft.displayName || 'Learner'}</p>
            </div>
          </div>

          {session ? (
            <UsernameField value={username} onChange={setUsername} status={usernameStatus} suggestions={suggestions} showError={triedSubmit} />
          ) : (
            <p className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600">Create an account in Settings to claim a @username.</p>
          )}

          <div className="space-y-1.5">
            <label htmlFor="edit-name" className="block font-bold text-slate-800">Display name</label>
            <input id="edit-name" value={draft.displayName} onChange={(e) => set({ displayName: e.target.value })} maxLength={40} autoComplete="nickname" className="w-full p-3 border border-slate-300 rounded-xl text-base" aria-describedby="edit-name-hint" />
            <p id="edit-name-hint" className="text-sm text-slate-600">Use a nickname, not your full name.</p>
          </div>

          <fieldset>
            <legend className="font-bold text-slate-800 mb-2">Avatar</legend>
            <div className="grid grid-cols-5 gap-2">
              {AVATARS.map((a) =>
                canUse(a, pro, owned) ? (
                  <label key={a.id} className={`${swatch} aspect-square bg-slate-100 flex items-center justify-center text-2xl`}>
                    <input type="radio" name="avatar" className="sr-only" checked={draft.avatar === a.id} onChange={() => set({ avatar: a.id })} aria-label={a.label} />
                    <span aria-hidden="true">{a.emoji}</span>
                  </label>
                ) : (
                  <button key={a.id} type="button" onClick={onOpenShop} className="relative aspect-square bg-slate-100 rounded-xl flex items-center justify-center text-2xl cursor-pointer" aria-label={`${a.label} avatar, ${SHOP_PRICES.avatar} gold rings in the ring shop`}>
                    <span aria-hidden="true" className="opacity-60">{a.emoji}</span>
                    {shopLock(SHOP_PRICES.avatar)}
                  </button>
                ),
              )}
            </div>
          </fieldset>

          <div className="space-y-1.5">
            <label htmlFor="edit-bio" className="block font-bold text-slate-800">Bio</label>
            <textarea id="edit-bio" value={draft.bio} onChange={(e) => set({ bio: e.target.value })} maxLength={limits.bio} rows={2} className="w-full p-3 border border-slate-300 rounded-xl text-base resize-none" aria-describedby="edit-bio-count" />
            <p id="edit-bio-count" className="text-sm text-slate-600 tabular-nums">{draft.bio.length} / {limits.bio} characters</p>
          </div>

          <fieldset>
            <legend className="font-bold text-slate-800 mb-2">Banner</legend>
            <div className="grid grid-cols-5 gap-2">
              {BANNERS.map((b) =>
                b.shop && !owned.includes(b.id) ? (
                  <button key={b.id} type="button" onClick={onOpenShop} className={`relative h-10 rounded-xl ${b.className} cursor-pointer`} aria-label={`${b.label} banner, ${SHOP_PRICES.banner} gold rings in the ring shop`}>
                    {shopLock(SHOP_PRICES.banner)}
                  </button>
                ) : b.pro && !pro ? (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setProNote(`The ${b.label} banner is part of Pro.`)}
                    className={`relative h-10 rounded-xl ${b.className} cursor-pointer`}
                    aria-label={`${b.label} banner, Pro only`}
                  >
                    <span className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl"><Lock className="w-4 h-4 text-white" aria-hidden="true" /></span>
                  </button>
                ) : (
                  <label key={b.id} className={`${swatch} h-10 ${b.className}`}>
                    <input type="radio" name="banner" className="sr-only" checked={draft.banner === b.id} onChange={() => set({ banner: b.id })} aria-label={`${b.label} banner`} />
                  </label>
                ),
              )}
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-bold text-slate-800 mb-2">Avatar frame</legend>
            <div className="grid grid-cols-4 gap-2">
              {FRAMES.map((fr) =>
                fr.shop && !owned.includes(fr.id) ? (
                  <button key={fr.id} type="button" onClick={onOpenShop} className="relative h-14 rounded-xl bg-slate-100 flex flex-col items-center justify-center gap-1 cursor-pointer" aria-label={`${fr.label} frame, ${SHOP_PRICES.frame} gold rings in the ring shop`}>
                    <span className={`w-7 h-7 rounded-full bg-white ${fr.className}`} aria-hidden="true" />
                    {shopLock(SHOP_PRICES.frame)}
                  </button>
                ) : fr.pro && !pro ? (
                  <button key={fr.id} type="button" onClick={() => setProNote(`The ${fr.label} frame is part of Pro.`)} className="h-14 rounded-xl bg-slate-100 flex flex-col items-center justify-center gap-1 cursor-pointer" aria-label={`${fr.label} frame, Pro only`}>
                    <span className={`w-7 h-7 rounded-full bg-white ${fr.className}`} aria-hidden="true" />
                    <Lock className="w-3 h-3 text-slate-500" aria-hidden="true" />
                  </button>
                ) : (
                  <label key={fr.id} className={`${swatch} h-14 bg-slate-100 flex flex-col items-center justify-center gap-1`}>
                    <input type="radio" name="frame" className="sr-only" checked={(draft.frame || 'none') === fr.id} onChange={() => set({ frame: fr.id })} aria-label={`${fr.label}${fr.id === 'none' ? '' : ' frame'}`} />
                    <span className={`w-7 h-7 rounded-full bg-white ${fr.className}`} aria-hidden="true" />
                    <span className="text-xs font-bold text-slate-700">{fr.label}</span>
                  </label>
                ),
              )}
            </div>
          </fieldset>

          {pro && (
            <>
              <div className="space-y-1.5">
                <label htmlFor="edit-status" className="block font-bold text-slate-800">Status line</label>
                <input id="edit-status" value={draft.status || ''} onChange={(e) => set({ status: e.target.value })} maxLength={40} placeholder="Grinding SQL 🔥" className="w-full p-3 border border-slate-300 rounded-xl text-base" aria-describedby="edit-status-count" />
                <p id="edit-status-count" className="text-sm text-slate-600 tabular-nums">{(draft.status || '').length} / 40 characters</p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="edit-snippet" className="block font-bold text-slate-800">Pinned code snippet</label>
                <select
                  aria-label="Snippet language"
                  value={draft.snippetLanguage || 'python'}
                  onChange={(e) => set({ snippetLanguage: e.target.value as LanguageId })}
                  className="w-full sm:w-56 p-2.5 border border-slate-300 rounded-xl text-base bg-white"
                >
                  {(Object.keys(PATHWAYS_DATA) as LanguageId[]).map((id) => <option key={id} value={id}>{PATHWAYS_DATA[id].name}</option>)}
                </select>
                <textarea
                  id="edit-snippet" value={draft.snippetCode || ''} onChange={(e) => set({ snippetCode: e.target.value })} maxLength={600} rows={5} spellCheck={false}
                  placeholder="Show off a bit of code you're proud of"
                  className="w-full p-3 bg-slate-900 text-emerald-300 font-mono text-sm rounded-xl" aria-describedby="edit-snippet-count"
                />
                <p id="edit-snippet-count" className="text-sm text-slate-600 tabular-nums">{(draft.snippetCode || '').length} / 600 characters</p>
              </div>
            </>
          )}

          <fieldset>
            <legend className="font-bold text-slate-800">Featured badges</legend>
            <p className="text-sm text-slate-600 mb-2">Pick up to {limits.featuredBadges} to show on your profile.</p>
            {unlocked.length === 0 ? (
              <p className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600">Unlock badges by finishing lessons, then feature your favorites here.</p>
            ) : (
              <div className="space-y-2">
                {unlocked.map((b) => {
                  const on = draft.featuredBadges.includes(b.id);
                  const full = !on && draft.featuredBadges.length >= limits.featuredBadges;
                  return (
                    <label key={b.id} className={`flex items-center gap-3 p-3 border rounded-xl ${full ? 'opacity-60' : 'cursor-pointer'} ${on ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}>
                      <input
                        type="checkbox"
                        checked={on}
                        disabled={full}
                        onChange={() => set({ featuredBadges: on ? draft.featuredBadges.filter((x) => x !== b.id) : [...draft.featuredBadges, b.id] })}
                        className="w-5 h-5 accent-emerald-600"
                      />
                      <span className="font-bold text-slate-900">{b.name}</span>
                      {on && <Check className="w-4 h-4 text-emerald-600 ml-auto" aria-hidden="true" />}
                    </label>
                  );
                })}
              </div>
            )}
          </fieldset>

          <fieldset>
            <legend className="font-bold text-slate-800">Showcase stats</legend>
            <p className="text-sm text-slate-600 mb-2">Pick up to {limits.showcase} to show on your profile, in the order you pick them.</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {allStats.map((s) => {
                const picked = draft.showcaseStats || [];
                const on = picked.includes(s.id);
                const full = !on && picked.length >= limits.showcase;
                return (
                  <label key={s.id} className={`flex items-center gap-3 p-2.5 border rounded-xl ${full ? 'opacity-60' : 'cursor-pointer'} ${on ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}>
                    <input
                      type="checkbox"
                      checked={on}
                      disabled={full}
                      onChange={() => set({ showcaseStats: on ? picked.filter((x) => x !== s.id) : [...picked, s.id] })}
                      className="w-5 h-5 accent-emerald-600 shrink-0"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-slate-900">{s.label}</span>
                      <span className="block text-xs text-slate-600 truncate">{s.value}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {pro && (
            <section aria-labelledby="space-editor" className="space-y-3">
              <h3 id="space-editor" className="font-bold text-slate-800">My space</h3>
              <p className="text-sm text-slate-600">
                Design your own section with HTML and CSS. Scripts, links and outside images are removed, so keep it to your own words and styles.
              </p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Start from a template">
                {SPACE_TEMPLATES.map((t) => (
                  <button key={t.id} type="button" onClick={() => set({ spaceHtml: t.html, spaceCss: t.css })} className="px-3 py-1.5 border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-800 hover:bg-slate-50 cursor-pointer">
                    {t.label}
                  </button>
                ))}
              </div>
              <fieldset>
                <legend className="text-sm font-bold text-slate-800 mb-1">Show My Space as</legend>
                <div className="grid sm:grid-cols-2 gap-2">
                  {([['standard', 'A section on my profile'], ['custom', 'My whole profile page']] as const).map(([value, label]) => (
                    <label key={value} className="flex items-center gap-2 p-2.5 border border-slate-200 rounded-xl cursor-pointer has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50">
                      <input type="radio" name="layout" checked={(draft.layout || 'standard') === value} onChange={() => set({ layout: value })} className="w-4 h-4 accent-emerald-600" />
                      <span className="text-sm font-bold text-slate-900">{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <details className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                <summary className="font-bold text-slate-800 cursor-pointer">Live data tags</summary>
                <p className="mt-2 text-slate-600">Type these in your HTML and they fill in with your real info.</p>
                <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                  {SPACE_TAGS.map(([tag, meaning]) => (
                    <React.Fragment key={tag}>
                      <dt><code className="font-mono text-emerald-700">{tag}</code></dt>
                      <dd className="text-slate-600">{meaning}</dd>
                    </React.Fragment>
                  ))}
                </dl>
              </details>
              <label htmlFor="space-html" className="block text-sm font-bold text-slate-800">HTML</label>
              <textarea id="space-html" value={draft.spaceHtml || ''} onChange={(e) => set({ spaceHtml: e.target.value })} maxLength={SPACE_LIMITS.html} rows={6} spellCheck={false} className="w-full p-3 bg-slate-900 text-emerald-300 font-mono text-sm rounded-xl" aria-describedby="space-html-count" />
              <p id="space-html-count" className="text-xs text-slate-600 tabular-nums">{(draft.spaceHtml || '').length} / {SPACE_LIMITS.html}</p>
              <label htmlFor="space-css" className="block text-sm font-bold text-slate-800">CSS</label>
              <textarea id="space-css" value={draft.spaceCss || ''} onChange={(e) => set({ spaceCss: e.target.value })} maxLength={SPACE_LIMITS.css} rows={6} spellCheck={false} className="w-full p-3 bg-slate-900 text-sky-300 font-mono text-sm rounded-xl" aria-describedby="space-css-count" />
              <p id="space-css-count" className="text-xs text-slate-600 tabular-nums">{(draft.spaceCss || '').length} / {SPACE_LIMITS.css}</p>
              <p className="text-sm font-bold text-slate-800">Preview</p>
              <iframe title="My space preview" sandbox="" srcDoc={spaceDocument(draft.spaceHtml || '', draft.spaceCss || '', spaceData(draft, stats, badges, pro))} className={`w-full ${draft.layout === 'custom' ? 'h-96' : 'h-64'} border border-slate-200 rounded-xl bg-white`} />
            </section>
          )}

          {pro ? (
            <p className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm font-bold text-emerald-800">
              <Crown className="w-4 h-4" aria-hidden="true" /> Pro is on: gradients, frames, status line, 160-character bio, 6 badges, 8 stats, a pinned snippet and My Space.
            </p>
          ) : (
          <section aria-labelledby="pro-extras" className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
            <h3 id="pro-extras" className="font-extrabold text-amber-900 flex items-center gap-2"><Lock className="w-4 h-4" aria-hidden="true" /> More with Pro</h3>
            {proNote && <p role="status" className="text-sm font-bold text-amber-900">{proNote}</p>}
            <ul className="text-sm text-amber-900 list-disc pl-5 space-y-0.5">
              {PRO_EXTRAS.map((x) => <li key={x}>{x}</li>)}
            </ul>
            <button type="button" onClick={onOpenPlans} className="px-4 py-2 bg-white border-2 border-amber-300 rounded-xl font-bold text-amber-900 hover:bg-amber-100 cursor-pointer">See Pro plans</button>
          </section>
          )}
        </div>

        {saveError && <p role="alert" className="px-6 pb-3 text-sm text-rose-700">{saveError}</p>}
        <div className="sticky bottom-0 p-4 bg-white border-t border-slate-200 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-3 border-2 border-slate-300 rounded-2xl font-bold text-slate-800 hover:bg-slate-50 cursor-pointer">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold cursor-pointer disabled:opacity-60">{saving ? 'Saving…' : 'Save profile'}</button>
        </div>
      </form>
    </Modal>
  );
};
