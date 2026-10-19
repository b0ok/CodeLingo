// "Let me cook": one hard challenge per course for learners who pick Pro during onboarding.
// Reference answers live in scripts/solutions.ts and are checked by check:curriculum.
import { LanguageId, TestCase, WebCheck } from '../types';

export interface ProChallenge {
  id: string;
  language: LanguageId;
  title: string;
  prompt: string;
  starterCode: string;
  testCases?: TestCase[]; // python, javascript, sql: whole output must match
  webChecks?: WebCheck[]; // web: checked against the rendered page
}

export const PRO_CHALLENGES: Record<LanguageId, ProChallenge> = {
  python: {
    id: 'pro-python-rle',
    language: 'python',
    title: 'Run-length encoding',
    prompt: 'Finish compress(s) so each run of a letter becomes the letter plus how many times it repeats: "aaab" becomes "a3b1". An empty string stays empty.',
    starterCode: `def compress(s):
    # "aaab" -> "a3b1"
    pass

print(compress("aaabccdddd"))
print(compress("z"))
print(compress("abba"))
print(compress(""))
`,
    testCases: [{ name: 'Encodes every run', expectedOutput: 'a3b1c2d4\nz1\na1b2a1' }],
  },
  javascript: {
    id: 'pro-js-brackets',
    language: 'javascript',
    title: 'Balanced brackets',
    prompt: 'Finish isBalanced(str): return true only if every (, [ and { is closed by the matching bracket in the right order.',
    starterCode: `function isBalanced(str) {
  // "([]{})" -> true, "([)]" -> false
}

console.log(isBalanced("([]{})"));
console.log(isBalanced("([)]"));
console.log(isBalanced("(("));
console.log(isBalanced("a(b[c]d)e"));
console.log(isBalanced(""));
`,
    testCases: [{ name: 'Checks every string', expectedOutput: 'true\nfalse\nfalse\ntrue\ntrue' }],
  },
  sql: {
    id: 'pro-sql-top-dev',
    language: 'sql',
    title: 'Top developer',
    prompt: 'Write one query that shows the name and email of the Developer with the most points. Only that one row. Tables: users (id, name, email, role, points), products, orders.',
    starterCode: `-- Name and email of the Developer with the most points
`,
    testCases: [{
      name: 'Exactly the top Developer',
      expectedOutput: `+-------------+---------------------+
| name        | email               |
+-------------+---------------------+
| Charlie Kim | charlie@example.com |
+-------------+---------------------+
(1 row in set)`,
    }],
  },
  web: {
    id: 'pro-web-grid',
    language: 'web',
    title: 'Feature grid',
    prompt: 'Build a .grid with six .tile boxes numbered 1 to 6. Use CSS grid with three equal columns and a 16px gap, and make the first tile span two columns.',
    starterCode: `<!-- Build the grid here -->

<style>

</style>
`,
    webChecks: [
      { label: 'The .grid uses display: grid', selector: '.grid', count: 1, style: { display: 'grid' } },
      { label: 'Gaps are 16px', selector: '.grid', style: { 'column-gap': '16px', 'row-gap': '16px' } },
      { label: 'There are six .tile boxes', selector: '.grid > .tile', count: 6 },
      { label: 'The first tile spans two columns (grid-column: span 2)', selector: '.grid > .tile:first-child', style: { 'grid-column-start': 'span 2' } },
      { label: 'The last tile says 6', selector: '.grid > .tile:last-child', text: '6' },
    ],
  },
};
