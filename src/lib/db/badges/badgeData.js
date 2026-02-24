// Badge seed data - 15 MVP badges for Phase 1
export const mvpBadges = [
  // Achievement Badges (Milestones)
  {
    badgeId: 'first-solve',
    name: 'First Solve',
    description: 'Solved your first problem',
    icon: 'Trophy',
    emoji: '🏆',
    category: 'achievement',
    rarity: 'common',
    color: '#FFD700',
    criteria: {
      type: 'milestone',
      condition: 'totalAcceptedCount >= 1',
      value: 1,
    },
    requirements: {
      minProblems: 1,
      minAcceptanceRate: 0,
    },
  },
  {
    badgeId: 'problem-solver-1',
    name: 'Problem Solver I',
    description: 'Solved 10 problems',
    icon: 'Gem',
    emoji: '💎',
    category: 'achievement',
    rarity: 'common',
    color: '#A78BFA',
    criteria: {
      type: 'milestone',
      condition: 'totalAcceptedCount >= 10',
      value: 10,
    },
    requirements: {
      minProblems: 10,
      minAcceptanceRate: 0,
    },
  },
  {
    badgeId: 'problem-solver-2',
    name: 'Problem Solver II',
    description: 'Solved 25 problems',
    icon: 'Gem',
    emoji: '💎',
    category: 'achievement',
    rarity: 'uncommon',
    color: '#A78BFA',
    criteria: {
      type: 'milestone',
      condition: 'totalAcceptedCount >= 25',
      value: 25,
    },
    requirements: {
      minProblems: 25,
      minAcceptanceRate: 0,
    },
  },
  {
    badgeId: 'problem-solver-3',
    name: 'Problem Solver III',
    description: 'Solved 50 problems',
    icon: 'Gem',
    emoji: '💎',
    category: 'achievement',
    rarity: 'rare',
    color: '#A78BFA',
    criteria: {
      type: 'milestone',
      condition: 'totalAcceptedCount >= 50',
      value: 50,
    },
    requirements: {
      minProblems: 50,
      minAcceptanceRate: 0,
    },
  },

  // Difficulty Badges
  {
    badgeId: 'difficulty-conqueror',
    name: 'Difficulty Conqueror',
    description: 'Solved problems across all difficulty levels',
    icon: 'Crown',
    emoji: '👑',
    category: 'difficulty',
    rarity: 'rare',
    color: '#FBBF24',
    criteria: {
      type: 'milestone',
      condition: 'solvedEasy >= 5 AND solvedMedium >= 5 AND solvedHard >= 5',
      value: 15,
    },
    requirements: {
      minProblems: 15,
      minAcceptanceRate: 0,
    },
  },

  // Streak Badges
  {
    badgeId: 'streak-7-days',
    name: '7-Day Streak',
    description: 'Submitted code 7 days in a row',
    icon: 'Flame',
    emoji: '🔥',
    category: 'streak',
    rarity: 'uncommon',
    color: '#F87171',
    criteria: {
      type: 'streak',
      condition: 'streakCount >= 7',
      value: 7,
    },
    requirements: {
      minProblems: 0,
      minAcceptanceRate: 0,
    },
  },
  {
    badgeId: 'streak-30-days',
    name: '30-Day Streak',
    description: 'Submitted code 30 days in a row',
    icon: 'Flame',
    emoji: '🔥',
    category: 'streak',
    rarity: 'rare',
    color: '#F87171',
    criteria: {
      type: 'streak',
      condition: 'streakCount >= 30',
      value: 30,
    },
    requirements: {
      minProblems: 0,
      minAcceptanceRate: 0,
    },
  },

  // Performance Badges
  {
    badgeId: 'speed-demon',
    name: 'Speed Demon',
    description: 'Have the fastest solution for a problem',
    icon: 'Zap',
    emoji: '⚡',
    category: 'performance',
    rarity: 'uncommon',
    color: '#FBBF24',
    criteria: {
      type: 'performance',
      condition: 'fastestSolutionCount >= 1',
      value: 1,
    },
    requirements: {
      minProblems: 1,
      minAcceptanceRate: 0,
    },
  },
  {
    badgeId: 'rocket-code',
    name: 'Rocket Code',
    description: 'Both speed and memory optimized for a problem',
    icon: 'Rocket',
    emoji: '🚀',
    category: 'performance',
    rarity: 'rare',
    color: '#60A5FA',
    criteria: {
      type: 'performance',
      condition: 'optimizedSolutionCount >= 1',
      value: 1,
    },
    requirements: {
      minProblems: 1,
      minAcceptanceRate: 0,
    },
  },

  // Accuracy Badges
  {
    badgeId: 'accuracy-ace',
    name: 'Accuracy Ace',
    description: '80% acceptance rate (10+ submissions)',
    icon: 'Target',
    emoji: '🎯',
    category: 'accuracy',
    rarity: 'uncommon',
    color: '#34D399',
    criteria: {
      type: 'accuracy',
      condition: 'acceptanceRate >= 80 AND totalSubmissions >= 10',
      value: 80,
    },
    requirements: {
      minProblems: 0,
      minAcceptanceRate: 80,
    },
  },
  {
    badgeId: 'perfect-score',
    name: 'Perfect Score',
    description: '95% acceptance rate (20+ submissions)',
    icon: '100',
    emoji: '💯',
    category: 'accuracy',
    rarity: 'rare',
    color: '#34D399',
    criteria: {
      type: 'accuracy',
      condition: 'acceptanceRate >= 95 AND totalSubmissions >= 20',
      value: 95,
    },
    requirements: {
      minProblems: 0,
      minAcceptanceRate: 95,
    },
  },
  {
    badgeId: 'first-try-master',
    name: 'First Try Master',
    description: 'Solve 10 problems on first attempt',
    icon: 'CheckCircle',
    emoji: '✅',
    category: 'accuracy',
    rarity: 'uncommon',
    color: '#34D399',
    criteria: {
      type: 'first-try',
      condition: 'perfectAcceptanceCount >= 10',
      value: 10,
    },
    requirements: {
      minProblems: 10,
      minAcceptanceRate: 0,
    },
  },
  {
    badgeId: 'no-errors',
    name: 'No Errors',
    description: '20+ consecutive successful submissions',
    icon: 'Shield',
    emoji: '🛡️',
    category: 'accuracy',
    rarity: 'rare',
    color: '#34D399',
    criteria: {
      type: 'accuracy',
      condition: 'consecutiveAcceptedCount >= 20',
      value: 20,
    },
    requirements: {
      minProblems: 0,
      minAcceptanceRate: 0,
    },
  },

  // Debug Badge
  {
    badgeId: 'debug-master',
    name: 'Debug Master',
    description: '50+ wrong answers then get it right',
    icon: 'Search',
    emoji: '🔍',
    category: 'special',
    rarity: 'uncommon',
    color: '#8B5CF6',
    criteria: {
      type: 'hidden',
      condition: 'totalFailuresBeforeSuccess >= 50',
      value: 50,
    },
    requirements: {
      minProblems: 1,
      minAcceptanceRate: 0,
    },
  },

  // Gamer Badge
  {
    badgeId: 'gamer',
    name: 'Gamer',
    description: 'Solved 100 problems',
    icon: 'Gamepad2',
    emoji: '🎮',
    category: 'special',
    rarity: 'legendary',
    color: '#EC4899',
    criteria: {
      type: 'milestone',
      condition: 'totalAcceptedCount >= 100',
      value: 100,
    },
    requirements: {
      minProblems: 100,
      minAcceptanceRate: 0,
    },
  },

  // Master Mind Badge
  {
    badgeId: 'master-mind',
    name: 'Master Mind',
    description: 'Solve problems across all difficulty levels',
    icon: 'Brain',
    emoji: '🧠',
    category: 'difficulty',
    rarity: 'rare',
    color: '#6366F1',
    criteria: {
      type: 'milestone',
      condition: 'solvedAllDifficulties === true',
      value: 1,
    },
    requirements: {
      minProblems: 3,
      minAcceptanceRate: 0,
    },
  },
];

export default mvpBadges;
