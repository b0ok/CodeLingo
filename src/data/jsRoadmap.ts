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
  id: 'js-fullstack-ts' | 'js-react-frontend' | 'js-node-backend' | 'js-cloud-serverless';
  name: string;
  tagline: string;
  targetRole: string;
  icon: string;
  color: string;
  essentialPhases: RoadmapPhaseId[];
  keyTools: string[];
  recommendedDailyMinutes: number;
}

export const JS_CAREER_TRACKS: CareerTrack[] = [
  {
    id: 'js-react-frontend',
    name: 'React & Frontend Architect',
    tagline: 'Master reactive state, component lifecycles, virtual DOM, and client performance',
    targetRole: 'Senior React / Frontend Engineer',
    icon: 'sparkles',
    color: 'amber',
    essentialPhases: ['js-basics', 'js-control-flow', 'js-data-structures', 'js-functions-closures', 'js-async-event-loop', 'js-dom-apis', 'js-modern-modules'],
    keyTools: ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Vite'],
    recommendedDailyMinutes: 25,
  },
  {
    id: 'js-fullstack-ts',
    name: 'Full-Stack TypeScript Engineer',
    tagline: 'End-to-end full-stack development with type-safe APIs, Node.js, and modern databases',
    targetRole: 'Full-Stack Software Engineer',
    icon: 'layers',
    color: 'cyan',
    essentialPhases: ['js-basics', 'js-control-flow', 'js-data-structures', 'js-functions-closures', 'js-oop-prototypes', 'js-async-event-loop', 'js-modern-modules', 'js-advanced-patterns'],
    keyTools: ['TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Prisma'],
    recommendedDailyMinutes: 30,
  },
  {
    id: 'js-node-backend',
    name: 'Node.js Backend & API Architect',
    tagline: 'High-throughput microservices, event-driven streaming, and database pooling',
    targetRole: 'Backend Node.js Engineer',
    icon: 'server',
    color: 'emerald',
    essentialPhases: ['js-basics', 'js-control-flow', 'js-functions-closures', 'js-oop-prototypes', 'js-async-event-loop', 'js-modern-modules', 'js-advanced-patterns'],
    keyTools: ['Node.js', 'Fastify', 'Redis', 'Docker', 'Event Loop Profiler'],
    recommendedDailyMinutes: 25,
  },
  {
    id: 'js-cloud-serverless',
    name: 'Cloud & Serverless Specialist',
    tagline: 'Edge compute, Lambda functions, asynchronous workers, and distributed state',
    targetRole: 'Serverless / Cloud Developer',
    icon: 'cpu',
    color: 'purple',
    essentialPhases: ['js-basics', 'js-control-flow', 'js-data-structures', 'js-async-event-loop', 'js-modern-modules'],
    keyTools: ['AWS Lambda', 'Cloudflare Workers', 'GraphQL', 'Terraform'],
    recommendedDailyMinutes: 20,
  },
];

export const JS_ROADMAP_PHASES: RoadmapPhase[] = [
  // ================= PHASE 1: JAVASCRIPT BASICS, VARIABLES & TYPES =================
  {
    id: 'js-basics',
    phaseNumber: 1,
    title: 'JavaScript Basics, Variables & Types',
    subtitle: 'Console, Strings, let/const/var & Coercion',
    description: 'Run your first statements, declare variables with the right keyword, and predict how JavaScript converts between types.',
    roadmapShUrl: 'https://roadmap.sh/javascript',
    badge: 'Scope Navigator',
    color: 'amber',
    accentBg: 'bg-amber-500/10',
    borderClass: 'border-amber-400/40',
    nodes: [
      {
        id: 'js-rm-console-strings',
        phaseId: 'js-basics',
        title: 'Console Output, Strings & Template Literals',
        roadmapCategory: 'Introduction / Strings',
        description: 'Log values with console.log(), build strings with template literals, and use common string methods.',
        keyConcepts: ['console.log()', 'Template literals (`${}`)', 'String methods', 'Strings are immutable'],
        unitId: 'js-unit-1',
        lessonIds: ['js-lesson-1-1', 'js-lesson-1-2'],
        importance: 'essential',
        icon: 'terminal',
        antiBlindQuestion:
          'Why are template literals preferred over string concatenation with +, and why does calling "name.toUpperCase()" leave the original "name" unchanged?',
        sampleAnswerHint:
          'Template literals embed any expression inside ${} and support multi-line text, so they are easier to read and avoid accidental number/string concatenation. Strings are immutable primitives: methods like toUpperCase() return a brand new string and never modify the original.',
      },
      {
        id: 'js-rm-variables-tdz',
        phaseId: 'js-basics',
        title: 'let, const vs var & Temporal Dead Zone',
        roadmapCategory: 'JavaScript Basics / Variables & Scoping',
        description: 'Understand how the engine allocates variable bindings and why accessing let/const before declaration throws a ReferenceError.',
        keyConcepts: ['var (function scoped)', 'let & const (block scoped)', 'Hoisting', 'Temporal Dead Zone (TDZ)'],
        unitId: 'js-unit-2',
        lessonIds: ['js-lesson-2-1'],
        importance: 'essential',
        icon: 'box',
        antiBlindQuestion:
          'What is the Temporal Dead Zone (TDZ) in JavaScript, and why does accessing a "var" variable before declaration evaluate to undefined, while doing the same with "let" throws a ReferenceError?',
        sampleAnswerHint:
          'Both var and let are hoisted during the creation phase of the execution context. However, var is initialized with undefined immediately, whereas let and const remain in the uninitialized Temporal Dead Zone until their line of declaration executes. Accessing an uninitialized binding throws ReferenceError.',
      },
      {
        id: 'js-rm-type-conversion',
        phaseId: 'js-basics',
        title: 'Data Types, typeof & Type Coercion',
        roadmapCategory: 'JavaScript Basics / Type Casting',
        description: 'Recognize the 7 primitive types, inspect values with typeof, and tell explicit conversion apart from implicit coercion.',
        keyConcepts: ['7 primitives vs objects', 'typeof (and typeof null)', 'Explicit: Number(), String(), Boolean()', 'Implicit coercion with + and -'],
        unitId: 'js-unit-2',
        lessonIds: ['js-lesson-2-2', 'js-lesson-2-3'],
        importance: 'essential',
        icon: 'shuffle',
        antiBlindQuestion:
          'Why does "5" + 3 produce "53" while "5" - 3 produces 2? How would you write the code so the intent is obvious?',
        sampleAnswerHint:
          'The + operator also means string concatenation, so if either side is a string the other is converted to a string. The - operator only works on numbers, so "5" is converted to 5. Converting explicitly with Number("5") + 3 states the intent and avoids relying on coercion rules.',
      },
    ],
  },

  // ================= PHASE 2: CONTROL FLOW, EQUALITY & ERRORS =================
  {
    id: 'js-control-flow',
    phaseNumber: 2,
    title: 'Control Flow, Equality & Errors',
    subtitle: 'Comparisons, Loops & try/catch',
    description: 'Compare values safely, repeat work with the right loop, and handle failures with throw and try/catch/finally.',
    roadmapShUrl: 'https://roadmap.sh/javascript',
    badge: 'Flow Controller',
    color: 'orange',
    accentBg: 'bg-orange-500/10',
    borderClass: 'border-orange-400/40',
    nodes: [
      {
        id: 'js-rm-types-equality',
        phaseId: 'js-control-flow',
        title: 'Equality: ==, === & Object.is()',
        roadmapCategory: 'JavaScript Basics / Types & Operators',
        description: 'Prevent implicit coercion bugs with strict equality and handle the NaN and -0 edge cases with Object.is().',
        keyConcepts: ['7 Primitives vs Objects', 'Type Coercion', 'Strict Equality (===)', 'NaN vs Object.is()'],
        unitId: 'js-unit-3',
        lessonIds: ['js-lesson-3-1'],
        importance: 'essential',
        icon: 'git-branch',
        antiBlindQuestion:
          'Why does [] == false evaluate to true in JavaScript, while Boolean([]) evaluates to true? Why does strict equality (===) prevent this?',
        sampleAnswerHint:
          'With loose equality (==), JS applies abstract equality coercion algorithms: [] is converted to primitive string "" then to number 0, and false is coerced to number 0 (0 == 0 is true!). But in boolean context, any object/array is truthy. Strict equality (===) checks both type and value without coercion, immediately returning false.',
      },
      {
        id: 'js-rm-loops',
        phaseId: 'js-control-flow',
        title: 'Loops: for, while, for...of & for...in',
        roadmapCategory: 'Control Flow / Loops and Iterations',
        description: 'Choose the right loop for arrays, objects and conditions, and steer it with break and continue.',
        keyConcepts: ['for / while / do...while', 'for...of (values)', 'for...in (keys)', 'break & continue'],
        unitId: 'js-unit-3',
        lessonIds: ['js-lesson-3-3'],
        importance: 'essential',
        icon: 'repeat',
        antiBlindQuestion:
          'What is the difference between "for...of" and "for...in" when looping over an array, and why is for...in a poor choice for arrays?',
        sampleAnswerHint:
          'for...of iterates over the values of any iterable (arrays, strings, Maps, Sets). for...in iterates over enumerable property keys as strings, including inherited ones, so on an array it gives "0", "1", ... and can pick up extra properties. Use for...of for array values and for...in (or Object.keys) for object keys.',
      },
      {
        id: 'js-rm-error-handling',
        phaseId: 'js-control-flow',
        title: 'Exceptions: throw, try/catch/finally & Error Objects',
        roadmapCategory: 'Control Flow / Exception Handling',
        description: 'Signal failures with throw new Error(), recover with try/catch, and guarantee cleanup with finally.',
        keyConcepts: ['throw new Error()', 'try / catch / finally', 'Error name, message & stack', 'Custom error classes'],
        unitId: 'js-unit-3',
        lessonIds: ['js-lesson-3-4'],
        importance: 'essential',
        icon: 'alert-triangle',
        antiBlindQuestion:
          'Why should you "throw new Error(message)" instead of "throw message", and when does a finally block run?',
        sampleAnswerHint:
          'An Error object carries a name, message and stack trace, so the catch block and logs can show where the failure happened; a thrown string has none of that. finally runs after try/catch on every path: normal completion, a caught error, or even a return inside try.',
      },
    ],
  },

  // ================= PHASE 3: DATA STRUCTURES & MODERN ES6+ =================
  {
    id: 'js-data-structures',
    phaseNumber: 3,
    title: 'Data Structures & Modern ES6+',
    subtitle: 'Arrays, Objects, Map, Set & JSON',
    description: 'Master higher-order array methods, destructuring and spread, keyed collections, and JSON serialization.',
    roadmapShUrl: 'https://roadmap.sh/javascript',
    badge: 'Structure Artisan',
    color: 'yellow',
    accentBg: 'bg-yellow-500/10',
    borderClass: 'border-yellow-400/40',
    nodes: [
      {
        id: 'js-rm-array-methods',
        phaseId: 'js-data-structures',
        title: 'Array Transformations: map, filter & reduce',
        roadmapCategory: 'Data Structures / Array Methods',
        description: 'Transform, prune, and accumulate array data without mutating the original source array.',
        keyConcepts: ['map() (1-to-1)', 'filter() (subset)', 'reduce() (accumulator)', 'Immutability'],
        unitId: 'js-unit-4',
        lessonIds: ['js-lesson-4-1'],
        importance: 'essential',
        icon: 'layers',
        antiBlindQuestion:
          'Why is reduce() considered the universal higher-order array method, and how can you reconstruct both map() and filter() using only reduce()?',
        sampleAnswerHint:
          'reduce() takes an accumulator and current element, producing an arbitrary single value (which can be a number, object, or new array). To implement map, you reduce with an initial empty array, pushing transformed elements. To implement filter, you conditionally push elements that pass the predicate.',
      },
      {
        id: 'js-rm-destructuring-spread',
        phaseId: 'js-data-structures',
        title: 'Destructuring, Spread (...) & Shallow vs Deep Copy',
        roadmapCategory: 'Data Structures / Object Patterns',
        description: 'Extract properties cleanly and understand why spread ({...obj}) only copies one level deep.',
        keyConcepts: ['Object destructuring', 'Rest/Spread operator', 'Shallow copy limitations', 'structuredClone()'],
        unitId: 'js-unit-4',
        lessonIds: ['js-lesson-4-2'],
        importance: 'essential',
        icon: 'split',
        antiBlindQuestion:
          'If you clone an object using the spread operator "const clone = { ...original };", what happens if you mutate a nested property like "clone.user.name = \'Alice\'"? How does structuredClone() fix this?',
        sampleAnswerHint:
          'The spread operator creates a shallow copy: top-level primitive values are duplicated, but nested objects/arrays are copied by memory reference! Mutating clone.user.name will also mutate original.user.name. structuredClone() performs a recursive deep copy, ensuring zero shared references.',
      },
      {
        id: 'js-rm-map-set-json',
        phaseId: 'js-data-structures',
        title: 'Map, Set, WeakMap & JSON',
        roadmapCategory: 'Data Structures / Keyed Collections & Structured Data',
        description: 'Use Map for any-type keys, Set for unique values, and JSON.stringify/parse to serialize data.',
        keyConcepts: ['Map vs plain object', 'Set for uniqueness', 'WeakMap & WeakSet', 'JSON.stringify / JSON.parse'],
        unitId: 'js-unit-4',
        lessonIds: ['js-lesson-4-3'],
        importance: 'essential',
        icon: 'database',
        antiBlindQuestion:
          'When would you choose a Map over a plain object, and what data is lost when you call JSON.stringify() on an object?',
        sampleAnswerHint:
          'A Map accepts keys of any type (objects, numbers), keeps insertion order, has a size property and no inherited keys. JSON.stringify drops functions, undefined values and symbols, turns Dates into strings, and cannot represent Maps, Sets or circular references.',
      },
    ],
  },

  // ================= PHASE 4: FUNCTIONS, SCOPE & CLOSURES =================
  {
    id: 'js-functions-closures',
    phaseNumber: 4,
    title: 'Functions, Scope & Closures',
    subtitle: 'Parameters, Closures, Arrows & this',
    description: 'Write flexible functions, understand how closures remember their scope, and control what "this" refers to.',
    roadmapShUrl: 'https://roadmap.sh/javascript',
    badge: 'Closure Master',
    color: 'teal',
    accentBg: 'bg-teal-500/10',
    borderClass: 'border-teal-400/40',
    nodes: [
      {
        id: 'js-rm-closures-encapsulation',
        phaseId: 'js-functions-closures',
        title: 'Closures & Private State Encapsulation',
        roadmapCategory: 'Functions & Scope / Closures',
        description: 'Learn how inner functions maintain a reference to their outer lexical environment to create private state.',
        keyConcepts: ['Lexical Environment', 'Scope Chain', 'Private Variables', 'Function Factories'],
        unitId: 'js-unit-5',
        lessonIds: ['js-lesson-5-1'],
        importance: 'essential',
        icon: 'key',
        antiBlindQuestion:
          'Explain what a closure is in JavaScript in your own words. Why does an inner function still have access to the outer function\'s local variables even after the outer function has returned and popped off the call stack?',
        sampleAnswerHint:
          'A closure is the combination of a function bundled together with references to its surrounding lexical environment. Even when the outer function returns, the inner function retains a live reference pointer [[Environment]] to that scope on the heap, preventing garbage collection and allowing state encapsulation.',
      },
      {
        id: 'js-rm-arrow-vs-regular',
        phaseId: 'js-functions-closures',
        title: 'Arrow Functions vs Traditional Functions (this)',
        roadmapCategory: 'Functions & Scope / Arrow Functions',
        description: 'Understand lexical this binding, constructor capabilities, and arguments object differences.',
        keyConcepts: ['Lexical this', 'arguments keyword', 'Constructor functions (new)', 'Implicit return'],
        unitId: 'js-unit-3',
        lessonIds: ['js-lesson-3-2'],
        importance: 'essential',
        icon: 'sparkles',
        antiBlindQuestion:
          'How does the "this" keyword behave differently inside an arrow function compared to a standard function declaration? Why can arrow functions NOT be used as constructors with "new"?',
        sampleAnswerHint:
          'Traditional functions bind "this" dynamically based on HOW they are called at runtime (caller binding). Arrow functions do NOT have their own "this"; they inherit "this" lexically from their enclosing scope. Furthermore, arrow functions lack internal [[Construct]] methods and prototype properties, so calling new on them throws a TypeError.',
      },
      {
        id: 'js-rm-function-params',
        phaseId: 'js-functions-closures',
        title: 'Default Params, Rest, IIFEs & Recursion',
        roadmapCategory: 'Functions / Function Parameters & Recursion',
        description: 'Give parameters defaults, collect extra arguments with rest, and solve problems recursively with a base case.',
        keyConcepts: ['Default parameters', 'Rest parameters (...args)', 'arguments object', 'Recursion & base cases'],
        unitId: 'js-unit-5',
        lessonIds: ['js-lesson-5-2'],
        importance: 'essential',
        icon: 'function-square',
        antiBlindQuestion:
          'What happens if a recursive function has no reachable base case, and why are rest parameters preferred over the arguments object?',
        sampleAnswerHint:
          'Without a base case every call adds a new frame to the call stack until the engine throws "RangeError: Maximum call stack size exceeded". Rest parameters give a real array (with map, filter, ...), are explicit in the signature, and work in arrow functions, which have no arguments object.',
      },
      {
        id: 'js-rm-this-binding',
        phaseId: 'js-functions-closures',
        title: 'The this Keyword: call, apply & bind',
        roadmapCategory: 'Functions / Using this Keyword & Explicit Binding',
        description: 'Predict what "this" refers to in methods, plain functions and event handlers, and fix it with call, apply and bind.',
        keyConcepts: ['this in a method', 'this in a plain function (strict mode)', 'call vs apply', 'bind() for callbacks'],
        unitId: 'js-unit-5',
        lessonIds: ['js-lesson-5-3'],
        importance: 'essential',
        icon: 'link',
        antiBlindQuestion:
          'Why does "const read = counter.read; read();" lose access to counter\'s properties, and how does bind() fix it?',
        sampleAnswerHint:
          '"this" is decided by how a function is called, not where it is defined. Calling counter.read() sets this to counter, but calling the detached read() has no receiver, so this is undefined in strict mode. counter.read.bind(counter) returns a new function whose this is permanently counter.',
      },
    ],
  },

  // ================= PHASE 5: PROTOTYPES & OBJECT-ORIENTED JS =================
  {
    id: 'js-oop-prototypes',
    phaseNumber: 5,
    title: 'Prototypes & Object-Oriented JS',
    subtitle: 'Prototypal Inheritance & ES6 Classes',
    description: 'Understand the prototype chain that powers JavaScript objects beneath the ES6 class syntax.',
    roadmapShUrl: 'https://roadmap.sh/javascript',
    badge: 'Prototype Wizard',
    color: 'purple',
    accentBg: 'bg-purple-500/10',
    borderClass: 'border-purple-400/40',
    nodes: [
      {
        id: 'js-rm-prototype-chain',
        phaseId: 'js-oop-prototypes',
        title: 'The Prototype Chain & Object.create()',
        roadmapCategory: 'Object-Oriented JS / Prototypes',
        description: 'Learn how JavaScript walks up the __proto__ chain to resolve inherited methods and properties.',
        keyConcepts: ['prototype vs __proto__', 'Object.getPrototypeOf()', 'Prototypal Inheritance', 'Object.prototype'],
        unitId: 'js-unit-6',
        lessonIds: ['js-lesson-6-2'],
        importance: 'essential',
        icon: 'cpu',
        antiBlindQuestion:
          'What is the difference between a function\'s ".prototype" property and an object instance\'s "__proto__" (internal [[Prototype]])?',
        sampleAnswerHint:
          'A constructor function\'s ".prototype" is the blueprint object that will become the [[Prototype]] of all instances created with "new". The instance\'s "__proto__" is the actual live reference pointing back to that prototype object, which the engine traverses when resolving properties.',
      },
      {
        id: 'js-rm-classes-oop',
        phaseId: 'js-oop-prototypes',
        title: 'ES6 Classes, Inheritance & Private Fields (#)',
        roadmapCategory: 'Object-Oriented JS / Classes',
        description: 'Use modern class syntax, constructor methods, super calls, and hard private fields (#field).',
        keyConcepts: ['class', 'constructor', 'super()', 'extends', 'Private fields (#)'],
        unitId: 'js-unit-6',
        lessonIds: ['js-lesson-6-1'],
        importance: 'essential',
        icon: 'terminal',
        antiBlindQuestion:
          'Is the ES6 "class" syntax a truly new object-oriented inheritance model in JavaScript, or is it syntactic sugar over prototypal inheritance? What does "super()" do in a subclass constructor?',
        sampleAnswerHint:
          'ES6 classes are syntactic sugar over JavaScript\'s existing prototypal inheritance system; under the hood, methods are still attached to ClassName.prototype. In a subclass, "super()" invokes the parent constructor and initializes the "this" context; accessing "this" before calling super() throws a ReferenceError.',
      },
    ],
  },

  // ================= PHASE 6: ASYNCHRONOUS JS & THE EVENT LOOP =================
  {
    id: 'js-async-event-loop',
    phaseNumber: 6,
    title: 'Asynchronous JS & The Event Loop',
    subtitle: 'Timers, Callbacks, Promises & async/await',
    description: 'Master the single-threaded asynchronous runtime: timers, callbacks, the microtask queue, and async/await.',
    roadmapShUrl: 'https://roadmap.sh/javascript',
    badge: 'Async Alchemist',
    color: 'emerald',
    accentBg: 'bg-emerald-500/10',
    borderClass: 'border-emerald-400/40',
    nodes: [
      {
        id: 'js-rm-callbacks-timers',
        phaseId: 'js-async-event-loop',
        title: 'setTimeout, setInterval & Callbacks',
        roadmapCategory: 'Asynchronous JS / Timers & Callbacks',
        description: 'Schedule work with timers, pass callbacks, and recognize the "callback hell" that promises were designed to fix.',
        keyConcepts: ['setTimeout / clearTimeout', 'setInterval / clearInterval', 'Callbacks', 'Callback hell'],
        unitId: 'js-unit-7',
        lessonIds: ['js-lesson-7-2'],
        importance: 'essential',
        icon: 'clock',
        antiBlindQuestion:
          'Does setTimeout(fn, 0) run fn immediately? Explain what actually happens.',
        sampleAnswerHint:
          'No. setTimeout hands the callback to the browser timer and returns at once. After at least the given delay, the callback joins the task queue, and the event loop only runs it once the call stack is empty and all microtasks have finished, so synchronous code after setTimeout always runs first.',
      },
      {
        id: 'js-rm-event-loop',
        phaseId: 'js-async-event-loop',
        title: 'The Event Loop: Microtasks vs Macrotasks',
        roadmapCategory: 'Asynchronous JS / Event Loop',
        description: 'Understand execution order between synchronous code, Promise microtasks, and setTimeout macrotasks.',
        keyConcepts: ['Call Stack', 'Microtask Queue (Promises)', 'Task Queue (setTimeout)', 'Event Loop Tick'],
        unitId: 'js-unit-7',
        lessonIds: ['js-lesson-7-1'],
        importance: 'essential',
        icon: 'refresh-cw',
        antiBlindQuestion:
          'Consider this code:\nconsole.log(1);\nsetTimeout(() => console.log(2), 0);\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);\nWhat is the exact console output order and why?',
        sampleAnswerHint:
          'Output is: 1, 4, 3, 2. Synchronous code runs first on the Call Stack (1, 4). Then, the Event Loop checks the Microtask Queue (Promise.then) and executes it before moving to the Macrotask Queue, logging 3. Finally, the setTimeout callback is picked from the Macrotask Queue, logging 2.',
      },
      {
        id: 'js-rm-async-await-errors',
        phaseId: 'js-async-event-loop',
        title: 'async/await, Promise Combinators & try/catch',
        roadmapCategory: 'Asynchronous JS / Promises & async/await',
        description: 'Write clean asynchronous code with async/await, handle errors with try/catch, and coordinate parallel requests with Promise.all().',
        keyConcepts: ['async / await', 'Promise.all vs Promise.allSettled', 'try / catch / finally', 'Error handling'],
        unitId: 'js-unit-7',
        lessonIds: ['js-lesson-7-3'],
        importance: 'essential',
        icon: 'trending-up',
        antiBlindQuestion:
          'What happens if ONE request fails inside "Promise.all([req1, req2, req3])" versus "Promise.allSettled()"? When should you use which?',
        sampleAnswerHint:
          'Promise.all is "all-or-nothing": if a single promise rejects, the entire aggregate immediately rejects and ignores the other results. Promise.allSettled waits for all promises to finish regardless of success/failure, returning an array of objects with status ("fulfilled" or "rejected"), making it ideal for independent operations.',
      },
    ],
  },

  // ================= PHASE 7: DOM MANIPULATION & WEB APIS =================
  {
    id: 'js-dom-apis',
    phaseNumber: 7,
    title: 'DOM Manipulation & Web APIs',
    subtitle: 'Event Bubbling, Delegation & fetch()',
    description: 'Interact with the browser DOM, handle user events with delegation, and talk to backend APIs.',
    roadmapShUrl: 'https://roadmap.sh/javascript',
    badge: 'DOM Commander',
    color: 'cyan',
    accentBg: 'bg-cyan-500/10',
    borderClass: 'border-cyan-400/40',
    nodes: [
      {
        id: 'js-rm-event-delegation',
        phaseId: 'js-dom-apis',
        title: 'Event Bubbling, Capturing & Delegation',
        roadmapCategory: 'Web APIs / Event Propagation',
        description: 'Leverage event propagation through the DOM to handle dynamic list items with a single listener.',
        keyConcepts: ['Event Bubbling', 'Event Capturing', 'event.target vs event.currentTarget', 'Event Delegation'],
        unitId: 'js-unit-8',
        lessonIds: ['js-lesson-8-2'],
        importance: 'essential',
        icon: 'globe',
        antiBlindQuestion:
          'What is Event Delegation in JavaScript, and why is attaching a single listener to a parent <ul> better than attaching 1,000 listeners to individual <li> elements?',
        sampleAnswerHint:
          'Event Delegation relies on event bubbling: when an event occurs on a child, it propagates up through ancestors. Instead of allocating memory for 1,000 separate listeners, you attach one listener to the parent <ul> and check event.target to identify which child was clicked. It also automatically handles newly added dynamic items!',
      },
      {
        id: 'js-rm-fetch-storage',
        phaseId: 'js-dom-apis',
        title: 'fetch() API, Response Parsing & localStorage',
        roadmapCategory: 'Web APIs / Networking & Storage',
        description: 'Send HTTP requests, parse JSON responses, handle network failures, and persist state across page reloads.',
        keyConcepts: ['fetch(url, options)', 'response.ok & response.json()', 'localStorage vs sessionStorage', 'AbortController'],
        unitId: 'js-unit-8',
        lessonIds: ['js-lesson-8-3'],
        importance: 'essential',
        icon: 'terminal',
        antiBlindQuestion:
          'Why does fetch() NOT reject a promise when the server returns an HTTP 404 Not Found or 500 Internal Server Error status?',
        sampleAnswerHint:
          'fetch() only rejects a promise on network failures (e.g. DNS failure, no internet connection, or request aborted). An HTTP 404 or 500 is still considered a successful HTTP communication cycle. To catch HTTP error codes, you must explicitly check if (!response.ok) and throw an error.',
      },
    ],
  },

  // ================= PHASE 8: MODERN SYNTAX & MODULES =================
  {
    id: 'js-modern-modules',
    phaseNumber: 8,
    title: 'Modern Syntax & Modules',
    subtitle: 'Optional Chaining, Nullish Coalescing & ES Modules',
    description: 'Write defensive modern JavaScript with ?. and ??, and split code into modules with import and export.',
    roadmapShUrl: 'https://roadmap.sh/javascript',
    badge: 'Modern Syntax Pro',
    color: 'rose',
    accentBg: 'bg-rose-500/10',
    borderClass: 'border-rose-400/40',
    nodes: [
      {
        id: 'js-rm-optional-nullish',
        phaseId: 'js-modern-modules',
        title: 'Optional Chaining (?.) & Nullish Coalescing (??)',
        roadmapCategory: 'Modern JavaScript / Operators',
        description: 'Safely access deeply nested object properties and distinguish false/0 from null/undefined.',
        keyConcepts: ['user?.profile?.avatar', '?? vs ||', 'Short-circuiting', 'Falsy vs Nullish'],
        unitId: 'js-unit-8',
        lessonIds: ['js-lesson-8-1'],
        importance: 'essential',
        icon: 'sliders',
        antiBlindQuestion:
          'Explain why "count ?? 10" is safer than "count || 10" when "count" is a valid quantity equal to 0.',
        sampleAnswerHint:
          'The logical OR (||) operator triggers on any falsy value (false, 0, "", null, undefined, NaN). If count is 0, count || 10 incorrectly overwrites it with 10. The nullish coalescing operator (??) ONLY triggers if the value is strictly null or undefined, preserving valid numbers like 0 or boolean false.',
      },
      {
        id: 'js-rm-modules-esm',
        phaseId: 'js-modern-modules',
        title: 'ES Modules vs CommonJS',
        roadmapCategory: 'Modules in JavaScript / ESM & CommonJS',
        description: 'Share code between files with named and default exports, and know how ES modules differ from require().',
        keyConcepts: ['export / import', 'Named vs default exports', 'CommonJS require()', 'Static imports & tree-shaking'],
        unitId: 'js-unit-8',
        lessonIds: ['js-lesson-8-4'],
        importance: 'essential',
        icon: 'package',
        antiBlindQuestion:
          'What is the practical difference between ES module "import" and CommonJS "require()", and why does it matter for bundle size?',
        sampleAnswerHint:
          'ES module imports are static declarations resolved before the code runs, so tools can see exactly what is used and drop the rest (tree-shaking). require() is an ordinary function call evaluated at runtime, can be conditional, and returns the whole module.exports object, so bundlers cannot safely remove unused code.',
      },
    ],
  },

  // ================= PHASE 9: ADVANCED PERFORMANCE & PATTERNS =================
  {
    id: 'js-advanced-patterns',
    phaseNumber: 9,
    title: 'Advanced Performance & Patterns',
    subtitle: 'Generators, Debounce, Throttle & Memory',
    description: 'Produce values lazily, tame high-frequency events, and keep memory from leaking in long-running apps.',
    roadmapShUrl: 'https://roadmap.sh/javascript',
    badge: 'Senior Architect',
    color: 'violet',
    accentBg: 'bg-violet-500/10',
    borderClass: 'border-violet-400/40',
    nodes: [
      {
        id: 'js-rm-iterators-generators',
        phaseId: 'js-advanced-patterns',
        title: 'Iterators & Generators',
        roadmapCategory: 'Iterators and Generators',
        description: 'Make objects iterable with Symbol.iterator and produce values lazily with function* and yield.',
        keyConcepts: ['Iteration protocol', 'Symbol.iterator', 'function* & yield', 'Lazy sequences'],
        unitId: 'js-unit-9',
        lessonIds: ['js-lesson-9-1'],
        importance: 'recommended',
        icon: 'list',
        antiBlindQuestion:
          'What does calling a generator function return, and why can a generator describe an infinite sequence without running out of memory?',
        sampleAnswerHint:
          'Calling a generator function runs none of its body; it returns an iterator. Each next() call resumes until the next yield and pauses again, keeping local state. Values are produced one at a time on demand, so an infinite while(true) generator only ever holds the current value.',
      },
      {
        id: 'js-rm-debounce-throttle',
        phaseId: 'js-advanced-patterns',
        title: 'Debounce vs Throttle & Performance',
        roadmapCategory: 'Advanced Patterns / Optimization',
        description: 'Limit rapid execution of scroll, resize, and search input handlers.',
        keyConcepts: ['Debounce (waits for silence)', 'Throttle (guarantees interval)', 'requestAnimationFrame', 'Memory leak prevention'],
        unitId: 'js-unit-9',
        lessonIds: ['js-lesson-9-2'],
        importance: 'recommended',
        icon: 'zap',
        antiBlindQuestion:
          'What is the real-world difference between Debounce and Throttle? In which scenarios would you choose a debounce over a throttle?',
        sampleAnswerHint:
          'Debounce delays function execution until a specified delay has passed since the LAST event fired (ideal for search autocomplete where you wait for the user to stop typing). Throttle guarantees execution at regular periodic intervals regardless of event frequency (ideal for window scroll or resize events where continuous UI updates are required).',
      },
      {
        id: 'js-rm-memory-gc',
        phaseId: 'js-advanced-patterns',
        title: 'Memory Management & Garbage Collection',
        roadmapCategory: 'Memory Management / Garbage Collection',
        description: 'Understand reachability-based garbage collection and find the listeners, timers and caches that leak memory.',
        keyConcepts: ['Memory lifecycle', 'Reachability & mark-and-sweep', 'Common leaks (listeners, timers)', 'DevTools memory profiling'],
        unitId: 'js-unit-9',
        lessonIds: ['js-lesson-9-3'],
        importance: 'recommended',
        icon: 'cpu',
        antiBlindQuestion:
          'JavaScript has automatic garbage collection, so how can a web app still leak memory? Give a concrete example.',
        sampleAnswerHint:
          'The garbage collector frees only objects that are unreachable from roots like globals and the call stack. A listener added to window that closes over a big array keeps that array reachable forever unless removeEventListener is called; uncleared setInterval callbacks and ever-growing caches leak the same way.',
      },
    ],
  },
];

export function getAllJsRoadmapNodes(): RoadmapNode[] {
  return JS_ROADMAP_PHASES.flatMap((p) => p.nodes);
}

export function getJsRoadmapNodeById(id: string): RoadmapNode | undefined {
  return getAllJsRoadmapNodes().find((n) => n.id === id);
}
