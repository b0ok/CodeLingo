import { useEffect, useState } from 'react';
import { createClient, Session } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

// Accounts are optional: without these settings the app runs local-only.
export const supabase = url && key ? createClient(url, key) : null;

export function useSession(): Session | null {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  return session;
}

// Sends a one-click sign-in link. `create` is false for "I have an account".
export async function sendSignInLink(email: string, create: boolean): Promise<string | null> {
  if (!supabase) return 'Accounts are not set up in this build yet.';
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: create, emailRedirectTo: window.location.origin },
  });
  // No account for that email looks the same as success, so the form can't be used to learn who has an account.
  if (!error || (!create && /signups not allowed/i.test(error.message))) return null;
  if (error.status === 429) return 'Too many sign-in emails were sent. Wait a few minutes, then try again.';
  return 'The sign-in email could not be sent. Check your connection and try again.';
}

// The database's text_problem() is the word filter for display names, bios and status lines.
export const TEXT_MESSAGES = {
  not_allowed: "isn't allowed. No swearing, insults, or words about anyone's religion, race, sexuality or disability.",
  reserved: 'is reserved for the CodeLingo team. Try another one.',
} as const;

// 'not_allowed', 'reserved', or null when the text is fine (or accounts are off, so nothing is shared).
export async function checkText(text: string): Promise<keyof typeof TEXT_MESSAGES | null> {
  if (!supabase || !text.trim()) return null;
  const { data, error } = await supabase.rpc('text_problem', { t: text });
  return error ? null : (data as keyof typeof TEXT_MESSAGES | null); // the database still enforces it on save
}

// Details chosen during onboarding, saved to the profile once the learner is signed in.
const PENDING_PROFILE_KEY = 'codelingo_pending_profile';

export interface PendingProfile {
  display_name: string;
  active_language: string;
  career_goal: string;
  daily_goal_xp: number;
  username?: string;
}

export function savePendingProfile(p: PendingProfile) {
  try { localStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify(p)); } catch { /* storage blocked */ }
}

// Returns the username that was saved, if any.
export async function flushPendingProfile(session: Session): Promise<string | undefined> {
  if (!supabase) return;
  let pending: PendingProfile | null = null;
  try { pending = JSON.parse(localStorage.getItem(PENDING_PROFILE_KEY) || 'null'); } catch { /* ignore */ }
  if (!pending) return;
  // Only learners who passed the 13+ check reach the sign-up form, so confirming age here is accurate.
  const save = (p: PendingProfile) => supabase!
    .from('profiles')
    .update({ ...p, age_confirmed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', session.user.id);
  let { error } = await save(pending);
  if (error && pending.username && (error.code === '23505' || error.code === '23514')) {
    // Someone claimed the name between the check and the email link: save the rest; they pick another in Profile.
    const { username: _taken, ...rest } = pending;
    ({ error } = await save(rest));
    pending = rest;
  }
  if (error) return;
  localStorage.removeItem(PENDING_PROFILE_KEY);
  return pending.username;
}
