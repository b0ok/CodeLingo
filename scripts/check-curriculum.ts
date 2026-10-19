// Structural check for every course: roadmap <-> lesson links, challenge fields,
// check-in data, and reference solutions for code_runner challenges.
// Run: npm run check:curriculum
import { readFileSync } from 'node:fs';
import { PYTHON_UNITS, JAVASCRIPT_UNITS, WEB_UNITS, SQL_UNITS } from '../src/data/curriculum';
import { PYTHON_ROADMAP_PHASES } from '../src/data/pythonRoadmap';
import { JS_ROADMAP_PHASES } from '../src/data/jsRoadmap';
import { WEB_ROADMAP_PHASES } from '../src/data/webRoadmap';
import { SQL_ROADMAP_PHASES } from '../src/data/sqlRoadmap';
import { getPhaseDiagnosticQuestions } from '../src/utils/agentCheckinService';
import { runUnifiedCode, passesTestCases } from '../src/utils/codeRunner';
import { PLAYGROUND_TEMPLATES } from '../src/utils/pythonRunner';
import type { Challenge, LanguageId, Unit } from '../src/types';

// Reference solutions: `right` must pass, starter code and every `wrong` must fail.
// Web challenges are graded in a real DOM, so they are checked in the browser instead.
const SOLUTIONS: Record<string, { right: string; wrong: string[] }> = {
  'u1-l1-c4': { right: 'print("Python is fun")', wrong: ['print("python is fun")', 'print("Python is fun!")'] },
  'u1-l3-c3': { right: '# print("Novice")\nprint("Python Champion")', wrong: ['print("Novice")'] },
  'u2-l3-c3': { right: 'score = 99\nprint(f"User score is {score}")', wrong: ['score = 99\nprint("User score is score")'] },
  'u3-l2-c3': { right: 'age = 15\nif age < 18:\n    print("Youth Ticket")\nelse:\n    print("Standard Ticket")', wrong: ['age = 15\nprint("Standard Ticket")'] },
  'u4-l1-c3': { right: 'total = 0\nfor n in range(1, 5):\n    total = total + n\nprint(total)', wrong: ['total = 0\nfor n in range(1, 4):\n    total = total + n\nprint(total)'] },
  'u5-l2-c2': { right: 'treasures = ["Gold", "Ruby"]\ntreasures.append("Diamond")\nprint(len(treasures))', wrong: ['treasures = ["Gold", "Ruby"]\nprint(len(treasures))'] },
  'u6-l2-c2': { right: 'def double_it(n):\n    return n * 2\n\nprint(double_it(7))', wrong: ['def double_it(n):\n    return n + 2\n\nprint(double_it(7))'] },
  'u7-l1-c2': { right: 'points = [45, 92, 78, 99, 61]\nprint(max(points))', wrong: ['points = [45, 92, 78, 99, 61]\nprint(min(points))'] },
  'u8-l1-c3': { right: 'class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\np = Point(3, 7)\nprint(p.x + p.y)', wrong: ['class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\np = Point(3, 7)\nprint(p.x)'] },
  'js-u1-l1-c5': { right: 'console.log("CodeLingo");', wrong: ['console.log("codelingo");', 'console.log("Code", "Lingo");'] },
  'js-u3-l2-c2': { right: 'const square = (x) => x * x;\nconsole.log(square(6));', wrong: ['const square = (x) => x * x;\nconsole.log(square(5));'] },
  'sql-u1-l1-c4': { right: 'SELECT name, role, points FROM users;', wrong: ['SELECT * FROM users;', 'SELECT name, role FROM users;'] },
  'sql-u1-l2-c3': { right: 'SELECT title, price FROM products WHERE price < 100;', wrong: ['SELECT title, price FROM products', 'SELECT title, price FROM products WHERE price > 100;'] },
  'sql-u2-l1-c2': { right: 'SELECT name, points FROM users ORDER BY points DESC LIMIT 3;', wrong: ['SELECT name, points FROM users ORDER BY points ASC LIMIT 3;', 'SELECT name, points FROM users LIMIT 3;'] },
  'sql-u2-l2-c3': { right: "SELECT name FROM users WHERE name LIKE '%li%';", wrong: ['SELECT name FROM users', "SELECT name FROM users WHERE name LIKE '%a%';"] },
  'sql-u5-l1-c1': { right: "SELECT COUNT(*) FROM users WHERE role = 'Developer';", wrong: ['SELECT COUNT(*) FROM users', "SELECT COUNT(*) FROM users WHERE role = 'Designer';"] },
};

const TRACKS: [LanguageId, Unit[], { id: string; nodes: any[] }[]][] = [
  ['python', PYTHON_UNITS, PYTHON_ROADMAP_PHASES],
  ['javascript', JAVASCRIPT_UNITS, JS_ROADMAP_PHASES],
  ['web', WEB_UNITS, WEB_ROADMAP_PHASES],
  ['sql', SQL_UNITS, SQL_ROADMAP_PHASES],
];
const MIN_CHALLENGES = 3;

const service = readFileSync(new URL('../src/utils/agentCheckinService.ts', import.meta.url), 'utf8');
const problems: string[] = [];
const warnings: string[] = [];
const fail = (m: string) => problems.push(m);

function checkChallenge(c: Challenge, lang: LanguageId) {
  switch (c.type) {
    case 'token_fill': {
      const blanks = (c.codeTemplate?.match(/__BLANK_\d+__/g) || []).length;
      if (!blanks || blanks !== c.blankCount || c.correctTokens?.length !== blanks) fail(`${c.id}: blank count mismatch`);
      const bank = [...(c.tokens || [])];
      for (const t of c.correctTokens || []) {
        const i = bank.indexOf(t);
        if (i < 0) fail(`${c.id}: token ${t} missing from bank`);
        else bank.splice(i, 1);
      }
      break;
    }
    case 'parsons': {
      const ids = (c.parsonsLines || []).map((l) => l.id).sort().join();
      if ([...(c.correctParsonsOrder || [])].sort().join() !== ids) fail(`${c.id}: parsons order does not cover lines`);
      break;
    }
    case 'predict_output':
    case 'concept_quiz':
      if (!c.options?.some((o) => o.id === c.correctOptionId)) fail(`${c.id}: correct option missing`);
      break;
    case 'spot_bug':
      if (c.buggyLineIndex == null || c.buggyLineIndex < 0 || c.buggyLineIndex >= (c.buggyCodeLines?.length || 0))
        fail(`${c.id}: bug line out of range`);
      break;
    case 'code_runner': {
      if (lang === 'web') break;
      const s = SOLUTIONS[c.id];
      if (!s) {
        warnings.push(`${c.id}: no reference solution`);
        break;
      }
      const passes = (code: string) => passesTestCases(runUnifiedCode(code, lang), c.testCases);
      if (!c.testCases?.length) fail(`${c.id}: no test cases`);
      if (!passes(s.right)) fail(`${c.id}: reference solution fails`);
      if (passes(c.starterCode || '')) fail(`${c.id}: starter code already passes`);
      for (const w of s.wrong) if (passes(w)) fail(`${c.id}: wrong answer passes: ${w}`);
      break;
    }
  }
}

for (const [lang, units, phases] of TRACKS) {
  const lessonUnit = new Map<string, string>();
  const challengeIds = new Set<string>();
  let challenges = 0;

  for (const unit of units) {
    unit.nodes.forEach((lesson, i) => {
      if (lessonUnit.has(lesson.id)) fail(`duplicate lesson ${lesson.id}`);
      lessonUnit.set(lesson.id, unit.id);
      if (lesson.unitId !== unit.id || lesson.unitNumber !== unit.unitNumber || lesson.indexInUnit !== i)
        fail(`${lesson.id}: unit/index fields out of sync`);
      if (lesson.challenges.length < MIN_CHALLENGES)
        warnings.push(`${lesson.id}: only ${lesson.challenges.length} challenges`);
      for (const c of lesson.challenges) {
        challenges++;
        if (challengeIds.has(c.id)) fail(`duplicate challenge ${c.id}`);
        challengeIds.add(c.id);
        checkChallenge(c, lang);
      }
    });
  }

  const linked = new Set<string>();
  const nodeIds = new Set<string>();
  for (const phase of phases) {
    if (getPhaseDiagnosticQuestions(phase.id)[0].id === 'diag-gen') fail(`${phase.id}: no diagnostic questions`);
    for (const n of phase.nodes) {
      if (nodeIds.has(n.id)) fail(`duplicate milestone ${n.id}`);
      nodeIds.add(n.id);
      if (n.phaseId !== phase.id) fail(`${n.id}: wrong phaseId`);
      if (!service.includes(`'${n.id}': [`)) fail(`${n.id}: no blind spots`);
      if (!n.lessonIds.length) warnings.push(`${n.id}: no lessons yet`);
      for (const l of n.lessonIds) {
        if (!lessonUnit.has(l)) fail(`${n.id}: links to missing lesson ${l}`);
        else if (lessonUnit.get(l) !== n.unitId) fail(`${n.id}: lesson ${l} is not in ${n.unitId}`);
        linked.add(l);
      }
    }
  }
  for (const l of lessonUnit.keys()) if (!linked.has(l)) warnings.push(`${l}: not on any roadmap milestone`);

  console.log(`${lang}: ${units.length} units, ${lessonUnit.size} lessons, ${challenges} challenges, ${phases.length} phases, ${nodeIds.size} milestones`);
}

// The Python playground's own examples must run cleanly.
for (const t of PLAYGROUND_TEMPLATES) {
  const r = runUnifiedCode(t.code, 'python');
  if (!r.success || r.output.includes('NaN')) fail(`playground "${t.name}": ${r.error || r.output}`);
}

if (warnings.length) console.log('\nwarnings:\n  ' + warnings.join('\n  '));
console.log(problems.length ? '\nPROBLEMS:\n  ' + problems.join('\n  ') : '\nall checks passed');
process.exit(problems.length ? 1 : 0);
