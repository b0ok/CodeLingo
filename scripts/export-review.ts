// Exports every lesson challenge and scheduled challenge to review/review-data.json
// for the content review page (review/index.html), tagging how each one is verified.
// Run: npm run export:review
import { writeFileSync, mkdirSync } from 'node:fs';
import { PYTHON_UNITS, JAVASCRIPT_UNITS, WEB_UNITS, SQL_UNITS } from '../src/data/curriculum';
import { SCHEDULED_CHALLENGES } from '../src/data/challenges';
import { describeAnswer } from '../src/utils/answers';
import type { Challenge, LanguageId, Unit } from '../src/types';
import { SOLUTIONS, SKIP } from './solutions';

const COURSES: [LanguageId, string, Unit[]][] = [
  ['python', 'Python', PYTHON_UNITS],
  ['javascript', 'JavaScript', JAVASCRIPT_UNITS],
  ['sql', 'SQL', SQL_UNITS],
  ['web', 'HTML & CSS', WEB_UNITS],
];
const RUNTIME: Record<string, string> = { python: 'Python', javascript: 'Node', sql: 'SQLite' };

// How much of this challenge is checked by a machine. "review" means only its
// structure is checked, so a person should read it.
function verification(c: Challenge, lang: LanguageId): { level: 'run' | 'hand' | 'review'; note: string } {
  if (c.type === 'predict_output' && c.codeSnippet) {
    if (SKIP[c.id]) return { level: 'hand', note: `Checked by hand: ${SKIP[c.id]}` };
    if (RUNTIME[lang]) return { level: 'run', note: `Snippet run in real ${RUNTIME[lang]}; the marked answer matches` };
  }
  if (c.type === 'code_runner') {
    if (c.webChecks?.length) return { level: 'run', note: 'Reference solution passes the graded checks in a browser' };
    if (SOLUTIONS[c.id]) return { level: 'run', note: 'Reference solution passes; starter code and wrong answers fail' };
  }
  return { level: 'review', note: 'Structure checked only; the content needs a human read' };
}

const code = (c: Challenge) =>
  c.codeSnippet ?? c.codeTemplate?.replace(/__BLANK_\d+__/g, '___') ?? c.buggyCodeLines?.join('\n') ?? c.starterCode ?? null;

const lessons = COURSES.flatMap(([lang, course, units]) =>
  units.flatMap((u) =>
    u.nodes.map((l) => ({
      id: l.id,
      course,
      lang,
      unit: `Unit ${u.unitNumber}: ${u.title}`,
      title: l.title,
      challenges: l.challenges.map((c) => ({
        id: c.id,
        type: c.type,
        title: c.title,
        instruction: c.instruction,
        code: code(c),
        options: c.options?.map((o) => ({ text: o.text, correct: o.id === c.correctOptionId })) ?? null,
        tokens: c.type === 'token_fill' ? c.tokens : null,
        pairs: c.matchPairs ?? null,
        checks: c.webChecks?.map((w) => w.label) ?? null,
        answer: describeAnswer(c),
        hint: c.hint,
        explanation: c.bugExplanation ? `${c.bugExplanation} ${c.explanation}` : c.explanation,
        verification: verification(c, lang),
      })),
    }))
  )
);

const scheduled = SCHEDULED_CHALLENGES.map((s) => ({
  id: s.id,
  type: s.type,
  title: s.title,
  difficulty: s.difficulty,
  language: s.language,
  prompt: s.prompt,
  starterCode: s.starterCode,
  expectedOutput: s.expectedOutput,
  hints: s.hints,
  verification: SOLUTIONS[s.id]
    ? { level: 'run', note: 'Reference solution passes in real Python and in the app; the starter fails' }
    : { level: 'review', note: 'No reference solution yet' },
}));

mkdirSync(new URL('../review/', import.meta.url), { recursive: true });
const out = { generatedAt: new Date().toISOString(), lessons, scheduled };
writeFileSync(new URL('../review/review-data.json', import.meta.url), JSON.stringify(out));
const all = lessons.flatMap((l) => l.challenges);
console.log(
  `exported ${all.length} lesson challenges (${all.filter((c) => c.verification.level !== 'review').length} machine- or hand-checked) and ${scheduled.length} scheduled challenges`
);
