import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { LEAGUE_CONFIG } from '../data/leaderboard';
import { AVATARS, BANNERS, LIMITS, PRO_EXTRAS, avatarEmoji, bannerClass } from '../data/profileOptions';
import { ProfileCustomization } from '../types';
import { BadgesView } from './BadgesView';
import { Modal } from './Modal';
import { Check, Lock, Pencil } from 'lucide-react';
import { supabase, useSession } from '../utils/supabase';
import { UsernameField, useUsernameCheck } from './UsernameField';

const DEFAULT_PROFILE: ProfileCustomization = { displayName: '', avatar: 'snake', bio: '', banner: 'emerald', featuredBadges: [] };

export const ProfileView: React.FC<{ onOpenPlans: () => void }> = ({ onOpenPlans }) => {
  const { stats, badges, currentLeague } = useGame();
  const session = useSession();
  const [editing, setEditing] = useState(false);
  const profile = { ...DEFAULT_PROFILE, ...stats.profile };
  const unlimited = stats.subscriptionTier === 'novice' || stats.subscriptionTier === 'pro';
  const featured = profile.featuredBadges
    .map((id) => badges.find((b) => b.id === id && b.isUnlocked))
    .filter((b): b is NonNullable<typeof b> => !!b);

  const tiles = [
    { label: 'Total XP', value: stats.xp.toLocaleString() },
    { label: 'Day streak', value: `${stats.streak} (best ${stats.highestStreak})` },
    { label: 'League', value: `${LEAGUE_CONFIG[currentLeague].icon} ${currentLeague}` },
    { label: 'Gold rings', value: stats.gems.toLocaleString() },
    { label: 'Life points', value: unlimited ? '∞' : `${stats.hearts} / ${stats.maxHearts}` },
    { label: 'Lessons done', value: stats.completedLessons.length.toLocaleString() },
  ];

  return (
    <div className="space-y-6">
      <section aria-labelledby="profile-heading" className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className={`h-24 ${bannerClass(profile.banner)}`} aria-hidden="true" />
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between gap-3 -mt-10">
            <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow flex items-center justify-center text-4xl" role="img" aria-label={`Avatar: ${AVATARS.find((a) => a.id === profile.avatar)?.label ?? 'Snake'}`}>
              {avatarEmoji(profile.avatar)}
            </div>
            <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-4 py-2 border-2 border-slate-300 bg-white rounded-xl font-bold text-slate-800 hover:bg-slate-50 cursor-pointer">
              <Pencil className="w-4 h-4" aria-hidden="true" />
              Edit profile
            </button>
          </div>
          <h2 id="profile-heading" className="mt-3 text-2xl font-extrabold text-slate-900 tracking-tight [overflow-wrap:anywhere]">
            {profile.displayName || 'Learner'}
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

          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
            {tiles.map((t) => (
              <div key={t.label} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <dt className="text-xs font-bold text-slate-600 uppercase">{t.label}</dt>
                <dd className="text-lg font-extrabold text-slate-900 tabular-nums mt-0.5">{t.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <BadgesView />

      {editing && <ProfileEditor profile={profile} onClose={() => setEditing(false)} onOpenPlans={() => { setEditing(false); onOpenPlans(); }} />}
    </div>
  );
};

const ProfileEditor: React.FC<{ profile: ProfileCustomization; onClose: () => void; onOpenPlans: () => void }> = ({ profile, onClose, onOpenPlans }) => {
  const { badges, updateProfile } = useGame();
  const session = useSession();
  const [draft, setDraft] = useState(profile);
  const [username, setUsername] = useState(profile.username || '');
  const { status: usernameStatus, suggestions } = useUsernameCheck(session ? username : '', profile.username || undefined);
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [proNote, setProNote] = useState<string | null>(null);
  const limits = LIMITS.free; // ponytail: Pro limits apply once Pro status is read from the server (build plan PR 11)
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
    });
    onClose();
  };

  const swatch = 'relative cursor-pointer rounded-xl has-[:checked]:ring-4 has-[:checked]:ring-slate-900/80 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-emerald-600';

  return (
    <Modal className="fixed inset-0 z-50 bg-slate-900/60 flex items-end sm:items-center justify-center p-0 sm:p-4" label="Edit profile" onClose={onClose}>
      <form onSubmit={save} className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-dvh overflow-y-auto overscroll-contain">
        <div className="p-6 space-y-6">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Edit profile</h2>

          {/* Live preview */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden" aria-hidden="true">
            <div className={`h-14 ${bannerClass(draft.banner)}`} />
            <div className="px-4 pb-3 -mt-6 flex items-end gap-3">
              <div className="w-12 h-12 rounded-full bg-white border-4 border-white shadow flex items-center justify-center text-2xl">{avatarEmoji(draft.avatar)}</div>
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
              {AVATARS.map((a) => (
                <label key={a.id} className={`${swatch} aspect-square bg-slate-100 flex items-center justify-center text-2xl`}>
                  <input type="radio" name="avatar" className="sr-only" checked={draft.avatar === a.id} onChange={() => set({ avatar: a.id })} aria-label={a.label} />
                  <span aria-hidden="true">{a.emoji}</span>
                </label>
              ))}
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
                b.pro ? (
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

          <section aria-labelledby="pro-extras" className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
            <h3 id="pro-extras" className="font-extrabold text-amber-900 flex items-center gap-2"><Lock className="w-4 h-4" aria-hidden="true" /> More with Pro</h3>
            {proNote && <p role="status" className="text-sm font-bold text-amber-900">{proNote}</p>}
            <ul className="text-sm text-amber-900 list-disc pl-5 space-y-0.5">
              {PRO_EXTRAS.map((x) => <li key={x}>{x}</li>)}
            </ul>
            <button type="button" onClick={onOpenPlans} className="px-4 py-2 bg-white border-2 border-amber-300 rounded-xl font-bold text-amber-900 hover:bg-amber-100 cursor-pointer">See Pro plans</button>
          </section>
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
