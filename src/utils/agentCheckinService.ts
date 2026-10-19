import { GoogleGenAI } from '@google/genai';
import { AgentCheckinEvaluation, RoadmapNode } from '../types';
import { getRoadmapNodeById } from '../data/pythonRoadmap';

// Initialize Gemini SDK if API key is provided
function getGeminiClient(): GoogleGenAI | null {
  try {
    const apiKey =
      (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) ||
      (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
      '';
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      return new GoogleGenAI({ apiKey });
    }
  } catch {
    // Environment does not support direct env lookup
  }
  return null;
}

/**
 * Intelligent Agent Evaluator that checks whether a learner is "blindly learning"
 * or truly understands the core Python mental model.
 */
export async function evaluateLearnerExplanation(
  node: RoadmapNode,
  userExplanation: string,
  targetCareerTrack?: string
): Promise<AgentCheckinEvaluation> {
  const ai = getGeminiClient();
  const [trackName, roadmapSlug] = node.id.startsWith('sql-')
    ? ['SQL', 'sql']
    : node.id.startsWith('js-')
    ? ['JavaScript', 'javascript']
    : node.id.startsWith('web-')
    ? ['HTML & CSS', 'frontend']
    : ['Python', 'python'];

  if (ai && userExplanation.trim().length > 10) {
    try {
      const prompt = `
You are Pyto, an expert ${trackName} engineering mentor and learning coach on CodeLingo.
A learner is working through the official roadmap.sh/${roadmapSlug} curriculum.
Our core mission is to PREVENT BLIND LEARNING: students must not just copy syntax or guess multiple-choice options; they must understand the first principles, memory models, trade-offs, and edge cases.

Roadmap Node: "${node.title}" (${node.roadmapCategory})
Key Concepts: ${node.keyConcepts.join(', ')}
Anti-Blind Socratic Prompt: "${node.antiBlindQuestion}"
Sample Expert Model Answer Hint: "${node.sampleAnswerHint}"
Learner's Target Career Track: "${targetCareerTrack || `General ${trackName} Mastery`}"

Learner's Explanation:
"""
${userExplanation}
"""

Evaluate their explanation strictly for true conceptual understanding:
1. Did they understand the underlying mental model (memory, execution flow, trade-offs)?
2. Did they detect potential gotchas or edge cases?
3. Are there blind spots or misconceptions in their reasoning?

Respond with a valid JSON object ONLY (no markdown formatting, no code fence):
{
  "score": number between 15 and 98,
  "rating": "Mastered" | "Solid Understanding" | "Blind Spots Detected" | "Needs Practice",
  "whatNailed": "1-2 sentences highlighting what specific intuition or concept they got right",
  "blindSpots": ["specific misconception or omitted crucial detail 1", "subtle gotcha 2"],
  "actionableTip": "One direct, practical ${trackName} tip or mental model trick",
  "socraticFollowup": "One thought-provoking question to deepen their intuition even further",
  "recommendedNextStep": "Brief guidance on whether to proceed to next roadmap phase or review",
  "pytoMood": "proud" | "celebrating" | "thinking" | "encouraging"
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        score: Math.max(20, Math.min(99, Number(parsed.score) || 75)),
        rating: parsed.rating || (parsed.score >= 85 ? 'Mastered' : 'Solid Understanding'),
        whatNailed: parsed.whatNailed || 'You articulated the core idea and connected it to practical Python usage.',
        blindSpots: Array.isArray(parsed.blindSpots) && parsed.blindSpots.length > 0 
          ? parsed.blindSpots 
          : ['Be mindful of edge cases when scale or concurrency is introduced.'],
        actionableTip: parsed.actionableTip || 'Always test behavior in a quick interactive Python terminal (REPL).',
        socraticFollowup: parsed.socraticFollowup || 'How would this behave if the input was empty or None?',
        recommendedNextStep: parsed.recommendedNextStep || 'Solid job! You are ready for the next roadmap milestone.',
        pytoMood: parsed.pytoMood || 'proud',
      };
    } catch {
      // Fallback to high-fidelity heuristic evaluator if network or key fails
    }
  }

  // High-fidelity fallback heuristic evaluator (Works offline / in sandbox)
  return runHeuristicEvaluation(node, userExplanation, targetCareerTrack);
}

/**
 * Robust heuristic evaluation engine that identifies genuine conceptual keywords,
 * depth of reasoning, code structure examples, and edge case awareness.
 */
function runHeuristicEvaluation(
  node: RoadmapNode,
  text: string,
  track?: string
): AgentCheckinEvaluation {
  const lower = text.toLowerCase().trim();
  const wordCount = lower.split(/\s+/).filter(Boolean).length;

  if (wordCount < 6) {
    return {
      score: 30,
      rating: 'Needs Practice',
      whatNailed: 'You provided a quick initial thought.',
      blindSpots: [
        'Explanation was too brief to verify deep understanding.',
        'Did not address why Python behaves this way under the hood.',
      ],
      actionableTip: 'Try explaining the "why" and "how" like you would to a junior colleague or rubber duck.',
      socraticFollowup: `Could you give a concrete snippet or scenario illustrating: ${node.keyConcepts[0] || 'this concept'}?`,
      recommendedNextStep: 'Take 60 seconds to flesh out the explanation before advancing on the roadmap.',
      pytoMood: 'thinking',
    };
  }

  // Count concept matches
  const conceptHits = node.keyConcepts.filter((c) => lower.includes(c.toLowerCase()));
  const mentionsCode = 
    lower.includes('def ') || 
    lower.includes('=') || 
    lower.includes('()') || 
    lower.includes('print') ||
    lower.includes('<') ||
    lower.includes('>') ||
    lower.includes('{') ||
    lower.includes('}') ||
    lower.includes('class') ||
    lower.includes('flex') ||
    lower.includes('grid');

  const mentionsWhy = 
    lower.includes('because') || 
    lower.includes('instead') || 
    lower.includes('memory') || 
    lower.includes('immutable') || 
    lower.includes('mutable') || 
    lower.includes('runtime') || 
    lower.includes('faster') || 
    lower.includes('avoid') ||
    lower.includes('accessible') ||
    lower.includes('screen reader') ||
    lower.includes('cascade') ||
    lower.includes('overflow') ||
    lower.includes('semantics') ||
    lower.includes('specificity');

  let score = 50;
  if (wordCount >= 15) score += 15;
  if (wordCount >= 35) score += 10;
  if (conceptHits.length > 0) score += 15;
  if (mentionsCode) score += 10;
  if (mentionsWhy) score += 10;

  score = Math.min(95, score);

  let rating: AgentCheckinEvaluation['rating'] = 'Solid Understanding';
  let pytoMood: AgentCheckinEvaluation['pytoMood'] = 'proud';

  if (score >= 85) {
    rating = 'Mastered';
    pytoMood = 'celebrating';
  } else if (score < 65) {
    rating = 'Blind Spots Detected';
    pytoMood = 'encouraging';
  }

  const defaultBlindSpots: Record<string, string[]> = {
    // Python blind spots
    'rm-print-io': [
      'Did you consider how print() handles multi-argument separation with sep=" "?',
      'Remember that f-strings evaluate arbitrary expressions at runtime: f"{2+2=}".',
    ],
    'rm-variables-types': [
      'Remember Python uses pass-by-object-reference; mutating a mutable object affects all alias references.',
      'Check difference between identity ("is") and equality ("==").',
    ],
    'rm-conditionals': [
      'Short-circuiting skips evaluating the second expression if the first is decisive.',
      'Empty lists [], empty dicts {}, and 0 evaluate to falsy in boolean contexts.',
    ],
    'rm-loops-range': [
      'The "else" branch on a for loop only fires if the loop was not interrupted by a break.',
      'range() produces an immutable sequence type, not an eager list in memory.',
    ],
    'rm-lists-tuples': [
      'Tuples can be used as dictionary keys because they are immutable and hashable.',
      'Slicing a list produces a shallow copy, not a pointer to the original.',
    ],
    'rm-dicts-sets': [
      'Sets require all elements to be hashable (lists and dicts cannot be set elements).',
      'dict.get(key, default) avoids throwing an unhandled KeyError.',
    ],
    'rm-func-params': [
      'Mutable default arguments like def f(x=[]) persist state across calls!',
      '*args gathers into a tuple, while **kwargs gathers into a dictionary.',
    ],
    'rm-classes-init': [
      'self is explicitly required in method signatures so Python can bind instance state.',
      'Class attributes are shared across all instances, whereas instance attributes live on self.',
    ],
    'rm-try-except': [
      'Never catch bare Exception unless logging or re-raising, to avoid swallowing KeyboardInterrupt.',
      'Use the finally block for guaranteed cleanup regardless of exceptions.',
    ],
    'rm-generators': [
      'Generators preserve local variable state between yield calls.',
      'Calling next() on an exhausted generator raises StopIteration.',
    ],
    // Web (HTML & CSS) blind spots
    'web-rm-doctype-tree': [
      'Omitting <!DOCTYPE html> forces browsers into Quirks Mode, reviving 1990s layout bugs.',
      'Ensure the <title> tag is always inside <head> for browser tab labels and SEO indexing.',
    ],
    'web-rm-selectors-cascade': [
      'Chaining classes (.card.active) increases specificity without resorting to toxic !important.',
      'Remember that inherited properties (like font-family or color) carry zero specificity weight.',
    ],
    'web-rm-box-sizing': [
      'Universal "* { box-sizing: border-box; }" ensures padding never unexpectedly expands your container width.',
      'Remember inline elements ignore top/bottom margins and padding for flow positioning.',
    ],
    'web-rm-semantic-landmarks': [
      'Avoid "div soup" — use <article> for self-contained syndicatable cards and <section> for thematic groups.',
      'Never use <div onClick> without role="button", tabindex="0", and keyboard Enter/Space key listeners.',
    ],
    'web-rm-flex-axes': [
      'When flex-direction is column, the main axis is vertical, so justify-content controls vertical space.',
      'Use the "gap" property on flex containers instead of brittle child margins.',
    ],
    'web-rm-grid-templates': [
      'The "fr" unit distributes free available space AFTER gaps and fixed tracks are accounted for.',
      'minmax(250px, 1fr) with auto-fit creates responsive columns without any media queries.',
    ],
    'web-rm-form-labels': [
      'Placeholders disappear on typing and fail accessibility color contrast; always bind explicit <label for="id">.',
      'Use :focus-visible to preserve visible focus rings for keyboard Tab navigation.',
    ],
    'web-rm-media-queries': [
      'Always design mobile-first with min-width media queries to avoid cascading style overrides.',
      'CSS custom properties (--brand) live dynamically in the DOM and reactively cascade through elements.',
    ],
    // JavaScript blind spots
    'js-rm-variables-tdz': [
      'Accessing let or const before line of declaration throws ReferenceError due to the Temporal Dead Zone.',
      'Remember var variables attach to the window object in browsers, polluting the global namespace.',
    ],
    'js-rm-types-equality': [
      'Remember that objects and arrays compare by memory reference, never by shape or contents ({} !== {}).',
      'Use Object.is() for edge cases like distinguishing -0 from +0 and NaN === NaN.',
    ],
    'js-rm-array-methods': [
      'map() and filter() return brand new arrays; avoid using them when you only need a side-effect (use forEach).',
      'reduce() without an initial value uses the first array element as the initial accumulator.',
    ],
    'js-rm-destructuring-spread': [
      'Spread ({...obj}) is shallow: nested objects share reference pointers and can still cause mutation bugs.',
      'Use structuredClone(obj) for safe deep cloning of nested data structures.',
    ],
    'js-rm-closures-encapsulation': [
      'Closures retain references to outer scope variables on the heap, preventing garbage collection.',
      'Creating closures inside tight loops without proper scoping can lead to memory retention leaks.',
    ],
    'js-rm-arrow-vs-regular': [
      'Arrow functions inherit "this" lexically from their enclosing scope and cannot be bound with .bind().',
      'Arrow functions do not possess their own "arguments" object or [[Construct]] constructor method.',
    ],
    'js-rm-prototype-chain': [
      'Methods added to Class.prototype are shared across all instances, saving memory over inline methods.',
      'Accessing properties traverses __proto__ recursively until reaching Object.prototype.__proto__ (null).',
    ],
    'js-rm-classes-oop': [
      'Calling super() is mandatory in derived constructors before accessing "this".',
      'Private fields (#privateField) are enforced at the language level and cannot be accessed from outside.',
    ],
    'js-rm-event-loop': [
      'Promise .then() microtasks execute immediately after the current script, before setTimeout macrotasks.',
      'Long-running synchronous loops on the Call Stack block the Event Loop and freeze the browser UI.',
    ],
    'js-rm-async-await-errors': [
      'Always wrap await calls in try/catch or chain .catch() to avoid unhandled promise rejections.',
      'Promise.all rejects immediately if any single promise rejects; use Promise.allSettled for independent tasks.',
    ],
    'js-rm-event-delegation': [
      'Check event.target.closest("selector") in event delegation to handle clicks on nested child elements.',
      'event.stopPropagation() halts bubbling, but use it sparingly as it can break analytical tracking tools.',
    ],
    'js-rm-optional-nullish': [
      'Nullish coalescing (??) checks specifically for null or undefined, preserving 0 and false.',
      'Optional chaining (?.) stops evaluation and returns undefined if the target is null or undefined.',
    ],
    'js-rm-debounce-throttle': [
      'Debounce resets its timer on every trigger; throttle enforces a maximum frequency of execution.',
      'Always clear timeouts in cleanup handlers to prevent memory leaks after components unmount.',
    ],
    // SQL blind spots
    'sql-rm-relational-model': [
      'Relational strength is enforced structure: types, constraints and multi-table ACID transactions.',
      'NoSQL is not "faster SQL"; it trades guarantees and joins for flexible shapes and horizontal scale.',
    ],
    'sql-rm-select-from': [
      'SELECT * breaks silently when columns change and blocks covering indexes.',
      'SQL keywords are case-insensitive, but string comparisons may not be, depending on collation.',
    ],
    'sql-rm-where-operators': [
      'Any comparison with NULL is UNKNOWN, so both = NULL and <> value drop NULL rows.',
      'AND binds tighter than OR; add parentheses whenever you mix them.',
    ],
    'sql-rm-order-limit': [
      'Without ORDER BY, row order is not guaranteed, even if it looks stable in testing.',
      'Paginate on a unique, deterministic sort key or pages can repeat or skip rows.',
    ],
    'sql-rm-ddl-tables': [
      'TRUNCATE usually cannot be filtered and may not fire row-level triggers.',
      'ALTER TABLE on a huge table can lock it; plan migrations for production traffic.',
    ],
    'sql-rm-constraints': [
      'Constraints are enforced on every write, by every client, unlike application-side checks.',
      'UNIQUE allows multiple NULLs in most databases because NULL is not equal to NULL.',
    ],
    'sql-rm-insert': [
      'Positional INSERT without a column list breaks when the schema changes.',
      'Batch rows into one statement or transaction to avoid a commit per row.',
    ],
    'sql-rm-update-delete': [
      'Preview the WHERE clause with a SELECT before running UPDATE or DELETE.',
      'Run risky changes inside a transaction and check the rows-affected count before COMMIT.',
    ],
    'sql-rm-aggregate-functions': [
      'COUNT(column), SUM and AVG skip NULLs; COUNT(*) does not.',
      'AVG of an integer column may use integer division in some databases; cast if needed.',
    ],
    'sql-rm-group-by-having': [
      'WHERE runs before grouping and HAVING after, which is why aggregates only work in HAVING.',
      'Every selected column must be grouped or aggregated.',
    ],
    'sql-rm-inner-left-join': [
      'A WHERE condition on the right table of a LEFT JOIN turns it back into an INNER JOIN.',
      'Joining on a non-unique key fans out rows and inflates SUMs and COUNTs.',
    ],
    'sql-rm-other-joins': [
      'A missing or wrong join condition creates a Cartesian product.',
      'A self join needs two aliases for the same table so each side has its own role.',
    ],
    'sql-rm-subqueries': [
      '= (subquery) fails if the subquery returns more than one row; use IN or EXISTS.',
      'NOT IN with a subquery that returns a NULL matches nothing; prefer NOT EXISTS.',
    ],
    'sql-rm-conditional-functions': [
      'CASE without ELSE returns NULL for unmatched rows.',
      'x / NULLIF(y, 0) avoids division-by-zero errors by returning NULL.',
    ],
    'sql-rm-views': [
      'A regular view stores the query, not the data, so it is not faster by itself.',
      'Materialized views are fast to read but stale until refreshed.',
    ],
    'sql-rm-indexes': [
      'Functions on an indexed column and leading % wildcards usually prevent index use.',
      'In a composite index, column order matters: (a, b) helps WHERE a = ?, not WHERE b = ? alone.',
    ],
    'sql-rm-transactions-acid': [
      'Long-running transactions hold locks and block other writers.',
      'Higher isolation levels prevent more anomalies but increase contention and retries.',
    ],
    'sql-rm-security': [
      'Never concatenate user input into SQL; use parameterized queries.',
      'Give each application role only the privileges it needs (least privilege).',
    ],
    'sql-rm-window-functions': [
      'Window functions keep every row; GROUP BY collapses them.',
      'RANK leaves gaps after ties, DENSE_RANK does not, ROW_NUMBER never ties.',
    ],
    'sql-rm-ctes-recursive': [
      'A recursive CTE needs a stop condition, and cyclic data needs a depth limit or cycle check.',
      'Some databases materialize CTEs, which can block optimizations; check the plan.',
    ],
    'sql-rm-query-optimization': [
      'Measure with EXPLAIN ANALYZE before changing anything.',
      'Row estimates far from actual rows usually mean stale statistics; run ANALYZE.',
    ],
  };

  const blindSpots = defaultBlindSpots[node.id] || [
    'Always consider rendering performance and accessibility edge cases.',
    'Test across mobile viewports and keyboard-only navigation.',
  ];

  return {
    score,
    rating,
    whatNailed: `Great explanation! You accurately touched on ${conceptHits.length > 0 ? conceptHits.join(' & ') : node.title} and communicated your thought process clearly.`,
    blindSpots: score >= 90 ? ['No critical blind spots found! You possess solid technical clarity.'] : blindSpots,
    actionableTip: `In real production codebases (${track ? `especially for ${track}` : 'software engineering'}), write clean semantic markup and verify behaviors across browsers.`,
    socraticFollowup: node.antiBlindQuestion,
    recommendedNextStep: score >= 75 ? 'Check-in verified! Move ahead to the next roadmap milestone with confidence.' : 'Review the code snippet examples in this unit before pushing ahead.',
    pytoMood,
  };
}

/**
 * Diagnostic check-in questions generator for a given roadmap phase.
 */
export function getPhaseDiagnosticQuestions(phaseId: string): {
  id: string;
  question: string;
  options: { id: string; text: string; isOptimal: boolean; feedback: string }[];
}[] {
  switch (phaseId) {
    case 'foundations':
      return [
        {
          id: 'diag-f1',
          question: 'What is the fundamental difference between "a = b" and "a = b[:]" when b is a list?',
          options: [
            {
              id: 'o1',
              text: '"a = b" aliases the exact same object; "a = b[:]" creates a shallow copy of the list.',
              isOptimal: true,
              feedback: 'Spot on! This prevents accidental mutation bugs in production.',
            },
            {
              id: 'o2',
              text: 'They are identical; Python always creates a copy automatically.',
              isOptimal: false,
              feedback: 'Careful! Python assigns references, not deep or shallow copies by default.',
            },
            {
              id: 'o3',
              text: '"a = b[:]" converts the list into an immutable tuple.',
              isOptimal: false,
              feedback: 'The slice operator [:] returns a new list of the same type.',
            },
          ],
        },
        {
          id: 'diag-f2',
          question: 'When checking "x is None" vs "x == None", which is preferred in Python and why?',
          options: [
            {
              id: 'o1',
              text: '"x is None" is idiomatic because None is a singleton and "is" checks exact memory identity.',
              isOptimal: true,
              feedback: 'Exactly. PEP 8 specifies "is None" because custom __eq__ methods can override "==".',
            },
            {
              id: 'o2',
              text: '"x == None" is preferred because it performs type casting.',
              isOptimal: false,
              feedback: 'No, "is None" is the standard Pythonic check.',
            },
          ],
        },
      ];
    case 'data-structures':
      return [
        {
          id: 'diag-ds1',
          question: 'Why can a tuple of integers be used as a dictionary key, but a list of integers cannot?',
          options: [
            {
              id: 'o1',
              text: 'Tuples are immutable and hashable; lists are mutable so their hash would change if modified.',
              isOptimal: true,
              feedback: 'Bingo! Dictionary hash buckets require immutable keys so lookups remain consistent.',
            },
            {
              id: 'o2',
              text: 'Dictionaries only accept primitive types like strings and ints.',
              isOptimal: false,
              feedback: 'Dictionaries accept ANY hashable object as keys, including tuples of hashable items.',
            },
          ],
        },
      ];
    case 'functions':
      return [
        {
          id: 'diag-fn1',
          question: 'What happens if you define a function with "def append_to(val, lst=[])"?',
          options: [
            {
              id: 'o1',
              text: 'The default list [] is created once when the function is defined, accumulating elements across calls.',
              isOptimal: true,
              feedback: 'Classic Python gotcha! Always use "lst=None" and initialize inside the body.',
            },
            {
              id: 'o2',
              text: 'A brand new empty list is created every single time the function is invoked.',
              isOptimal: false,
              feedback: 'Common misconception! In Python, default parameter expressions are evaluated at definition time.',
            },
          ],
        },
      ];
    case 'html-basics':
      return [
        {
          id: 'diag-web-h1',
          question: 'What is the primary effect of omitting "<!DOCTYPE html>" from the top of an HTML file?',
          options: [
            {
              id: 'o1',
              text: 'The browser renders the page in Quirks Mode, reviving legacy 1990s layout bugs and inconsistent box models.',
              isOptimal: true,
              feedback: 'Exact! Modern CSS requires Standards Mode, initiated by <!DOCTYPE html>.',
            },
            {
              id: 'o2',
              text: 'The webpage will not execute any JavaScript.',
              isOptimal: false,
              feedback: 'JavaScript will still execute, but DOM geometry and CSS rendering will glitch.',
            },
            {
              id: 'o3',
              text: 'Images will fail to display.',
              isOptimal: false,
              feedback: 'Images still load, but document layout falls into Quirks Mode.',
            },
          ],
        },
      ];
    case 'css-foundations':
      return [
        {
          id: 'diag-web-css1',
          question: 'Why is "rem" preferred over "px" for typography and spacing in modern accessible CSS?',
          options: [
            {
              id: 'o1',
              text: 'rem scales dynamically when users configure custom base font sizes in their browser accessibility settings.',
              isOptimal: true,
              feedback: 'Spot on! Respecting user zoom/text size preferences is WCAG best practice.',
            },
            {
              id: 'o2',
              text: 'rem renders faster on mobile GPUs than px.',
              isOptimal: false,
              feedback: 'Rendering speed is identical; the difference is accessibility scalability.',
            },
            {
              id: 'o3',
              text: 'rem prevents CSS files from being minified.',
              isOptimal: false,
              feedback: 'Minification is unrelated to CSS unit choice.',
            },
          ],
        },
      ];
    case 'box-model':
      return [
        {
          id: 'diag-web-box1',
          question: 'What problem does "* { box-sizing: border-box; }" solve when styling elements with width: 100%?',
          options: [
            {
              id: 'o1',
              text: 'It includes padding and borders inside the declared width, preventing containers from overflowing horizontally.',
              isOptimal: true,
              feedback: 'Bingo! In default content-box, width + padding causes horizontal overflow scrollbars.',
            },
            {
              id: 'o2',
              text: 'It disables margin collapse automatically.',
              isOptimal: false,
              feedback: 'Margin collapse still applies to normal block elements.',
            },
          ],
        },
      ];
    case 'semantic-html':
      return [
        {
          id: 'diag-web-sem1',
          question: 'Why is "<button>" preferred over "<div onClick>" for triggering modal dialogues or dropdowns?',
          options: [
            {
              id: 'o1',
              text: '<button> provides native keyboard focus (Tab), handles Enter/Space key triggers, and announces role="button" to screen readers.',
              isOptimal: true,
              feedback: 'Essential a11y knowledge! Never rebuild interactive button mechanics from scratch with divs.',
            },
            {
              id: 'o2',
              text: '<button> cannot be styled with CSS.',
              isOptimal: false,
              feedback: 'Buttons are completely styleable with modern CSS.',
            },
          ],
        },
      ];
    case 'flexbox':
      return [
        {
          id: 'diag-web-flex1',
          question: 'When "flex-direction: column" is applied to a flex container, what does "justify-content" align?',
          options: [
            {
              id: 'o1',
              text: 'The vertical (main) axis.',
              isOptimal: true,
              feedback: 'Correct! In column direction, the main axis runs vertically.',
            },
            {
              id: 'o2',
              text: 'The horizontal (cross) axis.',
              isOptimal: false,
              feedback: 'align-items aligns the cross (horizontal) axis when flex-direction is column.',
            },
          ],
        },
      ];
    case 'css-grid':
      return [
        {
          id: 'diag-web-grid1',
          question: 'Why does "grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))" make media queries unnecessary for card grids?',
          options: [
            {
              id: 'o1',
              text: 'auto-fit drops columns down when 280px can no longer fit, and 1fr stretches the remaining columns to fill the space.',
              isOptimal: true,
              feedback: 'Mastery level! Fluid responsive layouts without brittle media query breakpoints.',
            },
            {
              id: 'o2',
              text: 'It forces mobile devices to zoom in.',
              isOptimal: false,
              feedback: 'No, it mathematically calculates available grid track slots.',
            },
          ],
        },
      ];
    case 'forms-a11y':
      return [
        {
          id: 'diag-web-form1',
          question: 'Why is using ":focus-visible" better than "outline: none" on interactive elements?',
          options: [
            {
              id: 'o1',
              text: ':focus-visible provides clear focus rings for keyboard Tab navigation, while suppressing focus rings on mouse clicks.',
              isOptimal: true,
              feedback: 'Perfect! It gives keyboard users required accessibility while satisfying visual design preferences.',
            },
            {
              id: 'o2',
              text: 'outline: none is actually the recommended WCAG standard.',
              isOptimal: false,
              feedback: 'Dangerous mistake! outline: none makes keyboard navigation unusable for visually impaired users.',
            },
          ],
        },
      ];
    case 'responsive-modern':
      return [
        {
          id: 'diag-web-resp1',
          question: 'What is the primary advantage of CSS Custom Properties (--var) over compile-time preprocessors (Sass $var)?',
          options: [
            {
              id: 'o1',
              text: 'CSS variables live in the DOM cascade at runtime, allowing instant theme switching (like dark mode) without re-rendering.',
              isOptimal: true,
              feedback: 'Correct! CSS variables reactively cascade through the DOM at runtime.',
            },
            {
              id: 'o2',
              text: 'Sass variables cannot store hex colors.',
              isOptimal: false,
              feedback: 'Sass variables can store colors, but they are compiled to static values at build time.',
            },
          ],
        },
      ];
    case 'js-basics':
      return [
        {
          id: 'diag-js-b1',
          question: 'What happens when you access a "let" variable before its declaration line in JavaScript?',
          options: [
            {
              id: 'o1',
              text: 'A ReferenceError is thrown because the variable is in the Temporal Dead Zone (TDZ).',
              isOptimal: true,
              feedback: 'Spot on! Unlike var (which evaluates to undefined), let/const remain uninitialized until declaration.',
            },
            {
              id: 'o2',
              text: 'It returns undefined.',
              isOptimal: false,
              feedback: 'Careful! That is the legacy behavior of "var", not "let".',
            },
            {
              id: 'o3',
              text: 'It returns null.',
              isOptimal: false,
              feedback: 'JavaScript never initializes hoisted variables to null.',
            },
          ],
        },
      ];
    case 'js-data-structures':
      return [
        {
          id: 'diag-js-ds1',
          question: 'What is the risk of using "{ ...user }" to copy an object that contains a nested "address: { city: \'Paris\' }"?',
          options: [
            {
              id: 'o1',
              text: 'The spread operator only creates a shallow copy; the nested address object is copied by reference and mutations will affect the original.',
              isOptimal: true,
              feedback: 'Bingo! Use structuredClone() or immutability libraries for deep structures.',
            },
            {
              id: 'o2',
              text: 'The spread operator throws a TypeError on nested objects.',
              isOptimal: false,
              feedback: 'Spread syntax is completely valid, but it is strictly shallow.',
            },
          ],
        },
      ];
    case 'js-functions-closures':
      return [
        {
          id: 'diag-js-cl1',
          question: 'Why can an inner function access variables of an outer function even after the outer function has finished execution?',
          options: [
            {
              id: 'o1',
              text: 'The inner function forms a closure, retaining a live reference to its outer lexical environment on the heap.',
              isOptimal: true,
              feedback: 'Mastery! This is the core mechanism of data encapsulation and function factories in JavaScript.',
            },
            {
              id: 'o2',
              text: 'JavaScript automatically copies all outer variables into the global window object.',
              isOptimal: false,
              feedback: 'No, closures are private lexical environments, not global properties.',
            },
          ],
        },
      ];
    case 'js-oop-prototypes':
      return [
        {
          id: 'diag-js-oop1',
          question: 'Why does an arrow function NOT have its own "this" binding?',
          options: [
            {
              id: 'o1',
              text: 'Arrow functions resolve "this" lexically from their enclosing scope, just like standard variable lookups.',
              isOptimal: true,
              feedback: 'Correct! This makes arrow functions perfect for callbacks without needing .bind(this).',
            },
            {
              id: 'o2',
              text: 'Arrow functions always bind "this" to window/globalThis.',
              isOptimal: false,
              feedback: 'They bind to the lexical parent scope, which might be an instance, module, or function.',
            },
          ],
        },
      ];
    case 'js-async-event-loop':
      return [
        {
          id: 'diag-js-async1',
          question: 'Between a resolved Promise callback (.then) and a setTimeout(..., 0), which executes first and why?',
          options: [
            {
              id: 'o1',
              text: 'The Promise callback, because Promise microtasks are drained before the event loop advances to macrotasks.',
              isOptimal: true,
              feedback: 'Exact! Microtasks always have priority over macrotasks in the browser event loop.',
            },
            {
              id: 'o2',
              text: 'setTimeout, because 0 milliseconds is an immediate timer.',
              isOptimal: false,
              feedback: 'Even with 0ms, setTimeout queues in the Macrotask Queue, which runs after microtasks.',
            },
          ],
        },
      ];
    case 'js-dom-apis':
      return [
        {
          id: 'diag-js-dom1',
          question: 'Why is Event Delegation preferred over attaching listeners to 1,000 separate list items?',
          options: [
            {
              id: 'o1',
              text: 'It saves significant memory by using event bubbling to a single parent listener, and handles dynamically added items automatically.',
              isOptimal: true,
              feedback: 'Senior front-end technique! Event bubbling enables clean, scalable event handling.',
            },
            {
              id: 'o2',
              text: 'Modern browsers crash if you create more than 50 event listeners.',
              isOptimal: false,
              feedback: 'Browsers won\'t crash, but memory footprint and garbage collection overhead increase needlessly.',
            },
          ],
        },
      ];
    case 'js-modern-modules':
      return [
        {
          id: 'diag-js-mod1',
          question: 'Why is "x ?? 10" safer than "x || 10" when x is a number count?',
          options: [
            {
              id: 'o1',
              text: 'Because "||" triggers on 0 (treating it as falsy), while "??" only defaults if x is strictly null or undefined.',
              isOptimal: true,
              feedback: 'Essential modern JS! Nullish coalescing avoids corrupting valid zero or false values.',
            },
            {
              id: 'o2',
              text: 'Because "??" executes asynchronously.',
              isOptimal: false,
              feedback: 'Nullish coalescing is a purely synchronous operator.',
            },
          ],
        },
      ];
    case 'js-advanced-patterns':
      return [
        {
          id: 'diag-js-adv1',
          question: 'When should you choose Debounce over Throttle for an event listener?',
          options: [
            {
              id: 'o1',
              text: 'When you want to delay execution until the user has PAUSED input (e.g. search autocomplete input).',
              isOptimal: true,
              feedback: 'Spot on! Throttle is for continuous steady intervals (like scrolling), Debounce is for silence after activity.',
            },
            {
              id: 'o2',
              text: 'When you want to execute the handler as many times per second as possible.',
              isOptimal: false,
              feedback: 'Both debounce and throttle limit execution rate, not maximize it.',
            },
          ],
        },
      ];
    case 'sql-basics':
      return [
        {
          id: 'diag-sql-b1',
          question: 'Why does "WHERE phone = NULL" return no rows even when some phones are NULL?',
          options: [
            {
              id: 'o1',
              text: 'Comparisons with NULL evaluate to UNKNOWN, and WHERE only keeps TRUE rows. Use IS NULL.',
              isOptimal: true,
              feedback: 'Spot on! Three-valued logic is behind most NULL surprises in SQL.',
            },
            {
              id: 'o2',
              text: 'Because NULL values are stored in a separate table.',
              isOptimal: false,
              feedback: 'NULLs live in the same row; the issue is how comparisons with NULL evaluate.',
            },
            {
              id: 'o3',
              text: 'Because = only works on numbers.',
              isOptimal: false,
              feedback: '= works on strings and dates too. The problem is specifically NULL.',
            },
          ],
        },
      ];
    case 'sql-ddl-constraints':
      return [
        {
          id: 'diag-sql-ddl1',
          question: "Your app already checks that an order's user exists. Why add a FOREIGN KEY too?",
          options: [
            {
              id: 'o1',
              text: 'The database enforces it on every write from every client, atomically, so orphaned rows become impossible.',
              isOptimal: true,
              feedback: 'Exactly. Scripts, other services and race conditions can all bypass application checks.',
            },
            {
              id: 'o2',
              text: 'Foreign keys make SELECT queries faster.',
              isOptimal: false,
              feedback: 'They can help the planner, but their purpose is integrity, not speed.',
            },
            {
              id: 'o3',
              text: 'It is required for JOINs to work.',
              isOptimal: false,
              feedback: 'You can JOIN on any columns; foreign keys are about guaranteeing valid references.',
            },
          ],
        },
      ];
    case 'sql-dml':
      return [
        {
          id: 'diag-sql-dml1',
          question: 'What is the safest first step before running a one-off DELETE on production?',
          options: [
            {
              id: 'o1',
              text: 'Run the same WHERE as a SELECT to see exactly which rows match, then delete inside a transaction.',
              isOptimal: true,
              feedback: 'Right! Preview, run in a transaction, check rows affected, then COMMIT.',
            },
            {
              id: 'o2',
              text: 'Run it quickly during low traffic and check afterwards.',
              isOptimal: false,
              feedback: 'Without previewing the WHERE, a mistake deletes data before you notice.',
            },
            {
              id: 'o3',
              text: 'Use TRUNCATE instead because it is faster.',
              isOptimal: false,
              feedback: 'TRUNCATE removes every row; it cannot target specific ones.',
            },
          ],
        },
      ];
    case 'sql-aggregates':
      return [
        {
          id: 'diag-sql-agg1',
          question: 'Why can you write HAVING COUNT(*) > 1 but not WHERE COUNT(*) > 1?',
          options: [
            {
              id: 'o1',
              text: 'WHERE filters rows before GROUP BY creates groups; HAVING filters groups after aggregates are computed.',
              isOptimal: true,
              feedback: 'Correct. Logical order: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY.',
            },
            {
              id: 'o2',
              text: 'WHERE only supports text comparisons.',
              isOptimal: false,
              feedback: 'WHERE supports any row-level condition; it just runs before aggregation.',
            },
            {
              id: 'o3',
              text: 'They are interchangeable; it is a style choice.',
              isOptimal: false,
              feedback: 'They run at different stages, so aggregates are only available in HAVING.',
            },
          ],
        },
      ];
    case 'sql-joins':
      return [
        {
          id: 'diag-sql-j1',
          question: "A LEFT JOIN from users to orders loses users with no orders after you add WHERE orders.status = 'paid'. Why?",
          options: [
            {
              id: 'o1',
              text: "Unmatched users have NULL order columns, and NULL = 'paid' is not TRUE, so WHERE drops them. Move the condition into ON.",
              isOptimal: true,
              feedback: 'Exactly. Filters on the right table belong in the ON clause of a LEFT JOIN.',
            },
            {
              id: 'o2',
              text: 'LEFT JOIN never keeps unmatched rows.',
              isOptimal: false,
              feedback: 'Keeping unmatched left rows is exactly what LEFT JOIN does.',
            },
            {
              id: 'o3',
              text: 'The status column needs an index.',
              isOptimal: false,
              feedback: 'Indexes change speed, not which rows are returned.',
            },
          ],
        },
      ];
    case 'sql-subqueries-functions':
      return [
        {
          id: 'diag-sql-sq1',
          question: 'A NOT IN (SELECT manager_id FROM employees) query suddenly returns zero rows. What is the likely cause?',
          options: [
            {
              id: 'o1',
              text: 'The subquery returns a NULL, and x NOT IN (..., NULL) is never TRUE. Use NOT EXISTS or filter out NULLs.',
              isOptimal: true,
              feedback: 'Great catch! This is one of the most common real-world NULL bugs.',
            },
            {
              id: 'o2',
              text: 'Subqueries cannot be used with NOT IN.',
              isOptimal: false,
              feedback: 'They can; the problem is a NULL in the returned list.',
            },
            {
              id: 'o3',
              text: 'The subquery is correlated.',
              isOptimal: false,
              feedback: 'It is not correlated, and correlation would not cause zero rows by itself.',
            },
          ],
        },
      ];
    case 'sql-views-indexes-transactions':
      return [
        {
          id: 'diag-sql-tx1',
          question: 'A transfer runs two UPDATEs without a transaction and the server crashes between them. What happens?',
          options: [
            {
              id: 'o1',
              text: 'One account is debited but the other is never credited. A transaction makes the pair atomic.',
              isOptimal: true,
              feedback: 'Right. BEGIN ... COMMIT gives all-or-nothing behavior, and ROLLBACK undoes partial work.',
            },
            {
              id: 'o2',
              text: 'Nothing, the database undoes the first UPDATE automatically.',
              isOptimal: false,
              feedback: 'Without a transaction, each statement commits on its own.',
            },
            {
              id: 'o3',
              text: 'Both updates are lost.',
              isOptimal: false,
              feedback: 'The first statement already committed, so it stays.',
            },
          ],
        },
      ];
    case 'sql-advanced-performance':
      return [
        {
          id: 'diag-sql-adv1',
          question: 'What is the difference between GROUP BY department and AVG(salary) OVER (PARTITION BY department)?',
          options: [
            {
              id: 'o1',
              text: 'GROUP BY returns one row per department; the window function keeps every employee row and adds the department average.',
              isOptimal: true,
              feedback: 'Spot on! Window functions compute across rows without collapsing them.',
            },
            {
              id: 'o2',
              text: 'There is no difference in the output.',
              isOptimal: false,
              feedback: 'GROUP BY collapses rows; the window version keeps them.',
            },
            {
              id: 'o3',
              text: 'PARTITION BY is just an older syntax for GROUP BY.',
              isOptimal: false,
              feedback: 'They are different features with different output shapes.',
            },
          ],
        },
      ];
    default:
      return [
        {
          id: 'diag-gen',
          question: 'How do you ensure resources and layouts remain accessible across all devices?',
          options: [
            {
              id: 'o1',
              text: 'Use semantic HTML5 elements, relative units (rem/em), and keyboard-navigable focus states.',
              isOptimal: true,
              feedback: 'Spot on! Semantic markup and responsive units form the backbone of modern web engineering.',
            },
            {
              id: 'o2',
              text: 'Rely solely on fixed pixel dimensions.',
              isOptimal: false,
              feedback: 'Fixed pixel dimensions break on smaller screens and ignore user accessibility preferences.',
            },
          ],
        },
      ];
  }
}
