import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { getRoadmapProgress } from '../data/roadmapProgress';
import { Flame, Gem, Trophy, ChevronRight, ShieldCheck, Sparkles, Target, Settings2, Check, Plus, Minus, CheckSquare, Shuffle, Play, Compass, Brain } from 'lucide-react';
import { sound } from '../utils/soundEffects';
import { HabitRoutinePrompt } from './HabitRoutinePrompt';
import { CAREER_TRACKS } from '../data/pythonRoadmap';
import { WEB_CAREER_TRACKS } from '../data/webRoadmap';
import { JS_CAREER_TRACKS } from '../data/jsRoadmap';
import { SQL_CAREER_TRACKS } from '../data/sqlRoadmap';

interface DailySidebarProps {
  onOpenLeagues: () => void;
  onOpenShop: () => void;
  onStartQuickLesson?: () => void;
}

interface RandomTask {
  id: string;
  title: string;
  target: number;
  current: number;
  rewardGems: number;
  rewardXp: number;
  unit: string;
  isClaimed: boolean;
}

export const DailySidebar: React.FC<DailySidebarProps> = ({
  onOpenLeagues,
  onOpenShop,
  onStartQuickLesson,
}) => {
  const {
    stats,
    quests,
    claimQuest,
    currentLeague,
    setDailyGoalTarget,
    gainXpAndGems,
    openRoadmapModal,
    checkedInNodes,
    targetCareerTrack,
  } = useGame();
  const [isConfiguringGoal, setIsConfiguringGoal] = useState(false);

  // Randomized Daily Tasks Pool & State
  const RANDOM_TASK_POOL = [
    { id: 'lessons-2', title: 'Finish 2 lessons', target: 2, rewardGems: 15, rewardXp: 20, unit: 'lessons' },
    { id: 'practice-5', title: 'Practice for 5 minutes', target: 5, rewardGems: 15, rewardXp: 15, unit: 'mins' },
    { id: 'perfect-1', title: 'Score 100% on a drill', target: 1, rewardGems: 20, rewardXp: 20, unit: 'drill' },
    { id: 'bug-1', title: 'Spot 1 syntax bug', target: 1, rewardGems: 10, rewardXp: 15, unit: 'bug' },
    { id: 'sandbox-1', title: 'Run a script in Sandbox', target: 1, rewardGems: 15, rewardXp: 15, unit: 'run' },
    { id: 'xp-30', title: 'Earn 30 points today', target: 30, rewardGems: 15, rewardXp: 20, unit: 'XP' },
    { id: 'cheer-1', title: 'Cheer a student on the board', target: 1, rewardGems: 10, rewardXp: 10, unit: 'cheer' },
  ];

  const pickRandomTasks = (): RandomTask[] => {
    const shuffled = [...RANDOM_TASK_POOL].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3).map((t, idx) => ({
      ...t,
      current: idx === 0 ? 1 : 0,
      isClaimed: false,
    }));
  };

  const [randomTasks, setRandomTasks] = useState<RandomTask[]>(() => {
    try {
      const saved = localStorage.getItem('pylingo_random_tasks_v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return [
      { id: 'lessons-2', title: 'Finish 2 lessons', target: 2, current: 1, rewardGems: 15, rewardXp: 20, unit: 'lessons', isClaimed: false },
      { id: 'practice-5', title: 'Practice for 5 minutes', target: 5, current: 3, rewardGems: 15, rewardXp: 15, unit: 'mins', isClaimed: false },
      { id: 'perfect-1', title: 'Score 100% on a drill', target: 1, current: 1, rewardGems: 20, rewardXp: 20, unit: 'drill', isClaimed: false },
    ];
  });

  useEffect(() => {
    localStorage.setItem('pylingo_random_tasks_v2', JSON.stringify(randomTasks));
  }, [randomTasks]);

  const handleRerollTasks = () => {
    sound.playTap();
    setRandomTasks(pickRandomTasks());
  };

  const handleClaimRandomTask = (taskId: string) => {
    const task = randomTasks.find((t) => t.id === taskId);
    if (!task || task.current < task.target || task.isClaimed) return;

    sound.playGem();
    gainXpAndGems(task.rewardXp, task.rewardGems);
    setRandomTasks((prev: RandomTask[]) =>
      prev.map((t: RandomTask) => (t.id === taskId ? { ...t, isClaimed: true } : t))
    );
  };

  const handleAdvanceTask = (taskId: string) => {
    sound.playTap();
    setRandomTasks((prev: RandomTask[]) =>
      prev.map((t: RandomTask) => (t.id === taskId ? { ...t, current: Math.min(t.target, t.current + 1) } : t))
    );
  };

  // Today's points calculation
  const today = new Date().toISOString().split('T')[0];
  const todayXp = stats.history[today] || 0;
  const targetXp = stats.dailyGoalTarget || 50;

  // Progress ring math
  const progressRatio = Math.min(1, todayXp / targetXp);
  const percent = Math.min(100, Math.round((todayXp / targetXp) * 100));
  const isGoalAchieved = todayXp >= targetXp;
  const xpRemaining = Math.max(0, targetXp - todayXp);

  // Circle dimensions for SVG ring
  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ~238.76
  const strokeDashoffset = circumference - progressRatio * circumference;

  // Preset options for goal
  const goalPresets = [
    { label: 'Casual', xp: 20, desc: '1 quick lesson' },
    { label: 'Regular', xp: 50, desc: '2-3 lessons' },
    { label: 'Serious', xp: 100, desc: '4-5 lessons' },
    { label: 'Intense', xp: 150, desc: 'Mastery rush' },
  ];

  const handleSelectPreset = (xp: number) => {
    setDailyGoalTarget(xp);
    setIsConfiguringGoal(false);
  };

  const handleAdjustStep = (delta: number) => {
    const next = Math.max(10, Math.min(300, targetXp + delta));
    setDailyGoalTarget(next);
  };

  // Generate 7-day streak calendar (Mon - Sun)
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const todayIndex = (new Date().getDay() + 6) % 7; // 0 for Mon ... 6 for Sun

  const mascotTips = [
    "Python indentation isn't just style—it's syntax! Always use 4 spaces for blocks.",
    "Strings in Python are immutable, meaning once created, their characters cannot be modified in place.",
    "Functions with 'return' can pass calculated answers back into variables for later use!",
    "Dictionaries are lightning fast! They look up values by key in O(1) average time.",
  ];
  const tipOfTheDay = mascotTips[new Date().getDate() % mascotTips.length];

  // Check if today's activity is completed or if current streak is a milestone
  const isDailyCompleted = todayXp > 0;
  const isMilestoneStreak = stats.streak >= 3;
  const isStreakSurging = isDailyCompleted || isMilestoneStreak;
  const isSpecialMilestone = [3, 5, 7, 10, 14, 21, 30, 50, 100].includes(stats.streak);

  return (
    <div className="w-80 shrink-0 space-y-6 hidden xl:block">
      
      {/* 1. Daily Goal Progress Ring Card (Engaging & Configurable) */}
      <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4 relative overflow-hidden">
        {/* Subtle decorative glow when goal is achieved */}
        {isGoalAchieved && (
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
              isGoalAchieved ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <Target className="w-4 h-4 stroke-[2.5px]" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                Daily Goal
              </h3>
              <div className="text-xs text-slate-500 font-medium">
                {isGoalAchieved ? 'Daily target reached!' : `${xpRemaining} XP to target`}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              setIsConfiguringGoal(!isConfiguringGoal);
            }}
            className={`p-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
              isConfiguringGoal
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
            }`}
            title="Configure daily goal target"
            aria-label="Configure daily goal target"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span className="text-xs tabular-nums font-bold">{targetXp} XP</span>
          </button>
        </div>

        {/* Configurable Goal Drawer */}
        {isConfiguringGoal ? (
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Choose Daily Target</span>
              <span className="text-xs text-slate-500 tabular-nums">Current: {targetXp} XP</span>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 gap-2">
              {goalPresets.map((preset) => {
                const isSelected = targetXp === preset.xp;
                return (
                  <button
                    key={preset.label}
                    onClick={() => handleSelectPreset(preset.xp)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                        : 'bg-white border-slate-200 hover:border-emerald-300 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs">{preset.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className={`text-xs font-bold tabular-nums mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-emerald-600'}`}>
                      {preset.xp} XP
                    </div>
                    <div className={`text-xs truncate ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`}>
                      {preset.desc}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Adjust Stepper */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Custom adjustment:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleAdjustStep(-10)}
                  disabled={targetXp <= 10}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                  title="Decrease 10 XP"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold font-mono text-slate-800 w-12 text-center tabular-nums">
                  {targetXp} XP
                </span>
                <button
                  onClick={() => handleAdjustStep(10)}
                  disabled={targetXp >= 300}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                  title="Increase 10 XP"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* SVG Progress Ring & Metrics */
          <div className="flex items-center gap-5 pt-1">
            {/* SVG Ring */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform overflow-visible" viewBox="0 0 100 100">
                {/* Background Track */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-slate-100"
                  strokeWidth="8"
                  fill="transparent"
                />
                
                {/* Active Progress Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className={`transition duration-700 ease-out ${
                    isGoalAchieved ? 'stroke-emerald-500' : 'stroke-emerald-500'
                  }`}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                {isGoalAchieved ? (
                  <div className="flex flex-col items-center">
                    <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400 animate-bounce-subtle" />
                    <span className="text-xs font-extrabold text-emerald-700 tracking-tight mt-0.5">
                      100%
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="text-base font-extrabold text-slate-900 tabular-nums leading-none">
                      {percent}%
                    </span>
                    <span className="text-xs font-bold text-slate-500 mt-0.5">
                      GOAL
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side Stats & Engagement Message */}
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-900 tabular-nums tracking-tight">
                  {todayXp}
                </span>
                <span className="text-xs font-bold text-slate-500 tabular-nums">
                  / {targetXp} XP
                </span>
              </div>

              {isGoalAchieved ? (
                <div className="text-xs font-semibold text-emerald-700 leading-snug">
                  🎉 Phenomenal effort! You smashed today's goal.
                </div>
              ) : (
                <div className="text-xs text-slate-600 leading-snug">
                  Keep the momentum going! Earn <span className="font-bold text-emerald-700 tabular-nums">{xpRemaining} XP</span> more today.
                </div>
              )}

              {/* Micro bar showing progress */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-emerald-500 rounded-full transition duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Section Under Progress Ring: Three Small Randomized Daily Tasks */}
        <div className="pt-4 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Daily Tasks</span>
            </div>
            <button
              onClick={handleRerollTasks}
              className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer"
              title="Shuffle 3 new random tasks"
            >
              <Shuffle className="w-3 h-3" />
              <span>Reroll</span>
            </button>
          </div>

          <div className="space-y-2">
            {randomTasks.map((task) => {
              const taskPercent = Math.min(100, Math.round((task.current / task.target) * 100));
              const isTaskDone = task.current >= task.target;

              return (
                <div
                  key={task.id}
                  className={`p-2.5 rounded-2xl border transition ${
                    task.isClaimed
                      ? 'bg-emerald-50/50 border-emerald-200/60'
                      : isTaskDone
                      ? 'bg-amber-50/60 border-amber-300 shadow-sm'
                      : 'bg-slate-50/80 border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <div className="text-xs font-bold text-slate-900 leading-tight">
                        {task.title}
                      </div>
                      {/* Reward text */}
                      <div className="flex items-center gap-2 mt-0.5 text-xs font-semibold text-slate-500">
                        <span className="flex items-center gap-0.5 text-cyan-600 font-bold">
                          <Gem className="w-2.5 h-2.5 fill-cyan-400" />
                          <span>+{task.rewardGems}</span>
                        </span>
                        <span>·</span>
                        <span className="text-amber-600 font-bold">
                          +{task.rewardXp} XP
                        </span>
                      </div>
                    </div>

                    {/* Action / Claim Button */}
                    {task.isClaimed ? (
                      <span className="text-xs font-extrabold text-emerald-700 uppercase px-2 py-0.5 bg-emerald-100 rounded-md shrink-0">
                        Claimed ✓
                      </span>
                    ) : isTaskDone ? (
                      <button
                        onClick={() => handleClaimRandomTask(task.id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-lg shadow-sm cursor-pointer animate-pulse shrink-0"
                      >
                        Claim
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAdvanceTask(task.id)}
                        className="px-2 py-0.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Step progress"
                      >
                        +1
                      </button>
                    )}
                  </div>

                  {/* Progress bar and ratio */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition duration-300 ${
                          task.isClaimed || isTaskDone ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                        style={{ width: `${taskPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-500 tabular-nums">
                      {task.current}/{task.target}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Daily Streak Tracker Card with Subtle Milestone Animation */}
      <div className={`p-5 bg-white rounded-3xl shadow-sm space-y-4 transition duration-300 border ${
        isStreakSurging
          ? 'border-orange-200/90 shadow-orange-500/5'
          : 'border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <div
            onClick={() => {
              sound.playStreak();
            }}
            className="flex items-center gap-2 cursor-pointer group"
            title="Click to celebrate your streak flame!"
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-orange-600 transition ${
              isStreakSurging
                ? 'bg-orange-100 animate-streak-badge ring-2 ring-orange-300/60 shadow-sm shadow-orange-500/20'
                : 'bg-orange-50'
            }`}>
              <Flame className={`w-5 h-5 fill-orange-500 text-orange-600 ${
                isStreakSurging
                  ? 'animate-streak-milestone'
                  : 'animate-pulse'
              }`} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-slate-900 tabular-nums">
                  {stats.streak} Day Streak
                </span>
                {isSpecialMilestone && (
                  <span className="px-1.5 py-0.2 bg-orange-100 text-orange-800 text-xs font-extrabold rounded-md uppercase tracking-tight">
                    Milestone
                  </span>
                )}
              </div>
              <div className="text-xs font-medium leading-tight">
                {isSpecialMilestone ? (
                  <span className="text-orange-600 font-semibold">
                    🔥 {stats.streak}-day streak titan!
                  </span>
                ) : isDailyCompleted ? (
                  <span className="text-emerald-600 font-semibold">
                    Daily practice completed! ✓
                  </span>
                ) : (
                  <span className="text-slate-500">
                    Keep practicing daily!
                  </span>
                )}
              </div>
            </div>
          </div>

          {stats.streakFreeze > 0 && (
            <div
              title={`${stats.streakFreeze} Streak Freeze(s) equipped`}
              className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>{stats.streakFreeze} Safe</span>
            </div>
          )}
        </div>

        {/* 7-Day Visual Scroller */}
        <div className="grid grid-cols-7 gap-1 pt-1">
          {daysOfWeek.map((day, idx) => {
            const isCompleted = idx <= todayIndex;
            const isToday = idx === todayIndex;

            return (
              <div key={idx} className="flex flex-col items-center gap-1.5">
                <span className={`text-xs font-bold ${isToday ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {day}
                </span>
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs transition-colors ${
                    isToday
                      ? 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-300 shadow-sm'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-800 font-semibold'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>



      {/* 4. League Status Quick Card */}
      <div
        onClick={onOpenLeagues}
        className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl shadow-sm cursor-pointer hover:shadow-md transition group"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>{currentLeague} League</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </div>

        <div className="text-xl font-extrabold">
          Rank #{stats.leagueWeeklyXp > 300 ? '2' : '6'} this week
        </div>
        <p className="text-xs text-slate-300 mt-1">
          Top 5 advance to the next league! Keep earning XP to climb.
        </p>
      </div>

      {/* 4.5 Curriculum Roadmap & Agent Check-in Card */}
      {(stats.activeLanguage === 'python' || stats.activeLanguage === 'web' || stats.activeLanguage === 'javascript' || stats.activeLanguage === 'sql') && (
        <div className={`p-5 bg-gradient-to-br ${
          stats.activeLanguage === 'web'
            ? 'from-indigo-950 via-slate-900 to-purple-950 border-indigo-500/20'
            : stats.activeLanguage === 'javascript'
            ? 'from-amber-950 via-slate-900 to-slate-900 border-amber-500/20'
            : stats.activeLanguage === 'sql'
            ? 'from-cyan-950 via-slate-900 to-slate-900 border-cyan-500/20'
            : 'from-emerald-950 via-slate-900 to-slate-900 border-emerald-500/20'
        } text-white rounded-3xl shadow-sm border space-y-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-xl ${
                stats.activeLanguage === 'web'
                  ? 'bg-indigo-500/20 border-indigo-400/30 text-indigo-400'
                  : stats.activeLanguage === 'javascript'
                  ? 'bg-amber-500/20 border-amber-400/30 text-amber-400'
                  : stats.activeLanguage === 'sql'
                  ? 'bg-cyan-500/20 border-cyan-400/30 text-cyan-400'
                  : 'bg-emerald-500/20 border-emerald-400/30 text-emerald-400'
              } border flex items-center justify-center`}>
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <span className={`text-xs font-extrabold uppercase tracking-wider ${
                  stats.activeLanguage === 'web'
                    ? 'text-indigo-400'
                    : stats.activeLanguage === 'javascript'
                    ? 'text-amber-400'
                    : stats.activeLanguage === 'sql'
                    ? 'text-cyan-400'
                    : 'text-emerald-400'
                }`}>
                  {stats.activeLanguage === 'web'
                    ? 'HTML & CSS Dual-Track'
                    : stats.activeLanguage === 'javascript'
                    ? 'JavaScript Mastery Track'
                    : stats.activeLanguage === 'sql'
                    ? 'SQL Mastery Track'
                    : 'Python Mastery Track'}
                </span>
                <h4 className="text-xs font-extrabold text-white leading-tight">
                  Goal: {
                    stats.activeLanguage === 'web'
                      ? WEB_CAREER_TRACKS.find((t) => t.id === targetCareerTrack)?.name || 'Frontend Engineer'
                      : stats.activeLanguage === 'javascript'
                      ? JS_CAREER_TRACKS.find((t) => t.id === targetCareerTrack)?.name || 'Full-Stack TS Engineer'
                      : stats.activeLanguage === 'sql'
                      ? SQL_CAREER_TRACKS.find((t) => t.id === targetCareerTrack)?.name || 'Data Analyst'
                      : CAREER_TRACKS.find((t) => t.id === targetCareerTrack)?.name || 'AI Engineer'
                  }
                </h4>
              </div>
            </div>
            <span className={`text-xs font-mono font-bold ${
              stats.activeLanguage === 'web'
                ? 'text-indigo-300 bg-indigo-950/80 border-indigo-500/30'
                : stats.activeLanguage === 'javascript'
                ? 'text-amber-300 bg-amber-950/80 border-amber-500/30'
                : stats.activeLanguage === 'sql'
                ? 'text-cyan-300 bg-cyan-950/80 border-cyan-500/30'
                : 'text-emerald-300 bg-emerald-950/80 border-emerald-500/30'
            } px-2 py-0.5 rounded-full border`}>
              {(() => {
                const roadmap = getRoadmapProgress(stats.activeLanguage, checkedInNodes);
                return `${roadmap.verified}/${roadmap.total}`;
              })()}
            </span>
          </div>

          <p className="text-xs text-slate-300">
            {stats.activeLanguage === 'web'
              ? 'Intertwined lessons pair semantic HTML with CSS Box Model, Flexbox & Grid to build real components.'
              : stats.activeLanguage === 'javascript'
              ? 'Anti-blind check-ins verify that you understand Event Loop microtasks, closures, and object prototypes.'
              : stats.activeLanguage === 'sql'
              ? 'Anti-blind check-ins verify that you understand NULL logic, join fan-out, and transaction guarantees.'
              : 'Anti-blind check-ins verify that you understand the underlying memory models and edge cases.'}
          </p>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => openRoadmapModal(undefined, 'checkin')}
              className={`flex-1 py-2 px-3 rounded-xl ${
                stats.activeLanguage === 'web'
                  ? 'bg-indigo-500 hover:bg-indigo-400'
                  : stats.activeLanguage === 'javascript'
                  ? 'bg-amber-500 hover:bg-amber-400'
                  : stats.activeLanguage === 'sql'
                  ? 'bg-cyan-400 hover:bg-cyan-300'
                  : 'bg-emerald-500 hover:bg-emerald-400'
              } text-slate-950 font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Agent Check-in</span>
            </button>
            <button
              onClick={() => openRoadmapModal(undefined, 'roadmap')}
              className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-colors cursor-pointer"
              title="View full visual roadmap"
            >
              Roadmap
            </button>
          </div>
        </div>
      )}

      {/* 5. Daily Habit Engine & Routine Prompts */}
      <HabitRoutinePrompt onStartQuickLesson={onStartQuickLesson || onOpenShop} />

      {/* 6. Mascot Daily Coder Tip */}
      <div className="p-4 bg-emerald-50/80 border border-emerald-200/60 rounded-3xl space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            Pyto's Coder Tip
          </span>
        </div>
        <p className="text-xs text-emerald-950 leading-relaxed font-medium">
          "{tipOfTheDay}"
        </p>
      </div>

    </div>
  );
};
