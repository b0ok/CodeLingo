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
  if (!error) return null;
  if (!create && /signups not allowed/i.test(error.message)) {
    return "We couldn't find an account with that email. Check the spelling, or start learning to create one.";
  }
  if (error.status === 429) return 'Too many sign-in emails were sent. Wait a few minutes, then try again.';
  return 'The sign-in email could not be sent. Check your connection and try again.';
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
