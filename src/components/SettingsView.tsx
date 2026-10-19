import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { PATHWAYS_DATA } from '../data/curriculum';
import { LanguageId } from '../types';
import { supabase, useSession } from '../utils/supabase';
import { AccountDialog } from './Onboarding';
import { HabitRoutinePrompt } from './HabitRoutinePrompt';
import { Modal } from './Modal';
import { TriangleAlert } from 'lucide-react';

const DELETE_PHRASE = 'delete my account';

const DAILY_GOALS = [
  { xp: 20, label: 'Casual', minutes: 5 },
  { xp: 50, label: 'Steady', minutes: 10 },
  { xp: 100, label: 'Serious', minutes: 20 },
  { xp: 150, label: 'Intense', minutes: 30 },
];

const PLAN_NAMES: Record<string, string> = { free: 'Free', novice: 'Novice', pro: 'Pro' };

// Everything this app keeps in the browser (current and older key names).
function clearThisDevice() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('codelingo_') || k.startsWith('pylingo_'))
      .forEach((k) => localStorage.removeItem(k));
  } catch { /* storage blocked */ }
}

function downloadMyData() {
  const data: Record<string, unknown> = { exportedAt: new Date().toISOString() };
  try {
    for (const k of Object.keys(localStorage)) {
      if (!k.startsWith('codelingo_') && !k.startsWith('pylingo_')) continue;
      const raw = localStorage.getItem(k) || '';
      try { data[k] = JSON.parse(raw); } catch { data[k] = raw; }
    }
  } catch { /* storage blocked */ }
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `codelingo-data-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

const Section: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({ id, title, children }) => (
  <section aria-labelledby={id} className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
    <h3 id={id} className="text-lg font-extrabold text-slate-900">{title}</h3>
    {children}
  </section>
);

const secondaryBtn = 'px-4 py-2 border-2 border-slate-300 rounded-xl font-bold text-slate-800 hover:bg-slate-50 cursor-pointer';

export const SettingsView: React.FC<{ onOpenPlans: () => void; onStartQuickLesson: () => void }> = ({ onOpenPlans, onStartQuickLesson }) => {
  const { stats, activeLanguage, setActiveLanguage, setDailyGoalTarget, toggleSound, openRoadmapModal } = useGame();
  const session = useSession();
  const [accountMode, setAccountMode] = useState<'create' | 'signin' | null>(null);
  const [confirm, setConfirm] = useState<'clear' | 'delete' | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [typedEmail, setTypedEmail] = useState('');
  const [typedPhrase, setTypedPhrase] = useState('');
  const [fieldError, setFieldError] = useState<{ email?: string; phrase?: string }>({});

  const closeConfirm = () => {
    if (busy) return;
    setConfirm(null);
    setProblem(null);
    setTypedEmail('');
    setTypedPhrase('');
    setFieldError({});
  };

  // Both must match before anything is deleted.
  const confirmDelete = () => {
    const errors: { email?: string; phrase?: string } = {};
    if (typedEmail.trim().toLowerCase() !== (session?.user.email || '').toLowerCase()) {
      errors.email = "That doesn't match the email on this account.";
    }
    if (typedPhrase.trim().toLowerCase() !== DELETE_PHRASE) {
      errors.phrase = `Type "${DELETE_PHRASE}" exactly.`;
    }
    setFieldError(errors);
    if (errors.email) document.getElementById('delete-email')?.focus();
    else if (errors.phrase) document.getElementById('delete-phrase')?.focus();
    else deleteAccount();
  };

  const deleteAccount = async () => {
    if (!supabase) return;
    setBusy(true);
    const { error } = await supabase.rpc('delete_my_account');
    if (error) {
      setBusy(false);
      setProblem('Your account could not be deleted. Check your connection and try again.');
      return;
    }
    await supabase.auth.signOut();
    clearThisDevice();
    window.location.reload();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 xl:pb-12">
      <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Settings</h2>

      {supabase && (
        <Section id="settings-account" title="Account">
          <p className="text-sm text-slate-600 [overflow-wrap:anywhere]">
            {session ? `Signed in as ${session.user.email}. Your progress is saved to your account.` : 'Create a free account to keep your progress safe and use it on any device.'}
          </p>
          {session ? (
            <button onClick={() => supabase!.auth.signOut()} className={secondaryBtn}>Sign out</button>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setAccountMode('create')} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer">Create account</button>
              <button onClick={() => setAccountMode('signin')} className={secondaryBtn}>Sign in</button>
            </div>
          )}
        </Section>
      )}

      <Section id="settings-learning" title="Learning">
        <div className="space-y-1.5">
          <label htmlFor="settings-course" className="block font-bold text-slate-800">Course</label>
          <select
            id="settings-course"
            value={activeLanguage}
            onChange={(e) => setActiveLanguage(e.target.value as LanguageId)}
            className="w-full sm:w-72 p-2.5 border border-slate-300 rounded-xl text-base bg-white"
          >
            {(Object.keys(PATHWAYS_DATA) as LanguageId[]).map((id) => (
              <option key={id} value={id}>{PATHWAYS_DATA[id].name}</option>
            ))}
          </select>
        </div>

        <fieldset className="space-y-2">
          <legend className="font-bold text-slate-800">Daily goal</legend>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DAILY_GOALS.map((g) => (
              <label
                key={g.xp}
                className="p-3 border-2 rounded-2xl cursor-pointer text-center has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 border-slate-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-emerald-600"
              >
                <input type="radio" name="daily-goal" className="sr-only" checked={stats.dailyGoalTarget === g.xp} onChange={() => setDailyGoalTarget(g.xp)} />
                <span className="block font-bold text-slate-900">{g.label}</span>
                <span className="block text-sm text-slate-600 tabular-nums">{g.xp} XP · {g.minutes} min</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-bold text-slate-800">Career goal</p>
            <p className="text-sm text-slate-600">Shapes your roadmap and check-ins.</p>
          </div>
          <button onClick={() => openRoadmapModal(undefined, 'track')} className={secondaryBtn}>Change goal</button>
        </div>
      </Section>

      <Section id="settings-sound" title="Sound">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p id="sound-label" className="font-bold text-slate-800">Sound effects</p>
            <p className="text-sm text-slate-600">Taps, correct answers and streak sounds.</p>
          </div>
          <button
            role="switch"
            aria-checked={stats.soundEnabled}
            aria-labelledby="sound-label"
            onClick={toggleSound}
            className={`relative w-12 h-7 rounded-full shrink-0 cursor-pointer ${stats.soundEnabled ? 'bg-emerald-600' : 'bg-slate-300'}`}
          >
            <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${stats.soundEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      </Section>

      <div>
        <h3 className="sr-only">Reminders and habits</h3>
        <HabitRoutinePrompt show="settings" onStartQuickLesson={onStartQuickLesson} />
      </div>

      <Section id="settings-plan" title="Plan">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-slate-700">You're on the <strong>{PLAN_NAMES[stats.subscriptionTier] || 'Free'}</strong> plan.</p>
          <button onClick={onOpenPlans} className={secondaryBtn}>See plans</button>
        </div>
      </Section>

      <Section id="settings-data" title="Your data">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-bold text-slate-800">Download my data</p>
            <p className="text-sm text-slate-600">A copy of your progress and settings as a file.</p>
          </div>
          <button onClick={downloadMyData} className={secondaryBtn}>Download</button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-bold text-slate-800">Clear this device</p>
            <p className="text-sm text-slate-600">
              {session ? 'Removes progress saved in this browser. Your account keeps everything.' : 'Removes all progress saved in this browser.'}
            </p>
          </div>
          <button onClick={() => setConfirm('clear')} className={secondaryBtn}>Clear device</button>
        </div>
        {session && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <div>
              <p className="font-bold text-slate-800">Delete account</p>
              <p className="text-sm text-slate-600">Permanently deletes your account and everything saved to it.</p>
            </div>
            <button onClick={() => setConfirm('delete')} className="px-4 py-2 border-2 border-rose-300 text-rose-700 rounded-xl font-bold hover:bg-rose-50 cursor-pointer">
              Delete account
            </button>
          </div>
        )}
      </Section>

      <p className="text-center text-sm text-slate-600">CodeLingo · © 2026 Terry Nguyen. All rights reserved.</p>

      {accountMode && <AccountDialog mode={accountMode} onClose={() => setAccountMode(null)} />}

      {confirm && (
        <Modal
          className="fixed inset-0 z-50 bg-slate-900/60 flex items-end sm:items-center justify-center p-0 sm:p-4"
          label={confirm === 'delete' ? 'Delete your account?' : 'Clear this device?'}
          onClose={closeConfirm}
        >
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 space-y-4">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {confirm === 'delete' ? 'Delete your account?' : 'Clear this device?'}
            </h2>
            <p className="text-slate-600">
              {confirm === 'delete'
                ? `This permanently deletes ${session?.user.email}, your ${stats.xp.toLocaleString()} XP, your ${stats.completedLessons.length} completed lessons, your streak and your badges. This can't be undone.`
                : session
                  ? "This removes progress saved in this browser. You'll stay signed in, and your account keeps everything."
                  : `This removes your ${stats.xp.toLocaleString()} XP, ${stats.completedLessons.length} completed lessons and streak from this browser. Without an account, it can't be undone.`}
            </p>
            {confirm === 'delete' && (
              <>
                <p className="flex gap-2 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-900">
                  <TriangleAlert className="w-5 h-5 shrink-0 text-rose-600" aria-hidden="true" />
                  <span><strong>Warning:</strong> deleting is permanent. We can't restore your account or progress afterwards.</span>
                </p>
                <div className="space-y-1.5">
                  <label htmlFor="delete-email" className="block font-bold text-slate-800">Enter your account's email</label>
                  <input
                    id="delete-email" type="email" autoComplete="off" value={typedEmail} onChange={(e) => setTypedEmail(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl text-base aria-[invalid=true]:border-rose-500"
                    aria-invalid={!!fieldError.email} aria-describedby={fieldError.email ? 'delete-email-error' : undefined}
                  />
                  {fieldError.email && <p id="delete-email-error" className="text-sm text-rose-700">{fieldError.email}</p>}
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="delete-phrase" className="block font-bold text-slate-800">
                    Type <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{DELETE_PHRASE}</span> to confirm
                  </label>
                  <input
                    id="delete-phrase" autoComplete="off" spellCheck={false} value={typedPhrase} onChange={(e) => setTypedPhrase(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl text-base aria-[invalid=true]:border-rose-500"
                    aria-invalid={!!fieldError.phrase} aria-describedby={fieldError.phrase ? 'delete-phrase-error' : undefined}
                  />
                  {fieldError.phrase && <p id="delete-phrase-error" className="text-sm text-rose-700">{fieldError.phrase}</p>}
                </div>
              </>
            )}
            {problem && <p role="alert" className="text-sm text-rose-700">{problem}</p>}
            <button
              disabled={busy}
              onClick={() => {
                if (confirm === 'delete') confirmDelete();
                else { clearThisDevice(); window.location.reload(); }
              }}
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl cursor-pointer disabled:opacity-60"
            >
              {confirm === 'delete' ? (busy ? 'Deleting…' : 'Delete my account') : 'Clear this device'}
            </button>
            <button disabled={busy} onClick={closeConfirm} className="w-full py-3 border-2 border-slate-300 text-slate-800 font-bold rounded-2xl hover:bg-slate-50 cursor-pointer">
              {confirm === 'delete' ? 'Keep my account' : 'Keep my progress'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
