import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { Check, X } from 'lucide-react';

// The database's check_username() is the rulebook; this only mirrors the format rule for instant feedback.
export type UsernameStatus = 'empty' | 'checking' | 'ok' | 'taken' | 'invalid' | 'not_allowed' | 'reserved' | 'error' | 'unchanged';

const FORMAT = /^[a-z][a-z0-9_]{2,19}$/;

export const USERNAME_MESSAGES: Record<UsernameStatus, string> = {
  empty: 'Pick a username. 3 to 20 letters, numbers or underscores.',
  checking: 'Checking…',
  ok: 'is available.',
  unchanged: 'This is your username.',
  taken: 'is taken. Try one of these, or add a number:',
  invalid: 'Use 3 to 20 letters, numbers or underscores, starting with a letter.',
  not_allowed: "That username isn't allowed. No swearing, insults, or words about anyone's religion, race, sexuality or disability. CodeLingo is for everyone.",
  reserved: 'That username is reserved. Try another one.',
  error: "We couldn't check that name. Check your connection and try again.",
};

export async function checkUsername(name: string): Promise<UsernameStatus> {
  if (!FORMAT.test(name)) return 'invalid';
  if (!supabase) return 'error';
  const { data, error } = await supabase.rpc('check_username', { name });
  return error ? 'error' : (data as UsernameStatus);
}

async function suggest(base: string): Promise<string[]> {
  const stem = base.replace(/_+$/, '').slice(0, 16);
  const candidates = [...new Set([0, 1, 2, 3, 4].map(() => `${stem}${Math.floor(10 + Math.random() * 990)}`))];
  const results = await Promise.all(candidates.map(async (c) => ((await checkUsername(c)) === 'ok' ? c : null)));
  return results.filter((c): c is string => !!c).slice(0, 3);
}

export const useUsernameCheck = (value: string, current?: string) => {
  const [status, setStatus] = useState<UsernameStatus>('empty');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    setSuggestions([]);
    if (!value) { setStatus('empty'); return; }
    if (current && value === current) { setStatus('unchanged'); return; }
    if (!FORMAT.test(value)) { setStatus('invalid'); return; }
    setStatus('checking');
    let cancelled = false;
    const timer = setTimeout(async () => {
      const s = await checkUsername(value);
      if (cancelled) return;
      setStatus(s);
      if (s === 'taken') {
        const options = await suggest(value);
        if (!cancelled) setSuggestions(options);
      }
    }, 400);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [value, current]);

  return { status, suggestions };
};

export const UsernameField: React.FC<{
  value: string;
  onChange: (v: string) => void;
  status: UsernameStatus;
  suggestions: string[];
  showError: boolean; // after a submit attempt, problems are shown as errors
}> = ({ value, onChange, status, suggestions, showError }) => {
  const good = status === 'ok' || status === 'unchanged';
  const bad = ['taken', 'invalid', 'not_allowed', 'reserved', 'error'].includes(status) || (showError && status === 'empty');
  const message = status === 'ok' || status === 'taken' ? `@${value} ${USERNAME_MESSAGES[status]}` : USERNAME_MESSAGES[status];

  return (
    <div className="space-y-1.5">
      <label htmlFor="username" className="block font-bold text-slate-800">Username</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true">@</span>
        <input
          id="username"
          value={value}
          onChange={(e) => onChange(e.target.value.toLowerCase().replace(/^@/, '').replace(/\s/g, '_'))}
          maxLength={20}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          className="w-full p-3 pl-8 pr-10 border border-slate-300 rounded-xl text-base aria-[invalid=true]:border-rose-500"
          aria-invalid={bad}
          aria-describedby="username-status"
        />
        {good && <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" aria-hidden="true" />}
        {bad && status !== 'empty' && <X className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-600" aria-hidden="true" />}
      </div>
      <p id="username-status" aria-live="polite" className={`text-sm ${good ? 'text-emerald-700' : bad ? 'text-rose-700' : 'text-slate-600'}`}>
        {message}
      </p>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button key={s} type="button" onClick={() => onChange(s)} className="px-3 py-1.5 border-2 border-emerald-300 bg-emerald-50 text-emerald-800 rounded-xl text-sm font-bold cursor-pointer">
              @{s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
