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
import { runUnifiedCode, passesTestCases, MULTI_LANG_TEMPLATES } from '../src/utils/codeRunner';
import { SCHEDULED_CHALLENGES } from '../src/data/challenges';
import type { Challenge, LanguageId, Unit } from '../src/types';
import { SOLUTIONS } from './solutions';
import { pickChallenges, SESSION_SIZE } from '../src/utils/lessonSession';


const TRACKS: [LanguageId, Unit[], { id: string; nodes: any[] }[]][] = [
  ['python', PYTHON_UNITS, PYTHON_ROADMAP_PHASES],
  ['javascript', JAVASCRIPT_UNITS, JS_ROADMAP_PHASES],
  ['web', WEB_UNITS, WEB_ROADMAP_PHASES],
  ['sql', SQL_UNITS, SQL_ROADMAP_PHASES],
];
const MIN_CHALLENGES = 7; // pool size; each session draws SESSION_SIZE of them

const service = readFileSync(new URL('../src/utils/agentCheckinService.ts', import.meta.url), 'utf8');
const problems: string[] = [];
const warnings: string[] = [];
const fail = (m: string) => problems.push(m);

async function checkChallenge(c: Challenge, lang: LanguageId) {
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
    case 'matching': {
      const pairs = c.matchPairs || [];
      if (pairs.length < 3) fail(`${c.id}: matching needs at least 3 pairs`);
      if (new Set(pairs.map((p) => p.left)).size !== pairs.length || new Set(pairs.map((p) => p.right)).size !== pairs.length)
        fail(`${c.id}: matching items must be unique`);
      break;
    }
    case 'spot_bug':
      if (c.buggyLineIndex == null || c.buggyLineIndex < 0 || c.buggyLineIndex >= (c.buggyCodeLines?.length || 0))
        fail(`${c.id}: bug line out of range`);
      break;
    case 'code_runner': {
      // Web challenges are graded against a rendered DOM, which only exists in a browser.
      if (lang === 'web') {
        if (!c.webChecks?.length) fail(`${c.id}: web code_runner needs webChecks`);
        break;
      }
      const s = SOLUTIONS[c.id];
      if (!s) {
        warnings.push(`${c.id}: no reference solution`);
        break;
      }
      const passes = async (code: string) => passesTestCases(await runUnifiedCode(code, lang), c.testCases);
      if (!c.testCases?.length) fail(`${c.id}: no test cases`);
      if (!(await passes(s.right))) fail(`${c.id}: reference solution fails`);
      if (await passes(c.starterCode || '')) fail(`${c.id}: starter code already passes`);
      for (const w of s.wrong) if (await passes(w)) fail(`${c.id}: wrong answer passes: ${w}`);
      break;
    }
  }
}

for (const [lang, units, phases] of TRACKS) {
  const lessonUnit = new Map<string, string>();
  const challengeIds = new Set<string>();
  let challenges = 0;

  for (const unit of units) {
    for (const [i, lesson] of unit.nodes.entries()) {
      if (lessonUnit.has(lesson.id)) fail(`duplicate lesson ${lesson.id}`);
      lessonUnit.set(lesson.id, unit.id);
      if (lesson.unitId !== unit.id || lesson.unitNumber !== unit.unitNumber || lesson.indexInUnit !== i)
        fail(`${lesson.id}: unit/index fields out of sync`);
      if (lesson.challenges.length < MIN_CHALLENGES)
        fail(`${lesson.id}: only ${lesson.challenges.length} challenges`);
      // Session draws: right size, authored order, code exercise included, nothing starved
      const seen = new Set<string>();
      const hasCode = lesson.challenges.some((c) => c.type === 'code_runner');
      for (let i = 0; i < 300; i++) {
        const picked = pickChallenges(lesson.challenges);
        const idx = picked.map((c) => lesson.challenges.indexOf(c));
        if (picked.length !== Math.min(SESSION_SIZE, lesson.challenges.length) || idx.some((v, k) => k > 0 && v <= idx[k - 1]))
          { fail(`${lesson.id}: bad session draw`); break; }
        if (hasCode && !picked.some((c) => c.type === 'code_runner')) { fail(`${lesson.id}: session missed the code exercise`); break; }
        picked.forEach((c) => seen.add(c.id));
      }
      if (seen.size < lesson.challenges.length) fail(`${lesson.id}: some challenges never get drawn`);
      for (const c of lesson.challenges) {
        challenges++;
        if (challengeIds.has(c.id)) fail(`duplicate challenge ${c.id}`);
        challengeIds.add(c.id);
        await checkChallenge(c, lang);
      }
    }
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

// Scheduled challenges are graded by exact output match in the app's runner.
for (const ch of SCHEDULED_CHALLENGES) {
  const s = SOLUTIONS[ch.id];
  const passes = async (code: string) => {
    const r = await runUnifiedCode(code, ch.language);
    return r.success && r.output.trim() === ch.expectedOutput.trim();
  };
  if (!s) fail(`${ch.id}: no reference solution`);
  else {
    if (!(await passes(s.right))) fail(`${ch.id}: reference solution fails in the app runner`);
    if (await passes(ch.starterCode)) fail(`${ch.id}: starter code already passes`);
    for (const w of s.wrong) if (await passes(w)) fail(`${ch.id}: wrong answer passes: ${w}`);
  }
}

// The playground's example programs must run cleanly.
for (const t of MULTI_LANG_TEMPLATES) {
  if (t.language === 'web') continue;
  const r = await runUnifiedCode(t.code, t.language);
  if (!r.success || r.output.includes('NaN')) fail(`playground "${t.title}" (${t.language}): ${r.error || r.output}`);
}

if (warnings.length) console.log('\nwarnings:\n  ' + warnings.join('\n  '));
console.log(problems.length ? '\nPROBLEMS:\n  ' + problems.join('\n  ') : '\nall checks passed');
process.exit(problems.length ? 1 : 0);
