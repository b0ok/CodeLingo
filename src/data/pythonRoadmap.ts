import { RoadmapNode, RoadmapPhaseId } from '../types';

export interface RoadmapPhase {
  id: RoadmapPhaseId;
  phaseNumber: number;
  title: string;
  subtitle: string;
  description: string;
  roadmapShUrl: string;
  badge: string;
  color: string;
  accentBg: string;
  borderClass: string;
  nodes: RoadmapNode[];
}

export interface CareerTrack {
  id: 'web-backend' | 'ai-ml' | 'data-analysis' | 'automation' | 'foundations';
  name: string;
  tagline: string;
  targetRole: string;
  icon: string;
  color: string;
  essentialPhases: RoadmapPhaseId[];
  keyTools: string[];
  recommendedDailyMinutes: number;
}

export const CAREER_TRACKS: CareerTrack[] = [
  {
    id: 'ai-ml',
    name: 'AI & Machine Learning Engineer',
    tagline: 'Build LLM apps, fine-tune models, and master neural data pipelines',
    targetRole: 'AI Application / ML Engineer',
    icon: 'sparkles',
    color: 'emerald',
    essentialPhases: ['foundations', 'control-flow', 'data-structures', 'functions', 'oop', 'advanced'],
    keyTools: ['Gemini SDK', 'PyTorch', 'NumPy', 'FastAPI'],
    recommendedDailyMinutes: 25,
  },
  {
    id: 'web-backend',
    name: 'Backend Web Architect',
    tagline: 'High-performance APIs, microservices, and databases with FastAPI & Django',
    targetRole: 'Python Backend Engineer',
    icon: 'server',
    color: 'cyan',
    essentialPhases: ['foundations', 'control-flow', 'data-structures', 'functions', 'modules', 'oop', 'files-exceptions', 'advanced'],
    keyTools: ['FastAPI', 'PostgreSQL', 'Docker', 'Pydantic'],
    recommendedDailyMinutes: 30,
  },
  {
    id: 'data-analysis',
    name: 'Data Scientist & Analytics',
    tagline: 'Transform raw datasets, calculate statistical insights, and automate reports',
    targetRole: 'Data Analyst / Scientist',
    icon: 'bar-chart',
    color: 'amber',
    essentialPhases: ['foundations', 'control-flow', 'data-structures', 'functions', 'files-exceptions'],
    keyTools: ['Pandas', 'Jupyter', 'Polars', 'Matplotlib'],
    recommendedDailyMinutes: 20,
  },
  {
    id: 'automation',
    name: 'Scripting & Automation Ninja',
    tagline: 'Automate repetitive workflows, scrape the web, and build developer tools',
    targetRole: 'DevOps / Automation Engineer',
    icon: 'terminal',
    color: 'purple',
    essentialPhases: ['foundations', 'control-flow', 'data-structures', 'functions', 'modules', 'files-exceptions'],
    keyTools: ['Requests', 'Playwright', 'Click', 'OS/Sys'],
    recommendedDailyMinutes: 15,
  },
  {
    id: 'foundations',
    name: 'CS Core & Python Mastery',
    tagline: 'Deep fundamental mental models, idiomatic Pythonic patterns, and interview prep',
    targetRole: 'General Software Engineer',
    icon: 'code',
    color: 'indigo',
    essentialPhases: ['foundations', 'control-flow', 'data-structures', 'functions', 'oop', 'advanced'],
    keyTools: ['Python 3.12+', 'Pytest', 'Typing', 'Git'],
    recommendedDailyMinutes: 20,
  },
];

export const PYTHON_ROADMAP_PHASES: RoadmapPhase[] = [
  // PHASE 1
  {
    id: 'foundations',
    phaseNumber: 1,
    title: 'Basic Syntax & Foundations',
    subtitle: 'roadmap.sh/python Step 1',
    description: 'Master variables, memory allocation, string operations, dynamic typing, and console I/O.',
    roadmapShUrl: 'https://roadmap.sh/python',
    badge: 'Syntax Initiate',
    color: 'emerald',
    accentBg: 'bg-emerald-500/10',
    borderClass: 'border-emerald-500',
    nodes: [
      {
        id: 'rm-print-io',
        phaseId: 'foundations',
        title: 'Basic I/O & print()',
        roadmapCategory: 'Basic Syntax',
        description: 'Understand stdout, formatting with f-strings, and console parameters (sep, end).',
        keyConcepts: ['print()', 'f-strings', 'sep & end params', 'stdout'],
        unitId: 'unit-1',
        lessonIds: ['lesson-1-1', 'lesson-1-2', 'lesson-1-3'],
        importance: 'essential',
        icon: 'terminal',
        antiBlindQuestion: 'Why are f-strings generally preferred over old-style "%" formatting or string concatenation with "+"? What happens under the hood when you evaluate an expression inside { }?',
        sampleAnswerHint: 'f-strings are evaluated at runtime, much faster than concatenation because they avoid creating temporary string objects, and allow arbitrary Python expressions with automatic type conversion.',
      },
      {
        id: 'rm-variables-types',
        phaseId: 'foundations',
        title: 'Variables & Data Types',
        roadmapCategory: 'Variables & Data Types',
        description: 'How Python handles dynamic typing, memory references, int, float, str, and bool.',
        keyConcepts: ['Dynamic Typing', 'Type Casting', 'Memory References', 'Naming Conventions'],
        unitId: 'unit-2',
        lessonIds: ['lesson-2-1', 'lesson-2-2', 'lesson-2-3'],
        importance: 'essential',
        icon: 'box',
        antiBlindQuestion: 'In Python, variables are labels pointing to objects in memory rather than memory boxes holding values. What does this mean if you write a = [1, 2] and b = a?',
        sampleAnswerHint: 'b points to the exact same list object in memory as a. Modifying b (e.g. b.append(3)) will also alter a! To create an independent copy, you need a shallow copy or deep copy.',
      },
    ],
  },

  // PHASE 2
  {
    id: 'control-flow',
    phaseNumber: 2,
    title: 'Control Flow & Loops',
    subtitle: 'roadmap.sh/python Step 2',
    description: 'Conditionals, short-circuit boolean logic, while/for loops, range, and iteration mechanics.',
    roadmapShUrl: 'https://roadmap.sh/python',
    badge: 'Logic Artisan',
    color: 'purple',
    accentBg: 'bg-purple-500/10',
    borderClass: 'border-purple-500',
    nodes: [
      {
        id: 'rm-conditionals',
        phaseId: 'control-flow',
        title: 'Conditionals & Short-Circuiting',
        roadmapCategory: 'Conditionals',
        description: 'if, elif, else, and the truthiness of non-boolean objects (empty lists, 0, None).',
        keyConcepts: ['if/elif/else', 'Truthiness', 'Short-circuit evaluation', 'Ternary Expressions'],
        unitId: 'unit-3',
        lessonIds: ['lesson-3-1', 'lesson-3-2', 'lesson-3-3'],
        importance: 'essential',
        icon: 'git-branch',
        antiBlindQuestion: 'What is "short-circuit evaluation" with "and" and "or" operators in Python, and how can you use it safely to guard against NoneType errors?',
        sampleAnswerHint: 'Python evaluates from left to right. In "a and b", if a is False, Python stops and returns a without evaluating b. This allows checks like "user is not None and user.is_active".',
      },
      {
        id: 'rm-loops-range',
        phaseId: 'control-flow',
        title: 'Loops, Range & Iteration',
        roadmapCategory: 'Loops & Iterators',
        description: 'for loops, while loops, range(start, stop, step), break, continue, and loop-else blocks.',
        keyConcepts: ['for loops', 'while loops', 'range()', 'break / continue', 'loop-else'],
        unitId: 'unit-4',
        lessonIds: ['lesson-4-1', 'lesson-4-2', 'lesson-4-3'],
        importance: 'essential',
        icon: 'repeat',
        antiBlindQuestion: 'What does the "else" clause attached to a for or while loop do in Python? When does it execute, and when is it skipped?',
        sampleAnswerHint: 'The loop "else" block executes ONLY if the loop finishes naturally without encountering a "break" statement. It is commonly used for search loops where an item is not found.',
      },
    ],
  },

  // PHASE 3
  {
    id: 'data-structures',
    phaseNumber: 3,
    title: 'Data Structures & Collections',
    subtitle: 'roadmap.sh/python Step 3',
    description: 'Lists, Tuples, Sets, Dictionaries, Mutability vs Immutability, and Comprehensions.',
    roadmapShUrl: 'https://roadmap.sh/python',
    badge: 'Structure Master',
    color: 'cyan',
    accentBg: 'bg-cyan-500/10',
    borderClass: 'border-cyan-500',
    nodes: [
      {
        id: 'rm-lists-tuples',
        phaseId: 'data-structures',
        title: 'Lists vs Tuples',
        roadmapCategory: 'Lists & Tuples',
        description: 'Sequence operations, indexing, negative slicing, mutability vs immutability, and tuple packing.',
        keyConcepts: ['Slicing [::-1]', 'Mutability', 'Tuple Immutability', 'Unpacking'],
        unitId: 'unit-5',
        lessonIds: ['lesson-5-1', 'lesson-5-2'],
        importance: 'essential',
        icon: 'layers',
        antiBlindQuestion: 'Why would an engineer deliberately choose a tuple over a list for storing coordinate data (x, y) or database records? Mention at least 2 distinct advantages.',
        sampleAnswerHint: 'Tuples are immutable (preventing accidental mutation/bugs), hashable (can be used as dictionary keys or set elements), and have smaller memory footprint and faster iteration.',
      },
      {
        id: 'rm-dicts-sets',
        phaseId: 'data-structures',
        title: 'Dictionaries & Sets',
        roadmapCategory: 'Dictionaries & Sets',
        description: 'Hash tables under the hood, O(1) lookups, set algebra (union, intersection), and dict methods.',
        keyConcepts: ['Hash Tables', 'O(1) Lookup', 'Set Operations', 'dict.get(key, default)'],
        unitId: 'unit-5',
        lessonIds: ['lesson-5-3'],
        importance: 'essential',
        icon: 'key',
        antiBlindQuestion: 'Why is checking "item in my_set" O(1) instant time complexity, while "item in my_list" is O(n) linear time complexity? What requirement does this place on items stored in sets?',
        sampleAnswerHint: 'Sets and Dictionaries use hash tables. Python computes the hash of the item to jump directly to its memory bucket in O(1). Because of this, elements must be hashable and immutable.',
      },
      {
        id: 'rm-comprehensions',
        phaseId: 'data-structures',
        title: 'Comprehensions',
        roadmapCategory: 'Comprehensions',
        description: 'List, dict, and set comprehensions for clean, idiomatic, and fast declarative transforms.',
        keyConcepts: ['List Comprehensions', 'Filtering with if', 'Dict Comprehensions', 'Readability Tradeoffs'],
        unitId: 'unit-7',
        lessonIds: ['lesson-7-2'],
        importance: 'essential',
        icon: 'zap',
        antiBlindQuestion: 'When should you NOT use a list comprehension in production code? What is the readability boundary?',
        sampleAnswerHint: 'When the comprehension has multiple nested loops, complex multi-branch conditional logic, or causes excessive memory consumption on gigantic datasets where a generator expression is better.',
      },
    ],
  },

  // PHASE 4
  {
    id: 'functions',
    phaseNumber: 4,
    title: 'Functions & Scope',
    subtitle: 'roadmap.sh/python Step 4',
    description: 'def statements, return values, default arguments, *args, **kwargs, LEGB scope, and Lambdas.',
    roadmapShUrl: 'https://roadmap.sh/python',
    badge: 'Function Sorcerer',
    color: 'amber',
    accentBg: 'bg-amber-500/10',
    borderClass: 'border-amber-500',
    nodes: [
      {
        id: 'rm-func-params',
        phaseId: 'functions',
        title: 'Parameters, *args & **kwargs',
        roadmapCategory: 'Function Arguments',
        description: 'Positional arguments, keyword arguments, arbitrary argument unpacking, and default trap.',
        keyConcepts: ['*args (tuple)', '**kwargs (dict)', 'Default Arguments Trap', 'Keyword-Only'],
        unitId: 'unit-6',
        lessonIds: ['lesson-6-1', 'lesson-6-2', 'lesson-6-3'],
        importance: 'essential',
        icon: 'sliders',
        antiBlindQuestion: 'Why is defining "def add_item(item, basket=[])" considered a catastrophic beginner trap in Python? What happens if you call it three times?',
        sampleAnswerHint: 'Default argument expressions in Python are evaluated ONCE when the function is defined, NOT each time it is called. The same list instance persists and accumulates items across calls! Always use basket=None.',
      },
      {
        id: 'rm-scope-legb',
        phaseId: 'functions',
        title: 'LEGB Scope & Closures',
        roadmapCategory: 'Variable Scope',
        description: 'How Python searches for variables: Local, Enclosing, Global, Built-in, plus global and nonlocal.',
        keyConcepts: ['LEGB Rule', 'global keyword', 'nonlocal keyword', 'Closures'],
        unitId: 'unit-6',
        lessonIds: ['lesson-6-1'],
        importance: 'recommended',
        icon: 'shield',
        antiBlindQuestion: 'Walk through the LEGB rule when Python resolves a variable name inside an inner nested function.',
        sampleAnswerHint: 'Python first checks the Local function namespace, then Enclosing namespaces of any outer functions, then the Global module namespace, and lastly the Built-in Python namespace before raising NameError.',
      },
    ],
  },

  // PHASE 5
  {
    id: 'modules',
    phaseNumber: 5,
    title: 'Modules & Packages',
    subtitle: 'roadmap.sh/python Step 5',
    description: 'import systems, Python standard library (math, random, datetime, json), pip, and virtual environments.',
    roadmapShUrl: 'https://roadmap.sh/python',
    badge: 'Package Architect',
    color: 'teal',
    accentBg: 'bg-teal-500/10',
    borderClass: 'border-teal-500',
    nodes: [
      {
        id: 'rm-stdlib-imports',
        phaseId: 'modules',
        title: 'Standard Library & Imports',
        roadmapCategory: 'Modules & Packages',
        description: 'Navigating batteries-included Python: math, random, datetime, os, sys, and json.',
        keyConcepts: ['import vs from import', 'math & random', 'json.dumps / json.loads', 'Circular Imports'],
        unitId: 'unit-7',
        lessonIds: ['lesson-7-1'],
        importance: 'essential',
        icon: 'package',
        antiBlindQuestion: 'What does "if __name__ == \'__main__\':" do in a Python script, and why is it standard practice in professional codebases?',
        sampleAnswerHint: 'It checks whether the script is being executed directly by the user (where __name__ is set to "__main__") or imported as a module by another file (where __name__ is the module filename). It prevents test code from running on import.',
      },
      {
        id: 'rm-pip-venv',
        phaseId: 'modules',
        title: 'Virtual Environments & Pip',
        roadmapCategory: 'Package Management',
        description: 'Isolating dependencies using venv and recording versions in requirements.txt.',
        keyConcepts: ['python -m venv .venv', 'pip install', 'requirements.txt', 'Dependency Isolation'],
        unitId: 'unit-7',
        lessonIds: ['lesson-7-1'],
        importance: 'recommended',
        icon: 'shield-check',
        antiBlindQuestion: 'Why should you never install third-party libraries directly into your global system Python environment?',
        sampleAnswerHint: 'Different projects require conflicting versions of dependencies (e.g. Django 4 vs Django 5). Installing globally breaks existing projects and can corrupt OS-level system tools that rely on system Python.',
      },
    ],
  },

  // PHASE 6
  {
    id: 'oop',
    phaseNumber: 6,
    title: 'Object-Oriented Programming (OOP)',
    subtitle: 'roadmap.sh/python Step 6',
    description: 'Classes, Objects, __init__, self, Methods, Inheritance, Encapsulation, and Dunder methods.',
    roadmapShUrl: 'https://roadmap.sh/python',
    badge: 'Class Architect',
    color: 'blue',
    accentBg: 'bg-blue-500/10',
    borderClass: 'border-blue-500',
    nodes: [
      {
        id: 'rm-classes-init',
        phaseId: 'oop',
        title: 'Classes, Objects & __init__',
        roadmapCategory: 'Classes & Objects',
        description: 'Modeling real-world entities with classes, constructor methods, and instance state.',
        keyConcepts: ['class Definition', '__init__() Constructor', 'self Reference', 'Instance Attributes'],
        unitId: 'unit-8',
        lessonIds: ['lesson-8-1'],
        importance: 'essential',
        icon: 'cpu',
        antiBlindQuestion: 'What role does "self" actually play in Python class methods? Why is it passed explicitly in method definitions but omitted when you call obj.method()?',
        sampleAnswerHint: 'self represents the specific instance invoking the method. When you write obj.method(), Python syntactically rewrites it to Class.method(obj), binding the instance as the first argument automatically.',
      },
      {
        id: 'rm-inheritance-dunder',
        phaseId: 'oop',
        title: 'Inheritance & Magic Methods',
        roadmapCategory: 'OOP Principles',
        description: 'super(), subclassing, polymorphism, and dunder methods (__str__, __repr__, __len__, __eq__).',
        keyConcepts: ['Inheritance & super()', '__str__ vs __repr__', '__len__ Magic Method', 'Polymorphism'],
        unitId: 'unit-8',
        lessonIds: ['lesson-8-2'],
        importance: 'essential',
        icon: 'git-merge',
        antiBlindQuestion: 'What is the key difference between __str__ and __repr__ in a Python class? Which one is shown to end-users and which one is for debugging?',
        sampleAnswerHint: '__str__ is intended for readable, friendly output for end users (used by print). __repr__ is for developers and debugging, providing an unambiguous string showing how to reconstruct the object.',
      },
    ],
  },

  // PHASE 7
  {
    id: 'files-exceptions',
    phaseNumber: 7,
    title: 'Error Handling & File I/O',
    subtitle: 'roadmap.sh/python Step 7',
    description: 'try/except/else/finally, raising exceptions, reading and writing files with context managers.',
    roadmapShUrl: 'https://roadmap.sh/python',
    badge: 'Resilience Guardian',
    color: 'rose',
    accentBg: 'bg-rose-500/10',
    borderClass: 'border-rose-500',
    nodes: [
      {
        id: 'rm-try-except',
        phaseId: 'files-exceptions',
        title: 'Exception Handling Architecture',
        roadmapCategory: 'Exceptions',
        description: 'Graceful fault tolerance, specific exception catches, custom exceptions, and finally cleanup.',
        keyConcepts: ['try/except/else/finally', 'raise Exception', 'Built-in Hierarchy', 'Custom Exceptions'],
        unitId: 'unit-7',
        lessonIds: ['lesson-7-3'],
        importance: 'essential',
        icon: 'alert-triangle',
        antiBlindQuestion: 'Why is writing a bare "except:" or "except Exception:" considered an anti-pattern in professional Python applications? What can go wrong?',
        sampleAnswerHint: 'A bare except catches unexpected system errors like KeyboardInterrupt, SystemExit, and MemoryError, preventing the user from terminating a frozen program and silently swallowing critical bugs.',
      },
      {
        id: 'rm-file-io',
        phaseId: 'files-exceptions',
        title: 'File I/O & with Context Managers',
        roadmapCategory: 'File Handling',
        description: 'Reading, writing, appending files, and guaranteeing resource cleanup via with open(...) as f.',
        keyConcepts: ['with open(...) as f', 'Modes: r, w, a, rb', 'Context Managers', 'Line by line iteration'],
        unitId: 'unit-9',
        lessonIds: ['lesson-9-1'],
        importance: 'essential',
        icon: 'file-text',
        antiBlindQuestion: 'What guarantees does the "with" statement provide when working with files, even if an exception occurs mid-write?',
        sampleAnswerHint: 'The "with" statement invokes the context manager protocol (__enter__ and __exit__). It guarantees that f.close() is ALWAYS executed to release file handles and flush buffers, even if an error is raised.',
      },
    ],
  },

  // PHASE 8
  {
    id: 'advanced',
    phaseNumber: 8,
    title: 'Advanced Python & Real-World Craft',
    subtitle: 'roadmap.sh/python Step 8',
    description: 'Generators with yield, Decorators, Type Hinting, JSON APIs, and high-performance Pythonic code.',
    roadmapShUrl: 'https://roadmap.sh/python',
    badge: 'Python Grandmaster',
    color: 'indigo',
    accentBg: 'bg-indigo-500/10',
    borderClass: 'border-indigo-500',
    nodes: [
      {
        id: 'rm-generators',
        phaseId: 'advanced',
        title: 'Generators & The yield Keyword',
        roadmapCategory: 'Generators & Iterators',
        description: 'Memory-efficient lazy streaming of large datasets with yield and next().',
        keyConcepts: ['yield keyword', 'Lazy Evaluation', 'Memory Efficiency', 'Generator Expressions'],
        unitId: 'unit-10',
        lessonIds: ['lesson-10-1'],
        importance: 'essential',
        icon: 'activity',
        antiBlindQuestion: 'How does a generator function using "yield" save gigabytes of RAM when processing a 50GB server log file compared to a regular function returning a list?',
        sampleAnswerHint: 'A regular function must build and hold all items in memory simultaneously before returning. A generator yields one item at a time lazily on demand, using virtually zero memory (O(1) space).',
      },
      {
        id: 'rm-decorators',
        phaseId: 'advanced',
        title: 'Decorators & Wrappers',
        roadmapCategory: 'Decorators',
        description: 'First-class function wrapping, timing, authentication gates, and @functools.wraps.',
        keyConcepts: ['@decorator syntax', 'Higher-Order Functions', 'functools.wraps', 'Closure state'],
        unitId: 'unit-10',
        lessonIds: ['lesson-10-2'],
        importance: 'recommended',
        icon: 'sparkles',
        antiBlindQuestion: 'In plain English, what is a Python decorator actually doing when you place "@my_decorator" on top of a function definition?',
        sampleAnswerHint: 'A decorator is syntactic sugar that takes a function as an argument, wraps it with pre/post execution behavior, and returns a new function. Writing @dec def f(): ... is identical to f = dec(f).',
      },
      {
        id: 'rm-type-hints',
        phaseId: 'advanced',
        title: 'Type Hints & Modern APIs',
        roadmapCategory: 'Type System & APIs',
        description: 'Static type annotations, Optional, Union, Pydantic/FastAPI integration, and JSON APIs.',
        keyConcepts: ['Type Annotations', 'typing module', 'FastAPI & Pydantic', 'HTTP / Requests'],
        unitId: 'unit-10',
        lessonIds: ['lesson-10-3'],
        importance: 'recommended',
        icon: 'check-circle',
        antiBlindQuestion: 'Python is dynamically typed at runtime. Does adding type hints like "def greet(name: str) -> str:" slow down execution or cause runtime TypeErrors?',
        sampleAnswerHint: 'No! Python type hints are purely annotations ignored by the CPython interpreter at runtime. They have zero performance overhead and are used by IDEs and static analyzers (mypy, Pyright) for safety.',
      },
    ],
  },
];

export function getRoadmapPhase(phaseId: RoadmapPhaseId): RoadmapPhase | undefined {
  return PYTHON_ROADMAP_PHASES.find((p) => p.id === phaseId);
}

export function getAllRoadmapNodes(): RoadmapNode[] {
  return PYTHON_ROADMAP_PHASES.flatMap((p) => p.nodes);
}

export function getRoadmapNodeById(nodeId: string): RoadmapNode | undefined {
  return getAllRoadmapNodes().find((n) => n.id === nodeId);
}
