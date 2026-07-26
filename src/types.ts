export type AgeGroup = 'Kids' | 'Adults' | 'Seniors';

export type Category = 
  | 'Science & Nature' 
  | 'History & Myths' 
  | 'Pop Culture & Movies' 
  | 'Geography & World' 
  | 'Sports & Games' 
  | "Kid's Wonders" 
  | 'Art & Literature' 
  | 'Food & Delicacies';

export type GameMode = 'solo' | 'pass_and_play' | 'versus_ai' | 'daily_challenge' | 'community_spotlight';

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0..3
  category: Category;
  difficulty: AgeGroup;
  imageUrl: string;
  explanation: string;
  author?: string;
  isCommunity?: boolean;
  hint?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider: 'google' | 'apple' | 'guest';
  lifetimeUnlocked: boolean;
  xp: number;
  level: number;
  totalGames: number;
  totalCorrect: number;
  totalQuestions: number;
  highestStreak: number;
  highestScore: number;
  ageGroup: AgeGroup;
  country: string;
  currencySymbol: string;
  badges: string[];
  customVoiceEnabled: boolean;
  fontSizePreference: 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
  autoReadAloud: boolean;
  timerSpeedSeconds: number;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  avatar: string;
  score: number;
  ageGroup: AgeGroup;
  category: string;
  date: string;
  country: string;
}

export interface GeoPricing {
  country: string;
  currency: string;
  priceText: string;
  rawAmount: number;
  symbol: string;
  discountPercentage: string;
  unlockedFeatures: string[];
}

export interface MultiplayerPlayer {
  id: string;
  name: string;
  avatar: string;
  score: number;
  streak: number;
  isAI?: boolean;
  aiDifficulty?: 'Easy' | 'Medium' | 'Hard';
  aiAccuracy?: number;
}
