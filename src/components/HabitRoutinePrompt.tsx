import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { PytoMascot } from './PytoMascot';
import { sound } from '../utils/soundEffects';
import { formatIdleTime } from '../utils/notificationService';
import {
  Bell,
  BellRing,
  Clock,
  Flame,
  HeartHandshake,
  Check,
  X,
  Sparkles,
  Zap,
  Volume2,
  Activity,
  Radio,
  CheckCircle2,
  AlertCircle,
  Play,
} from 'lucide-react';

interface HabitRoutinePromptProps {
  onStartQuickLesson: () => void;
  show: 'alerts' | 'settings';
}

export const HabitRoutinePrompt: React.FC<HabitRoutinePromptProps> = ({ onStartQuickLesson, show }) => {
  const {
    stats,
    highFiveNotification,
    dismissHighFive,
    activeHabitReminder,
    triggerHabitReminder,
    dismissHabitReminder,
    toggleNotifications,
    setDailyRoutineTime,
    sendHighFive,
    // Web Inactivity Reminder System
    notificationPermission,
    requestBrowserNotifications,
    inactivityIntervalSec,
    setInactivityIntervalSec,
    inactivityAlertsEnabled,
    toggleInactivityAlerts,
    idleSeconds,
    triggerTestInactivityReminder,
  } = useGame();

  const [isSettingTime, setIsSettingTime] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleSaveRoutineTime = (time: string) => {
    setDailyRoutineTime(time);
    setIsSettingTime(false);
    sound.playTap();
  };

  const handleSimulatePeerHighFive = () => {
    const peers = ['Maya (Rank #2)', 'Alex Chen', 'Elena Rostova', 'Devin Vance'];
    const randomPeer = peers[Math.floor(Math.random() * peers.length)];
    sendHighFive(randomPeer);
  };

  const today = new Date().toISOString().split('T')[0];
  const todayXp = stats.history[today] || 0;
  const targetXp = stats.dailyGoalTarget || 50;
  const xpRemaining = Math.max(0, targetXp - todayXp);
  const idlePercent = Math.min(100, Math.round((idleSeconds / inactivityIntervalSec) * 100));

  const intervalPresets = [
    { label: '15s Test', sec: 15 },
    { label: '30s Demo', sec: 30 },
    { label: '1 min', sec: 60 },
    { label: '2 mins', sec: 120 },
    { label: '5 mins', sec: 300 },
  ];

  return (
    <>
      {/* 1. Floating High-Five Received Notification Toast */}
      {show === 'alerts' && highFiveNotification && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 max-w-sm w-full bg-white border-2 border-emerald-500 rounded-3xl p-4 shadow-2xl animate-in slide-in-from-bottom duration-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center text-xl shrink-0">
              {highFiveNotification.emoji}
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-800">
                {highFiveNotification.from} sent a High-Five!
              </div>
              <div className="text-xs text-slate-600 line-clamp-2">
                {highFiveNotification.message}
              </div>
            </div>
          </div>

          <button
            onClick={dismissHighFive}
            className="p-1.5 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Persistent / Urgent "Streak Saver" Habit Banner */}
      {show === 'alerts' && activeHabitReminder && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4 animate-in slide-in-from-top duration-300">
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white rounded-3xl p-4 sm:p-5 shadow-2xl flex items-center justify-between gap-4 border border-white/20">
            <div className="flex items-center gap-3">
              <PytoMascot mood="concerned" size="sm" showHat={true} />
              <div>
                <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-100">
                  <Flame className="w-3.5 h-3.5 fill-white text-white animate-pulse" />
                  <span>Streak Alert ({stats.streak} Days)</span>
                </div>
                <p className="text-xs sm:text-sm font-bold leading-snug mt-0.5">
                  {activeHabitReminder}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  dismissHabitReminder();
                  onStartQuickLesson();
                }}
                className="px-4 py-2 bg-white text-slate-900 font-extrabold text-xs rounded-xl shadow-md hover:bg-amber-50 cursor-pointer active:scale-95"
              >
                Cook 3 Mins
              </button>

              <button
                onClick={dismissHabitReminder}
                className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Daily Habit & Inactivity Notification Control Card */}
      {show === 'settings' && (
      <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Habit & Inactivity Engine</h4>
              <p className="text-xs text-slate-500">Goal reminders & idle detection</p>
            </div>
          </div>

          <button
            onClick={toggleNotifications}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
              stats.notificationsEnabled
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {stats.notificationsEnabled ? 'Active' : 'Muted'}
          </button>
        </div>

        {/* --- Section A: Web Inactivity Reminders --- */}
        <div className="p-3.5 bg-gradient-to-br from-slate-50 to-emerald-50/30 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>Inactivity Reminder</span>
            </span>

            <button
              onClick={toggleInactivityAlerts}
              className={`text-xs font-extrabold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                inactivityAlertsEnabled
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {inactivityAlertsEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Browser Notification Permission Status */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
            <span className="text-slate-600 text-xs font-medium">Browser Web Push:</span>
            {notificationPermission === 'granted' ? (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Granted
              </span>
            ) : notificationPermission === 'denied' ? (
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-rose-600" />
                Blocked
              </span>
            ) : (
              <button
                onClick={() => requestBrowserNotifications()}
                className="text-xs font-extrabold text-emerald-700 bg-white border border-emerald-300 hover:bg-emerald-50 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
              >
                Enable Web Push 🔔
              </button>
            )}
          </div>

          {/* Inactivity Trigger Interval Selector */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-600 font-medium">Trigger if idle for:</span>
              <span className="font-mono font-bold text-slate-800">
                {formatIdleTime(inactivityIntervalSec)}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1">
              {intervalPresets.map((preset) => (
                <button
                  key={preset.sec}
                  onClick={() => setInactivityIntervalSec(preset.sec)}
                  className={`py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    inactivityIntervalSec === preset.sec
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live Inactivity Tracker & Progress Meter */}
          <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <Activity className="w-3 h-3 text-slate-500" />
                <span>Live Idle Counter:</span>
              </span>
              <span
                className={`font-mono font-bold tabular-nums ${
                  idleSeconds === 0 ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {idleSeconds === 0 ? 'Active 🟢' : `${idleSeconds}s / ${inactivityIntervalSec}s`}
              </span>
            </div>

            {/* Countdown / Idle Bar */}
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition duration-300 rounded-full ${
                  idlePercent >= 100
                    ? 'bg-rose-500'
                    : idlePercent >= 60
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${idlePercent}%` }}
              />
            </div>
          </div>

          {/* Quick Test Trigger Button */}
          <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2">
            <button
              onClick={() => triggerTestInactivityReminder()}
              className="flex-1 py-1.5 px-3 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 text-xs font-extrabold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs active:scale-98"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Test Web Notification Now</span>
            </button>

            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              title="Preview reminder copy"
            >
              {showPreview ? 'Hide' : 'Copy'}
            </button>
          </div>

          {/* Personalized Message Preview */}
          {showPreview && (
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 animate-in fade-in space-y-1">
              <div className="font-extrabold text-slate-900">
                Personalized copy for your goal ({todayXp}/{targetXp} XP):
              </div>
              <p className="text-slate-600 italic">
                {todayXp >= targetXp
                  ? `"🌟 Pyto: Daily Goal Crushed (${todayXp} XP)! Ready for LET ME COOK or bonus practice?"`
                  : xpRemaining <= 15
                  ? `"⚡ Just ${xpRemaining} XP to hit your ${stats.activeLanguage} goal! Finish 1 quick challenge to lock it in!"`
                  : `"🐍 Pyto says: You're idle! Complete your daily ${stats.activeLanguage} goal (${targetXp} XP) to protect your ${stats.streak}-day streak! 🔥"`}
              </p>
            </div>
          )}
        </div>

        {/* --- Section B: Daily Routine Practice Hour --- */}
        <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Routine Practice Hour:
            </span>
            <button
              onClick={() => setIsSettingTime(!isSettingTime)}
              className="font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
            >
              {stats.dailyRoutineTime} ▾
            </button>
          </div>

          {isSettingTime && (
            <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-200/60 animate-in fade-in">
              {['08:00', '12:30', '20:00', '21:30'].map((time) => (
                <button
                  key={time}
                  onClick={() => handleSaveRoutineTime(time)}
                  className={`py-1 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                    stats.dailyRoutineTime === time
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
            <button
              onClick={() => triggerHabitReminder()}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <Zap className="w-3 h-3 text-amber-600" />
              <span>Routine Alarm</span>
            </button>

            <button
              onClick={handleSimulatePeerHighFive}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <HeartHandshake className="w-3 h-3 text-emerald-600" />
              <span>Send High-Five</span>
            </button>
          </div>
        </div>

        {/* High-Fives Tally */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>🙌 High-Fives: <strong className="text-slate-800 tabular-nums">{stats.receivedHighFives}</strong></span>
          <span>Sent: <strong className="text-slate-800 tabular-nums">{stats.sentHighFives}</strong></span>
        </div>
      </div>
      )}
    </>
  );
};
