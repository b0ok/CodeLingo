import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { LessonNode, Challenge, LanguageId } from '../types';
import { useGame } from '../context/GameContext';
import { lessonReward } from '../data/economy';
import { PytoMascot } from './PytoMascot';
import { runUnifiedCode, passesTestCases, gradeWebCode, WebGradeResult } from '../utils/codeRunner';
import { sound } from '../utils/soundEffects';
import { pickChallenges, shuffle } from '../utils/lessonSession';
import { describeAnswer } from '../utils/answers';
import { preloadPython, pythonStatus } from '../utils/pythonRunner';
import confetti from 'canvas-confetti';
import { X, Heart, CheckCircle2, AlertCircle, ArrowUp, ArrowDown, Play, Sparkles, RotateCcw, HelpCircle, XCircle } from 'lucide-react';

const LANGUAGE_LABELS: Record<LanguageId, string> = {
  python: 'Python',
  javascript: 'JavaScript',
  sql: 'SQL',
  web: 'HTML & CSS',
};

const CODE_PLACEHOLDERS: Record<LanguageId, string> = {
  python: '# Write your Python code here',
  javascript: '// Write your JavaScript code here',
  sql: '-- Write your SQL query here',
  web: '<!-- Write your HTML and CSS here -->',
};

interface LessonModalProps {
  lesson: LessonNode;
  onClose: () => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({ lesson, onClose }) => {
  const { stats, loseHeart, gainXpAndGems, trackActivity } = useGame();
  // Counts toward the "Practice for 5 minutes" task while this screen is open and visible.
  useEffect(() => {
    const timer = setInterval(() => document.visibilityState === 'visible' && trackActivity('practiceMinutes'), 60000);
    return () => clearInterval(timer);
  }, [trackActivity]);

  const [firstTime] = useState(() => !stats.completedLessons.includes(lesson.id));
  const [earned, setEarned] = useState({ xp: 0, rings: 0 });

  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [heartsLostInSession, setHeartsLostInSession] = useState(0);

  // Per-challenge user states
  // 1. token_fill
  const [filledTokens, setFilledTokens] = useState<string[]>([]);
  const [availableTokens, setAvailableTokens] = useState<string[]>([]);

  // 2. parsons
  const [orderedLineIds, setOrderedLineIds] = useState<string[]>([]);

  // 3. predict_output & concept_quiz
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // 4. spot_bug
  const [selectedBugLine, setSelectedBugLine] = useState<number | null>(null);

  // 5. code_runner
  const [userCode, setUserCode] = useState<string>('');
  const [runnerOutput, setRunnerOutput] = useState<string>('');
  const [runnerError, setRunnerError] = useState<string | null>(null);
  const [isRunningCode, setIsRunningCode] = useState(false);

  // 6. matching: matches maps a left index to the pair index chosen on the right
  const [matchRightOrder, setMatchRightOrder] = useState<number[]>([]);
  const [matches, setMatches] = useState<Record<number, number>>({});
  const [activeLeft, setActiveLeft] = useState<number | null>(null);

  const [webResults, setWebResults] = useState<WebGradeResult | null>(null);
  const [optionOrder, setOptionOrder] = useState<string[]>([]);

  // 'retry' = first miss (hint shown, one more try); 'wrong' = second miss (answer shown)
  const [status, setStatus] = useState<'unsubmitted' | 'retry' | 'correct' | 'wrong'>('unsubmitted');
  const [attempt, setAttempt] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // Each time the lesson opens it draws a fresh set from the lesson's pool
  const [challenges] = useState(() => pickChallenges(lesson.challenges));
  const currentChallenge: Challenge = challenges[currentChallengeIndex];
  const challengeLang: LanguageId = lesson.id.startsWith('js-')
    ? 'javascript'
    : lesson.id.startsWith('sql-')
    ? 'sql'
    : lesson.id.startsWith('web-')
    ? 'web'
    : 'python';
  const isWebRunner = currentChallenge.type === 'code_runner' && !!currentChallenge.webChecks?.length;
  const progressPercent = ((currentChallengeIndex) / challenges.length) * 100;

  // Initialize per-challenge state
  useEffect(() => {
    setStatus('unsubmitted');
    setAttempt(0);
    setShowHint(false);

    if (currentChallenge.type === 'token_fill') {
      setFilledTokens([]);
      setAvailableTokens([...(currentChallenge.tokens || [])]);
    } else if (currentChallenge.type === 'parsons') {
      const ids = (currentChallenge.parsonsLines || []).map((l) => l.id);
      const solved = (currentChallenge.correctParsonsOrder || []).join();
      let shuffled = ids;
      for (let tries = 0; ids.length > 1 && tries < 10 && shuffled.join() === solved; tries++) {
        shuffled = shuffle(ids);
      }
      if (shuffled.join() === solved) shuffled = [...ids].reverse();
      setOrderedLineIds(shuffled);
    } else if (currentChallenge.type === 'predict_output' || currentChallenge.type === 'concept_quiz') {
      setSelectedOptionId(null);
      // Authored options often list the answer first; shuffle so position gives nothing away.
      setOptionOrder(shuffle((currentChallenge.options || []).map((o) => o.id)));
    } else if (currentChallenge.type === 'spot_bug') {
      setSelectedBugLine(null);
    } else if (currentChallenge.type === 'matching') {
      const indexes = (currentChallenge.matchPairs || []).map((_, i) => i);
      let order = shuffle(indexes);
      // Never line every answer up beside its term
      if (indexes.length > 1 && order.every((v, i) => v === i)) order = [...indexes.slice(1), indexes[0]];
      setMatchRightOrder(order);
      setMatches({});
      setActiveLeft(0);
    } else if (currentChallenge.type === 'code_runner') {
      setUserCode(currentChallenge.starterCode || '');
      setRunnerOutput('');
      setRunnerError(null);
      setWebResults(null);
    }
  }, [currentChallengeIndex, lesson]);

  // Handle Token Fill clicks
  const handleSelectBankToken = (token: string, bankIdx: number) => {
    sound.playTap();
    const maxBlanks = currentChallenge.blankCount || 1;
    if (filledTokens.length >= maxBlanks) return;

    setFilledTokens([...filledTokens, token]);
    setAvailableTokens((prev) => prev.filter((_, idx) => idx !== bankIdx));
  };

  const handleRemoveFilledToken = (index: number) => {
    sound.playTap();
    const removed = filledTokens[index];
    setFilledTokens((prev) => prev.filter((_, idx) => idx !== index));
    setAvailableTokens((prev) => [...prev, removed]);
  };

  // Handle Parsons line swap
  const handleMoveLine = (index: number, direction: 'up' | 'down') => {
    sound.playTap();
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= orderedLineIds.length) return;

    const copy = [...orderedLineIds];
    const temp = copy[index];
    copy[index] = copy[newIdx];
    copy[newIdx] = temp;
    setOrderedLineIds(copy);
  };

  // Matching: pick a term, then its partner. Picking a matched term unpairs it.
  const handleSelectLeft = (leftIdx: number) => {
    if (status !== 'unsubmitted') return;
    sound.playTap();
    if (leftIdx in matches) {
      const next = { ...matches };
      delete next[leftIdx];
      setMatches(next);
    }
    setActiveLeft(leftIdx);
  };

  const handleSelectRight = (pairIdx: number) => {
    if (status !== 'unsubmitted' || activeLeft === null) return;
    sound.playTap();
    const next: Record<number, number> = {};
    for (const [l, r] of Object.entries(matches)) if (r !== pairIdx) next[Number(l)] = r;
    next[activeLeft] = pairIdx;
    setMatches(next);
    const total = currentChallenge.matchPairs?.length || 0;
    const nextOpen = Array.from({ length: total }, (_, i) => i).find((i) => !(i in next));
    setActiveLeft(nextOpen ?? null);
  };

  // Python downloads on first use; start it as soon as a lesson with Python code opens
  useEffect(() => {
    if (challengeLang === 'python' && challenges.some((c) => c.type === 'code_runner')) preloadPython();
  }, []);

  // Runs the learner's code and shows the output; returns the result for grading
  const runCode = async () => {
    setIsRunningCode(true);
    setRunnerError(null);
    if (challengeLang === 'python' && pythonStatus() !== 'ready') setRunnerOutput('Starting Python (the first run downloads about 12 MB)…');
    const result = await runUnifiedCode(userCode, challengeLang);
    setIsRunningCode(false);
    setRunnerOutput(result.output);
    setRunnerError(result.error || null);
    return result;
  };

  // Run Code in browser
  const handleExecuteCode = async () => {
    sound.playTap();
    if (isWebRunner) {
      setWebResults(gradeWebCode(userCode, currentChallenge.webChecks));
      return;
    }
    const result = await runCode();
    if (result.success) {
      sound.playTap();
    } else {
      sound.playError();
    }
  };

  // Check Answer Handler
  const handleCheckAnswer = async () => {
    let isCorrect = false;

    if (currentChallenge.type === 'token_fill') {
      const correct = currentChallenge.correctTokens || [];
      isCorrect =
        filledTokens.length === correct.length &&
        filledTokens.every((token, idx) => token === correct[idx]);
    } else if (currentChallenge.type === 'parsons') {
      const correctOrder = currentChallenge.correctParsonsOrder || [];
      isCorrect =
        orderedLineIds.length === correctOrder.length &&
        orderedLineIds.every((id, idx) => id === correctOrder[idx]);
    } else if (currentChallenge.type === 'predict_output' || currentChallenge.type === 'concept_quiz') {
      isCorrect = selectedOptionId === currentChallenge.correctOptionId;
    } else if (currentChallenge.type === 'spot_bug') {
      isCorrect = selectedBugLine === currentChallenge.buggyLineIndex;
    } else if (currentChallenge.type === 'matching') {
      const pairs = currentChallenge.matchPairs || [];
      isCorrect = pairs.length > 0 && pairs.every((_, i) => matches[i] === i);
    } else if (isWebRunner) {
      const graded = gradeWebCode(userCode, currentChallenge.webChecks);
      setWebResults(graded);
      isCorrect = graded.passed;
    } else if (currentChallenge.type === 'code_runner') {
      isCorrect = passesTestCases(await runCode(), currentChallenge.testCases);
    }

    if (isCorrect) {
      sound.playSuccess();
      setStatus('correct');
      if (currentChallenge.type === 'spot_bug') trackActivity('bugs');
    } else if (attempt === 0) {
      // First miss costs one life point and earns a second try with the hint open.
      sound.playError();
      setStatus('retry');
      setShowHint(true);
      setHeartsLostInSession((prev) => prev + 1);
      loseHeart();
    } else {
      sound.playError();
      setStatus('wrong');
    }
  };

  // Clear the previous answer (keeping parsons order and code, which are edited in place)
  const handleTryAgain = () => {
    sound.playTap();
    setAttempt(1);
    setStatus('unsubmitted');
    if (currentChallenge.type === 'token_fill') {
      setFilledTokens([]);
      setAvailableTokens([...(currentChallenge.tokens || [])]);
    } else if (currentChallenge.type === 'predict_output' || currentChallenge.type === 'concept_quiz') {
      setSelectedOptionId(null);
    } else if (currentChallenge.type === 'spot_bug') {
      setSelectedBugLine(null);
    } else if (currentChallenge.type === 'matching') {
      // Keep the pairs that were right; clear only the wrong ones
      const kept: Record<number, number> = {};
      for (const [l, r] of Object.entries(matches)) if (Number(l) === r) kept[r] = r;
      setMatches(kept);
      const total = currentChallenge.matchPairs?.length || 0;
      setActiveLeft(Array.from({ length: total }, (_, i) => i).find((i) => !(i in kept)) ?? null);
    }
  };

  // Move to next challenge or complete lesson
  const handleContinue = () => {
    if (currentChallengeIndex + 1 < challenges.length) {
      setCurrentChallengeIndex((prev) => prev + 1);
    } else {
      // Completed full lesson!
      const stars = heartsLostInSession === 0 ? 3 : heartsLostInSession === 1 ? 2 : 1;
      const reward = lessonReward(stars, firstTime);
      setEarned(reward);
      gainXpAndGems(reward.xp, reward.rings, lesson.id, stars);
      sound.playVictory();
      setIsCompleted(true);

      // Confetti burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#059669', '#34d399', '#f59e0b', '#3b82f6'],
      });
    }
  };

  // Is check button enabled?
  const canCheck = () => {
    if (status !== 'unsubmitted' || isRunningCode) return false;
    if (currentChallenge.type === 'token_fill') {
      return filledTokens.length === (currentChallenge.blankCount || 1);
    }
    if (currentChallenge.type === 'parsons') {
      return orderedLineIds.length > 0;
    }
    if (currentChallenge.type === 'predict_output' || currentChallenge.type === 'concept_quiz') {
      return selectedOptionId !== null;
    }
    if (currentChallenge.type === 'spot_bug') {
      return selectedBugLine !== null;
    }
    if (currentChallenge.type === 'matching') {
      return Object.keys(matches).length === (currentChallenge.matchPairs?.length || 0);
    }
    if (currentChallenge.type === 'code_runner') {
      return userCode.trim().length > 0;
    }
    return false;
  };

  return (
    <Modal className="fixed inset-0 z-50 bg-slate-50 flex flex-col justify-between overflow-hidden select-none" label={lesson.title}>
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 shrink-0 shadow-xs">
        <button
          onClick={onClose}
          className="p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Exit lesson"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Focus Shield Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span>Focus Mode Active</span>
        </div>

        {/* Progress bar */}
        <div className="flex-1 max-w-xl bg-slate-100 h-3 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Life points remaining */}
        <div className="flex items-center gap-1.5 text-rose-500 font-bold text-sm">
          <Heart className="w-5 h-5 fill-rose-500" />
          <span className="tabular-nums">
            {stats.subscriptionTier === 'novice' || stats.subscriptionTier === 'pro' ? '∞' : stats.hearts}
          </span>
        </div>
      </div>

      {/* Main Challenge Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl w-full mx-auto flex flex-col justify-center">
        {!isCompleted ? (
          <div className="space-y-6">
            
            {/* Header: Type tag & Instruction */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  {lesson.title} · Challenge {currentChallengeIndex + 1} of {challenges.length}
                </span>

                <button
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHint ? 'Hide Hint' : 'Hint'}</span>
                </button>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                {currentChallenge.instruction}
              </h2>

              {showHint && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-medium text-amber-900 animate-fadeIn">
                  💡 <strong>Tip:</strong> {currentChallenge.hint}
                </div>
              )}
            </div>

            {/* 1. TOKEN FILL CHALLENGE */}
            {currentChallenge.type === 'token_fill' && (
              <div className="space-y-6">
                {/* Code template with fillable slots */}
                <div className="p-5 bg-slate-900 text-slate-100 rounded-2xl font-mono text-base sm:text-lg shadow-inner">
                  <div className="flex flex-wrap items-center gap-2 leading-relaxed">
                    {currentChallenge.codeTemplate?.split(/(__BLANK_\d+__)/).map((segment, idx) => {
                      const blankMatch = segment.match(/__BLANK_(\d+)__/);
                      if (blankMatch) {
                        const blankIdx = parseInt(blankMatch[1], 10);
                        const tokenInSlot = filledTokens[blankIdx];

                        return (
                          <span
                            key={idx}
                            onClick={() => tokenInSlot && handleRemoveFilledToken(blankIdx)}
                            className={`inline-flex items-center justify-center min-w-[70px] h-9 px-3 rounded-lg border-2 text-sm font-bold cursor-pointer transition ${
                              tokenInSlot && (status === 'retry' || status === 'wrong')
                                ? 'bg-rose-500 border-rose-400 text-white shadow-sm'
                                : tokenInSlot
                                ? 'bg-emerald-500 border-emerald-400 text-white shadow-sm'
                                : 'bg-slate-800 border-dashed border-slate-600 text-slate-400'
                            }`}
                          >
                            {tokenInSlot || '___'}
                          </span>
                        );
                      }
                      return <span key={idx}>{segment}</span>;
                    })}
                  </div>
                </div>

                {/* Word Bank */}
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-2">Tap a token to insert:</div>
                  <div className="flex flex-wrap gap-2.5 min-h-[44px]">
                    {availableTokens.map((token, idx) => (
                      <button
                        key={`${token}-${idx}`}
                        onClick={() => handleSelectBankToken(token, idx)}
                        disabled={status !== 'unsubmitted'}
                        className="px-4 py-2.5 bg-white hover:bg-slate-50 active:bg-slate-100 border-2 border-slate-200 hover:border-emerald-400 rounded-xl font-mono text-sm font-bold text-slate-800 shadow-sm cursor-pointer transition min-h-[44px]"
                      >
                        {token}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. PARSONS LINE REORDERING */}
            {currentChallenge.type === 'parsons' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  Use the arrows to reorder lines into the correct execution sequence:
                </p>

                <div className="space-y-2">
                  {orderedLineIds.map((lineId, idx) => {
                    const lineObj = currentChallenge.parsonsLines?.find((l) => l.id === lineId);
                    if (!lineObj) return null;

                    return (
                      <div
                        key={lineId}
                        className="flex items-center justify-between p-3.5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm text-slate-100 font-mono text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500 select-none w-4">{idx + 1}</span>
                          <span style={{ paddingLeft: `${lineObj.indent * 1.5}rem` }}>
                            {lineObj.text}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveLine(idx, 'up')}
                            disabled={idx === 0 || status !== 'unsubmitted'}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 transition-colors"
                            title="Move up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMoveLine(idx, 'down')}
                            disabled={idx === orderedLineIds.length - 1 || status !== 'unsubmitted'}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 transition-colors"
                            title="Move down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. PREDICT OUTPUT & CONCEPT QUIZ */}
            {(currentChallenge.type === 'predict_output' || currentChallenge.type === 'concept_quiz') && (
              <div className="space-y-4">
                {currentChallenge.codeSnippet && (
                  <div className="p-4 bg-slate-900 text-emerald-400 rounded-2xl font-mono text-sm sm:text-base whitespace-pre shadow-inner overflow-x-auto">
                    {currentChallenge.codeSnippet}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {optionOrder
                    .map((id) => currentChallenge.options?.find((o) => o.id === id))
                    .map((option) => {
                    if (!option) return null;
                    const isSelected = selectedOptionId === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => {
                          if (status === 'unsubmitted') {
                            sound.playTap();
                            setSelectedOptionId(option.id);
                          }
                        }}
                        disabled={status !== 'unsubmitted'}
                        className={`p-4 rounded-xl border-2 text-left font-medium text-sm transition cursor-pointer min-h-[56px] flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        <span className={option.isCode ? 'font-mono' : ''}>{option.text}</span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shrink-0 ml-2">
                            ✓
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. SPOT THE BUG */}
            {currentChallenge.type === 'spot_bug' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  Tap the line that contains the bug:
                </p>

                <div className="bg-slate-900 rounded-2xl p-3 divide-y divide-slate-800">
                  {currentChallenge.buggyCodeLines?.map((line, idx) => {
                    const isSelected = selectedBugLine === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (status === 'unsubmitted') {
                            sound.playTap();
                            setSelectedBugLine(idx);
                          }
                        }}
                        disabled={status !== 'unsubmitted'}
                        className={`w-full flex items-center gap-3 p-3 text-left font-mono text-sm transition-colors cursor-pointer rounded-lg ${
                          isSelected
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-500/50'
                            : 'hover:bg-slate-800 text-slate-200'
                        }`}
                      >
                        <span className="text-slate-500 select-none text-xs w-5">{idx + 1}</span>
                        <span className="flex-1">{line}</span>
                        {isSelected && (
                          <span className="text-xs font-bold text-rose-400">Bug here</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. MATCHING */}
            {currentChallenge.type === 'matching' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">Tap an item on the left, then its match on the right:</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    {currentChallenge.matchPairs?.map((pair, leftIdx) => {
                      const matchedTo = matches[leftIdx];
                      const isMatched = matchedTo !== undefined;
                      const isActive = activeLeft === leftIdx && status === 'unsubmitted';
                      const judged = status === 'retry' || status === 'wrong';
                      return (
                        <button
                          key={leftIdx}
                          onClick={() => handleSelectLeft(leftIdx)}
                          disabled={status !== 'unsubmitted'}
                          aria-pressed={isActive}
                          aria-label={`${pair.left}${isMatched ? `, matched with ${currentChallenge.matchPairs![matchedTo].right}` : ''}`}
                          className={`w-full min-h-[48px] p-3 rounded-xl border-2 text-left font-mono text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                            judged && isMatched
                              ? matchedTo === leftIdx
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                                : 'bg-rose-50 border-rose-500 text-rose-900'
                              : isActive
                              ? 'bg-emerald-50 border-emerald-500 text-slate-900'
                              : isMatched
                              ? 'bg-slate-100 border-slate-400 text-slate-800'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                          }`}
                        >
                          <span className="w-5 h-5 shrink-0 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center tabular-nums">
                            {leftIdx + 1}
                          </span>
                          <span className="min-w-0 break-words">{pair.left}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="space-y-2">
                    {matchRightOrder.map((pairIdx) => {
                      const pair = currentChallenge.matchPairs?.[pairIdx];
                      if (!pair) return null;
                      const leftEntry = Object.entries(matches).find(([, r]) => r === pairIdx);
                      const leftIdx = leftEntry ? Number(leftEntry[0]) : null;
                      return (
                        <button
                          key={pairIdx}
                          onClick={() => handleSelectRight(pairIdx)}
                          disabled={status !== 'unsubmitted' || activeLeft === null}
                          aria-label={`${pair.right}${leftIdx !== null ? `, matched with item ${leftIdx + 1}` : ''}`}
                          className={`w-full min-h-[48px] p-3 rounded-xl border-2 text-left text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer disabled:cursor-default ${
                            leftIdx !== null
                              ? 'bg-slate-100 border-slate-400 text-slate-800'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 shrink-0 rounded-full text-xs flex items-center justify-center tabular-nums ${
                              leftIdx !== null ? 'bg-slate-900 text-white' : 'border-2 border-dashed border-slate-300'
                            }`}
                            aria-hidden="true"
                          >
                            {leftIdx !== null ? leftIdx + 1 : ''}
                          </span>
                          <span className="min-w-0 break-words">{pair.right}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 5. CODE RUNNER (Interactive Python Playground Drill) */}
            {currentChallenge.type === 'code_runner' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">{LANGUAGE_LABELS[challengeLang]} Editor</span>
                  <button
                    onClick={handleExecuteCode}
                    disabled={isRunningCode}
                    className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isWebRunner ? 'Run Checks' : 'Run Code'}</span>
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    rows={isWebRunner ? 9 : 5}
                    spellCheck={false}
                    aria-label={`${LANGUAGE_LABELS[challengeLang]} code`}
                    className="w-full p-4 bg-slate-900 text-emerald-400 font-mono text-sm rounded-2xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder={CODE_PLACEHOLDERS[challengeLang]}
                  />
                </div>

                {isWebRunner ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Live preview: sandboxed with no permissions, so scripts never run */}
                    <iframe
                      title="Page preview"
                      sandbox=""
                      srcDoc={userCode}
                      className="w-full h-48 bg-white rounded-xl border border-slate-200"
                    />
                    <ul className="p-3 bg-white rounded-xl border border-slate-200 text-sm space-y-1.5" aria-label="Checks">
                      {currentChallenge.webChecks!.map((check, idx) => {
                        const result = webResults?.results[idx];
                        return (
                          <li key={idx} className="flex items-start gap-2">
                            {!result ? (
                              <span className="w-4 h-4 mt-0.5 shrink-0 rounded-full border-2 border-slate-300" aria-hidden="true" />
                            ) : result.passed ? (
                              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
                            ) : (
                              <XCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" aria-hidden="true" />
                            )}
                            <span className={result && !result.passed ? 'text-rose-700' : 'text-slate-700'}>
                              {check.label}
                              {result && <span className="sr-only">{result.passed ? ' (passed)' : ' (not yet)'}</span>}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                <div className="p-3 bg-slate-950 text-slate-300 rounded-xl font-mono text-xs border border-slate-800 min-h-[50px]">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Terminal Console:</div>
                  {runnerError ? (
                    <span className="text-rose-400">{runnerError}</span>
                  ) : runnerOutput ? (
                    <span className="text-emerald-300 whitespace-pre">{runnerOutput}</span>
                  ) : (
                    <span className="text-slate-600">Press "Run Code" or "Check Answer" to test output</span>
                  )}
                </div>
                )}
              </div>
            )}

          </div>
        ) : (
          /* LESSON COMPLETE CELEBRATION SCREEN */
          <div className="text-center py-8 space-y-6 animate-fadeIn">
            <PytoMascot mood="celebrating" size="lg" className="justify-center" />

            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Lesson Complete! 🎉
              </h2>
              <p className="text-slate-600 max-w-md mx-auto">
                You just leveled up your {LANGUAGE_LABELS[challengeLang]} skills! Pyto is proud of your dedication.
              </p>
            </div>

            {/* Rewards Grid */}
            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl">
                <div className="text-xl font-extrabold text-amber-600 tabular-nums">+{earned.xp}</div>
                <div className="text-xs font-bold text-amber-800 uppercase mt-0.5">Total XP</div>
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-2xl">
                <div className="text-xl font-extrabold text-amber-700 tabular-nums">+{earned.rings}</div>
                <div className="text-xs font-bold text-amber-900 uppercase mt-0.5">Gold rings</div>
              </div>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl">
                <div className="text-xl font-extrabold text-rose-600 tabular-nums">
                  {heartsLostInSession === 0 ? '100%' : `${Math.round(((challenges.length - heartsLostInSession) / challenges.length) * 100)}%`}
                </div>
                <div className="text-xs font-bold text-rose-800 uppercase mt-0.5">Accuracy</div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full max-w-sm mx-auto py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition cursor-pointer block"
            >
              Back to Roadmap
            </button>
          </div>
        )}
      </div>

      {/* Bottom Result & Action Drawer */}
      {!isCompleted && (
        <div
          className={`border-t px-4 sm:px-6 py-4 transition-colors shrink-0 ${
            status === 'correct'
              ? 'bg-emerald-50 border-emerald-200'
              : status === 'retry'
              ? 'bg-amber-50 border-amber-200'
              : status === 'wrong'
              ? 'bg-rose-50 border-rose-200'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Feedback message when submitted */}
            <div role="status" className="min-w-0 w-full sm:w-auto sm:flex-1">
            {status === 'correct' ? (
              <div className="flex items-center gap-3 text-emerald-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-extrabold text-base">Fantastic!</div>
                  <div className="text-xs text-emerald-700 leading-snug">{currentChallenge.explanation}</div>
                </div>
              </div>
            ) : status === 'retry' ? (
              <div className="flex items-center gap-3 text-amber-900">
                <RotateCcw className="w-8 h-8 text-amber-600 shrink-0" />
                <div>
                  <div className="font-extrabold text-base">Not quite. You get one more try.</div>
                  <div className="text-xs text-amber-800 leading-snug">Read the hint above, then try again.</div>
                </div>
              </div>
            ) : status === 'wrong' ? (
              <div className="flex items-start gap-3 text-rose-800">
                <AlertCircle className="w-8 h-8 text-rose-600 shrink-0" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="font-extrabold text-base">Here's the answer</div>
                  {describeAnswer(currentChallenge) && (
                    <pre className="max-h-32 overflow-auto p-2 bg-white border border-rose-200 rounded-lg text-xs font-mono text-slate-800 whitespace-pre-wrap">
                      {describeAnswer(currentChallenge)}
                    </pre>
                  )}
                  <div className="text-xs text-rose-700 leading-snug">
                    {currentChallenge.bugExplanation || currentChallenge.explanation}
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden sm:block text-xs font-medium text-slate-500">
                Tap your answer and press Check to continue.
              </div>
            )}
            </div>

            {/* Action Button */}
            {status === 'retry' ? (
              <button
                onClick={handleTryAgain}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide text-white bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/20 active:scale-[0.98] transition cursor-pointer min-h-[44px] shrink-0"
              >
                Try again
              </button>
            ) : status === 'unsubmitted' ? (
              <button
                onClick={handleCheckAnswer}
                disabled={!canCheck()}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide transition cursor-pointer min-h-[44px] ${
                  canCheck()
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 active:scale-[0.98]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={handleContinue}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide text-white transition cursor-pointer min-h-[44px] ${
                  status === 'correct'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-[0.98]'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 active:scale-[0.98]'
                }`}
              >
                Continue
              </button>
            )}

          </div>
        </div>
      )}
    </Modal>
  );
};
