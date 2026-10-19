// Runs challenge code in real runtimes (Node, Python, SQLite via Python) and checks
// that the content matches what actually happens:
//   - predict_output: the option marked correct matches the real output (or error),
//     and no other option does
//   - code_runner: reference solutions pass in the real language too, not just in the
//     in-browser runners
// Needs `python` (3.8+) on PATH. Run: npm run verify:snippets
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { PYTHON_UNITS, JAVASCRIPT_UNITS, WEB_UNITS, SQL_UNITS } from '../src/data/curriculum';
import { SAMPLE_SQL_DB } from '../src/utils/codeRunner';
import type { Challenge, LanguageId, TestCase } from '../src/types';
import { SOLUTIONS } from './solutions';
import { SCHEDULED_CHALLENGES } from '../src/data/challenges';

// Snippets that cannot run outside a browser or only describe timing.
// Each one needs a human check; the reason is printed in the report.
export const SKIP: Record<string, string> = {
  'js-u7-l3-c4': 'timing question (sequential vs parallel awaits); checked by hand 2026-10-19',
  'js-u8-l2-c3': 'needs a browser DOM (event bubbling); checked by hand 2026-10-19',
  'js-u8-l3-c4': 'needs browser localStorage; checked by hand 2026-10-19',
  'web-u2-l1-c1': 'CSS specificity; checked by hand 2026-10-19',
  'web-u2-l2-c1': 'CSS margin collapsing; checked by hand 2026-10-19',
};

// For options written as a description ("RANK = 4, DENSE_RANK = 3"), the real output
// was checked by hand against the marked option once and is pinned here, so any later
// change to the snippet shows up as a mismatch.
export const PINNED_OUTPUT: Record<string, string> = {
  'sql-u9-l1-c1': '100 | 1 | 1\n90 | 2 | 2\n90 | 2 | 2\n80 | 4 | 3',
};

type Run = { ok: boolean; out: string; error?: string };

const SQL_HARNESS = `
import json, sqlite3, sys
data = json.loads(sys.stdin.read())
con = sqlite3.connect(':memory:')
for table, rows in data['db'].items():
    cols = list(rows[0].keys())
    con.execute(f"CREATE TABLE {table} ({', '.join(cols)})")
    con.executemany(f"INSERT INTO {table} VALUES ({', '.join('?' for _ in cols)})", [tuple(r[c] for c in cols) for r in rows])
cur = con.cursor()
statements = [s.strip() for s in data['sql'].split(';') if s.strip()]
for s in statements:
    cur.execute(s)
def fmt(v):
    if v is None:
        return 'NULL'
    if isinstance(v, float) and v.is_integer():
        return str(int(v))
    return str(v)
if cur.description is None:
    print(f"{cur.rowcount} row" + ("" if cur.rowcount == 1 else "s"))
else:
    for row in cur.fetchall():
        print(' | '.join(fmt(v) for v in row))
`;

function run(lang: LanguageId, code: string): Run {
  const opts = { encoding: 'utf8' as const, timeout: 10000, cwd: tmpdir() }; // snippets may write files
  const r =
    lang === 'javascript'
      ? spawnSync(process.execPath, ['--input-type=module', '-e', code], opts)
      : lang === 'python'
      ? spawnSync('python', ['-I', '-c', code], opts)
      : spawnSync('python', ['-I', '-c', SQL_HARNESS], { ...opts, input: JSON.stringify({ db: SAMPLE_SQL_DB, sql: code }) });
  if (r.error) throw r.error;
  const out = (r.stdout || '').replace(/\r\n/g, '\n').trimEnd();
  if (r.status === 0) return { ok: true, out };
  const lines = (r.stderr || '').trim().split('\n');
  return { ok: false, out, error: lines.reverse().find((l) => /\w+(Error|Exception)\b/.test(l)) || lines[0] };
}

const errorName = (msg = '') => msg.match(/\b(\w+(?:Error|Exception))\b/)?.[1] || '';

// An option "matches" when it equals the output written one way or another: on separate
// lines, comma-separated, "a then b", "a and b", space-separated, or as a row count.
function matches(option: string, r: Run): boolean {
  if (!r.ok) return !!errorName(r.error) && option.includes(errorName(r.error));
  const text = option
    .replace(/\s+\([^()]*\)$/, '') // trailing explanation in parentheses
    .trim();
  const lines = r.out === '' ? [] : r.out.split('\n');
  const forms = [r.out, ...[', ', ' then ', ' and ', ' & ', ' ', ','].map((sep) => lines.join(sep))];
  if (lines.length && !/ rows?$/.test(r.out)) forms.push(`${lines.length} row${lines.length === 1 ? '' : 's'}`);
  return forms.some((f) => f === text);
}

const outputPasses = (r: Run, tests: TestCase[] = []) =>
  r.ok && tests.every((t) => (t.contains ? r.out.includes(t.expectedOutput.trim()) : r.out.trim() === t.expectedOutput.trim()));

const problems: string[] = [];
const skipped: string[] = [];
let checked = 0;

const TRACKS: [LanguageId, typeof PYTHON_UNITS][] = [
  ['python', PYTHON_UNITS],
  ['javascript', JAVASCRIPT_UNITS],
  ['sql', SQL_UNITS],
  ['web', WEB_UNITS],
];

for (const [lang, units] of TRACKS) {
  for (const c of units.flatMap((u) => u.nodes.flatMap((l) => l.challenges)) as Challenge[]) {
    if (c.type === 'predict_output' && c.codeSnippet) {
      if (lang === 'web' && !SKIP[c.id]) {
        problems.push(`${c.id}: HTML/CSS snippet cannot run here; check it by hand and add it to SKIP`);
        continue;
      }
      if (SKIP[c.id]) {
        skipped.push(`${c.id}: ${SKIP[c.id]}`);
        continue;
      }
      const r = run(lang, c.codeSnippet);
      checked++;
      if (PINNED_OUTPUT[c.id] !== undefined) {
        if (!r.ok || r.out !== PINNED_OUTPUT[c.id])
          problems.push(`${c.id}: output changed from the hand-checked ${JSON.stringify(PINNED_OUTPUT[c.id])} to ${r.ok ? JSON.stringify(r.out) : r.error}`);
        continue;
      }
      const correct = c.options?.find((o) => o.id === c.correctOptionId);
      const actual = r.ok ? JSON.stringify(r.out) : `error: ${r.error}`;
      if (!correct || !matches(correct.text, r)) problems.push(`${c.id}: marked "${correct?.text}" but real run gives ${actual}`);
      for (const o of c.options || [])
        if (o.id !== c.correctOptionId && matches(o.text, r)) problems.push(`${c.id}: wrong option "${o.text}" also matches ${actual}`);
    }
    if (c.type === 'code_runner' && (lang === 'python' || lang === 'javascript') && SOLUTIONS[c.id]) {
      checked++;
      const s = SOLUTIONS[c.id];
      const right = run(lang, s.right);
      if (!outputPasses(right, c.testCases)) problems.push(`${c.id}: reference solution fails in real ${lang}: ${right.ok ? JSON.stringify(right.out) : right.error}`);
      for (const w of s.wrong) if (outputPasses(run(lang, w), c.testCases)) problems.push(`${c.id}: wrong answer passes in real ${lang}: ${w}`);
    }
  }
}

for (const ch of SCHEDULED_CHALLENGES) {
  const s = SOLUTIONS[ch.id];
  if (!s) continue; // reported by check-curriculum
  checked++;
  const tests = [{ name: 'expected', expectedOutput: ch.expectedOutput }];
  const right = run(ch.language, s.right);
  if (!outputPasses(right, tests)) problems.push(`${ch.id}: reference solution fails in real ${ch.language}: ${right.ok ? JSON.stringify(right.out) : right.error}`);
  for (const w of s.wrong) if (outputPasses(run(ch.language, w), tests)) problems.push(`${ch.id}: wrong answer passes in real ${ch.language}`);
}

console.log(`checked ${checked} snippets and solutions in real runtimes`);
if (skipped.length) console.log(`\nskipped (${skipped.length}), review by hand:\n  ` + skipped.join('\n  '));
console.log(problems.length ? `\nPROBLEMS (${problems.length}):\n  ` + problems.join('\n  ') : '\nall snippets match');
process.exit(problems.length ? 1 : 0);
