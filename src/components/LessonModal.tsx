import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { LessonNode, Challenge } from '../types';
import { useGame } from '../context/GameContext';
import { PytoMascot } from './PytoMascot';
import { runUnifiedCode } from '../utils/codeRunner';
import { sound } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { X, Heart, CheckCircle2, AlertCircle, ArrowUp, ArrowDown, Play, Sparkles, RefreshCw, HelpCircle } from 'lucide-react';

interface LessonModalProps {
  lesson: LessonNode;
  onClose: () => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({ lesson, onClose }) => {
  const { stats, loseHeart, gainXpAndGems } = useGame();

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

  // Evaluation status: 'unsubmitted' | 'correct' | 'wrong'
  const [status, setStatus] = useState<'unsubmitted' | 'correct' | 'wrong'>('unsubmitted');
  const [showHint, setShowHint] = useState(false);

  const currentChallenge: Challenge = lesson.challenges[currentChallengeIndex];
  const progressPercent = ((currentChallengeIndex) / lesson.challenges.length) * 100;

  // Initialize per-challenge state
  useEffect(() => {
    setStatus('unsubmitted');
    setShowHint(false);

    if (currentChallenge.type === 'token_fill') {
      setFilledTokens([]);
      setAvailableTokens([...(currentChallenge.tokens || [])]);
    } else if (currentChallenge.type === 'parsons') {
      const initialIds = (currentChallenge.parsonsLines || []).map((l) => l.id);
      // Shuffle initial order slightly if needed, or use as provided
      setOrderedLineIds(initialIds);
    } else if (currentChallenge.type === 'predict_output' || currentChallenge.type === 'concept_quiz') {
      setSelectedOptionId(null);
    } else if (currentChallenge.type === 'spot_bug') {
      setSelectedBugLine(null);
    } else if (currentChallenge.type === 'code_runner') {
      setUserCode(currentChallenge.starterCode || '');
      setRunnerOutput('');
      setRunnerError(null);
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

  // Run Code in browser
  const handleExecuteCode = () => {
    sound.playTap();
    setIsRunningCode(true);
    setTimeout(() => {
      const challengeLang = lesson.id.startsWith('js-') ? 'javascript' : lesson.id.startsWith('sql-') ? 'sql' : lesson.id.startsWith('web-') ? 'web' : 'python';
      const result = runUnifiedCode(userCode, challengeLang);
      setIsRunningCode(false);
      setRunnerOutput(result.output);
      setRunnerError(result.error || null);

      if (result.success) {
        sound.playTap();
      } else {
        sound.playError();
      }
    }, 150);
  };

  // Check Answer Handler
  const handleCheckAnswer = () => {
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
    } else if (currentChallenge.type === 'code_runner') {
      const challengeLang = lesson.id.startsWith('js-') ? 'javascript' : lesson.id.startsWith('sql-') ? 'sql' : lesson.id.startsWith('web-') ? 'web' : 'python';
      const result = runUnifiedCode(userCode, challengeLang);
      const actual = result.output.trim();
      isCorrect =
        result.success &&
        (currentChallenge.testCases || []).every((tc) => actual.includes(tc.expectedOutput.trim()));
      setRunnerOutput(result.output);
      setRunnerError(result.error || null);
    }

    if (isCorrect) {
      sound.playSuccess();
      setStatus('correct');
    } else {
      sound.playError();
      setStatus('wrong');
      setHeartsLostInSession((prev) => prev + 1);
      loseHeart();
    }
  };

  // Move to next challenge or complete lesson
  const handleContinue = () => {
    if (currentChallengeIndex + 1 < lesson.challenges.length) {
      setCurrentChallengeIndex((prev) => prev + 1);
    } else {
      // Completed full lesson!
      const stars = heartsLostInSession === 0 ? 3 : heartsLostInSession === 1 ? 2 : 1;
      gainXpAndGems(lesson.xpReward, lesson.gemReward, lesson.id, stars);
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
    if (status !== 'unsubmitted') return false;
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

        {/* Hearts Remaining */}
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
                  {lesson.title} · Challenge {currentChallengeIndex + 1} of {lesson.challenges.length}
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
                              tokenInSlot
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
                  {currentChallenge.options?.map((option) => {
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

            {/* 5. CODE RUNNER (Interactive Python Playground Drill) */}
            {currentChallenge.type === 'code_runner' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Python Editor</span>
                  <button
                    onClick={handleExecuteCode}
                    disabled={isRunningCode}
                    className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Code</span>
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    rows={5}
                    spellCheck={false}
                    className="w-full p-4 bg-slate-900 text-emerald-400 font-mono text-sm rounded-2xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="# Write your Python code here"
                  />
                </div>

                {/* Console Output */}
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
                You just leveled up your Python powers! Pyto is proud of your dedication.
              </p>
            </div>

            {/* Rewards Grid */}
            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl">
                <div className="text-xl font-extrabold text-amber-600 tabular-nums">+{lesson.xpReward}</div>
                <div className="text-xs font-bold text-amber-800 uppercase mt-0.5">Total XP</div>
              </div>
              <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-2xl">
                <div className="text-xl font-extrabold text-cyan-600 tabular-nums">+{lesson.gemReward}</div>
                <div className="text-xs font-bold text-cyan-800 uppercase mt-0.5">Gems</div>
              </div>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl">
                <div className="text-xl font-extrabold text-rose-600 tabular-nums">
                  {heartsLostInSession === 0 ? '100%' : `${Math.round(((lesson.challenges.length - heartsLostInSession) / lesson.challenges.length) * 100)}%`}
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
              : status === 'wrong'
              ? 'bg-rose-50 border-rose-200'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Feedback message when submitted */}
            {status === 'correct' ? (
              <div className="flex items-center gap-3 text-emerald-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-extrabold text-base">Fantastic!</div>
                  <div className="text-xs text-emerald-700 leading-snug">{currentChallenge.explanation}</div>
                </div>
              </div>
            ) : status === 'wrong' ? (
              <div className="flex items-center gap-3 text-rose-800">
                <AlertCircle className="w-8 h-8 text-rose-600 shrink-0" />
                <div>
                  <div className="font-extrabold text-base">Not quite yet</div>
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

            {/* Action Button */}
            {status === 'unsubmitted' ? (
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
