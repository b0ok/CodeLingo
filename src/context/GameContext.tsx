import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { UserStats, DailyQuest, LeaderboardEntry, Badge, LeagueTier, LanguageId, SubscriptionTier } from '../types';
import { INITIAL_BADGES } from '../data/badges';
import { INITIAL_LEADERBOARD_USERS } from '../data/leaderboard';
import { sound } from '../utils/soundEffects';
import { supabase, useSession } from '../utils/supabase';
import { CloudState, Rows, pick, merge, hasProgress, toRows, changedRows, pull, push } from '../utils/cloudSync';
import { SyncChoiceDialog } from '../components/SyncChoiceDialog';
import {
  PersonalizedGoalReminder,
  NotificationPermissionState,
  getNotificationPermission,
  requestNotificationPermission,
  generatePersonalizedReminder,
  dispatchWebNotification,
} from '../utils/notificationService';

interface HighFiveNotification {
  from: string;
  message: string;
  emoji: string;
}

interface GameContextType {
  stats: UserStats;
  badges: Badge[];
  quests: DailyQuest[];
  leaderboard: LeaderboardEntry[];
  currentLeague: LeagueTier;
  activeLanguage: LanguageId;
  setActiveLanguage: (lang: LanguageId) => void;
  loseHeart: () => boolean; // returns true if still has hearts
  refillHearts: () => void;
  gainXpAndGems: (xp: number, gems: number, lessonId?: string, stars?: number) => void;
  buyStreakFreeze: () => boolean;
  refillHeartsWithGems: () => boolean;
  toggleSound: () => void;
  claimQuest: (questId: string) => void;
  cheerLeaderboardUser: (userId: string) => void;
  setDailyGoalTarget: (target: number) => void;
  placeOutOfLessons: (lessonIds: string[]) => void;
  newlyUnlockedBadge: Badge | null;
  dismissBadgeNotification: () => void;
  // Subscription & Monetization
  setSubscriptionTier: (tier: SubscriptionTier) => void;
  // Habit & Reminders
  toggleNotifications: () => void;
  setDailyRoutineTime: (time: string) => void;
  sendHighFive: (toName: string) => void;
  highFiveNotification: HighFiveNotification | null;
  dismissHighFive: () => void;
  activeHabitReminder: string | null;
  triggerHabitReminder: (customMsg?: string) => void;
  dismissHabitReminder: () => void;
  markChallengeCompleted: (challengeId: string) => void;
  // Web Notifications & Inactivity Engine
  notificationPermission: NotificationPermissionState;
  requestBrowserNotifications: () => Promise<NotificationPermissionState>;
  inactivityIntervalSec: number;
  setInactivityIntervalSec: (sec: number) => void;
  inactivityAlertsEnabled: boolean;
  toggleInactivityAlerts: () => void;
  idleSeconds: number;
  activeInactivityReminder: PersonalizedGoalReminder | null;
  dismissInactivityReminder: () => void;
  triggerTestInactivityReminder: (forceNow?: boolean) => void;
  snoozeInactivityReminder: (seconds?: number) => void;
  // Roadmap & Agentic Goal Check-in
  targetCareerTrack: NonNullable<UserStats['targetCareerTrack']>;
  setTargetCareerTrack: (track: NonNullable<UserStats['targetCareerTrack']>) => void;
  checkedInNodes: string[];
  markNodeCheckedIn: (nodeId: string) => void;
  isRoadmapModalOpen: boolean;
  roadmapModalInitialTab: 'roadmap' | 'checkin' | 'track';
  roadmapModalNodeId?: string;
  openRoadmapModal: (nodeId?: string, tab?: 'roadmap' | 'checkin' | 'track') => void;
  closeRoadmapModal: () => void;
  syncStatus: SyncStatus;
}

export type SyncStatus = 'off' | 'loading' | 'saved' | 'saving' | 'offline';
const SYNCED_USER_KEY = 'codelingo_synced_user';

const STORAGE_KEY = 'codelingo_user_stats_v2';
const QUESTS_KEY = 'codelingo_quests_v2';
const BADGES_KEY = 'codelingo_badges_v2';
const LEADERBOARD_KEY = 'codelingo_leaderboard_v2';

// A brand-new learner starts from zero.
const DEFAULT_STATS: UserStats = {
  xp: 0,
  gems: 0,
  streak: 0,
  highestStreak: 0,
  hearts: 5,
  maxHearts: 5,
  streakFreeze: 0,
  completedLessons: [],
  nodeStars: {},
  lastActiveDate: '',
  history: {},
  currentLeague: 'Bronze',
  leagueWeeklyXp: 0,
  unlockedBadgeIds: [],
  dailyGoalTarget: 50,
  activeLanguage: 'python',
  theme: 'emerald',
  soundEnabled: true,
  subscriptionTier: 'free',
  notificationsEnabled: false,
  dailyRoutineTime: '20:00',
  receivedHighFives: 0,
  sentHighFives: 0,
  completedChallenges: [],
  inactivityIntervalSec: 60,
  inactivityAlertsEnabled: false,
  targetCareerTrack: 'ai-ml',
  checkedInNodes: [],
  agentCheckinsCount: 0,
};

const DEFAULT_QUESTS: DailyQuest[] = [
  {
    id: 'quest-xp',
    title: 'Earn 50 XP today',
    target: 50,
    current: 0,
    rewardGems: 15,
    rewardXp: 10,
    isCompleted: false,
    isClaimed: false,
    unitLabel: 'XP',
  },
  {
    id: 'quest-lessons',
    title: 'Complete 2 lessons',
    target: 2,
    current: 0,
    rewardGems: 20,
    rewardXp: 15,
    isCompleted: false,
    isClaimed: false,
    unitLabel: 'Lessons',
  },
  {
    id: 'quest-hearts',
    title: 'Finish a challenge with full life points',
    target: 1,
    current: 0,
    rewardGems: 15,
    rewardXp: 10,
    isCompleted: false,
    isClaimed: false,
    unitLabel: 'Drill',
  },
];

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_STATS,
          ...parsed,
          dailyGoalTarget: parsed.dailyGoalTarget || 50,
          activeLanguage: parsed.activeLanguage || 'python',
          subscriptionTier: parsed.subscriptionTier || 'free',
          dailyRoutineTime: parsed.dailyRoutineTime || '20:00',
          completedChallenges: parsed.completedChallenges || [],
          inactivityIntervalSec: parsed.inactivityIntervalSec || 60,
        };
      }
    } catch {
      // Ignore
    }
    return DEFAULT_STATS;
  });

  const [quests, setQuests] = useState<DailyQuest[]>(() => {
    try {
      const saved = localStorage.getItem(QUESTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return DEFAULT_QUESTS;
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    try {
      const saved = localStorage.getItem(BADGES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return INITIAL_BADGES;
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    try {
      const saved = localStorage.getItem(LEADERBOARD_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return INITIAL_LEADERBOARD_USERS;
  });

  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<Badge | null>(null);
  const [highFiveNotification, setHighFiveNotification] = useState<HighFiveNotification | null>(null);
  const [activeHabitReminder, setActiveHabitReminder] = useState<string | null>(null);

  // Inactivity & Web Notifications state
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermissionState>(() =>
    getNotificationPermission()
  );
  const [inactivityIntervalSec, setInactivityIntervalSecState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('codelingo_inactivity_interval_sec');
      if (saved) return Number(saved);
    } catch {
      // Ignore
    }
    return stats.inactivityIntervalSec || 60;
  });
  const [inactivityAlertsEnabled, setInactivityAlertsEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('codelingo_inactivity_alerts_enabled');
      if (saved) return saved === 'true';
    } catch {
      // Ignore
    }
    return stats.inactivityAlertsEnabled ?? true;
  });
  const [idleSeconds, setIdleSeconds] = useState<number>(0);
  const [activeInactivityReminder, setActiveInactivityReminder] = useState<PersonalizedGoalReminder | null>(null);
  const lastReminderDispatchedAt = useRef<number>(0);
  const isSnoozedUntil = useRef<number>(0);

  // Monitor user activity across mouse, touch, keyboard, scroll, and tab visibility
  useEffect(() => {
    const handleUserActivity = () => {
      setIdleSeconds(0);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleUserActivity();
      }
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('mousedown', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('mousedown', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Inactivity Interval Timer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setIdleSeconds((prevIdle) => {
        const nextIdle = prevIdle + 1;
        const now = Date.now();

        // Check if snoozed
        if (now < isSnoozedUntil.current) {
          return nextIdle;
        }

        // Check if inactivity threshold reached, notifications enabled, and cooldown passed
        if (
          inactivityAlertsEnabled &&
          stats.notificationsEnabled &&
          nextIdle >= inactivityIntervalSec &&
          now - lastReminderDispatchedAt.current > Math.max(30000, inactivityIntervalSec * 1000)
        ) {
          lastReminderDispatchedAt.current = now;

          const today = new Date().toISOString().split('T')[0];
          const todayXp = stats.history[today] || 0;

          const reminder = generatePersonalizedReminder({
            activeLanguage: stats.activeLanguage || 'python',
            dailyGoalTarget: stats.dailyGoalTarget || 50,
            todayXp,
            streak: stats.streak || 1,
            idleSeconds: nextIdle,
          });

          setActiveInactivityReminder(reminder);

          // Dispatch native browser Web Notification
          dispatchWebNotification(reminder, () => {
            setActiveInactivityReminder(null);
          });
        }

        return nextIdle;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    inactivityAlertsEnabled,
    stats.notificationsEnabled,
    inactivityIntervalSec,
    stats.activeLanguage,
    stats.dailyGoalTarget,
    stats.streak,
    stats.history,
  ]);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  // ---------- Cloud progress (signed-in learners) ----------
  // ponytail: last write wins between devices; fine for one learner switching devices, not for two at once.
  const session = useSession();
  const userId = session?.user.id ?? null;
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('off');
  const [syncChoice, setSyncChoice] = useState<{ local: CloudState; cloud: CloudState } | null>(null);
  const lastPushed = useRef<Rows | null>(null);
  const statsRef = useRef(stats);
  statsRef.current = stats;

  const applyCloud = useCallback((s: CloudState) => {
    setStats((prev) => ({ ...prev, ...s }));
    setBadges((prev) => prev.map((b) => (s.unlockedBadgeIds.includes(b.id) ? { ...b, isUnlocked: true, currentProgress: b.maxProgress } : b)));
    sound.setMuted(!s.soundEnabled);
  }, []);

  // Save everything that changed since the last save.
  const flush = useCallback(async () => {
    if (!supabase || !userId || !lastPushed.current) return;
    const rows = toRows(pick(statsRef.current));
    const diff = changedRows(rows, lastPushed.current);
    if (!Object.keys(diff).length) return;
    setSyncStatus('saving');
    try {
      await push(supabase, userId, diff);
      lastPushed.current = rows;
      setSyncStatus('saved');
    } catch {
      setSyncStatus('offline'); // the next change or tab switch tries again
    }
  }, [userId]);

  const finishLink = useCallback(async (result: CloudState, cloud: CloudState) => {
    if (!supabase || !userId) return;
    applyCloud(result);
    try {
      await push(supabase, userId, changedRows(toRows(result), toRows(cloud)));
      lastPushed.current = toRows(result);
      localStorage.setItem(SYNCED_USER_KEY, userId);
      setSyncStatus('saved');
    } catch {
      lastPushed.current = toRows(cloud);
      setSyncStatus('offline');
    }
  }, [userId, applyCloud]);

  // On sign-in: load the account, and decide what happens to this device's progress.
  useEffect(() => {
    lastPushed.current = null;
    setSyncChoice(null);
    if (!supabase || !userId) { setSyncStatus('off'); return; }
    let cancelled = false;
    setSyncStatus('loading');
    pull(supabase, userId).then((cloud) => {
      if (cancelled) return;
      const local = pick(statsRef.current);
      const linked = localStorage.getItem(SYNCED_USER_KEY) === userId;
      if (!hasProgress(cloud)) finishLink(merge(local, cloud), cloud); // new account: bring this device's progress in
      else if (linked || !hasProgress(local)) {
        applyCloud(cloud);
        lastPushed.current = toRows(cloud);
        localStorage.setItem(SYNCED_USER_KEY, userId);
        setSyncStatus('saved');
      } else setSyncChoice({ local, cloud });
    }).catch(() => !cancelled && setSyncStatus('offline'));
    return () => { cancelled = true; };
  }, [userId, applyCloud, finishLink]);

  // Save a moment after progress changes.
  useEffect(() => {
    if (!lastPushed.current) return;
    const timer = setTimeout(flush, 1500);
    return () => clearTimeout(timer);
  }, [stats, flush]);

  // Leaving the tab saves now; coming back picks up progress made on another device.
  useEffect(() => {
    if (!supabase || !userId) return;
    const onVisibility = async () => {
      if (!lastPushed.current) return;
      if (document.visibilityState === 'hidden') { flush(); return; }
      await flush();
      try {
        const cloud = await pull(supabase!, userId);
        applyCloud(cloud);
        lastPushed.current = toRows(cloud);
      } catch { /* stay on local data until the next try */ }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [userId, flush, applyCloud]);

  useEffect(() => {
    localStorage.setItem(QUESTS_KEY, JSON.stringify(quests));
  }, [quests]);

  useEffect(() => {
    localStorage.setItem(BADGES_KEY, JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
  }, [leaderboard]);

  // Daily streak check
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (stats.lastActiveDate !== today) {
      const last = new Date(stats.lastActiveDate);
      const curr = new Date(today);
      const diffDays = Math.round((curr.getTime() - last.getTime()) / (1000 * 3600 * 24));

      if (diffDays === 1) {
        // active on consecutive day!
      } else if (diffDays > 1) {
        // Missed day
        if (stats.streakFreeze > 0) {
          // Freeze saved it
          setStats((prev) => ({
            ...prev,
            streakFreeze: prev.streakFreeze - 1,
            lastActiveDate: today,
          }));
        } else {
          // Reset streak to 1
          setStats((prev) => ({
            ...prev,
            streak: 1,
            lastActiveDate: today,
          }));
        }
      }
    }
  }, [stats.lastActiveDate, stats.streakFreeze]);

  // Keep leaderboard user score in sync with stats.leagueWeeklyXp
  useEffect(() => {
    setLeaderboard((prev) => {
      const updated = prev.map((item) => {
        if (item.isUser) {
          return {
            ...item,
            xp: stats.leagueWeeklyXp,
            streak: stats.streak,
          };
        }
        return item;
      });
      return [...updated].sort((a, b) => b.xp - a.xp);
    });
  }, [stats.leagueWeeklyXp, stats.streak]);

  // Badge evaluation helper
  const evaluateBadges = (currentStats: UserStats) => {
    setBadges((prevBadges) => {
      return prevBadges.map((badge) => {
        if (badge.isUnlocked) return badge;

        let newProgress = badge.currentProgress;
        let unlocked = false;

        if (badge.id === 'first_strike') {
          newProgress = currentStats.completedLessons.length;
          if (newProgress >= 1) unlocked = true;
        } else if (badge.id === 'streak_3') {
          newProgress = currentStats.streak;
          if (newProgress >= 3) unlocked = true;
        } else if (badge.id === 'streak_7') {
          newProgress = currentStats.streak;
          if (newProgress >= 7) unlocked = true;
        } else if (badge.id === 'var_master') {
          const unit2Lessons = currentStats.completedLessons.filter((id) => id.startsWith('lesson-2-')).length;
          newProgress = unit2Lessons;
          if (newProgress >= 3) unlocked = true;
        } else if (badge.id === 'logic_guru') {
          const unit3Lessons = currentStats.completedLessons.filter((id) => id.startsWith('lesson-3-')).length;
          newProgress = unit3Lessons;
          if (newProgress >= 3) unlocked = true;
        } else if (badge.id === 'loop_master') {
          const unit4Lessons = currentStats.completedLessons.filter((id) => id.startsWith('lesson-4-')).length;
          newProgress = unit4Lessons;
          if (newProgress >= 3) unlocked = true;
        } else if (badge.id === 'list_collector') {
          const unit5Lessons = currentStats.completedLessons.filter((id) => id.startsWith('lesson-5-')).length;
          newProgress = unit5Lessons;
          if (newProgress >= 3) unlocked = true;
        } else if (badge.id === 'function_wizard') {
          const unit6Lessons = currentStats.completedLessons.filter((id) => id.startsWith('lesson-6-')).length;
          newProgress = unit6Lessons;
          if (newProgress >= 3) unlocked = true;
        }

        if (unlocked && !currentStats.unlockedBadgeIds.includes(badge.id)) {
          sound.playGem();
          setNewlyUnlockedBadge({ ...badge, isUnlocked: true });
          setStats((p) => ({
            ...p,
            gems: p.gems + 25,
            unlockedBadgeIds: [...p.unlockedBadgeIds, badge.id],
          }));
          return { ...badge, isUnlocked: true, currentProgress: badge.maxProgress };
        }

        return { ...badge, currentProgress: Math.min(newProgress, badge.maxProgress) };
      });
    });
  };

  const loseHeart = (): boolean => {
    // Subscribers get unlimited hearts
    if (stats.subscriptionTier === 'novice' || stats.subscriptionTier === 'pro') {
      sound.playError();
      return true;
    }
    sound.playError();
    let remaining = 0;
    setStats((prev) => {
      const nextHearts = Math.max(0, prev.hearts - 1);
      remaining = nextHearts;
      return { ...prev, hearts: nextHearts };
    });
    return remaining > 0;
  };

  const refillHearts = () => {
    sound.playSuccess();
    setStats((prev) => ({ ...prev, hearts: prev.maxHearts }));
  };

  const refillHeartsWithGems = (): boolean => {
    if (stats.gems < 20) return false;
    sound.playGem();
    setStats((prev) => ({
      ...prev,
      gems: prev.gems - 20,
      hearts: prev.maxHearts,
    }));
    return true;
  };

  const buyStreakFreeze = (): boolean => {
    if (stats.gems < 50) return false;
    sound.playGem();
    setStats((prev) => ({
      ...prev,
      gems: prev.gems - 50,
      streakFreeze: prev.streakFreeze + 1,
    }));
    return true;
  };

  const gainXpAndGems = (xpGained: number, gemsGained: number, lessonId?: string, stars: number = 3) => {
    const today = new Date().toISOString().split('T')[0];
    
    setStats((prev) => {
      const alreadyCompleted = lessonId ? prev.completedLessons.includes(lessonId) : false;
      const newCompleted = lessonId && !alreadyCompleted ? [...prev.completedLessons, lessonId] : prev.completedLessons;
      const currentStars = lessonId ? Math.max(prev.nodeStars[lessonId] || 0, stars) : 0;
      const newNodeStars = lessonId ? { ...prev.nodeStars, [lessonId]: currentStars } : prev.nodeStars;
      
      const newXp = prev.xp + xpGained;
      const newGems = prev.gems + gemsGained;
      const newLeagueXp = prev.leagueWeeklyXp + xpGained;
      
      // Update streak
      let newStreak = prev.streak;
      if (prev.lastActiveDate !== today) {
        newStreak = prev.streak + 1;
        sound.playStreak();
      }

      const updatedHistory = {
        ...prev.history,
        [today]: (prev.history[today] || 0) + xpGained,
      };

      const updatedStats: UserStats = {
        ...prev,
        xp: newXp,
        gems: newGems,
        streak: newStreak,
        highestStreak: Math.max(prev.highestStreak, newStreak),
        lastActiveDate: today,
        leagueWeeklyXp: newLeagueXp,
        completedLessons: newCompleted,
        nodeStars: newNodeStars,
        history: updatedHistory,
      };

      setTimeout(() => evaluateBadges(updatedStats), 100);
      return updatedStats;
    });

    // Update Daily Quests
    setQuests((prevQuests) => {
      return prevQuests.map((q) => {
        let added = 0;
        if (q.id === 'quest-xp') added = xpGained;
        if (q.id === 'quest-lessons' && lessonId) added = 1;
        if (q.id === 'quest-hearts' && stats.hearts === stats.maxHearts) added = 1;

        const newCurrent = Math.min(q.target, q.current + added);
        const completed = newCurrent >= q.target;
        return {
          ...q,
          current: newCurrent,
          isCompleted: completed,
        };
      });
    });
  };

  const claimQuest = (questId: string) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest || !quest.isCompleted || quest.isClaimed) return;

    sound.playGem();
    setStats((prev) => ({
      ...prev,
      gems: prev.gems + quest.rewardGems,
      xp: prev.xp + quest.rewardXp,
      leagueWeeklyXp: prev.leagueWeeklyXp + quest.rewardXp,
    }));

    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, isClaimed: true } : q))
    );
  };

  const cheerLeaderboardUser = (userId: string) => {
    sound.playTap();
    setLeaderboard((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, cheerCount: user.cheerCount + 1 } : user
      )
    );
  };

  const setActiveLanguage = (lang: LanguageId) => {
    sound.playTap();
    setStats((prev) => ({
      ...prev,
      activeLanguage: lang,
    }));
  };

  const placeOutOfLessons = (lessonIds: string[]) => {
    setStats((prev) => ({
      ...prev,
      completedLessons: [...new Set([...prev.completedLessons, ...lessonIds])],
      nodeStars: { ...Object.fromEntries(lessonIds.map((id) => [id, 1])), ...prev.nodeStars },
    }));
  };

  const setDailyGoalTarget = (target: number) => {
    sound.playTap();
    setStats((prev) => ({
      ...prev,
      dailyGoalTarget: target,
    }));
  };

  const toggleSound = () => {
    const next = !stats.soundEnabled;
    sound.setMuted(!next);
    setStats((prev) => ({ ...prev, soundEnabled: next }));
  };

  const dismissBadgeNotification = () => {
    setNewlyUnlockedBadge(null);
  };

  const setSubscriptionTier = (tier: SubscriptionTier) => {
    sound.playVictory();
    setStats((prev) => ({
      ...prev,
      subscriptionTier: tier,
      hearts: prev.maxHearts,
    }));
  };

  const toggleNotifications = () => {
    sound.playTap();
    setStats((prev) => ({
      ...prev,
      notificationsEnabled: !prev.notificationsEnabled,
    }));
  };

  const setDailyRoutineTime = (time: string) => {
    sound.playTap();
    setStats((prev) => ({
      ...prev,
      dailyRoutineTime: time,
    }));
  };

  const sendHighFive = (toName: string) => {
    sound.playSuccess();
    setStats((prev) => ({
      ...prev,
      sentHighFives: prev.sentHighFives + 1,
      xp: prev.xp + 5,
    }));

    // Simulate an encouraging reciprocal high-five response after a moment!
    setTimeout(() => {
      sound.playGem();
      setHighFiveNotification({
        from: toName,
        message: `High-five back! "Awesome work keeping the streak alive! 🙌"`,
        emoji: '🙌',
      });
      setStats((prev) => ({ ...prev, receivedHighFives: prev.receivedHighFives + 1 }));
    }, 1800);
  };

  const dismissHighFive = () => {
    setHighFiveNotification(null);
  };

  const triggerHabitReminder = (customMsg?: string) => {
    sound.playTap();
    setActiveHabitReminder(
      customMsg || `⏰ Routine Check: It's ${stats.dailyRoutineTime}! Just 3 minutes of code keeps your ${stats.streak}-day streak alive.`
    );
  };

  const dismissHabitReminder = () => {
    setActiveHabitReminder(null);
  };

  const markChallengeCompleted = (challengeId: string) => {
    setStats((prev) => ({
      ...prev,
      completedChallenges: prev.completedChallenges.includes(challengeId)
        ? prev.completedChallenges
        : [...prev.completedChallenges, challengeId],
    }));
  };

  const requestBrowserNotifications = useCallback(async (): Promise<NotificationPermissionState> => {
    const perm = await requestNotificationPermission();
    setNotificationPermission(perm);
    return perm;
  }, []);

  const setInactivityIntervalSec = useCallback((sec: number) => {
    sound.playTap();
    setInactivityIntervalSecState(sec);
    localStorage.setItem('codelingo_inactivity_interval_sec', String(sec));
    setStats((prev) => ({ ...prev, inactivityIntervalSec: sec }));
  }, []);

  const toggleInactivityAlerts = useCallback(() => {
    sound.playTap();
    setInactivityAlertsEnabledState((prev) => {
      const next = !prev;
      localStorage.setItem('codelingo_inactivity_alerts_enabled', String(next));
      setStats((s) => ({ ...s, inactivityAlertsEnabled: next }));
      return next;
    });
  }, []);

  const dismissInactivityReminder = useCallback(() => {
    sound.playTap();
    setActiveInactivityReminder(null);
  }, []);

  const snoozeInactivityReminder = useCallback((seconds: number = 300) => {
    sound.playTap();
    isSnoozedUntil.current = Date.now() + seconds * 1000;
    setActiveInactivityReminder(null);
    setIdleSeconds(0);
  }, []);

  const triggerTestInactivityReminder = useCallback((forceNow: boolean = true) => {
    const today = new Date().toISOString().split('T')[0];
    const todayXp = stats.history[today] || 0;
    const testIdle = forceNow ? Math.max(idleSeconds, inactivityIntervalSec) : idleSeconds;

    const reminder = generatePersonalizedReminder({
      activeLanguage: stats.activeLanguage || 'python',
      dailyGoalTarget: stats.dailyGoalTarget || 50,
      todayXp,
      streak: stats.streak || 1,
      idleSeconds: testIdle,
    });

    setActiveInactivityReminder(reminder);
    dispatchWebNotification(reminder, () => {
      setActiveInactivityReminder(null);
    });
  }, [stats.activeLanguage, stats.dailyGoalTarget, stats.history, stats.streak, idleSeconds, inactivityIntervalSec]);

  // Roadmap & Agentic Goal Check-in state
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false);
  const [roadmapModalInitialTab, setRoadmapModalInitialTab] = useState<'roadmap' | 'checkin' | 'track'>('roadmap');
  const [roadmapModalNodeId, setRoadmapModalNodeId] = useState<string | undefined>(undefined);

  const openRoadmapModal = useCallback((nodeId?: string, tab: 'roadmap' | 'checkin' | 'track' = 'roadmap') => {
    setRoadmapModalNodeId(nodeId);
    setRoadmapModalInitialTab(tab);
    setIsRoadmapModalOpen(true);
    sound.playClick();
  }, []);

  const closeRoadmapModal = useCallback(() => {
    setIsRoadmapModalOpen(false);
    sound.playClick();
  }, []);

  const setTargetCareerTrack = useCallback((track: NonNullable<UserStats['targetCareerTrack']>) => {
    setStats((prev) => {
      const next = { ...prev, targetCareerTrack: track };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const markNodeCheckedIn = useCallback((nodeId: string) => {
    setStats((prev) => {
      const currentList = prev.checkedInNodes || [];
      const updated = currentList.includes(nodeId) ? currentList : [...currentList, nodeId];
      const next = {
        ...prev,
        checkedInNodes: updated,
        agentCheckinsCount: (prev.agentCheckinsCount || 0) + 1,
        xp: prev.xp + 40,
        gems: prev.gems + 15,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    sound.playCelebration();
  }, []);

  return (
    <GameContext.Provider
      value={{
        stats,
        badges,
        quests,
        leaderboard,
        currentLeague: stats.currentLeague,
        activeLanguage: stats.activeLanguage || 'python',
        setActiveLanguage,
        loseHeart,
        refillHearts,
        gainXpAndGems,
        buyStreakFreeze,
        refillHeartsWithGems,
        toggleSound,
        claimQuest,
        cheerLeaderboardUser,
        setDailyGoalTarget,
        placeOutOfLessons,
        newlyUnlockedBadge,
        dismissBadgeNotification,
        setSubscriptionTier,
        toggleNotifications,
        setDailyRoutineTime,
        sendHighFive,
        highFiveNotification,
        dismissHighFive,
        activeHabitReminder,
        triggerHabitReminder,
        dismissHabitReminder,
        markChallengeCompleted,
        notificationPermission,
        requestBrowserNotifications,
        inactivityIntervalSec,
        setInactivityIntervalSec,
        inactivityAlertsEnabled,
        toggleInactivityAlerts,
        idleSeconds,
        activeInactivityReminder,
        dismissInactivityReminder,
        triggerTestInactivityReminder,
        snoozeInactivityReminder,
        targetCareerTrack: stats.targetCareerTrack || 'ai-ml',
        setTargetCareerTrack,
        checkedInNodes: stats.checkedInNodes || [],
        markNodeCheckedIn,
        isRoadmapModalOpen,
        roadmapModalInitialTab,
        roadmapModalNodeId,
        openRoadmapModal,
        closeRoadmapModal,
        syncStatus,
      }}
    >
      {children}
      {syncChoice && (
        <SyncChoiceDialog
          local={syncChoice.local}
          cloud={syncChoice.cloud}
          onChoose={(choice) => {
            const { local, cloud } = syncChoice;
            setSyncChoice(null);
            finishLink(choice === 'combine' ? merge(local, cloud) : cloud, cloud);
          }}
        />
      )}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
