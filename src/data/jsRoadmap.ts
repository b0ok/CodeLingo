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
    essentialPhases: ['js-basics', 'js-data-structures', 'js-functions-closures', 'js-async-event-loop', 'js-dom-apis', 'js-modern-modules'],
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
    essentialPhases: ['js-basics', 'js-data-structures', 'js-functions-closures', 'js-oop-prototypes', 'js-async-event-loop', 'js-modern-modules', 'js-advanced-patterns'],
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
    essentialPhases: ['js-basics', 'js-functions-closures', 'js-oop-prototypes', 'js-async-event-loop', 'js-modern-modules', 'js-advanced-patterns'],
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
    essentialPhases: ['js-basics', 'js-data-structures', 'js-async-event-loop', 'js-modern-modules'],
    keyTools: ['AWS Lambda', 'Cloudflare Workers', 'GraphQL', 'Terraform'],
    recommendedDailyMinutes: 20,
  },
];

export const JS_ROADMAP_PHASES: RoadmapPhase[] = [
  // ================= PHASE 1: JAVASCRIPT BASICS & SCOPE =================
  {
    id: 'js-basics',
    phaseNumber: 1,
    title: 'JavaScript Basics & Variable Scoping',
    subtitle: 'let vs const vs var, Hoisting & TDZ',
    description: 'Learn memory bindings, block scoping, data types, and strict equality (===) without type coercion surprises.',
    roadmapShUrl: 'https://roadmap.sh/javascript',
    badge: 'Scope Navigator',
    color: 'amber',
    accentBg: 'bg-amber-500/10',
    borderClass: 'border-amber-400/40',
    nodes: [
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
        id: 'js-rm-types-equality',
        phaseId: 'js-basics',
        title: 'Data Types, Primitives vs References & ===',
        roadmapCategory: 'JavaScript Basics / Types & Operators',
        description: 'Distinguish stack-allocated primitives from heap-allocated objects, and prevent implicit type coercion bugs.',
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
    ],
  },

  // ================= PHASE 2: DATA STRUCTURES & MODERN ES6+ =================
  {
    id: 'js-data-structures',
    phaseNumber: 2,
    title: 'Data Structures & Modern ES6+',
    subtitle: 'Arrays, Objects, Destructuring & Rest/Spread',
    description: 'Master higher-order array methods (map, filter, reduce), object destructuring, and immutable data handling.',
    roadmapShUrl: 'https://roadmap.sh/javascript',
    badge: 'Structure Artisan',
    color: 'orange',
    accentBg: 'bg-orange-500/10',
    borderClass: 'border-orange-400/40',
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
    ],
  },

  // ================= PHASE 3: FUNCTIONS, SCOPE & CLOSURES =================
  {
    id: 'js-functions-closures',
    phaseNumber: 3,
    title: 'Functions, Scope & Closures',
    subtitle: 'Lexical Environments & Data Encapsulation',
    description: 'Demystify how functions remember their outer variable scope even after the outer function has finished executing.',
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
    ],
  },

  // ================= PHASE 4: OBJECT-ORIENTED JS & PROTOTYPES =================
  {
    id: 'js-oop-prototypes',
    phaseNumber: 4,
    title: 'Prototypes & Object-Oriented JS',
    subtitle: 'Prototypal Inheritance, ES6 Classes & this Binding',
    description: 'Understand the underlying prototype chain that powers JavaScript objects beneath the ES6 class syntax sugar.',
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
        lessonIds: ['js-lesson-6-1'],
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

  // ================= PHASE 5: ASYNC JAVASCRIPT & THE EVENT LOOP =================
  {
    id: 'js-async-event-loop',
    phaseNumber: 5,
    title: 'Asynchronous JS & The Event Loop',
    subtitle: 'Call Stack, Microtasks, Promises & async/await',
    description: 'Master the single-threaded asynchronous runtime: Call Stack, Web APIs, Microtask Queue, and async/await.',
    roadmapShUrl: 'https://roadmap.sh/javascript',
    badge: 'Async Alchemist',
    color: 'emerald',
    accentBg: 'bg-emerald-500/10',
    borderClass: 'border-emerald-400/40',
    nodes: [
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
        lessonIds: ['js-lesson-7-1'],
        importance: 'essential',
        icon: 'trending-up',
        antiBlindQuestion:
          'What happens if ONE request fails inside "Promise.all([req1, req2, req3])" versus "Promise.allSettled()"? When should you use which?',
        sampleAnswerHint:
          'Promise.all is "all-or-nothing": if a single promise rejects, the entire aggregate immediately rejects and ignores the other results. Promise.allSettled waits for all promises to finish regardless of success/failure, returning an array of objects with status ("fulfilled" or "rejected"), making it ideal for independent operations.',
      },
    ],
  },

  // ================= PHASE 6: DOM MANIPULATION & WEB APIS =================
  {
    id: 'js-dom-apis',
    phaseNumber: 6,
    title: 'DOM Manipulation & Web APIs',
    subtitle: 'Event Bubbling, Delegation & fetch()',
    description: 'Interact with the living browser DOM, handle user events with delegation, and communicate with backend REST APIs.',
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
        lessonIds: ['js-lesson-8-1'],
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
        lessonIds: ['js-lesson-8-1'],
        importance: 'essential',
        icon: 'terminal',
        antiBlindQuestion:
          'Why does fetch() NOT reject a promise when the server returns an HTTP 404 Not Found or 500 Internal Server Error status?',
        sampleAnswerHint:
          'fetch() only rejects a promise on network failures (e.g. DNS failure, no internet connection, or request aborted). An HTTP 404 or 500 is still considered a successful HTTP communication cycle. To catch HTTP error codes, you must explicitly check if (!response.ok) and throw an error.',
      },
    ],
  },

  // ================= PHASE 7: MODERN ES6+ & MODULES =================
  {
    id: 'js-modern-modules',
    phaseNumber: 7,
    title: 'Modern ES6+ Syntax & Modules',
    subtitle: 'Optional Chaining, Nullish Coalescing & Imports',
    description: 'Write bulletproof modern JavaScript with safe property traversal (?.) and defensive null handling (??).',
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
    ],
  },

  // ================= PHASE 8: PERFORMANCE & ADVANCED PATTERNS =================
  {
    id: 'js-advanced-patterns',
    phaseNumber: 8,
    title: 'Advanced Performance & Patterns',
    subtitle: 'Debounce, Throttle, Memory Leaks & Garbage Collection',
    description: 'Optimize high-frequency event handlers, avoid memory leaks, and master senior engineering patterns.',
    roadmapShUrl: 'https://roadmap.sh/javascript',
    badge: 'Senior Architect',
    color: 'violet',
    accentBg: 'bg-violet-500/10',
    borderClass: 'border-violet-400/40',
    nodes: [
      {
        id: 'js-rm-debounce-throttle',
        phaseId: 'js-advanced-patterns',
        title: 'Debounce vs Throttle & Performance',
        roadmapCategory: 'Advanced Patterns / Optimization',
        description: 'Limit rapid execution of scroll, resize, and search input handlers.',
        keyConcepts: ['Debounce (waits for silence)', 'Throttle (guarantees interval)', 'requestAnimationFrame', 'Memory leak prevention'],
        unitId: 'js-unit-8',
        lessonIds: ['js-lesson-8-1'],
        importance: 'recommended',
        icon: 'zap',
        antiBlindQuestion:
          'What is the real-world difference between Debounce and Throttle? In which scenarios would you choose a debounce over a throttle?',
        sampleAnswerHint:
          'Debounce delays function execution until a specified delay has passed since the LAST event fired (ideal for search autocomplete where you wait for the user to stop typing). Throttle guarantees execution at regular periodic intervals regardless of event frequency (ideal for window scroll or resize events where continuous UI updates are required).',
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
