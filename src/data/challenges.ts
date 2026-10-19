import { ScheduledChallenge } from '../types';

export const SCHEDULED_CHALLENGES: ScheduledChallenge[] = [
  // 1. Daily Challenge
  {
    id: 'challenge-daily-1',
    type: 'daily',
    title: 'Two-Sum Micro Target',
    difficulty: 'Easy',
    language: 'python',
    description: 'Find two distinct numbers in a list that add up to the target sum and print them.',
    prompt: 'Given nums = [2, 7, 11, 15] and target = 9, print the two numbers separated by a space.',
    starterCode: `# Daily Challenge: Two-Sum Micro
nums = [2, 7, 11, 15]
target = 9

# TODO: Find the two numbers that add up to target and print them: "2 7"
`,
    expectedOutput: '2 7',
    testCases: [
      {
        name: 'Matches Target 9',
        expectedOutput: '2 7',
      },
    ],
    hints: [
      'Iterate through the array and look for target - current_num.',
      'Check if 2 + 7 equals 9.',
    ],
    cleanlinessStandard: 'Ideal: Single pass using set/dict or clean nested comprehension under 8 lines.',
    xpReward: 60,
    gemReward: 25,
    timeLimitSec: 120,
  },

  // 2. Weekly Boss Challenge
  {
    id: 'challenge-weekly-1',
    type: 'weekly',
    title: 'Palindrome Streamer Boss',
    difficulty: 'Medium',
    language: 'python',
    description: 'Determine whether a given input phrase is an exact palindrome ignoring whitespace and case.',
    prompt: 'Test word = "racecar". Output "VALID PALINDROME" if it reads identical forwards and backwards.',
    starterCode: `# Weekly Boss Challenge: Palindrome Streamer
word = "racecar"

# TODO: Print "VALID PALINDROME" if word reads the same backwards, otherwise "INVALID"
`,
    expectedOutput: 'VALID PALINDROME',
    testCases: [
      {
        name: 'Verifies racecar',
        expectedOutput: 'VALID PALINDROME',
      },
    ],
    hints: [
      'Python strings can be reversed effortlessly using slice notation [::-1].',
      'Compare word with its reversed representation.',
    ],
    cleanlinessStandard: 'Under 5 lines of code, idiomatic slice comparison, zero redundant allocations.',
    xpReward: 150,
    gemReward: 60,
    timeLimitSec: 180,
  },

  // 3. Monthly Grand Tournament Challenge
  {
    id: 'challenge-monthly-1',
    type: 'monthly',
    title: 'High-Frequency Counter Matrix',
    difficulty: 'Hard',
    language: 'python',
    description: 'Find the most repeated character in a string and print its frequency count.',
    prompt: 'Given stream = "mississippi", find the highest frequency count of any letter and print "Max frequency: 4".',
    starterCode: `# Monthly Grand Tournament: Frequency Counter
stream = "mississippi"

# TODO: Count each letter, then print the highest count as "Max frequency: N"
`,
    expectedOutput: 'Max frequency: 4',
    testCases: [
      {
        name: 'Counts 4 occurrences of i and s',
        expectedOutput: 'Max frequency: 4',
      },
    ],
    hints: [
      'Use a dictionary or count() method to track occurrences.',
      'max(counts.values()) will yield the highest count.',
    ],
    cleanlinessStandard: 'O(N) time complexity, clean dictionary comprehension or Counter idiom, PEP8 compliance.',
    xpReward: 350,
    gemReward: 150,
    timeLimitSec: 240,
  },
];
