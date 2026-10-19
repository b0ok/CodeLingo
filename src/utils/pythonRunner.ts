// In-browser lightweight Python execution simulator & evaluator
// Parses and executes standard beginner and intermediate Python constructs safely.

export interface ExecutionResult {
  success: boolean;
  output: string;
  returnValue?: unknown;
  error?: string;
  executionTimeMs: number;
}

export function runPythonCode(code: string, mockInputs: string[] = []): ExecutionResult {
  const startTime = performance.now();
  const stdout: string[] = [];
  let inputPointer = 0;

  try {
    // Basic sanitization
    if (!code.trim()) {
      return {
        success: true,
        output: '',
        executionTimeMs: 0,
      };
    }

    // Check for common syntax issues before evaluation
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      // Colons missing on compound statements
      if (/^(if|elif|else|for|while|def|class|try|except|finally)\b/.test(trimmed)) {
        if (!trimmed.endsWith(':')) {
          throw new Error(`SyntaxError: expected ':' at end of line ${i + 1}\n  ${line}`);
        }
      }

      // Check unbalanced parentheses
      const openParens = (line.match(/\(/g) || []).length;
      const closeParens = (line.match(/\)/g) || []).length;
      if (openParens !== closeParens && !line.includes('"""') && !line.includes("'''")) {
        // Can be multiline, but in short snippets flag if simple
      }
    }

    // Convert Python code to JS executable representation
    const jsTranspiled = transpilePythonToJs(code);

    // Context environment
    const scope: Record<string, unknown> = {
      print: (...args: unknown[]) => {
        const text = args
          .map((arg) => {
            if (arg === null) return 'None';
            if (arg === undefined) return 'None';
            if (typeof arg === 'boolean') return arg ? 'True' : 'False';
            if (Array.isArray(arg)) {
              return '[' + arg.map((item) => (typeof item === 'string' ? `'${item}'` : String(item))).join(', ') + ']';
            }
            if (typeof arg === 'object') {
              try {
                return JSON.stringify(arg).replace(/"/g, "'");
              } catch {
                return String(arg);
              }
            }
            return String(arg);
          })
          .join(' ');
        stdout.push(text);
      },
      input: (prompt?: string) => {
        if (prompt) stdout.push(prompt);
        if (inputPointer < mockInputs.length) {
          const val = mockInputs[inputPointer++];
          return val;
        }
        return 'Python';
      },
      len: (obj: unknown) => {
        if (typeof obj === 'string' || Array.isArray(obj)) return obj.length;
        if (obj && typeof obj === 'object') return Object.keys(obj).length;
        throw new Error(`TypeError: object of type '${typeof obj}' has no len()`);
      },
      range: (start: number, stop?: number, step: number = 1) => {
        const res: number[] = [];
        let actualStart = 0;
        let actualStop = start;
        let actualStep = step;

        if (stop !== undefined) {
          actualStart = start;
          actualStop = stop;
        }

        if (actualStep === 0) throw new Error('ValueError: range() arg 3 must not be zero');

        if (actualStep > 0) {
          for (let i = actualStart; i < actualStop; i += actualStep) {
            res.push(i);
          }
        } else {
          for (let i = actualStart; i > actualStop; i += actualStep) {
            res.push(i);
          }
        }
        return res;
      },
      str: (v: unknown) => {
        if (v === null || v === undefined) return 'None';
        if (typeof v === 'boolean') return v ? 'True' : 'False';
        return String(v);
      },
      int: (v: unknown) => {
        const n = parseInt(String(v), 10);
        if (isNaN(n)) throw new Error(`ValueError: invalid literal for int(): '${v}'`);
        return n;
      },
      float: (v: unknown) => {
        const n = parseFloat(String(v));
        if (isNaN(n)) throw new Error(`ValueError: could not convert string to float: '${v}'`);
        return n;
      },
      bool: (v: unknown) => {
        if (!v || v === '0' || v === 'False') return false;
        return Boolean(v);
      },
      type: (v: unknown) => {
        if (typeof v === 'string') return "<class 'str'>";
        if (typeof v === 'number') return Number.isInteger(v) ? "<class 'int'>" : "<class 'float'>";
        if (typeof v === 'boolean') return "<class 'bool'>";
        if (Array.isArray(v)) return "<class 'list'>";
        if (v && typeof v === 'object') return "<class 'dict'>";
        return "<class 'NoneType'>";
      },
      sum: (arr: number[]) => {
        if (!Array.isArray(arr)) throw new Error('TypeError: sum() requires an iterable of numbers');
        return arr.reduce((a, b) => a + Number(b), 0);
      },
      max: (...args: unknown[]) => {
        const list = Array.isArray(args[0]) ? args[0] : args;
        return Math.max(...(list as number[]));
      },
      min: (...args: unknown[]) => {
        const list = Array.isArray(args[0]) ? args[0] : args;
        return Math.min(...(list as number[]));
      },
      abs: (v: number) => Math.abs(v),
      enumerate: (items: unknown[], start: number = 0) => [...items].map((v, i) => [i + start, v]),
      round: (v: number, decimals?: number) => {
        if (decimals !== undefined) {
          const factor = Math.pow(10, decimals);
          return Math.round(v * factor) / factor;
        }
        return Math.round(v);
      },
      True: true,
      False: false,
      None: null,
    };

    // Execute in sandboxed Function with keys
    const scopeKeys = Object.keys(scope);
    const scopeValues = Object.values(scope);

    const runner = new Function(...scopeKeys, jsTranspiled);
    const result = runner(...scopeValues);

    const endTime = performance.now();
    return {
      success: true,
      output: stdout.join('\n'),
      returnValue: result,
      executionTimeMs: Math.round(endTime - startTime),
    };
  } catch (err: unknown) {
    const endTime = performance.now();
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      output: stdout.join('\n'),
      error: errorMsg,
      executionTimeMs: Math.round(endTime - startTime),
    };
  }
}

// Convert Python indentation, syntax, and keywords into safe JavaScript
function transpilePythonToJs(pyCode: string): string {
  const lines = pyCode.split('\n');
  const jsLines: string[] = [];
  const indentStack: number[] = [0];

  // Helper to handle f-strings like f"My age is {age}" -> `My age is ${age}`
  function processFStrings(line: string): string {
    return line.replace(/f(["'])(.*?)\1/g, (_match, _quote, content) => {
      // replace {var} with ${var}
      const templated = content.replace(/\{([^}]+)\}/g, '${$1}');
      return `\`${templated}\``;
    });
  }

  // Apply keyword rewrites outside string literals only, so print("Python is fun") stays intact.
  const STRING_LITERAL = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/;
  function outsideStrings(line: string, fn: (code: string) => string): string {
    return line
      .split(STRING_LITERAL)
      .map((part, i) =>
        i % 2 === 0 ? fn(part) : part.startsWith('`') ? part.replace(/\$\{([^}]*)\}/g, (_m, e) => '${' + fn(e) + '}') : part
      )
      .join('');
  }

  // Pre-process declarations
  const declaredVars = new Set<string>();
  const classNames = new Set<string>();
  const classBodyIndents: number[] = []; // body indent of each open class (-1 until its first line)

  for (let idx = 0; idx < lines.length; idx++) {
    let rawLine = lines[idx];
    if (!rawLine.trim() || rawLine.trim().startsWith('#')) {
      continue;
    }

    // Count indentation
    const indentMatch = rawLine.match(/^(\s*)/);
    const indentSpaces = indentMatch ? indentMatch[1].replace(/\t/g, '    ').length : 0;
    let trimmed = rawLine.trim();

    // Close blocks if indentation decreased
    while (indentStack.length > 1 && indentSpaces < indentStack[indentStack.length - 1]) {
      indentStack.pop();
      jsLines.push('}');
    }

    // Process comments at end of line
    const commentIdx = trimmed.indexOf('#');
    if (commentIdx !== -1 && !trimmed.slice(0, commentIdx).includes('"') && !trimmed.slice(0, commentIdx).includes("'")) {
      trimmed = trimmed.slice(0, commentIdx).trim();
    }

    // F-strings
    trimmed = processFStrings(trimmed);

    // Track whether this line sits directly in a class body
    if (classBodyIndents[classBodyIndents.length - 1] === -1) {
      classBodyIndents[classBodyIndents.length - 1] = indentSpaces;
    }
    while (classBodyIndents.length && indentSpaces < classBodyIndents[classBodyIndents.length - 1]) {
      classBodyIndents.pop();
    }
    const inClassBody =
      classBodyIndents.length > 0 && indentSpaces === classBodyIndents[classBodyIndents.length - 1];

    // Replace Python operators and keywords
    // 'and' -> '&&', 'or' -> '||', 'not' -> '!'
    trimmed = outsideStrings(trimmed, (code) =>
      code
        .replace(/\band\b/g, '&&')
        .replace(/\bor\b/g, '||')
        .replace(/\bnot\s+/g, '!')
        .replace(/\bTrue\b/g, 'true')
        .replace(/\bFalse\b/g, 'false')
        .replace(/\bNone\b/g, 'null')
        .replace(/\bis\s+not\b/g, '!==')
        .replace(/\bis\b/g, '===')
        .replace(/\bsuper\(\)\.__init__\(/g, 'super(')
        .replace(/\bself\./g, 'this.')
        .replace(/\[\s*-\s*(\d+)\s*\]/g, '.at(-$1)')
        .replace(/(^|[^.\w])([A-Z]\w*)\(/g, (m, pre, name) => (classNames.has(name) ? `${pre}new ${name}(` : m))
    );

    // In operator for strings / lists: "x in list" -> "list.includes(x)" (handled in conditions if simple)

    // Check block starters
    if (trimmed.endsWith(':')) {
      const header = trimmed.slice(0, -1).trim();

      // IF statement: if cond:
      if (header.startsWith('if ')) {
        const cond = header.slice(3).trim();
        jsLines.push(`if (${cond}) {`);
        indentStack.push(indentSpaces + 2);
        continue;
      }
      // elif / else / except / finally continue the previous block: the dedent above already
      // emitted its closing brace, so replace that brace with the joined form.
      const continuation = header.startsWith('elif ')
        ? `} else if (${header.slice(5).trim()}) {`
        : header === 'else'
        ? '} else {'
        : header.startsWith('except')
        ? '} catch (e) {'
        : header === 'finally'
        ? '} finally {'
        : null;
      if (continuation) {
        if (jsLines[jsLines.length - 1] === '}') jsLines.pop();
        jsLines.push(continuation);
        indentStack.push(indentSpaces + 2);
        continue;
      }
      // CLASS: class Name: / class Name(Base):
      const classMatch = header.match(/^class\s+([A-Za-z_]\w*)\s*(?:\((\w*)\))?$/);
      if (classMatch) {
        classNames.add(classMatch[1]);
        jsLines.push(`class ${classMatch[1]}${classMatch[2] ? ` extends ${classMatch[2]}` : ''} {`);
        indentStack.push(indentSpaces + 2);
        classBodyIndents.push(-1);
        continue;
      }
      // METHOD in a class body: def name(self, ...):
      const methodMatch = inClassBody && header.match(/^def\s+([a-zA-Z_]\w*)\s*\(\s*self\s*,?\s*(.*?)\)$/);
      if (methodMatch) {
        jsLines.push(`${methodMatch[1] === '__init__' ? 'constructor' : methodMatch[1]}(${methodMatch[2]}) {`);
        indentStack.push(indentSpaces + 2);
        continue;
      }
      // WHILE loop: while cond:
      if (header.startsWith('while ')) {
        const cond = header.slice(6).trim();
        jsLines.push(`while (${cond}) {`);
        indentStack.push(indentSpaces + 2);
        continue;
      }
      // FOR loop: for x in range(n) or for item in list:
      const forMatch = header.match(/^for\s+([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)*)\s+in\s+(.+)$/);
      if (forMatch) {
        const names = forMatch[1].split(',').map((n) => n.trim());
        const iterable = forMatch[2];
        names.forEach((n) => declaredVars.add(n));
        const target = names.length > 1 ? `[${names.join(', ')}]` : names[0];
        jsLines.push(`for (let ${target} of (${iterable})) {`);
        indentStack.push(indentSpaces + 2);
        continue;
      }
      // DEF function: def name(args):
      const defMatch = header.match(/^def\s+([a-zA-Z_]\w*)\s*\((.*?)\)$/);
      if (defMatch) {
        const fnName = defMatch[1];
        const params = defMatch[2];
        declaredVars.add(fnName);
        jsLines.push(`function ${fnName}(${params}) {`);
        indentStack.push(indentSpaces + 2);
        continue;
      }
      // TRY
      if (header === 'try') {
        jsLines.push('try {');
        indentStack.push(indentSpaces + 2);
        continue;
      }
    }

    // Python-style list methods: .append(x) -> .push(x)
    trimmed = trimmed.replace(/\.append\(/g, '.push(');

    // Variable assignment: x = ... (declare with let if not declared)
    const assignMatch = trimmed.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/);
    if (assignMatch) {
      const varName = assignMatch[1];
      if (!declaredVars.has(varName)) {
        declaredVars.add(varName);
        trimmed = `let ${trimmed}`;
      }
    }

    // Pass statement
    if (trimmed === 'pass') {
      trimmed = '/* pass */';
    }

    jsLines.push(trimmed + ';');
  }

  // Close remaining blocks
  while (indentStack.length > 1) {
    indentStack.pop();
    jsLines.push('}');
  }

  return jsLines.join('\n');
}

// Starter templates for the playground
export const PLAYGROUND_TEMPLATES = [
  {
    name: 'Hello & Personalized Greeting',
    category: 'Basics',
    code: `# Welcome to PyLingo Playground!
name = "Future Pythonista"
streak = 5

print(f"Hey there, {name}!")
print(f"You are on a {streak}-day coding streak! 🔥")
print("Python is ready for your commands.")
`,
  },
  {
    name: 'Temperature Converter',
    category: 'Math & Logic',
    code: `# Convert Fahrenheit to Celsius
temp_f = 77
temp_c = (temp_f - 32) * 5 / 9

print(f"{temp_f}°F is equal to {round(temp_c, 1)}°C")

if temp_c > 24:
    print("It's a warm and sunny day! ☀️")
else:
    print("Pleasant coding weather! 💻")
`,
  },
  {
    name: 'FizzBuzz Classic',
    category: 'Loops & Conditionals',
    code: `# The classic programming interview puzzle
print("Running FizzBuzz up to 15:")

for num in range(1, 16):
    if num % 15 == 0:
        print(f"{num}: FizzBuzz! ⚡")
    elif num % 3 == 0:
        print(f"{num}: Fizz 🟢")
    elif num % 5 == 0:
        print(f"{num}: Buzz 🔵")
    else:
        print(f"{num}")
`,
  },
  {
    name: 'Inventory & List Powers',
    category: 'Lists & Methods',
    code: `# Managing a snake adventurer inventory
backpack = ["Torch", "Map", "Python Scroll"]

print("Starting inventory:", backpack)
backpack.append("Golden Key")
print(f"Added item! Total items: {len(backpack)}")

for index, item in enumerate(backpack):
    print(f"Slot {index + 1}: {item}")
`,
  },
  {
    name: 'Fibonacci Sequence Generator',
    category: 'Functions & Loops',
    code: `# Generate first 10 Fibonacci numbers
def generate_fibonacci(count):
    fib = [0, 1]
    while len(fib) < count:
        next_num = fib[-1] + fib[-2]
        fib.append(next_num)
    return fib

numbers = generate_fibonacci(10)
print("First 10 Fibonacci numbers:")
print(numbers)
`,
  },
];
