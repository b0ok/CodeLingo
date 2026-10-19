import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { getUnitsForLanguage, getPathway } from '../data/curriculum';
import { CAREER_TRACKS } from '../data/pythonRoadmap';
import { JS_CAREER_TRACKS } from '../data/jsRoadmap';
import { SQL_CAREER_TRACKS } from '../data/sqlRoadmap';
import { WEB_CAREER_TRACKS } from '../data/webRoadmap';
import { Challenge, LanguageId, UserStats } from '../types';
import { Modal } from './Modal';
import { sendSignInLink, savePendingProfile } from '../utils/supabase';
import { ArrowLeft, Check, Mail, ShieldCheck } from 'lucide-react';

// ---------- Where the learner is in onboarding (kept in this browser) ----------

export type OnboardingStage = 'intro' | 'lesson' | 'account' | 'welcome' | 'done';
const STAGE_KEY = 'codelingo_onboarding_v1';
const AGE_GATE_KEY = 'codelingo_age_gate';

export function loadStage(): OnboardingStage {
  try {
    const saved = localStorage.getItem(STAGE_KEY) as OnboardingStage | null;
    if (saved) return saved === 'lesson' ? 'done' : saved; // a reload mid-lesson just drops them on their path
    // Learners who were here before onboarding existed skip it.
    return localStorage.getItem('codelingo_user_stats_v2') ? 'done' : 'intro';
  } catch {
    return 'done';
  }
}

export function saveStage(stage: OnboardingStage) {
  try { localStorage.setItem(STAGE_KEY, stage); } catch { /* storage blocked */ }
}

function isAgeBlocked() {
  try { return localStorage.getItem(AGE_GATE_KEY) === 'under13'; } catch { return false; }
}

// ---------- Shared pieces ----------

const COURSES: { id: LanguageId; outcome: string }[] = [
  { id: 'python', outcome: 'Automate tasks, work with data and start with AI' },
  { id: 'javascript', outcome: 'Make websites interactive and build web apps' },
  { id: 'sql', outcome: 'Ask questions of data and power real apps' },
  { id: 'web', outcome: 'Build and style your own web pages' },
];

type Track = { id: NonNullable<UserStats['targetCareerTrack']>; name: string; tagline: string };
const TRACKS: Record<LanguageId, Track[]> = {
  python: CAREER_TRACKS,
  javascript: JS_CAREER_TRACKS as Track[],
  sql: SQL_CAREER_TRACKS as Track[],
  web: WEB_CAREER_TRACKS as Track[],
};

const DAILY_GOALS = [
  { minutes: 5, xp: 20, label: 'Casual' },
  { minutes: 10, xp: 50, label: 'Steady' },
  { minutes: 20, xp: 100, label: 'Serious' },
];

// One placement question per unit: the first multiple-choice challenge in it.
function placementQuestions(lang: LanguageId): Challenge[] {
  return getUnitsForLanguage(lang)
    .slice(0, 5)
    .map((u) => u.nodes.flatMap((n) => n.challenges).find((c) => c.options?.length && c.correctOptionId))
    .filter((c): c is Challenge => !!c);
}

// Moves focus to each new screen's heading so keyboard and screen reader users land in the right place.
function useHeadingFocus(key: unknown) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => { ref.current?.focus(); }, [key]);
  return ref;
}

const choiceClass =
  'w-full text-left p-4 bg-white border-2 border-slate-200 rounded-2xl hover:border-emerald-400 focus-visible:outline-2 focus-visible:outline-emerald-600 cursor-pointer';
const primaryClass =
  'w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl cursor-pointer disabled:opacity-60';
const inputClass =
  'w-full p-3 border border-slate-300 rounded-xl text-base focus-visible:outline-2 focus-visible:outline-emerald-600 aria-[invalid=true]:border-rose-500';

// ---------- Before the first lesson ----------

type IntroStep = 'welcome' | 'course' | 'goal' | 'level' | 'placement' | 'placed' | 'daily';
const NUMBERED: IntroStep[] = ['course', 'goal', 'level', 'daily'];

export const OnboardingIntro: React.FC<{ onFinish: (lang: LanguageId, skippedLessonIds: string[]) => void }> = ({ onFinish }) => {
  const { setActiveLanguage, setTargetCareerTrack, setDailyGoalTarget, placeOutOfLessons } = useGame();
  const [step, setStep] = useState<IntroStep>('welcome');
  const [history, setHistory] = useState<IntroStep[]>([]);
  const [lang, setLang] = useState<LanguageId>('python');
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [signingIn, setSigningIn] = useState(false);
  const heading = useHeadingFocus(`${step}-${answers.length}`);

  const go = (next: IntroStep) => { setHistory((h) => [...h, step]); setStep(next); };
  const back = () => {
    const prev = history[history.length - 1];
    if (!prev) return;
    if (step === 'placement' || step === 'placed' || (step === 'daily' && prev === 'placed')) {
      setAnswers([]);
      setHistory((h) => h.slice(0, h.lastIndexOf('level')));
      setStep('level');
      return;
    }
    setHistory((h) => h.slice(0, -1));
    setStep(prev);
  };

  const questions = placementQuestions(lang);
  const units = getUnitsForLanguage(lang);
  const firstMiss = answers.indexOf(false);
  const placedUnit = answers.length === 0 ? 0 : firstMiss === -1 ? answers.length : firstMiss;
  const skipped = units.slice(0, placedUnit).flatMap((u) => u.nodes.map((n) => n.id));

  const finish = (goalXp: number) => {
    setDailyGoalTarget(goalXp);
    if (skipped.length) placeOutOfLessons(skipped);
    onFinish(lang, skipped);
  };

  const stepNumber = NUMBERED.indexOf(step === 'placement' || step === 'placed' ? 'level' : step);
  const h1 = 'text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight outline-none [text-wrap:balance]';

  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col">
      <header className="max-w-xl w-full mx-auto px-4 pt-6 flex items-center gap-3 min-h-14">
        {history.length > 0 && (
          <button onClick={back} className="p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-200 cursor-pointer" aria-label="Back">
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
        {stepNumber >= 0 && (
          <div className="flex-1 flex items-center gap-3">
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden" aria-hidden="true">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${((stepNumber + 1) / NUMBERED.length) * 100}%` }} />
            </div>
            <span className="text-sm text-slate-600 tabular-nums">Step {stepNumber + 1} of {NUMBERED.length}</span>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-8 space-y-6">
        {step === 'welcome' && (
          <section className="text-center space-y-6 pt-8">
            <p className="text-sm font-bold text-emerald-700 uppercase tracking-wider">CodeLingo</p>
            <h1 ref={heading} tabIndex={-1} className={h1}>Learn to code with real code, 5 minutes a day</h1>
            <p className="text-slate-600 text-lg [text-wrap:pretty]">
              Python, JavaScript, SQL and HTML &amp; CSS. Every answer is tested in real Python, Node and SQLite, and your code runs right in your browser.
            </p>
            <div className="space-y-3 max-w-sm mx-auto">
              <button onClick={() => go('course')} className={primaryClass}>Start learning</button>
              <button onClick={() => setSigningIn(true)} className="w-full py-3.5 border-2 border-slate-300 text-slate-800 font-bold rounded-2xl hover:bg-white cursor-pointer">
                I have an account
              </button>
            </div>
            <p className="text-sm text-slate-600">Free. No card needed.</p>
          </section>
        )}

        {step === 'course' && (
          <section className="space-y-4">
            <h1 ref={heading} tabIndex={-1} className={h1}>What do you want to learn?</h1>
            {COURSES.map((c) => (
              <button key={c.id} className={choiceClass} onClick={() => { setLang(c.id); setActiveLanguage(c.id); setAnswers([]); go('goal'); }}>
                <span className="block font-bold text-slate-900">{getPathway(c.id).name}</span>
                <span className="block text-sm text-slate-600 mt-0.5">{c.outcome}</span>
              </button>
            ))}
          </section>
        )}

        {step === 'goal' && (
          <section className="space-y-4">
            <h1 ref={heading} tabIndex={-1} className={h1}>What's your goal with {getPathway(lang).name}?</h1>
            <p className="text-slate-600">We'll shape your roadmap around it. You can change it any time.</p>
            {TRACKS[lang].map((t) => (
              <button key={t.id} className={choiceClass} onClick={() => { setTargetCareerTrack(t.id); go('level'); }}>
                <span className="block font-bold text-slate-900">{t.name}</span>
                <span className="block text-sm text-slate-600 mt-0.5">{t.tagline}</span>
              </button>
            ))}
          </section>
        )}

        {step === 'level' && (
          <section className="space-y-4">
            <h1 ref={heading} tabIndex={-1} className={h1}>Where are you starting?</h1>
            <button className={choiceClass} onClick={() => { setAnswers([]); go('daily'); }}>
              <span className="block font-bold text-slate-900">I'm brand new</span>
              <span className="block text-sm text-slate-600 mt-0.5">Start from the first lesson</span>
            </button>
            {questions.length > 0 && (
              <button className={choiceClass} onClick={() => { setAnswers([]); go('placement'); }}>
                <span className="block font-bold text-slate-900">I know some already</span>
                <span className="block text-sm text-slate-600 mt-0.5">Take a {questions.length}-question check and skip what you know</span>
              </button>
            )}
          </section>
        )}

        {step === 'placement' && answers.length < questions.length && (() => {
          const q = questions[answers.length];
          return (
            <section className="space-y-4">
              <p className="text-sm font-bold text-slate-600 tabular-nums">Question {answers.length + 1} of {questions.length}</p>
              <h1 ref={heading} tabIndex={-1} className="text-xl font-extrabold text-slate-900 outline-none">{q.instruction}</h1>
              {q.codeSnippet && (
                <pre className="p-4 bg-slate-900 text-emerald-300 rounded-2xl text-sm overflow-x-auto"><code>{q.codeSnippet}</code></pre>
              )}
              {q.options!.map((o) => (
                <button key={o.id} className={choiceClass} onClick={() => {
                  const next = [...answers, o.id === q.correctOptionId];
                  setAnswers(next);
                  // Stop at the first miss: that's where they start.
                  if (!next[next.length - 1] || next.length === questions.length) go('placed');
                }}>
                  <span className={o.isCode ? 'font-mono text-sm' : ''}>{o.text}</span>
                </button>
              ))}
              <button className="text-sm font-bold text-slate-600 underline cursor-pointer" onClick={() => { setAnswers([...answers, false]); go('placed'); }}>
                I'm not sure
              </button>
            </section>
          );
        })()}

        {step === 'placed' && (
          <section className="space-y-4">
            <h1 ref={heading} tabIndex={-1} className={h1}>
              {placedUnit === 0 ? "Let's start from the beginning" : `You'll start at Unit ${units[placedUnit]?.unitNumber ?? placedUnit + 1}`}
            </h1>
            <p className="text-slate-600">
              {placedUnit === 0
                ? 'The first lessons move quickly, so you can catch up fast.'
                : `You tested out of ${placedUnit} unit${placedUnit === 1 ? '' : 's'}. Next up: ${units[placedUnit]?.title ?? 'the rest of the course'}. Skipped lessons stay open if you want a refresher.`}
            </p>
            <button onClick={() => go('daily')} className={primaryClass}>Continue</button>
          </section>
        )}

        {step === 'daily' && (
          <section className="space-y-4">
            <h1 ref={heading} tabIndex={-1} className={h1}>How much time a day?</h1>
            <p className="text-slate-600">Small and steady beats big and rare. You can change this later.</p>
            {DAILY_GOALS.map((g) => (
              <button key={g.minutes} className={choiceClass} onClick={() => finish(g.xp)}>
                <span className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{g.minutes} minutes a day</span>
                  <span className="text-sm text-slate-600">{g.label}</span>
                </span>
              </button>
            ))}
          </section>
        )}
      </main>

      {signingIn && <AccountDialog mode="signin" onClose={() => setSigningIn(false)} />}
    </div>
  );
};

// ---------- Account: create (after the first win) or sign in ----------

function ageFrom(isoDate: string): number {
  const b = new Date(isoDate + 'T00:00:00');
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  if (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) age--;
  return age;
}

export const AccountDialog: React.FC<{ mode: 'create' | 'signin'; onClose: () => void; intro?: string }> = ({ mode, onClose, intro }) => {
  const { activeLanguage, targetCareerTrack, stats } = useGame();
  const [step, setStep] = useState<'birthday' | 'details' | 'sent' | 'blocked'>(
    mode === 'signin' ? 'details' : isAgeBlocked() ? 'blocked' : 'birthday',
  );
  const [birthday, setBirthday] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<{ field: 'birthday' | 'email' | 'form'; text: string } | null>(null);
  const [sending, setSending] = useState(false);
  const heading = useHeadingFocus(step);
  const today = new Date().toISOString().split('T')[0];

  const submitBirthday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthday || birthday > today || ageFrom(birthday) > 120) {
      setError({ field: 'birthday', text: 'Enter your birthday, for example 2008-05-14.' });
      return;
    }
    setError(null);
    if (ageFrom(birthday) < 13) {
      try { localStorage.setItem(AGE_GATE_KEY, 'under13'); } catch { /* storage blocked */ }
      setStep('blocked');
    } else {
      setStep('details');
    }
  };

  const submitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError({ field: 'email', text: 'Enter your email address, like name@example.com.' });
      return;
    }
    setError(null);
    setSending(true);
    if (mode === 'create') {
      savePendingProfile({
        display_name: name.trim().slice(0, 40) || 'Learner',
        active_language: activeLanguage,
        career_goal: targetCareerTrack,
        daily_goal_xp: stats.dailyGoalTarget,
      });
    }
    const problem = await sendSignInLink(trimmed, mode === 'create');
    setSending(false);
    if (problem) setError({ field: 'form', text: problem });
    else setStep('sent');
  };

  const h2 = 'text-2xl font-extrabold text-slate-900 tracking-tight outline-none';
  const errorFor = (field: 'birthday' | 'email') =>
    error?.field === field ? <p id={`${field}-error`} className="text-sm text-rose-700">{error.text}</p> : null;

  return (
    <Modal
      className="fixed inset-0 z-50 bg-slate-900/60 flex items-end sm:items-center justify-center p-0 sm:p-4"
      label={mode === 'signin' ? 'Sign in' : 'Create your account'}
      onClose={onClose}
    >
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 space-y-5 max-h-dvh overflow-y-auto">
        {step === 'birthday' && (
          <form onSubmit={submitBirthday} noValidate className="space-y-4">
            <h2 ref={heading} tabIndex={-1} className={h2}>{intro || 'Save your progress'}</h2>
            <p className="text-slate-600">Create a free account to keep your streak and pick up on any device.</p>
            <div className="space-y-1.5">
              <label htmlFor="birthday" className="block font-bold text-slate-800">What's your birthday?</label>
              <input
                id="birthday" type="date" max={today} value={birthday} onChange={(e) => setBirthday(e.target.value)}
                className={inputClass} aria-invalid={error?.field === 'birthday'} aria-describedby="birthday-hint birthday-error"
              />
              <p id="birthday-hint" className="text-sm text-slate-600">We only use this to keep CodeLingo safe. We don't store your birthday.</p>
              {errorFor('birthday')}
            </div>
            <button type="submit" className={primaryClass}>Continue</button>
            <button type="button" onClick={onClose} className="w-full py-2 text-slate-600 font-bold cursor-pointer">Not now</button>
          </form>
        )}

        {step === 'blocked' && (
          <div className="space-y-4">
            <h2 ref={heading} tabIndex={-1} className={h2}>Keep learning on this device</h2>
            <p className="text-slate-600">
              CodeLingo accounts are for ages 13 and up. You can keep doing every lesson here. Your progress stays on this device and isn't sent anywhere.
            </p>
            <button onClick={onClose} className={primaryClass}>Keep learning</button>
          </div>
        )}

        {step === 'details' && (
          <form onSubmit={submitDetails} noValidate className="space-y-4">
            <h2 ref={heading} tabIndex={-1} className={h2}>{mode === 'signin' ? 'Sign in' : 'Create your account'}</h2>
            {mode === 'create' && (
              <div className="space-y-1.5">
                <label htmlFor="display-name" className="block font-bold text-slate-800">Display name</label>
                <input id="display-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoComplete="nickname" className={inputClass} aria-describedby="name-hint" />
                <p id="name-hint" className="text-sm text-slate-600">Shown on leaderboards. Use a nickname, not your full name.</p>
              </div>
            )}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block font-bold text-slate-800">Email</label>
              <input
                id="email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className={inputClass} aria-invalid={error?.field === 'email'} aria-describedby="email-hint email-error"
              />
              <p id="email-hint" className="text-sm text-slate-600">We'll email you a one-click sign-in link. No password needed.</p>
              {errorFor('email')}
            </div>
            {error?.field === 'form' && <p role="alert" className="text-sm text-rose-700">{error.text}</p>}
            <button type="submit" disabled={sending} className={primaryClass}>
              {sending ? 'Sending…' : 'Email me a sign-in link'}
            </button>
            <p className="flex gap-2 text-sm text-slate-600">
              <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-emerald-700" aria-hidden="true" />
              <span>We store your email and progress, nothing else. We never sell your data.</span>
            </p>
            <button type="button" onClick={onClose} className="w-full py-2 text-slate-600 font-bold cursor-pointer">
              {mode === 'signin' ? 'Cancel' : 'Not now'}
            </button>
          </form>
        )}

        {step === 'sent' && (
          <div className="space-y-4" role="status">
            <Mail className="w-10 h-10 text-emerald-600" aria-hidden="true" />
            <h2 ref={heading} tabIndex={-1} className={h2}>Check your email</h2>
            <p className="text-slate-600">
              We sent a sign-in link to <strong className="text-slate-900 [overflow-wrap:anywhere]">{email.trim()}</strong>. Open it on this device to finish. It can take a minute to arrive.
            </p>
            <button onClick={onClose} className={primaryClass}>{mode === 'signin' ? 'Done' : 'Keep learning'}</button>
            <button onClick={() => { setStep('details'); setError(null); }} className="w-full py-2 text-slate-600 font-bold cursor-pointer">
              Use a different email
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

// ---------- After the account step: the plan and reminders ----------

export const WelcomeDialog: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const { stats, activeLanguage, requestBrowserNotifications, toggleNotifications } = useGame();
  const [reminder, setReminder] = useState<'idle' | 'on' | 'denied'>(stats.notificationsEnabled ? 'on' : 'idle');
  const heading = useHeadingFocus(0);
  const minutes = DAILY_GOALS.find((g) => g.xp === stats.dailyGoalTarget)?.minutes ?? 10;
  const next = getUnitsForLanguage(activeLanguage).flatMap((u) => u.nodes).find((n) => !stats.completedLessons.includes(n.id));

  const turnOnReminders = async () => {
    const result = await requestBrowserNotifications();
    if (result === 'granted') {
      if (!stats.notificationsEnabled) toggleNotifications();
      setReminder('on');
    } else {
      setReminder('denied');
    }
  };

  return (
    <Modal className="fixed inset-0 z-50 bg-slate-900/60 flex items-end sm:items-center justify-center p-0 sm:p-4" label="You're all set" onClose={onDone}>
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 space-y-5">
        <h2 ref={heading} tabIndex={-1} className="text-2xl font-extrabold text-slate-900 tracking-tight outline-none">You're all set</h2>
        <ul className="space-y-3">
          <li className="flex gap-3"><Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" /><span><strong>{getPathway(activeLanguage).name}</strong>, {minutes} minutes a day</span></li>
          <li className="flex gap-3"><Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" /><span>This week: 5 lessons</span></li>
          {next && <li className="flex gap-3"><Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" /><span>Next up: {next.title}</span></li>}
        </ul>
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
          <p className="font-bold text-slate-900">Want a daily reminder?</p>
          <p className="text-sm text-slate-600">One nudge a day at your practice time. Turn it off any time.</p>
          {reminder === 'idle' && (
            <button onClick={turnOnReminders} className="px-4 py-2 border-2 border-slate-300 rounded-xl font-bold text-slate-800 hover:bg-white cursor-pointer">
              Turn on reminders
            </button>
          )}
          {reminder === 'on' && <p role="status" className="text-sm font-bold text-emerald-700">Reminders are on.</p>}
          {reminder === 'denied' && (
            <p role="status" className="text-sm text-slate-700">Your browser blocked notifications. You can allow them in your browser's site settings later.</p>
          )}
        </div>
        <button onClick={onDone} className={primaryClass}>Go to my path</button>
      </div>
    </Modal>
  );
};
