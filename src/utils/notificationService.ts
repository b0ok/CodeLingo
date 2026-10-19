import { LanguageId } from '../types';
import { sound } from './soundEffects';

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export interface PersonalizedGoalReminder {
  id: string;
  title: string;
  body: string;
  badgeText: string;
  iconEmoji: string;
  xpRemaining: number;
  todayXp: number;
  targetXp: number;
  progressPercent: number;
  activeLanguage: LanguageId;
  languageName: string;
  streak: number;
  idleSeconds: number;
  timestamp: number;
  urgencyLevel: 'normal' | 'streak_risk' | 'goal_near' | 'bonus_practice';
}

/**
 * Check if the browser environment supports the Web Notifications API
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current browser notification permission
 */
export function getNotificationPermission(): NotificationPermissionState {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission as NotificationPermissionState;
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  try {
    const result = await Notification.requestPermission();
    return result as NotificationPermissionState;
  } catch (error) {
    console.warn('Could not request notification permission:', error);
    return 'denied';
  }
}

/**
 * Human-readable language pathway label
 */
export function getLanguageDisplayName(lang: LanguageId): string {
  switch (lang) {
    case 'python':
      return 'Python 3';
    case 'javascript':
      return 'JavaScript (ES6+)';
    case 'sql':
      return 'Relational SQL';
    case 'web':
      return 'HTML & CSS Web';
    default:
      return 'Coding';
  }
}

/**
 * Format idle seconds nicely (e.g. 45s, 2m 15s)
 */
export function formatIdleTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

/**
 * Generate witty, dynamic, personalized reminder copy based on the user's
 * exact daily coding goal, current XP progress, active language, and idle duration.
 */
export function generatePersonalizedReminder(params: {
  activeLanguage: LanguageId;
  dailyGoalTarget: number;
  todayXp: number;
  streak: number;
  idleSeconds: number;
}): PersonalizedGoalReminder {
  const { activeLanguage, dailyGoalTarget, todayXp, streak, idleSeconds } = params;
  const xpRemaining = Math.max(0, dailyGoalTarget - todayXp);
  const progressPercent = Math.min(100, Math.round((todayXp / dailyGoalTarget) * 100));
  const langName = getLanguageDisplayName(activeLanguage);
  const idleStr = formatIdleTime(idleSeconds);
  const reminderId = `reminder-${Date.now()}`;

  // Case 1: Daily goal already achieved today -> Encourage bonus drills or LET ME COOK
  if (todayXp >= dailyGoalTarget) {
    return {
      id: reminderId,
      title: `🌟 Pyto: Daily Goal Crushed! (${todayXp} XP)`,
      body: `You've been idle for ${idleStr}. Why not test your speed in the 'LET ME COOK' terminal or play in the ${langName} sandbox?`,
      badgeText: 'Goal Complete! Bonus XP',
      iconEmoji: '🚀',
      xpRemaining: 0,
      todayXp,
      targetXp: dailyGoalTarget,
      progressPercent: 100,
      activeLanguage,
      languageName: langName,
      streak,
      idleSeconds,
      timestamp: Date.now(),
      urgencyLevel: 'bonus_practice',
    };
  }

  // Case 2: Very close to goal (1-15 XP remaining)
  if (xpRemaining <= 15) {
    return {
      id: reminderId,
      title: `⚡ Just ${xpRemaining} XP to hit your ${langName} goal!`,
      body: `You've been idle for ${idleStr}. One quick 90-second bite-sized challenge will seal your daily target for today!`,
      badgeText: `Almost Done (${progressPercent}%)`,
      iconEmoji: '⚡',
      xpRemaining,
      todayXp,
      targetXp: dailyGoalTarget,
      progressPercent,
      activeLanguage,
      languageName: langName,
      streak,
      idleSeconds,
      timestamp: Date.now(),
      urgencyLevel: 'goal_near',
    };
  }

  // Case 3: Significant streak at risk (streak >= 3 days) and not started yet today
  if (streak >= 3 && todayXp === 0) {
    return {
      id: reminderId,
      title: `🔥 Don't freeze your ${streak}-day streak!`,
      body: `You've been away for ${idleStr}. Your daily ${langName} goal (${dailyGoalTarget} XP) is waiting. Keep that flame alive before midnight!`,
      badgeText: `${streak}-Day Streak Alert`,
      iconEmoji: '🔥',
      xpRemaining,
      todayXp,
      targetXp: dailyGoalTarget,
      progressPercent,
      activeLanguage,
      languageName: langName,
      streak,
      idleSeconds,
      timestamp: Date.now(),
      urgencyLevel: 'streak_risk',
    };
  }

  // Case 4: Standard Inactivity Goal Nudge (0 XP or in progress)
  if (todayXp === 0) {
    const freshGreetings = [
      `🐍 Pyto says: Step away from the idle, time for ${langName}!`,
      `💻 2-minute coding break: Your daily goal is 0/${dailyGoalTarget} XP.`,
      `⏰ Quick habit check: Your ${langName} learning pathway is calling!`,
    ];
    const greeting = freshGreetings[Math.floor(Math.random() * freshGreetings.length)];

    return {
      id: reminderId,
      title: greeting,
      body: `Inactive for ${idleStr}. Solve 1 bite-sized challenge now to kickstart your daily goal (${dailyGoalTarget} XP) & keep your streak!`,
      badgeText: `Daily Target: ${dailyGoalTarget} XP`,
      iconEmoji: '🐍',
      xpRemaining,
      todayXp,
      targetXp: dailyGoalTarget,
      progressPercent: 0,
      activeLanguage,
      languageName: langName,
      streak,
      idleSeconds,
      timestamp: Date.now(),
      urgencyLevel: 'normal',
    };
  }

  // Case 5: Mid-progress (e.g. 20/50 XP)
  return {
    id: reminderId,
    title: `🎯 ${progressPercent}% done: Finish your daily ${langName} goal!`,
    body: `You've been idle for ${idleStr}. You're making progress (${todayXp}/${dailyGoalTarget} XP)—knock out the remaining ${xpRemaining} XP now!`,
    badgeText: `${xpRemaining} XP to target`,
    iconEmoji: '🎯',
    xpRemaining,
    todayXp,
    targetXp: dailyGoalTarget,
    progressPercent,
    activeLanguage,
    languageName: langName,
    streak,
    idleSeconds,
    timestamp: Date.now(),
    urgencyLevel: 'normal',
  };
}

/**
 * Dispatches a native browser notification (if permission granted)
 * and plays a gamified audio chime.
 */
export function dispatchWebNotification(
  reminder: PersonalizedGoalReminder,
  onAction?: () => void
): boolean {
  // Always play notification chime
  sound.playNotification();

  // If Notification API is available and permission is granted, display native OS prompt
  if (isNotificationSupported() && Notification.permission === 'granted') {
    try {
      const nativeNotif = new Notification(reminder.title, {
        body: reminder.body,
        icon: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=128&auto=format&fit=crop&q=80',
        badge: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=64&auto=format&fit=crop&q=80',
        tag: 'codelingo-daily-goal-reminder', // Replaces previous notification instead of stacking clutter
        silent: false,
      });

      nativeNotif.onclick = () => {
        try {
          window.focus();
        } catch {
          // Ignore focus restriction
        }
        if (onAction) {
          onAction();
        }
        nativeNotif.close();
      };

      return true;
    } catch (err) {
      console.warn('Native notification dispatch error:', err);
      return false;
    }
  }

  return false;
}
