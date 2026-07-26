import { UserAccount } from '../types';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'Milestone' | 'Score' | 'Streak' | 'Accuracy' | 'Special';
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
  icon: string;
  badgeStyle: {
    bg: string;
    border: string;
    text: string;
    iconBg: string;
    glow: string;
  };
  requirementText: string;
  checkUnlocked: (user: UserAccount) => boolean;
  getProgress: (user: UserAccount) => { current: number; total: number; percentage: number };
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_spark',
    title: 'First Spark',
    description: 'Complete your very first trivia game session.',
    category: 'Milestone',
    tier: 'Bronze',
    icon: '⚡',
    badgeStyle: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      iconBg: 'bg-amber-100 text-amber-700',
      glow: 'shadow-amber-200/50',
    },
    requirementText: 'Complete 1 trivia game',
    checkUnlocked: (user) => user.totalGames >= 1,
    getProgress: (user) => ({
      current: Math.min(user.totalGames, 1),
      total: 1,
      percentage: Math.min(100, (user.totalGames / 1) * 100),
    }),
  },
  {
    id: 'trivia_novice',
    title: 'Trivia Novice',
    description: 'Achieve a score of at least 500 points in a single session.',
    category: 'Score',
    tier: 'Bronze',
    icon: '🌱',
    badgeStyle: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-900',
      iconBg: 'bg-emerald-100 text-emerald-700',
      glow: 'shadow-emerald-200/50',
    },
    requirementText: 'Reach 500+ high score',
    checkUnlocked: (user) => user.highestScore >= 500,
    getProgress: (user) => ({
      current: Math.min(user.highestScore, 500),
      total: 500,
      percentage: Math.min(100, (user.highestScore / 500) * 100),
    }),
  },
  {
    id: 'score_master',
    title: 'Score Master',
    description: 'Break through and reach a high score of 1,500 points.',
    category: 'Score',
    tier: 'Silver',
    icon: '🎯',
    badgeStyle: {
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      text: 'text-sky-900',
      iconBg: 'bg-sky-100 text-sky-700',
      glow: 'shadow-sky-200/50',
    },
    requirementText: 'Reach 1,500+ high score',
    checkUnlocked: (user) => user.highestScore >= 1500,
    getProgress: (user) => ({
      current: Math.min(user.highestScore, 1500),
      total: 1500,
      percentage: Math.min(100, (user.highestScore / 1500) * 100),
    }),
  },
  {
    id: 'trivia_legend',
    title: 'Trivia Legend',
    description: 'Attain an astonishing score of 3,000+ points in a single match.',
    category: 'Score',
    tier: 'Gold',
    icon: '👑',
    badgeStyle: {
      bg: 'bg-amber-100/80',
      border: 'border-amber-300',
      text: 'text-amber-950',
      iconBg: 'bg-amber-200 text-amber-800',
      glow: 'shadow-amber-300/60',
    },
    requirementText: 'Reach 3,000+ high score',
    checkUnlocked: (user) => user.highestScore >= 3000,
    getProgress: (user) => ({
      current: Math.min(user.highestScore, 3000),
      total: 3000,
      percentage: Math.min(100, (user.highestScore / 3000) * 100),
    }),
  },
  {
    id: 'hot_streak',
    title: 'Hot Streak',
    description: 'Answer 5 questions correctly in a row without a mistake.',
    category: 'Streak',
    tier: 'Bronze',
    icon: '🔥',
    badgeStyle: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-900',
      iconBg: 'bg-orange-100 text-orange-700',
      glow: 'shadow-orange-200/50',
    },
    requirementText: 'Reach a 5+ streak',
    checkUnlocked: (user) => user.highestStreak >= 5,
    getProgress: (user) => ({
      current: Math.min(user.highestStreak, 5),
      total: 5,
      percentage: Math.min(100, (user.highestStreak / 5) * 100),
    }),
  },
  {
    id: 'unstoppable',
    title: 'Unstoppable',
    description: 'Build an incredible 10-question streak of flawless answers.',
    category: 'Streak',
    tier: 'Gold',
    icon: '🚀',
    badgeStyle: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-900',
      iconBg: 'bg-purple-100 text-purple-700',
      glow: 'shadow-purple-200/50',
    },
    requirementText: 'Reach a 10+ streak',
    checkUnlocked: (user) => user.highestStreak >= 10,
    getProgress: (user) => ({
      current: Math.min(user.highestStreak, 10),
      total: 10,
      percentage: Math.min(100, (user.highestStreak / 10) * 100),
    }),
  },
  {
    id: 'sharpshooter',
    title: 'Sharpshooter',
    description: 'Answer 25 total trivia questions correctly across all games.',
    category: 'Accuracy',
    tier: 'Bronze',
    icon: '🎯',
    badgeStyle: {
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      text: 'text-teal-900',
      iconBg: 'bg-teal-100 text-teal-700',
      glow: 'shadow-teal-200/50',
    },
    requirementText: 'Answer 25 questions correctly',
    checkUnlocked: (user) => user.totalCorrect >= 25,
    getProgress: (user) => ({
      current: Math.min(user.totalCorrect, 25),
      total: 25,
      percentage: Math.min(100, (user.totalCorrect / 25) * 100),
    }),
  },
  {
    id: 'century_scholar',
    title: 'Century Scholar',
    description: 'Cross 100 total correct trivia answers milestone.',
    category: 'Accuracy',
    tier: 'Silver',
    icon: '📚',
    badgeStyle: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      text: 'text-indigo-900',
      iconBg: 'bg-indigo-100 text-indigo-700',
      glow: 'shadow-indigo-200/50',
    },
    requirementText: 'Answer 100 questions correctly',
    checkUnlocked: (user) => user.totalCorrect >= 100,
    getProgress: (user) => ({
      current: Math.min(user.totalCorrect, 100),
      total: 100,
      percentage: Math.min(100, (user.totalCorrect / 100) * 100),
    }),
  },
  {
    id: 'picture_genius',
    title: 'Picture Master',
    description: 'Demonstrate visual expertise with image-rich trivia questions.',
    category: 'Special',
    tier: 'Silver',
    icon: '🖼️',
    badgeStyle: {
      bg: 'bg-pink-50',
      border: 'border-pink-200',
      text: 'text-pink-900',
      iconBg: 'bg-pink-100 text-pink-700',
      glow: 'shadow-pink-200/50',
    },
    requirementText: 'Answer 10+ questions correctly',
    checkUnlocked: (user) => user.totalCorrect >= 10,
    getProgress: (user) => ({
      current: Math.min(user.totalCorrect, 10),
      total: 10,
      percentage: Math.min(100, (user.totalCorrect / 10) * 100),
    }),
  },
  {
    id: 'xp_climber',
    title: 'XP Climber',
    description: 'Level up your MindSpark account to Level 3 or higher.',
    category: 'Milestone',
    tier: 'Silver',
    icon: '🌟',
    badgeStyle: {
      bg: 'bg-cyan-50',
      border: 'border-cyan-200',
      text: 'text-cyan-900',
      iconBg: 'bg-cyan-100 text-cyan-700',
      glow: 'shadow-cyan-200/50',
    },
    requirementText: 'Reach Account Level 3+',
    checkUnlocked: (user) => user.level >= 3,
    getProgress: (user) => ({
      current: Math.min(user.level, 3),
      total: 3,
      percentage: Math.min(100, (user.level / 3) * 100),
    }),
  },
  {
    id: 'voice_wizard',
    title: 'Voice Wizard',
    description: 'Enable hands-free AI voice control command mode.',
    category: 'Special',
    tier: 'Bronze',
    icon: '🎙️',
    badgeStyle: {
      bg: 'bg-violet-50',
      border: 'border-violet-200',
      text: 'text-violet-900',
      iconBg: 'bg-violet-100 text-violet-700',
      glow: 'shadow-violet-200/50',
    },
    requirementText: 'Enable Voice Control in settings',
    checkUnlocked: (user) => !!user.customVoiceEnabled,
    getProgress: (user) => ({
      current: user.customVoiceEnabled ? 1 : 0,
      total: 1,
      percentage: user.customVoiceEnabled ? 100 : 0,
    }),
  },
  {
    id: 'pro_pioneer',
    title: 'Pro Pioneer',
    description: 'Unlock Lifetime Pro membership for unrestricted trivia topics & AI generation.',
    category: 'Special',
    tier: 'Diamond',
    icon: '💎',
    badgeStyle: {
      bg: 'bg-gradient-to-r from-amber-50 to-indigo-50',
      border: 'border-amber-300',
      text: 'text-indigo-950',
      iconBg: 'bg-gradient-to-r from-amber-400 to-indigo-600 text-white',
      glow: 'shadow-indigo-300/60',
    },
    requirementText: 'Unlock Lifetime Pro',
    checkUnlocked: (user) => !!user.lifetimeUnlocked,
    getProgress: (user) => ({
      current: user.lifetimeUnlocked ? 1 : 0,
      total: 1,
      percentage: user.lifetimeUnlocked ? 100 : 0,
    }),
  },
];

/**
 * Checks for newly unlocked achievements and updates user badges.
 */
export const evaluateUserAchievements = (
  user: UserAccount
): { updatedBadges: string[]; newlyUnlocked: Achievement[] } => {
  const currentBadges = new Set(user.badges || []);
  const newlyUnlocked: Achievement[] = [];

  ACHIEVEMENTS.forEach((achievement) => {
    // Check title or ID matching
    const isAlreadyUnlocked = currentBadges.has(achievement.title) || currentBadges.has(achievement.id);
    if (!isAlreadyUnlocked && achievement.checkUnlocked(user)) {
      currentBadges.add(achievement.title);
      newlyUnlocked.push(achievement);
    }
  });

  return {
    updatedBadges: Array.from(currentBadges),
    newlyUnlocked,
  };
};
