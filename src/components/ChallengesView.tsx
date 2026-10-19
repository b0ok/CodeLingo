import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { SCHEDULED_CHALLENGES } from '../data/challenges';
import { ScheduledChallenge, ChallengeGameMode, CookEvaluation } from '../types';
import { evaluateCookSubmission } from '../utils/cookGrader';
import { runUnifiedCode } from '../utils/codeRunner';
import { sound } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import {
  Flame,
  Clock,
  BookOpen,
  Zap,
  Terminal,
  Trophy,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  HelpCircle,
  ChefHat,
  Shield,
  Award,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';

export const ChallengesView: React.FC = () => {
  const { stats, gainXpAndGems, markChallengeCompleted } = useGame();

  const [activeChallenge, setActiveChallenge] = useState<ScheduledChallenge>(SCHEDULED_CHALLENGES[0]);
  const [gameMode, setGameMode] = useState<ChallengeGameMode>('regular');
  const [isPlaying, setIsPlaying] = useState(false);

  // In-session player state
  const [code, setCode] = useState(activeChallenge.starterCode);
  const [timeLeft, setTimeLeft] = useState(activeChallenge.timeLimitSec);
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [usedHintCount, setUsedHintCount] = useState(0);
  const [showCheatsheet, setShowCheatsheet] = useState(false);
  const [cookResult, setCookResult] = useState<CookEvaluation | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize state when starting challenge
  const handleStartChallenge = (challenge: ScheduledChallenge, mode: ChallengeGameMode) => {
    sound.playTap();
    setActiveChallenge(challenge);
    setGameMode(mode);
    setCode(challenge.starterCode);
    setOutput('');
    setError(null);
    setUsedHintCount(0);
    setShowCheatsheet(false);
    setCookResult(null);
    setIsSubmitted(false);
    setTimeLeft(mode === 'regular' ? 0 : challenge.timeLimitSec);
    setIsPlaying(true);
  };

  // Timer countdown for novice and cook modes
  useEffect(() => {
    if (isPlaying && !isSubmitted && gameMode !== 'regular') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimeExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isSubmitted, gameMode]);

  const handleTimeExpired = () => {
    sound.playError();
    if (gameMode === 'cook') {
      handleSubmitCook();
    } else {
      setError('⏱️ Time expired! Try running your code or switch to Regular (No-Timer) mode.');
    }
  };

  const handleRunTest = () => {
    sound.playTap();
    const result = runUnifiedCode(code, 'python');
    setOutput(result.output);
    setError(result.error || null);
    if (result.success) sound.playTap();
    else sound.playError();
  };

  const handleSubmitCook = () => {
    const timeTaken = activeChallenge.timeLimitSec - timeLeft;
    const evaluation = evaluateCookSubmission(
      code,
      activeChallenge.expectedOutput,
      timeTaken,
      activeChallenge.timeLimitSec
    );

    setCookResult(evaluation);
    setIsSubmitted(true);

    if (evaluation.passed) {
      sound.playVictory();
      const bonusMultiplier = gameMode === 'cook' ? 3 : gameMode === 'novice' ? 1.5 : 1;
      const earnedXp = Math.round(activeChallenge.xpReward * bonusMultiplier);
      const earnedGems = activeChallenge.gemReward * (gameMode === 'cook' ? 2 : 1);

      gainXpAndGems(earnedXp, earnedGems);
      markChallengeCompleted(activeChallenge.id);

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    } else {
      sound.playError();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // ================= RENDER: HARDCORE "LET ME COOK" ARENA =================
  if (isPlaying && gameMode === 'cook') {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col justify-between font-mono select-none overflow-hidden animate-in fade-in duration-200">
        {/* Cook Terminal Top Bar */}
        <div className="px-6 py-4 bg-slate-900 border-b border-emerald-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950 border border-emerald-700/80 rounded-full text-xs font-bold text-emerald-400">
              <ChefHat className="w-4 h-4 text-emerald-400" />
              <span>LET ME COOK: COMMAND LINE ARENA</span>
            </div>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Zero hints · Strict timer · Efficiency graded
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-lg ${
              timeLeft < 30 ? 'bg-rose-950/80 text-rose-400 border border-rose-800 animate-pulse' : 'bg-slate-800 text-amber-400'
            }`}>
              <Clock className="w-4 h-4" />
              <span className="tabular-nums font-mono">{formatTime(timeLeft)}</span>
            </div>

            <button
              onClick={() => setIsPlaying(false)}
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-850 cursor-pointer"
            >
              Abort Cook
            </button>
          </div>
        </div>

        {/* Cook Main Stage: Problem Prompt + Raw Terminal Editor */}
        <div className="flex-1 p-6 max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto items-start">
          {/* Left: Terminal Mission Brief */}
          <div className="space-y-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                {activeChallenge.type.toUpperCase()} ARENA · {activeChallenge.difficulty}
              </span>
              <span className="text-xs text-slate-400 font-mono">Target: 100% Accuracy</span>
            </div>

            <h2 className="text-xl font-bold text-white tracking-tight">
              {activeChallenge.title}
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              {activeChallenge.description}
            </p>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-emerald-400">
              <span className="text-slate-500 block mb-1">Expected Terminal Output:</span>
              <code>"{activeChallenge.expectedOutput}"</code>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-amber-300/90 space-y-1">
              <span className="text-slate-500 block">Cleanliness & Efficiency Criteria:</span>
              <p>{activeChallenge.cleanlinessStandard}</p>
            </div>
          </div>

          {/* Right: Raw Terminal Editor */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[460px]">
            <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>cook_session.py</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                {code.split('\n').length} lines
              </span>
            </div>

            <div className="flex-1 p-4 relative">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isSubmitted}
                spellCheck={false}
                className="w-full h-full bg-transparent text-emerald-400 font-mono text-sm leading-relaxed resize-none focus:outline-none"
                placeholder="# Code here with speed and clean syntax..."
              />
            </div>

            {/* Test Run Output Drawer */}
            {output && (
              <div className="p-3 bg-slate-950 border-t border-slate-800 text-xs font-mono text-emerald-300 max-h-28 overflow-y-auto">
                <span className="text-slate-500 block mb-1">Stdout:</span>
                <pre>{output}</pre>
              </div>
            )}

            {/* Action Bar */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={handleRunTest}
                disabled={isSubmitted}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Run Test</span>
              </button>

              <button
                onClick={handleSubmitCook}
                disabled={isSubmitted}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 active:scale-95 cursor-pointer"
              >
                <ChefHat className="w-4 h-4" />
                <span>Submit & Grade Cook</span>
              </button>
            </div>
          </div>
        </div>

        {/* Cook Evaluation Modal / Bottom Reveal */}
        {cookResult && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 text-slate-100 space-y-5 animate-in zoom-in-95">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-950 border border-emerald-700 text-2xl font-black text-emerald-400 mb-2">
                  {cookResult.efficiencyRating}
                </div>
                <h3 className="text-2xl font-black">
                  {cookResult.passed ? '👨‍🍳 Cooked to Perfection!' : '🍳 Underdone Solution'}
                </h3>
                <p className="text-xs text-slate-400">
                  {cookResult.passed
                    ? 'Automated cleanliness & efficiency benchmarking passed!'
                    : 'Check test output and try again.'}
                </p>
              </div>

              {/* Scorecard Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-lg font-bold text-emerald-400">{cookResult.cleanlinessScore}/100</div>
                  <div className="text-[10px] text-slate-500 uppercase">Cleanliness</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-lg font-bold text-amber-400">{cookResult.linesCount} lines</div>
                  <div className="text-[10px] text-slate-500 uppercase">Brevity</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-lg font-bold text-cyan-400">{cookResult.runtimeMs}ms</div>
                  <div className="text-[10px] text-slate-500 uppercase">Runtime</div>
                </div>
              </div>

              {/* Automated Feedback Points */}
              <div className="space-y-1.5 text-xs font-sans">
                {cookResult.feedback.map((item, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-slate-950/80 text-slate-300">
                    {item}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setIsPlaying(false)}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md"
                >
                  Return to Challenges
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ================= RENDER: REGULAR & NOVICE ACTIVE CHALLENGE =================
  if (isPlaying) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              {activeChallenge.title} · {gameMode === 'regular' ? 'Open Book Mode' : 'Novice Sprint'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {gameMode === 'novice' && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <Clock className="w-3.5 h-3.5" />
                <span className="tabular-nums font-mono">{formatTime(timeLeft)}</span>
              </div>
            )}

            <button
              onClick={() => setIsPlaying(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              Exit Challenge
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 max-w-4xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto items-start">
          {/* Left: Challenge Prompt & Reference */}
          <div className="space-y-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                {activeChallenge.type} Challenge · {activeChallenge.difficulty}
              </span>
              <span className="text-xs font-bold text-amber-600">
                +{activeChallenge.xpReward * (gameMode === 'novice' ? 1.5 : 1)} XP
              </span>
            </div>

            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {activeChallenge.title}
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed">
              {activeChallenge.description}
            </p>

            <div className="p-3 bg-slate-900 text-emerald-400 rounded-2xl text-xs font-mono">
              <span className="text-slate-400 block mb-1">Target Output:</span>
              "{activeChallenge.expectedOutput}"
            </div>

            {/* Open Book Cheatsheet Drawer for Regular Mode */}
            {gameMode === 'regular' && (
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setShowCheatsheet(!showCheatsheet)}
                  className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>Open Reference Cheatsheet</span>
                  </div>
                  <span>{showCheatsheet ? '▲' : '▼'}</span>
                </button>
                {showCheatsheet && (
                  <div className="p-4 bg-white text-xs text-slate-600 space-y-2 border-t border-slate-200 font-sans">
                    <p>• <strong>Strings:</strong> Slices use `s[start:end:step]`. Negative step `[::-1]` reverses.</p>
                    <p>• <strong>Loops:</strong> `for i, item in enumerate(list):` yields indices and elements.</p>
                    <p>• <strong>Dictionaries:</strong> `d.get(key, 0)` avoids KeyError on missing keys.</p>
                  </div>
                )}
              </div>
            )}

            {/* Hints Button */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  {gameMode === 'novice' ? `Hints allowed: 1 (Used: ${usedHintCount}/1)` : 'Hints: Unlimited'}
                </span>
                <button
                  onClick={() => {
                    if (gameMode === 'novice' && usedHintCount >= 1) return;
                    sound.playTap();
                    setUsedHintCount((prev) => prev + 1);
                  }}
                  disabled={gameMode === 'novice' && usedHintCount >= 1}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer disabled:text-slate-400"
                >
                  Reveal Hint
                </button>
              </div>
              {usedHintCount > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
                  💡 {activeChallenge.hints[Math.min(usedHintCount - 1, activeChallenge.hints.length - 1)]}
                </div>
              )}
            </div>
          </div>

          {/* Right: Code Editor & Runner */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden flex flex-col h-[460px] shadow-sm">
            <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>solution.py</span>
              <button
                onClick={() => setCode(activeChallenge.starterCode)}
                className="text-slate-400 hover:text-white cursor-pointer"
                title="Reset code"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 p-4 relative">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="w-full h-full bg-transparent text-emerald-400 font-mono text-sm leading-relaxed resize-none focus:outline-none"
              />
            </div>

            {/* Test Run Output */}
            {output && (
              <div className="p-3 bg-slate-950 border-t border-slate-800 text-xs font-mono text-emerald-300 max-h-28 overflow-y-auto">
                <span className="text-slate-500 block mb-1">Terminal Output:</span>
                <pre>{output}</pre>
              </div>
            )}

            {/* Action Bar */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={handleRunTest}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Run Code</span>
              </button>

              <button
                onClick={handleSubmitCook}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Solution</span>
              </button>
            </div>
          </div>
        </div>

        {/* Evaluation Banner for Regular / Novice */}
        {cookResult && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 text-slate-900 space-y-4 shadow-2xl">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">
                  {cookResult.passed ? 'Challenge Conquered!' : 'Almost There!'}
                </h3>
                <p className="text-xs text-slate-500">
                  {cookResult.passed
                    ? `Earned +${Math.round(activeChallenge.xpReward * (gameMode === 'novice' ? 1.5 : 1))} XP and gems!`
                    : 'Output did not match the expected target. Keep tweaking!'}
                </p>
              </div>

              <button
                onClick={() => setIsPlaying(false)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ================= MAIN CHALLENGES HUB LIST =================
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 md:pb-12">
      {/* Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-lg border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Competitive Challenges Hub</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Daily, Weekly & Tournament Quests
          </h2>
          <p className="text-sm text-slate-300 max-w-lg">
            Pick your challenge, select your play style, and prove your algorithmic sharpness on the leaderboard!
          </p>
        </div>
      </div>

      {/* 3 Game Modes Explainer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Regular Mode */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-sm text-slate-900">Regular Mode</h3>
          </div>
          <p className="text-xs text-slate-500">
            Open book reference guide, zero timer pressure, and unlimited hints. Great for relaxed learning.
          </p>
          <span className="inline-block text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
            Standard XP
          </span>
        </div>

        {/* Novice Mode */}
        <div className="p-5 bg-white border border-amber-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900">Novice Sprint</h3>
          </div>
          <p className="text-xs text-slate-500">
            Soft countdown timer, 1 hint allowed, and test case automated evaluation.
          </p>
          <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
            +50% XP Multiplier
          </span>
        </div>

        {/* LET ME COOK Mode */}
        <div className="p-5 bg-slate-900 text-white border border-emerald-500/40 rounded-2xl shadow-md space-y-2 relative overflow-hidden">
          <div className="flex items-center gap-2">
            <ChefHat className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">LET ME COOK Mode</h3>
          </div>
          <p className="text-xs text-slate-300">
            Hardcore terminal: zero hints, strict timer, and graded on code cleanliness & efficiency!
          </p>
          <span className="inline-block text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-700/60 px-2 py-0.5 rounded-full">
            +200% XP & Grader Card
          </span>
        </div>
      </div>

      {/* Available Challenges List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>Active Challenge Board</span>
          <span className="text-xs font-normal text-slate-500">({SCHEDULED_CHALLENGES.length} available)</span>
        </h3>

        <div className="space-y-4">
          {SCHEDULED_CHALLENGES.map((challenge) => {
            const isDone = stats.completedChallenges.includes(challenge.id);

            return (
              <div
                key={challenge.id}
                className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      challenge.type === 'daily'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : challenge.type === 'weekly'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}>
                      {challenge.type} challenge
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Difficulty: {challenge.difficulty}
                    </span>
                    {isDone && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </span>
                    )}
                  </div>

                  <h4 className="text-lg font-bold text-slate-900">{challenge.title}</h4>
                  <p className="text-xs text-slate-500 max-w-xl">{challenge.description}</p>
                </div>

                {/* Game Mode Launch Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto">
                  <button
                    onClick={() => handleStartChallenge(challenge, 'regular')}
                    className="flex-1 md:flex-none px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Regular
                  </button>

                  <button
                    onClick={() => handleStartChallenge(challenge, 'novice')}
                    className="flex-1 md:flex-none px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    Novice (Timed)
                  </button>

                  <button
                    onClick={() => handleStartChallenge(challenge, 'cook')}
                    className="flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/50 flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                  >
                    <ChefHat className="w-3.5 h-3.5 text-emerald-400" />
                    <span>LET ME COOK</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
