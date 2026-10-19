// Reference solutions for code_runner challenges: `right` must pass; the starter code
// and every `wrong` answer must fail. Python and JavaScript ones are also run in real
// Python and Node by verify-snippets.ts.
export const SOLUTIONS: Record<string, { right: string; wrong: string[] }> = {
  // Onboarding "let me cook" challenges (data/proChallenges.ts); the web one is checked in the browser test
  'pro-python-rle': {
    right: "def compress(s):\n    out = \"\"\n    i = 0\n    while i < len(s):\n        j = i\n        while j < len(s) and s[j] == s[i]:\n            j += 1\n        out += s[i] + str(j - i)\n        i = j\n    return out\n\nprint(compress(\"aaabccdddd\"))\nprint(compress(\"z\"))\nprint(compress(\"abba\"))\nprint(compress(\"\"))",
    wrong: ["def compress(s):\n    out = \"\"\n    for ch in dict.fromkeys(s):\n        out += ch + str(s.count(ch))\n    return out\n\nprint(compress(\"aaabccdddd\"))\nprint(compress(\"z\"))\nprint(compress(\"abba\"))\nprint(compress(\"\"))"], // counts letters overall instead of runs: "abba" becomes a2b2
  },
  'pro-js-brackets': {
    right: "function isBalanced(str) {\n  const pairs = { \")\": \"(\", \"]\": \"[\", \"}\": \"{\" };\n  const stack = [];\n  for (const ch of str) {\n    if (\"([{\".includes(ch)) stack.push(ch);\n    else if (ch in pairs && stack.pop() !== pairs[ch]) return false;\n  }\n  return stack.length === 0;\n}\n\nconsole.log(isBalanced(\"([]{})\"));\nconsole.log(isBalanced(\"([)]\"));\nconsole.log(isBalanced(\"((\"));\nconsole.log(isBalanced(\"a(b[c]d)e\"));\nconsole.log(isBalanced(\"\"));",
    wrong: ["function isBalanced(str) {\n  let open = 0;\n  for (const ch of str) {\n    if (\"([{\".includes(ch)) open++;\n    if (\")]}\".includes(ch)) open--;\n  }\n  return open === 0;\n}\n\nconsole.log(isBalanced(\"([]{})\"));\nconsole.log(isBalanced(\"([)]\"));\nconsole.log(isBalanced(\"((\"));\nconsole.log(isBalanced(\"a(b[c]d)e\"));\nconsole.log(isBalanced(\"\"));"], // only counts brackets, so "([)]" wrongly passes
  },
  'pro-sql-top-dev': {
    right: "SELECT name, email FROM users WHERE role = 'Developer' ORDER BY points DESC LIMIT 1;",
    wrong: [
      "SELECT name, email FROM users ORDER BY points DESC LIMIT 1;",
      "SELECT name, email FROM users WHERE role = 'Developer' ORDER BY points DESC;",
    ],
  },
  // Scheduled challenges (data/challenges.ts)
  'challenge-daily-1': {
    right: 'nums = [2, 7, 11, 15]\ntarget = 9\n\nfor i in range(len(nums)):\n    for j in range(i + 1, len(nums)):\n        if nums[i] + nums[j] == target:\n            print(f"{nums[i]} {nums[j]}")',
    wrong: ['nums = [2, 7, 11, 15]\ntarget = 9\nprint(nums[0], nums[2])'],
  },
  'challenge-weekly-1': {
    right: 'word = "racecar"\n\nif word == word[::-1]:\n    print("VALID PALINDROME")\nelse:\n    print("INVALID")',
    wrong: ['word = "racecar"\n\nif word == word[1:]:\n    print("VALID PALINDROME")\nelse:\n    print("INVALID")'],
  },
  'challenge-monthly-1': {
    right: 'stream = "mississippi"\n\ncounts = {}\nfor ch in stream:\n    counts[ch] = counts.get(ch, 0) + 1\n\nprint(f"Max frequency: {max(counts.values())}")',
    wrong: ['stream = "mississippi"\n\ncounts = {}\nfor ch in stream:\n    counts[ch] = 1\n\nprint(f"Max frequency: {max(counts.values())}")'],
  },
  'u1-l1-c4': { right: 'print("Python is fun")', wrong: ['print("python is fun")', 'print("Python is fun!")'] },
  'u1-l3-c3': { right: '# print("Novice")\nprint("Python Champion")', wrong: ['print("Novice")'] },
  'u2-l3-c3': { right: 'score = 99\nprint(f"User score is {score}")', wrong: ['score = 99\nprint("User score is score")'] },
  'u3-l2-c3': { right: 'age = 15\nif age < 18:\n    print("Youth Ticket")\nelse:\n    print("Standard Ticket")', wrong: ['age = 15\nprint("Standard Ticket")'] },
  'u4-l1-c3': { right: 'total = 0\nfor n in range(1, 5):\n    total = total + n\nprint(total)', wrong: ['total = 0\nfor n in range(1, 4):\n    total = total + n\nprint(total)'] },
  'u5-l2-c2': { right: 'treasures = ["Gold", "Ruby"]\ntreasures.append("Diamond")\nprint(len(treasures))', wrong: ['treasures = ["Gold", "Ruby"]\nprint(len(treasures))'] },
  'u6-l2-c2': { right: 'def double_it(n):\n    return n * 2\n\nprint(double_it(7))', wrong: ['def double_it(n):\n    return n + 2\n\nprint(double_it(7))'] },
  'u7-l1-c2': { right: 'points = [45, 92, 78, 99, 61]\nprint(max(points))', wrong: ['points = [45, 92, 78, 99, 61]\nprint(min(points))'] },
  'u8-l1-c3': { right: 'class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\np = Point(3, 7)\nprint(p.x + p.y)', wrong: ['class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\np = Point(3, 7)\nprint(p.x)'] },
  'u4-l2-c4': { right: 'prices = [3, 5, 2]\ntotal = 0\nfor p in prices:\n    total = total + p\nprint(total)', wrong: ['prices = [3, 5, 2]\ntotal = 0\nfor p in prices:\n    total = p\nprint(total)'] },
  'u4-l3-c4': { right: 'n = 1\nwhile n < 20:\n    print(n)\n    n = n * 2', wrong: ['n = 1\nwhile n < 20:\n    n = n * 2\n    print(n)'] },
  'u5-l3-c4': { right: 'stock = {"apples": 5, "pears": 2}\nstock["apples"] = stock["apples"] + 3\nprint(stock["apples"])', wrong: ['stock = {"apples": 5, "pears": 2}\nstock["apples"] = 3\nprint(stock["apples"])'] },
  'u6-l1-c4': { right: 'def greet(name):\n    print("Hello, " + name)\n\ngreet("Ada")', wrong: ['def greet(name):\n    print("Hello, name")\n\ngreet("Ada")'] },
  'u6-l3-c4': { right: 'def power(base, exp=2):\n    return base ** exp\n\nprint(power(5))', wrong: ['def power(base, exp=3):\n    return base ** exp\n\nprint(power(5))'] },
  'u8-l2-c4': { right: 'class Animal:\n    def __init__(self, name):\n        self.name = name\n\n    def speak(self):\n        return "..."\n\nclass Dog(Animal):\n    def speak(self):\n        return "Woof!"\n\nprint(Dog("Rex").speak())', wrong: ['class Animal:\n    def __init__(self, name):\n        self.name = name\n\n    def speak(self):\n        return "..."\n\nclass Dog(Animal):\n    pass\n\nprint(Dog("Rex").speak())'] },
  'js-u1-l1-c5': { right: 'console.log("CodeLingo");', wrong: ['console.log("codelingo");', 'console.log("Code", "Lingo");'] },
  'js-u3-l2-c2': { right: 'const square = (x) => x * x;\nconsole.log(square(6));', wrong: ['const square = (x) => x * x;\nconsole.log(square(5));'] },
  'js-u1-l2-c4': { right: 'const lang = "JavaScript";\nconst year = 1995;\nconsole.log(`${lang} was created in ${year}`);', wrong: ['const lang = "JavaScript";\nconst year = 1995;\nconsole.log("lang was created in year");'] },
  'js-u2-l2-c5': { right: 'const values = [7, "7", [7]];\nconsole.log(values.map((v) => typeof v).join(" "));', wrong: ['console.log("number string array");'] },
  'js-u2-l3-c5': { right: 'const a = "4";\nconst b = "6";\nconsole.log(Number(a) + Number(b));', wrong: ['const a = "4";\nconst b = "6";\nconsole.log(a - b);'] },
  'js-u3-l1-c5': { right: 'const score = 85;\nif (score >= 90) {\n  console.log("A");\n} else if (score >= 80) {\n  console.log("B");\n} else {\n  console.log("C");\n}', wrong: ['const score = 85;\nconsole.log(score >= 80 ? "A" : "B");'] },
  'js-u3-l3-c5': { right: 'let total = 0;\nfor (let n = 1; n <= 10; n++) {\n  if (n % 2 === 0) total += n;\n}\nconsole.log(total);', wrong: ['let total = 0;\nfor (let n = 1; n <= 10; n++) {\n  total += n;\n}\nconsole.log(total);'] },
  'js-u3-l4-c4': { right: 'function safeDivide(a, b) {\n  if (b === 0) throw new Error("Cannot divide by zero");\n  return a / b;\n}\n\ntry {\n  console.log(safeDivide(10, 0));\n} catch (err) {\n  console.log(err.message);\n}', wrong: ['function safeDivide(a, b) {\n  if (b === 0) throw "Cannot divide by zero";\n  return a / b;\n}\n\ntry {\n  console.log(safeDivide(10, 0));\n} catch (err) {\n  console.log(err.message);\n}'] },
  'js-u4-l1-c4': { right: 'const prices = [5, 12, 8, 20];\nconsole.log(prices.filter((p) => p > 7).reduce((sum, p) => sum + p, 0));', wrong: ['const prices = [5, 12, 8, 20];\nconsole.log(prices.reduce((sum, p) => sum + p, 0));'] },
  'js-u4-l2-c4': { right: 'let a = 1;\nlet b = 2;\n[a, b] = [b, a];\nconsole.log(a, b);', wrong: ['let a = 1;\nlet b = 2;\na = b;\nb = a;\nconsole.log(a, b);'] },
  'js-u4-l3-c5': { right: 'const tags = ["js", "css", "js", "html", "css"];\nconsole.log(new Set(tags).size);', wrong: ['const tags = ["js", "css", "js", "html", "css"];\nconsole.log(tags.length);'] },
  'js-u5-l1-c4': { right: 'function createCounter() {\n  let count = 0;\n  return () => ++count;\n}\n\nconst next = createCounter();\nnext();\nnext();\nconsole.log(next());', wrong: ['function createCounter() {\n  return () => {\n    let count = 0;\n    return ++count;\n  };\n}\n\nconst next = createCounter();\nnext();\nnext();\nconsole.log(next());'] },
  'js-u5-l2-c4': { right: 'function sumTo(n) {\n  if (n <= 0) return 0;\n  return n + sumTo(n - 1);\n}\n\nconsole.log(sumTo(5));', wrong: ['function sumTo(n) {\n  if (n <= 0) return 0;\n  return n + sumTo(n - 2);\n}\n\nconsole.log(sumTo(5));'] },
  'js-u5-l3-c4': { right: 'const counter = {\n  count: 10,\n  read() {\n    return this.count;\n  },\n};\n\nconst read = counter.read.bind(counter);\nconsole.log(read());', wrong: ['const counter = {\n  count: 10,\n  read() {\n    return this.count;\n  },\n};\n\nconst read = counter.read.bind({});\nconsole.log(read());'] },
  'js-u6-l1-c4': { right: 'class Rectangle {\n  constructor(w, h) {\n    this.w = w;\n    this.h = h;\n  }\n  area() {\n    return this.w * this.h;\n  }\n}\n\nconsole.log(new Rectangle(3, 4).area());', wrong: ['class Rectangle {\n  constructor(w, h) {\n    this.w = w;\n    this.h = h;\n  }\n  area() {\n    return this.w + this.h;\n  }\n}\n\nconsole.log(new Rectangle(3, 4).area());'] },
  'js-u8-l1-c3': { right: 'const settings = { volume: 0, theme: null };\nconsole.log(settings.volume ?? 50, settings.theme ?? "light");', wrong: ['const settings = { volume: 0, theme: null };\nconsole.log(settings.volume || 50, settings.theme || "light");'] },
  'js-u8-l3-c3': { right: 'const prefs = { theme: "dark", fontSize: 16 };\nconst copy = JSON.parse(JSON.stringify(prefs));\nconsole.log(copy.theme);', wrong: ['const prefs = { theme: "dark", fontSize: 16 };\nconsole.log(JSON.stringify(prefs).theme);'] },
  'js-u9-l1-c3': { right: 'function* range(start, end) {\n  for (let i = start; i < end; i++) yield i;\n}\n\nconsole.log([...range(1, 5)].join(","));', wrong: ['function* range(start, end) {\n  for (let i = start; i <= end; i++) yield i;\n}\n\nconsole.log([...range(1, 5)].join(","));'] },
  'js-u9-l2-c4': { right: 'function once(fn) {\n  let called = false;\n  return (...args) => {\n    if (called) return;\n    called = true;\n    return fn(...args);\n  };\n}\n\nconst init = once(() => console.log("init"));\ninit();\ninit();\ninit();', wrong: ['function once(fn) {\n  return fn;\n}\n\nconst init = once(() => console.log("init"));\ninit();\ninit();\ninit();'] },
  'sql-u1-l1-c4': { right: 'SELECT name, role, points FROM users;', wrong: ['SELECT * FROM users;', 'SELECT name, role FROM users;'] },
  'sql-u1-l2-c3': { right: 'SELECT title, price FROM products WHERE price < 100;', wrong: ['SELECT title, price FROM products', 'SELECT title, price FROM products WHERE price > 100;'] },
  'sql-u2-l1-c2': { right: 'SELECT name, points FROM users ORDER BY points DESC LIMIT 3;', wrong: ['SELECT name, points FROM users ORDER BY points ASC LIMIT 3;', 'SELECT name, points FROM users LIMIT 3;'] },
  'sql-u2-l2-c3': { right: "SELECT name FROM users WHERE name LIKE '%li%';", wrong: ['SELECT name FROM users', "SELECT name FROM users WHERE name LIKE '%a%';"] },
  'sql-u5-l1-c1': { right: "SELECT COUNT(*) FROM users WHERE role = 'Developer';", wrong: ['SELECT COUNT(*) FROM users', "SELECT COUNT(*) FROM users WHERE role = 'Designer';"] },
  'u2-l1-c6': { right: 'width = 4\nheight = 5\narea = width * height\nprint(area)', wrong: ['width = 4\nheight = 5\nprint(width + height)'] },
  'u2-l2-c7': { right: 'age = 20\nis_adult = age >= 18\nprint(is_adult)', wrong: ['age = 20\nis_adult = age > 30\nprint(is_adult)'] },
  'u2-l3-c7': { right: 'a = "4"\nb = "6"\nprint(int(a) + int(b))', wrong: ['a = "4"\nb = "6"\nprint(a + b)'] },
  'u3-l1-c6': { right: 'coins = 120\nif coins > 100:\n    print("Rich!")', wrong: ['coins = 120\nif coins < 100:\n    print("Rich!")'] },
  'u3-l3-c6': { right: 'age = 25\nhas_ticket = True\nif age >= 18 and has_ticket:\n    print("Enter")\nelse:\n    print("Stop")', wrong: ['age = 25\nhas_ticket = True\nif age >= 18 and not has_ticket:\n    print("Enter")\nelse:\n    print("Stop")'] },
  'u5-l1-c7': { right: 'pets = ["cat", "dog", "fish"]\nprint(pets[0])\nprint(pets[-1])', wrong: ['pets = ["cat", "dog", "fish"]\nprint(pets[1])\nprint(pets[2])'] },
  'u5-l2-c7': { right: 'scores = [40, 90, 75]\nscores.sort()\nprint(scores)', wrong: ['scores = [40, 90, 75]\nprint(scores)'] },
  'u6-l2-c7': { right: 'def is_even(n):\n    return n % 2 == 0\n\nprint(is_even(10))', wrong: ['def is_even(n):\n    return n % 2 == 1\n\nprint(is_even(10))'] },
  'u7-l1-c7': { right: 'temps = [18, 21, 25, 20]\nprint(max(temps) - min(temps))', wrong: ['temps = [18, 21, 25, 20]\nprint(max(temps))'] },
  'js-u3-l2-c7': { right: 'const greet = (name) => `Hi, ${name}`;\n\nconsole.log(greet("Ada"));', wrong: ['const greet = (name) => { `Hi, ${name}`; };\n\nconsole.log(greet("Ada"));'] },
  'js-u3-l4-c7': { right: 'class ValidationError extends Error {\n  constructor(message) {\n    super(message);\n    this.name = "ValidationError";\n  }\n}\n\ntry {\n  throw new ValidationError("Email is required");\n} catch (err) {\n  console.log(`${err.name}: ${err.message}`);\n}', wrong: ['class ValidationError extends Error {\n  constructor(message) {\n    this.name = "ValidationError";\n    super(message);\n  }\n}\n\ntry {\n  throw new ValidationError("Email is required");\n} catch (err) {\n  console.log(`${err.name}: ${err.message}`);\n}'] },
  'js-u4-l3-c7': { right: 'const json = \'{"name":"Ada","langs":["js","py"]}\';\nconsole.log(JSON.parse(json).langs.length);', wrong: ['const json = \'{"name":"Ada","langs":["js","py"]}\';\nconsole.log(json.langs);'] },
  'js-u9-l1-c6': { right: 'const countdown = {\n  from: 3,\n  *[Symbol.iterator]() {\n    for (let i = this.from; i >= 1; i--) yield i;\n  },\n};\n\nconsole.log([...countdown].join(" "));', wrong: ['const countdown = {\n  from: 3,\n  *[Symbol.iterator]() {\n    for (let i = this.from; i > 1; i--) yield i;\n  },\n};\n\nconsole.log([...countdown].join(" "));'] },
  'sql-u1-l2-c7': { right: 'SELECT name FROM users WHERE points > 300;', wrong: ['SELECT name FROM users WHERE points > 400;', 'SELECT name FROM users;'] },
  'sql-u2-l1-c7': { right: 'SELECT title FROM products ORDER BY price LIMIT 2;', wrong: ['SELECT title FROM products ORDER BY price DESC LIMIT 2;', 'SELECT title FROM products ORDER BY price;'] },
  'sql-u5-l1-c7': { right: 'SELECT COUNT(*) FROM products WHERE category = \'Hardware\';', wrong: ['SELECT COUNT(*) FROM products;', 'SELECT COUNT(*) FROM products WHERE category = \'Apparel\';'] },
};

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
