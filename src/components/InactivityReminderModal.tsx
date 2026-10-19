import React from 'react';
import { useGame } from '../context/GameContext';
import { PytoMascot } from './PytoMascot';
import { sound } from '../utils/soundEffects';
import {
  Flame,
  Target,
  Clock,
  Zap,
  BellRing,
  X,
  Play,
  RotateCcw,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface InactivityReminderModalProps {
  onStartLesson: () => void;
}

export const InactivityReminderModal: React.FC<InactivityReminderModalProps> = ({ onStartLesson }) => {
  const {
    activeInactivityReminder,
    dismissInactivityReminder,
    snoozeInactivityReminder,
    stats,
    notificationPermission,
    requestBrowserNotifications,
  } = useGame();

  if (!activeInactivityReminder) return null;

  const {
    title,
    body,
    badgeText,
    iconEmoji,
    xpRemaining,
    todayXp,
    targetXp,
    progressPercent,
    languageName,
    streak,
    idleSeconds,
    urgencyLevel,
  } = activeInactivityReminder;

  const handleStartCoding = () => {
    sound.playTap();
    dismissInactivityReminder();
    onStartLesson();
  };

  const handleSnooze = () => {
    sound.playTap();
    snoozeInactivityReminder(300); // 5 minutes
  };

  return (
    <aside
      aria-label="Daily Coding Goal Reminder"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-full animate-in slide-in-from-bottom duration-300"
    >
      <div className="bg-white border-2 border-emerald-500 rounded-3xl p-5 shadow-2xl relative overflow-hidden ring-4 ring-emerald-500/10">
        {/* Decorative Top Accent Bar */}
        <div
          className={`h-1.5 w-full absolute top-0 left-0 ${
            urgencyLevel === 'streak_risk'
              ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500'
              : urgencyLevel === 'goal_near'
              ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600'
          }`}
        />

        {/* Header Row: Pyto Mascot + Title + Dismiss Button */}
        <div className="flex items-start justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <PytoMascot
                mood={urgencyLevel === 'streak_risk' ? 'concerned' : urgencyLevel === 'bonus_practice' ? 'celebrating' : 'happy'}
                size="sm"
                showHat={true}
              />
              <span className="absolute -bottom-1 -right-1 text-sm bg-white rounded-full shadow-xs px-0.5">
                {iconEmoji}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    urgencyLevel === 'streak_risk'
                      ? 'bg-orange-100 text-orange-700'
                      : urgencyLevel === 'goal_near'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {badgeText}
                </span>

                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  Idle {idleSeconds}s
                </span>
              </div>

              <h4 className="text-sm font-black text-slate-900 mt-1 leading-snug">
                {title}
              </h4>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              dismissInactivityReminder();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
            title="Dismiss reminder"
            aria-label="Dismiss reminder"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Personalized Reminder Body */}
        <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed">
          {body}
        </p>

        {/* Daily Goal Live Progress Meter */}
        <div className="mt-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-600" />
              <span>{languageName} Daily Goal</span>
            </span>
            <span className="font-black tabular-nums text-slate-800">
              {todayXp} / {targetXp} XP
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                progressPercent >= 100
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              <strong className="text-slate-700">{streak} Days</strong> Streak
            </span>
            <span className="font-semibold text-emerald-700">
              {xpRemaining > 0 ? `${xpRemaining} XP to go` : 'Goal completed!'}
            </span>
          </div>
        </div>

        {/* Notification Permission Prompt if not granted */}
        {notificationPermission === 'default' && (
          <div className="mt-2.5 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-2">
            <div className="text-[11px] text-amber-800 font-semibold flex items-center gap-1.5">
              <BellRing className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Get reminders even when tab is in background</span>
            </div>
            <button
              onClick={() => requestBrowserNotifications()}
              className="text-[11px] font-black text-amber-900 bg-amber-200 hover:bg-amber-300 px-2 py-1 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              Allow
            </button>
          </div>
        )}

        {/* Action Buttons: Cook Now & Snooze */}
        <div className="flex items-center gap-2 mt-4 pt-1">
          <button
            onClick={handleStartCoding}
            className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Cook 2 Mins Now</span>
          </button>

          <button
            onClick={handleSnooze}
            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1"
            title="Snooze reminder for 5 minutes"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Snooze 5m</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
