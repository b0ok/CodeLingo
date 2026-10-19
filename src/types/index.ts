export type ChallengeType = 
  | 'token_fill'       // Tap tokens from word bank to fill in blanks
  | 'parsons'          // Arrange code lines in correct logical order & indentation
  | 'predict_output'   // Multiple choice predicting Python stdout
  | 'spot_bug'         // Tap the buggy code line or pick the fix
  | 'code_runner'      // Live interactive coding with automated test cases
  | 'concept_quiz'     // Quick concept comprehension check
  | 'matching';        // Pair each term on the left with its match on the right

export interface ParsonsLine {
  id: string;
  text: string;
  indent: number; // 0, 1, 2 for indentation level
}

export interface TestCase {
  name: string;
  input?: string;
  expectedOutput: string;
  contains?: boolean; // pass if output includes expectedOutput (default: whole output must match)
}

// One requirement for an HTML/CSS code_runner challenge, checked against the rendered page.
// Every element matching `selector` must satisfy the listed computed styles, attributes and text.
export interface WebCheck {
  label: string; // shown to the student, e.g. "The nav uses display: flex"
  selector: string;
  count?: number; // exact number of matches (default: at least one)
  style?: Record<string, string>; // computed values, e.g. { display: 'flex', 'padding-top': '16px' }
  attr?: Record<string, string>; // '' means the attribute only has to exist
  text?: string; // trimmed textContent must include this
}

export interface Challenge {
  id: string;
  type: ChallengeType;
  title: string;
  instruction: string;
  
  // For token_fill
  codeTemplate?: string; // e.g. "print(__BLANK_0__('Hello, Python!'))" or similar
  blankCount?: number;
  tokens?: string[];
  correctTokens?: string[]; // strings matching blanks in order
  
  // For parsons
  parsonsLines?: ParsonsLine[];
  correctParsonsOrder?: string[]; // line IDs in correct order
  
  // For predict_output & concept_quiz
  codeSnippet?: string;
  options?: {
    id: string;
    text: string;
    isCode?: boolean;
    explanation?: string;
  }[];
  correctOptionId?: string;

  // For matching (shown left column in order, right column shuffled)
  matchPairs?: { left: string; right: string }[];

  // For spot_bug
  buggyCodeLines?: string[];
  buggyLineIndex?: number; // 0-indexed
  bugExplanation?: string;

  // For code_runner
  starterCode?: string;
  solutionHint?: string;
  testCases?: TestCase[];
  webChecks?: WebCheck[]; // used instead of testCases for HTML/CSS challenges

  hint: string;
  explanation: string;
}

export interface LessonNode {
  id: string;
  unitId: string;
  unitNumber: number;
  indexInUnit: number;
  title: string;
  description: string;
  conceptTag: string;
  icon: string;
  xpReward: number;
  gemReward: number;
  challenges: Challenge[];
}

export type LanguageId = 'python' | 'javascript' | 'web' | 'sql';

export interface LanguagePathway {
  id: LanguageId;
  name: string;
  tagline: string;
  icon: string;
  badge: string;
  accentColor: string;
  units: Unit[];
}

export interface Unit {
  id: string;
  unitNumber: number;
  title: string;
  subtitle: string;
  badgeName: string;
  themeColor: string; // Tailwind hex or class color
  accentBorder: string;
  nodes: LessonNode[];
}

export type LeagueTier = 'Bronze' | 'Silver' | 'Gold' | 'Sapphire' | 'Ruby' | 'Diamond' | 'Legend';

export interface LeaderboardEntry {
  id: string;
  name: string;
  username: string;
  avatarSeed: string;
  xp: number;
  streak: number;
  league: LeagueTier;
  isUser: boolean;
  rankChange: 'up' | 'down' | 'same';
  cheerCount: number;
}

export interface Badge {
  id: string;
  name: string;
  category: 'syntax' | 'logic' | 'loops' | 'collections' | 'functions' | 'streaks' | 'special';
  tier: 'bronze' | 'silver' | 'gold';
  description: string;
  requirement: string;
  currentProgress: number;
  maxProgress: number;
  isUnlocked: boolean;
  unlockedDate?: string;
  iconType: string;
}

export interface DailyQuest {
  id: string;
  title: string;
  target: number;
  current: number;
  rewardGems: number;
  rewardXp: number;
  isCompleted: boolean;
  isClaimed: boolean;
  unitLabel: string;
}

export type SubscriptionTier = 'free' | 'novice' | 'pro';

export type ChallengeGameMode = 'regular' | 'novice' | 'cook'; // 'regular' is open-book/no-timer, 'novice' is soft timer with 1 hint, 'cook' is LET ME COOK hardcore terminal

export interface ScheduledChallenge {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Legendary';
  language: LanguageId;
  description: string;
  prompt: string;
  starterCode: string;
  expectedOutput: string;
  testCases: TestCase[];
  hints: string[];
  cleanlinessStandard: string;
  xpReward: number;
  gemReward: number;
  timeLimitSec: number;
}

export interface CookEvaluation {
  runtimeMs: number;
  linesCount: number;
  cleanlinessScore: number;
  efficiencyRating: 'S' | 'A' | 'B' | 'C';
  feedback: string[];
  passed: boolean;
}

export interface ReminderNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'streak' | 'quest' | 'high_five' | 'cook';
}

export interface UserStats {
  xp: number;
  gems: number;
  streak: number;
  highestStreak: number;
  hearts: number;
  maxHearts: number;
  streakFreeze: number;
  completedLessons: string[]; // lesson ids
  nodeStars: Record<string, number>; // lessonId -> 1, 2, 3 stars
  lastActiveDate: string; // YYYY-MM-DD
  history: Record<string, number>; // date -> xp
  currentLeague: LeagueTier;
  leagueWeeklyXp: number;
  unlockedBadgeIds: string[];
  dailyGoalTarget: number; // Configurable daily XP target (e.g. 20, 50, 100, 150)
  activeLanguage: LanguageId; // Currently selected pathway (python, javascript, web, sql)
  theme: 'emerald' | 'cyan' | 'amber' | 'indigo';
  soundEnabled: boolean;
  subscriptionTier: SubscriptionTier;
  notificationsEnabled: boolean;
  dailyRoutineTime: string; // e.g. '20:00'
  receivedHighFives: number;
  sentHighFives: number;
  completedChallenges: string[];
  inactivityIntervalSec?: number; // e.g. 30, 60, 120, 300, 900
  inactivityAlertsEnabled?: boolean;
  targetCareerTrack?: 
    | 'web-backend' 
    | 'ai-ml' 
    | 'data-analysis' 
    | 'automation' 
    | 'foundations'
    | 'frontend-dev'
    | 'ui-engineer'
    | 'accessibility-specialist'
    | 'fullstack-web'
    | 'js-fullstack-ts'
    | 'js-react-frontend'
    | 'js-node-backend'
    | 'js-cloud-serverless'
    | 'sql-data-analyst'
    | 'sql-backend-dev'
    | 'sql-data-engineer'
    | 'sql-dba';
  checkedInNodes?: string[]; // Node IDs verified through Agent check-in
  learningLanguages?: LanguageId[]; // every course picked in onboarding; the first is where they start
  agentCheckinsCount?: number;
}

export type RoadmapPhaseId =
  // Python phases
  | 'foundations'
  | 'control-flow'
  | 'data-structures'
  | 'functions'
  | 'modules'
  | 'oop'
  | 'files-exceptions'
  | 'advanced'
  // HTML & CSS Web phases
  | 'html-basics'
  | 'css-foundations'
  | 'box-model'
  | 'semantic-html'
  | 'flexbox'
  | 'css-grid'
  | 'forms-a11y'
  | 'responsive-modern'
  // JavaScript phases
  | 'js-basics'
  | 'js-control-flow'
  | 'js-data-structures'
  | 'js-functions-closures'
  | 'js-oop-prototypes'
  | 'js-async-event-loop'
  | 'js-dom-apis'
  | 'js-modern-modules'
  | 'js-advanced-patterns'
  // SQL phases
  | 'sql-basics'
  | 'sql-ddl-constraints'
  | 'sql-dml'
  | 'sql-aggregates'
  | 'sql-joins'
  | 'sql-subqueries-functions'
  | 'sql-views-indexes-transactions'
  | 'sql-advanced-performance';

export interface RoadmapNode {
  id: string;
  phaseId: RoadmapPhaseId;
  title: string;
  roadmapCategory: string; // roadmap.sh category
  description: string;
  keyConcepts: string[];
  unitId: string;
  lessonIds: string[];
  importance: 'essential' | 'recommended' | 'optional';
  icon: string;
  antiBlindQuestion: string; // Socratic / Feynman prompt to verify actual understanding
  sampleAnswerHint: string;
}

export interface AgentCheckinEvaluation {
  score: number; // 0 - 100
  rating: 'Mastered' | 'Solid Understanding' | 'Blind Spots Detected' | 'Needs Practice';
  whatNailed: string;
  blindSpots: string[];
  actionableTip: string;
  socraticFollowup: string;
  recommendedNextStep: string;
  pytoMood: 'proud' | 'celebrating' | 'thinking' | 'encouraging';
}

export interface AgentCheckinSession {
  id: string;
  timestamp: string;
  nodeId: string;
  topicTitle: string;
  mode: 'feynman' | 'diagnostic' | 'goal-alignment';
  userText: string;
  evaluation: AgentCheckinEvaluation;
}

