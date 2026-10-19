import { Challenge } from '../types';

// The correct answer written out in words: shown to learners after a second miss
// and to reviewers on the content review page.
export function describeAnswer(c: Challenge): string | null {
  switch (c.type) {
    case 'token_fill':
      return (c.codeTemplate || '').replace(/__BLANK_(\d+)__/g, (m, i) => c.correctTokens?.[Number(i)] ?? m);
    case 'parsons':
      return (c.correctParsonsOrder || [])
        .map((id) => c.parsonsLines?.find((l) => l.id === id))
        .map((l) => (l ? '  '.repeat(l.indent) + l.text : ''))
        .join('\n');
    case 'predict_output':
    case 'concept_quiz':
      return c.options?.find((o) => o.id === c.correctOptionId)?.text ?? null;
    case 'matching':
      return (c.matchPairs || []).map((p) => `${p.left} → ${p.right}`).join('\n');
    case 'spot_bug':
      return c.buggyLineIndex == null ? null : `Line ${c.buggyLineIndex + 1}: ${c.buggyCodeLines?.[c.buggyLineIndex]}`;
    case 'code_runner':
      if (c.webChecks?.length) return 'Your page needs to meet every check:\n' + c.webChecks.map((w) => `• ${w.label}`).join('\n');
      if (c.testCases?.length) return 'Expected output:\n' + c.testCases.map((t) => t.expectedOutput).join('\n');
      return null;
    default:
      return null;
  }
}
