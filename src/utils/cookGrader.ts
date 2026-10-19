import { CookEvaluation } from '../types';
import { runUnifiedCode } from './codeRunner';

export function evaluateCookSubmission(
  code: string,
  expectedOutput: string,
  timeTakenSec: number,
  timeLimitSec: number
): CookEvaluation {
  const result = runUnifiedCode(code, 'python');
  const actual = result.output.trim();
  const expected = expectedOutput.trim();
  const passed = result.success && actual === expected;

  const lines = code.split('\n').filter((l) => l.trim().length > 0 && !l.trim().startsWith('#'));
  const linesCount = lines.length;
  const feedback: string[] = [];

  let cleanlinessScore = 100;

  // 1. Correctness check
  if (!passed) {
    cleanlinessScore -= 50;
    feedback.push(`Output mismatch: expected "${expected}", received "${actual || (result.error ? 'Error' : 'empty')}".`);
  } else {
    feedback.push('✓ Output matches expected result with 100% precision.');
  }

  // 2. Line efficiency & brevity
  if (linesCount <= 5) {
    feedback.push('✨ Exceptional brevity: Clean, concise solution under 5 lines (+15 pts).');
    cleanlinessScore += 5;
  } else if (linesCount > 15) {
    cleanlinessScore -= 10;
    feedback.push('⚠️ Verbose structure: Could be refactored into fewer statements.');
  } else {
    feedback.push('✓ Solid line count and logical separation.');
  }

  // 3. Time speed bonus
  const timeRatio = timeTakenSec / Math.max(1, timeLimitSec);
  if (timeRatio < 0.3) {
    feedback.push('⚡ Blazing speed: Solved in top 5% speed bracket (+10 pts).');
    cleanlinessScore += 5;
  } else if (timeRatio > 0.85) {
    feedback.push('⏱️ Completed near wire: Keep practicing for faster recall.');
  }

  // 4. Formatting & clean code
  const hasTabs = code.includes('\t');
  if (hasTabs) {
    cleanlinessScore -= 5;
    feedback.push('ℹ️ Notice: Prefer 4 spaces over tab characters for PEP8 compliance.');
  }

  const finalScore = Math.min(100, Math.max(20, cleanlinessScore));

  let efficiencyRating: 'S' | 'A' | 'B' | 'C' = 'C';
  if (passed && finalScore >= 95) efficiencyRating = 'S';
  else if (passed && finalScore >= 80) efficiencyRating = 'A';
  else if (passed) efficiencyRating = 'B';
  else efficiencyRating = 'C';

  return {
    runtimeMs: result.executionTimeMs,
    linesCount,
    cleanlinessScore: finalScore,
    efficiencyRating,
    feedback,
    passed,
  };
}
