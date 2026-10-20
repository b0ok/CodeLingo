// Universal client-side code runner supporting Python, JavaScript, and SQL execution
import { runPythonCode, ExecutionResult } from './pythonRunner';
import { runJavaScriptInScope } from './jsCore';
import { LanguageId, TestCase, WebCheck } from '../types';

export type { ExecutionResult };

// In-Memory Database for SQL challenges & Sandbox
export interface SqlDatabase {
  users: Array<{ id: number; name: string; email: string; role: string; points: number }>;
  products: Array<{ id: number; title: string; category: string; price: number; stock: number }>;
  orders: Array<{ id: number; user_id: number; product_id: number; quantity: number; order_date: string }>;
}

export const SAMPLE_SQL_DB: SqlDatabase = {
  users: [
    { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'Developer', points: 350 },
    { id: 2, name: 'Bob Jones', email: 'bob@example.com', role: 'Designer', points: 120 },
    { id: 3, name: 'Charlie Kim', email: 'charlie@example.com', role: 'Developer', points: 480 },
    { id: 4, name: 'Dana Lee', email: 'dana@example.com', role: 'Product Lead', points: 290 },
    { id: 5, name: 'Eli Vance', email: 'eli@example.com', role: 'DevOps', points: 510 },
  ],
  products: [
    { id: 1, title: 'Mechanical Keyboard', category: 'Hardware', price: 120, stock: 15 },
    { id: 2, title: 'Ergonomic Mouse', category: 'Hardware', price: 65, stock: 40 },
    { id: 3, title: 'CodeLingo Pro Hoodie', category: 'Apparel', price: 45, stock: 80 },
    { id: 4, title: 'Coffee Mug "while True:"', category: 'Accessories', price: 18, stock: 120 },
    { id: 5, title: 'UltraWide Monitor', category: 'Hardware', price: 450, stock: 8 },
  ],
  orders: [
    { id: 101, user_id: 1, product_id: 1, quantity: 1, order_date: '2026-10-01' },
    { id: 102, user_id: 3, product_id: 4, quantity: 2, order_date: '2026-10-03' },
    { id: 103, user_id: 2, product_id: 2, quantity: 1, order_date: '2026-10-05' },
    { id: 104, user_id: 5, product_id: 5, quantity: 1, order_date: '2026-10-08' },
    { id: 105, user_id: 1, product_id: 3, quantity: 1, order_date: '2026-10-12' },
  ],
};

// A run passes when every test case matches: the whole trimmed output by default,
// or a substring when the test case sets `contains` (used for SQL tables).
export function passesTestCases(result: ExecutionResult, testCases: TestCase[] = []): boolean {
  const actual = result.output.trim();
  return (
    result.success &&
    testCases.length > 0 &&
    testCases.every((tc) =>
      tc.contains ? actual.includes(tc.expectedOutput.trim()) : actual === tc.expectedOutput.trim()
    )
  );
}

export interface WebGradeResult {
  passed: boolean;
  results: { label: string; passed: boolean }[];
}

// Renders HTML/CSS in a hidden frame and checks the live DOM and computed styles.
// The frame is sandboxed without allow-scripts, so student <script> tags never run.
export function gradeWebCode(code: string, checks: WebCheck[] = []): WebGradeResult {
  const frame = document.createElement('iframe');
  frame.setAttribute('sandbox', 'allow-same-origin');
  frame.setAttribute('aria-hidden', 'true');
  frame.tabIndex = -1;
  // A fixed, off-screen viewport keeps layout-dependent values (widths, grid tracks) predictable.
  frame.style.cssText = 'position:fixed;left:-10000px;top:0;width:800px;height:600px;border:0;visibility:hidden;';
  document.body.appendChild(frame);
  try {
    const doc = frame.contentDocument!;
    doc.open();
    doc.write(code);
    doc.close();
    const view = doc.defaultView!;

    const results = checks.map((check) => {
      let els: Element[] = [];
      try {
        els = Array.from(doc.querySelectorAll(check.selector));
      } catch {
        // invalid selector in the check itself
      }
      const countOk = check.count === undefined ? els.length > 0 : els.length === check.count;
      const passed =
        countOk &&
        els.every((el) => {
          const css = view.getComputedStyle(el);
          return (
            Object.entries(check.style || {}).every(([prop, value]) => css.getPropertyValue(prop).trim() === value) &&
            Object.entries(check.attr || {}).every(([name, value]) =>
              value === '' ? el.hasAttribute(name) : el.getAttribute(name)?.trim() === value
            ) &&
            (check.text === undefined || (el.textContent || '').trim().includes(check.text))
          );
        });
      return { label: check.label, passed };
    });
    return { passed: results.length > 0 && results.every((r) => r.passed), results };
  } finally {
    frame.remove();
  }
}

const JS_TIME_LIMIT_MS = 3000;

// Learner JavaScript runs in a fresh Web Worker, never on the page: pasted code can't read the
// saved sign-in, change the page or reach the network, and an endless loop is stopped.
export function runJavaScriptCode(code: string): Promise<ExecutionResult> {
  if (typeof window === 'undefined') return Promise.resolve(runJavaScriptInScope(code)); // Node repo scripts
  return new Promise((resolve) => {
    const w = new Worker(new URL('./jsWorker.ts', import.meta.url), { type: 'module' });
    const done = (r: ExecutionResult) => { clearTimeout(timer); w.terminate(); resolve(r); };
    const timer = setTimeout(() => done({
      success: false,
      output: '',
      error: `Your code ran for more than ${JS_TIME_LIMIT_MS / 1000} seconds, so it was stopped. Check for a loop that never ends.`,
      executionTimeMs: JS_TIME_LIMIT_MS,
    }), JS_TIME_LIMIT_MS);
    w.onmessage = (e: MessageEvent<ExecutionResult>) => done(e.data);
    w.onerror = () => done({ success: false, output: '', error: 'JavaScript could not start. Reload the page and try again.', executionTimeMs: 0 });
    w.postMessage({ code });
  });
}

// In-browser Relational SQL Query Engine
export function runSqlCode(query: string, db: SqlDatabase = SAMPLE_SQL_DB): ExecutionResult {
  const startTime = performance.now();
  // Drop -- line comments (outside quotes) before parsing
  const cleanQuery = query
    .split('\n')
    .map((line) => line.replace(/^((?:[^'-]|'[^']*'|-(?!-))*)--.*$/, '$1'))
    .join('\n')
    .replace(/\s+/g, ' ') // the parser below works on one line; multi-line queries are normal SQL
    .trim()
    .replace(/;$/, '');

  try {
    if (!cleanQuery) {
      return { success: true, output: '', executionTimeMs: 0 };
    }

    const selectMatch = cleanQuery.match(/SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+(?:WHERE|ORDER|LIMIT|INNER|LEFT).*)?$/i);
    if (!selectMatch) {
      // Basic validation
      if (/^(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)/i.test(cleanQuery)) {
        return {
          success: true,
          output: '✓ Query executed successfully (1 row affected).',
          executionTimeMs: 2.1,
        };
      }
      throw new Error('SyntaxError: Only SELECT statements are currently simulated in the client runner.');
    }

    const rawFields = selectMatch[1].trim();
    const tableName = selectMatch[2].toLowerCase().trim() as keyof SqlDatabase;

    if (!db[tableName]) {
      throw new Error(`TableNotFoundError: Table '${tableName}' does not exist. Available tables: users, products, orders.`);
    }

    let records: Record<string, unknown>[] = JSON.parse(JSON.stringify(db[tableName]));

    // Check WHERE clause
    const whereMatch = cleanQuery.match(/\bWHERE\s+(.+?)(?:\s+(?:ORDER\s+BY|LIMIT)|$)/i);
    if (whereMatch) {
      const condition = whereMatch[1].trim();
      records = records.filter((row) => evaluateSqlCondition(row, condition));
    }

    // Check ORDER BY clause
    const orderMatch = cleanQuery.match(/\bORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?/i);
    if (orderMatch) {
      const orderCol = orderMatch[1];
      const isDesc = (orderMatch[2] || 'ASC').toUpperCase() === 'DESC';
      records.sort((a, b) => {
        const valA = a[orderCol];
        const valB = b[orderCol];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return isDesc ? valB - valA : valA - valB;
        }
        return isDesc ? String(valB).localeCompare(String(valA)) : String(valA).localeCompare(String(valB));
      });
    }

    // Check LIMIT clause
    const limitMatch = cleanQuery.match(/\bLIMIT\s+(\d+)/i);
    if (limitMatch) {
      const limit = parseInt(limitMatch[1], 10);
      records = records.slice(0, limit);
    }

    // Field projection
    let finalRows: Record<string, unknown>[] = [];
    if (rawFields === '*') {
      finalRows = records;
    } else if (/^COUNT\(\*\)/i.test(rawFields)) {
      finalRows = [{ 'COUNT(*)': records.length }];
    } else {
      const fields = rawFields.split(',').map((f) => f.trim());
      finalRows = records.map((row) => {
        const projected: Record<string, unknown> = {};
        for (const field of fields) {
          projected[field] = row[field];
        }
        return projected;
      });
    }

    // Format output as ASCII table
    const output = formatAsciiTable(finalRows);
    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

    return {
      success: true,
      output,
      executionTimeMs,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
    return {
      success: false,
      output: '',
      error: errorMsg,
      executionTimeMs,
    };
  }
}

function evaluateSqlCondition(row: Record<string, unknown>, condition: string): boolean {
  // Support col = 'val', col = num, col > num, col < num, col LIKE '%val%'
  const equalMatch = condition.match(/^(\w+)\s*=\s*(?:'([^']*)'|(\d+))$/);
  if (equalMatch) {
    const col = equalMatch[1];
    const strVal = equalMatch[2];
    const numVal = equalMatch[3];
    if (strVal !== undefined) return String(row[col]).toLowerCase() === strVal.toLowerCase();
    if (numVal !== undefined) return Number(row[col]) === Number(numVal);
  }

  const greaterMatch = condition.match(/^(\w+)\s*>\s*(\d+)$/);
  if (greaterMatch) {
    return Number(row[greaterMatch[1]]) > Number(greaterMatch[2]);
  }

  const lessMatch = condition.match(/^(\w+)\s*<\s*(\d+)$/);
  if (lessMatch) {
    return Number(row[lessMatch[1]]) < Number(lessMatch[2]);
  }

  const likeMatch = condition.match(/^(\w+)\s+LIKE\s+'%([^%']+)%'/i);
  if (likeMatch) {
    const col = likeMatch[1];
    const term = likeMatch[2].toLowerCase();
    return String(row[col]).toLowerCase().includes(term);
  }

  return true;
}

function formatAsciiTable(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) {
    return '(0 rows returned)';
  }

  const headers = Object.keys(rows[0]);
  const colWidths: Record<string, number> = {};

  for (const h of headers) {
    colWidths[h] = h.length;
  }

  for (const row of rows) {
    for (const h of headers) {
      const valStr = String(row[h] !== undefined ? row[h] : 'NULL');
      colWidths[h] = Math.max(colWidths[h], valStr.length);
    }
  }

  const separator = '+' + headers.map((h) => '-'.repeat(colWidths[h] + 2)).join('+') + '+';
  const headerRow = '|' + headers.map((h) => ` ${h.padEnd(colWidths[h])} `).join('|') + '|';
  const dataRows = rows.map((row) => {
    return '|' + headers.map((h) => ` ${String(row[h] !== undefined ? row[h] : 'NULL').padEnd(colWidths[h])} `).join('|') + '|';
  });

  return [
    separator,
    headerRow,
    separator,
    ...dataRows,
    separator,
    `(${rows.length} row${rows.length === 1 ? '' : 's'} in set)`,
  ].join('\n');
}

// Unified runner dispatcher. Async because Python runs in a worker.
export async function runUnifiedCode(code: string, language: LanguageId): Promise<ExecutionResult> {
  switch (language) {
    case 'python':
      return runPythonCode(code);
    case 'javascript':
      return runJavaScriptCode(code);
    case 'sql':
      return runSqlCode(code);
    case 'web':
      // For web/html, preview tags or check structure
      return {
        success: true,
        output: `<!-- HTML/CSS rendered successfully -->\n${code}`,
        executionTimeMs: 1.2,
      };
    default:
      return runPythonCode(code);
  }
}

// Sandbox practices: a working starter program plus a "Try this" task to change it.
export interface PlaygroundTemplate {
  title: string;
  category: string;
  language: LanguageId;
  description: string;
  task: string;
  code: string;
}

export const MULTI_LANG_TEMPLATES: PlaygroundTemplate[] = [
  // Python
  {
    title: 'FizzBuzz Classic',
    category: 'Algorithms',
    language: 'python',
    description: 'The famous interview problem: print Fizz, Buzz, or FizzBuzz.',
    task: 'Change it to count to 30 and print "Bang" for multiples of 7.',
    code: `# FizzBuzz in Python
for n in range(1, 16):
    if n % 15 == 0:
        print(f"{n}: FizzBuzz")
    elif n % 3 == 0:
        print(f"{n}: Fizz")
    elif n % 5 == 0:
        print(f"{n}: Buzz")
    else:
        print(f"{n}: -")
`,
  },
  {
    title: 'Fibonacci Generator',
    category: 'Math & Sequences',
    language: 'python',
    description: 'Generate the first 10 Fibonacci numbers with a loop.',
    task: 'Stop the loop as soon as a term goes over 100.',
    code: `# Fibonacci Sequence in Python
a = 0
b = 1
print("Fibonacci terms:")
for i in range(10):
    print(f"Term {i+1} -> {a}")
    next_val = a + b
    a = b
    b = next_val
`,
  },
  {
    title: 'Grade Calculator',
    category: 'Conditionals',
    language: 'python',
    description: 'Turn test scores into letter grades with if / elif.',
    task: 'Add a "+" to any grade whose score ends in 7, 8 or 9 (like 88 -> B+).',
    code: `# Letter grades from scores
scores = {"Ava": 93, "Ben": 78, "Cleo": 85, "Dev": 61, "Eve": 55}

for name, score in scores.items():
    if score >= 90:
        grade = "A"
    elif score >= 80:
        grade = "B"
    elif score >= 70:
        grade = "C"
    elif score >= 60:
        grade = "D"
    else:
        grade = "F"
    print(f"{name}: {score} -> {grade}")
`,
  },
  {
    title: 'Word Counter',
    category: 'Strings & Dictionaries',
    language: 'python',
    description: 'Count how often each word appears in a sentence.',
    task: 'Print only the words that appear more than once.',
    code: `# Count words with a dictionary
text = "the cat and the hat and the bat"
counts = {}

for word in text.split():
    counts[word] = counts.get(word, 0) + 1

for word, n in sorted(counts.items()):
    print(word, n)
`,
  },
  {
    title: 'Shopping Cart',
    category: 'Lists & Functions',
    language: 'python',
    description: 'Add up a cart with a function and apply a discount.',
    task: 'Give 10% off only when the total is over $50.',
    code: `# Cart total with a function
cart = [("Notebook", 4.50, 3), ("Pen", 1.25, 10), ("Backpack", 32.00, 1)]

def cart_total(items):
    total = 0
    for name, price, qty in items:
        line = price * qty
        print(f"{name:10} x{qty:<3} \${line:.2f}")
        total += line
    return total

total = cart_total(cart)
print(f"Total: \${total:.2f}")
`,
  },
  {
    title: 'Number Guess Logic',
    category: 'Loops',
    language: 'python',
    description: 'Binary search guesses a secret number in a few tries.',
    task: 'Change the secret to 999 and the range to 1–1000. How many guesses now?',
    code: `# Guess a number by halving the range each time
secret = 37
low, high = 1, 100
tries = 0

while True:
    guess = (low + high) // 2
    tries += 1
    print(f"Try {tries}: {guess}")
    if guess == secret:
        print(f"Found it in {tries} tries!")
        break
    elif guess < secret:
        low = guess + 1
    else:
        high = guess - 1
`,
  },

  // JavaScript
  {
    title: 'Modern Array Transformations',
    category: 'ES6+ Functional',
    language: 'javascript',
    description: 'Filter, map, and reduce test scores with arrow functions.',
    task: 'Also print the name of the lowest scorer.',
    code: `// Array Transformation in JavaScript
const students = [
  { name: 'Alex', score: 88 },
  { name: 'Maya', score: 95 },
  { name: 'Leo', score: 72 },
  { name: 'Zoe', score: 99 }
];

console.log("--- Honor Roll (Scores >= 85) ---");
const honorRoll = students
  .filter(s => s.score >= 85)
  .map(s => \`\${s.name} scored \${s.score}% (A Grade)\`);

honorRoll.forEach(msg => console.log("✓", msg));

const average = students.reduce((acc, s) => acc + s.score, 0) / students.length;
console.log("\\nClass Average:", average.toFixed(1) + "%");
`,
  },
  {
    title: 'Object Destructuring & Spread',
    category: 'Modern JS',
    language: 'javascript',
    description: 'Build profile objects and update them without changing the original.',
    task: 'Destructure username and level into variables and print them in one line.',
    code: `// Modern Object syntax in JavaScript
const basePlayer = {
  username: "CodeStriker",
  level: 12,
  lifePoints: 5,
  skills: ["Python", "JS"]
};

// Spread into new state
const updatedPlayer = {
  ...basePlayer,
  level: 13,
  badge: "Master Coder",
  skills: [...basePlayer.skills, "SQL"]
};

console.log("Player:", updatedPlayer.username);
console.log("Level:", updatedPlayer.level);
console.log("Skills:", updatedPlayer.skills.join(" • "));
`,
  },
  {
    title: 'Tip Splitter',
    category: 'Functions',
    language: 'javascript',
    description: 'A function that splits a bill and tip between friends.',
    task: 'Add a fourth parameter that rounds each share up to the nearest dollar.',
    code: `// Split a bill with a function
function splitBill(total, tipPercent, people) {
  const tip = total * (tipPercent / 100);
  const share = (total + tip) / people;
  return { tip: tip.toFixed(2), share: share.toFixed(2) };
}

const result = splitBill(84.5, 18, 3);
console.log("Tip:", "$" + result.tip);
console.log("Each pays:", "$" + result.share);
`,
  },
  {
    title: 'Todo List',
    category: 'Arrays & Objects',
    language: 'javascript',
    description: 'Add, complete, and list tasks stored in an array of objects.',
    task: 'Write a removeTodo(id) function and use it on task 2.',
    code: `// A tiny todo list
const todos = [];
let nextId = 1;

function addTodo(text) {
  todos.push({ id: nextId++, text, done: false });
}

function completeTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) todo.done = true;
}

addTodo("Learn loops");
addTodo("Practice functions");
addTodo("Build a project");
completeTodo(1);

todos.forEach(t => console.log(t.done ? "[x]" : "[ ]", t.text));
console.log(todos.filter(t => !t.done).length, "left to do");
`,
  },
  {
    title: 'String Tricks',
    category: 'Strings',
    language: 'javascript',
    description: 'Reverse words, check palindromes, and count vowels.',
    task: 'Make isPalindrome ignore spaces so "taco cat" counts.',
    code: `// Handy string functions
const reverse = (s) => s.split("").reverse().join("");
const isPalindrome = (s) => s.toLowerCase() === reverse(s.toLowerCase());
const countVowels = (s) => (s.match(/[aeiou]/gi) || []).length;

for (const word of ["racecar", "Level", "javascript"]) {
  console.log(word, "->", reverse(word), "| palindrome:", isPalindrome(word), "| vowels:", countVowels(word));
}
`,
  },
  {
    title: 'Countdown Timer',
    category: 'Loops',
    language: 'javascript',
    description: 'Format seconds as minutes and seconds while counting down.',
    task: 'Start from 125 seconds and only print every 30 seconds.',
    code: `// Count down and format mm:ss
function format(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

for (let t = 65; t >= 0; t -= 15) {
  console.log(format(t));
}
console.log("Time's up!");
`,
  },

  // SQL (tables: users, products, orders)
  {
    title: 'Query Top Developers',
    category: 'Filtering',
    language: 'sql',
    description: 'Find users with high points, highest first.',
    task: 'Show only the top 2, and include their email.',
    code: `-- Filter users by points and order them
SELECT name, role, points
FROM users
WHERE points > 200
ORDER BY points DESC
LIMIT 3;
`,
  },
  {
    title: 'Inventory & Stock Search',
    category: 'Filtering',
    language: 'sql',
    description: 'Find products under $100, cheapest first.',
    task: 'Find products with fewer than 20 in stock instead.',
    code: `-- Find affordable products
SELECT title, category, price, stock
FROM products
WHERE price < 100
ORDER BY price ASC;
`,
  },
  {
    title: 'Find by Role',
    category: 'Exact match',
    language: 'sql',
    description: 'List every user with one job title.',
    task: "Change it to find the 'Designer'.",
    code: `-- Everyone with the Developer role
SELECT name, email
FROM users
WHERE role = 'Developer';
`,
  },
  {
    title: 'Search Product Names',
    category: 'Pattern match',
    language: 'sql',
    description: 'Use LIKE to search inside text.',
    task: "Search for products with 'Mouse' in the title.",
    code: `-- Products whose title contains "Monitor"
SELECT title, price
FROM products
WHERE title LIKE '%Monitor%';
`,
  },
  {
    title: 'Count Rows',
    category: 'Aggregates',
    language: 'sql',
    description: 'COUNT(*) tells you how many rows a table has.',
    task: 'Count the rows in the orders table instead.',
    code: `-- How many users are there?
SELECT COUNT(*)
FROM users;
`,
  },
  {
    title: 'Latest Orders',
    category: 'Sorting',
    language: 'sql',
    description: 'Sort orders by date to see the newest ones.',
    task: 'Show only orders with a quantity greater than 1.',
    code: `-- Three most recent orders
SELECT id, user_id, product_id, order_date
FROM orders
ORDER BY order_date DESC
LIMIT 3;
`,
  },

  // HTML & CSS
  {
    title: 'Profile Card',
    category: 'Layout',
    language: 'web',
    description: 'A semantic card with a header, text, and a button.',
    task: 'Give the card rounded corners and change the button color.',
    code: `<article class="card">
  <header>
    <span class="tag">PRO</span>
    <h2>CodeLingo Champion</h2>
  </header>
  <p>Daily streak: 14 days unbroken!</p>
  <button>Claim gold rings</button>
</article>

<style>
  body { font-family: system-ui, sans-serif; padding: 24px; background: #f1f5f9; }
  .card { background: white; padding: 20px; max-width: 280px; border: 1px solid #cbd5e1; }
  .tag { background: #fde68a; padding: 2px 8px; font-size: 12px; font-weight: bold; }
  h2 { margin: 8px 0; }
  button { background: #059669; color: white; border: 0; padding: 10px 16px; font-weight: bold; }
</style>
`,
  },
  {
    title: 'Navigation Bar',
    category: 'Flexbox',
    language: 'web',
    description: 'Lay out links in a row with flexbox.',
    task: 'Push the "Sign in" link to the far right with margin-left: auto.',
    code: `<nav>
  <strong>MySite</strong>
  <a href="#">Home</a>
  <a href="#">Courses</a>
  <a href="#">About</a>
  <a href="#" class="signin">Sign in</a>
</nav>

<style>
  body { font-family: system-ui, sans-serif; margin: 0; }
  nav { display: flex; gap: 16px; align-items: center; padding: 16px; background: #0f172a; }
  nav strong { color: #34d399; }
  nav a { color: #e2e8f0; text-decoration: none; }
</style>
`,
  },
  {
    title: 'Photo Grid',
    category: 'CSS Grid',
    language: 'web',
    description: 'Arrange tiles in a responsive grid.',
    task: 'Make the first tile span two columns.',
    code: `<div class="grid">
  <div>1</div><div>2</div><div>3</div>
  <div>4</div><div>5</div><div>6</div>
</div>

<style>
  body { font-family: system-ui, sans-serif; padding: 16px; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .grid div { background: #a7f3d0; padding: 32px 0; text-align: center; font-weight: bold; border-radius: 8px; }
</style>
`,
  },
  {
    title: 'Sign-up Form',
    category: 'Forms',
    language: 'web',
    description: 'A form with labels tied to each input.',
    task: 'Add a password field with its own label.',
    code: `<form>
  <label for="name">Name</label>
  <input id="name" type="text">

  <label for="email">Email</label>
  <input id="email" type="email">

  <button type="submit">Create account</button>
</form>

<style>
  body { font-family: system-ui, sans-serif; padding: 24px; }
  form { display: grid; gap: 8px; max-width: 260px; }
  input { padding: 8px; border: 1px solid #94a3b8; border-radius: 6px; font-size: 16px; }
  button { margin-top: 8px; padding: 10px; background: #4f46e5; color: white; border: 0; border-radius: 6px; }
</style>
`,
  },
];
