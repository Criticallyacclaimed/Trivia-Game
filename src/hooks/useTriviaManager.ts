import { useState, useEffect, useCallback, useMemo } from 'react';
import { TriviaQuestion, Category, AgeGroup } from '../types';
import { INITIAL_TRIVIA_QUESTIONS } from '../data/triviaDatabase';

const DATABASE_STORAGE_KEY = 'mindspark_trivia_database_v2';
const SEEN_QUESTIONS_KEY = 'mindspark_seen_questions_v2';
const LAST_REFRESH_KEY = 'mindspark_last_hourly_refresh_v2';

// Fisher-Yates array shuffling helper
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function useTriviaManager(isProUser: boolean) {
  // Database of questions (base + hourly + custom)
  const [questionDb, setQuestionDb] = useState<TriviaQuestion[]>(() => {
    try {
      const saved = localStorage.getItem(DATABASE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_TRIVIA_QUESTIONS.length) {
          return parsed;
        }
      }
    } catch {
      // Ignore fallback
    }
    return INITIAL_TRIVIA_QUESTIONS;
  });

  // Track seen question IDs
  const [seenQuestionIds, setSeenQuestionIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(SEEN_QUESTIONS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return [];
  });

  // Last hourly refresh timestamp
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(LAST_REFRESH_KEY);
      if (saved) return Number(saved);
    } catch {
      // Ignore
    }
    return 0;
  });

  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Save database updates to localStorage
  useEffect(() => {
    localStorage.setItem(DATABASE_STORAGE_KEY, JSON.stringify(questionDb));
  }, [questionDb]);

  // Save seen questions
  useEffect(() => {
    localStorage.setItem(SEEN_QUESTIONS_KEY, JSON.stringify(seenQuestionIds));
  }, [seenQuestionIds]);

  // Save refresh timestamp
  useEffect(() => {
    if (lastRefreshTime > 0) {
      localStorage.setItem(LAST_REFRESH_KEY, lastRefreshTime.toString());
    }
  }, [lastRefreshTime]);

  // Hourly Auto-Refresh for Pro Users
  const checkAndRunHourlyRefresh = useCallback(async () => {
    if (!isProUser) return;

    const now = Date.now();
    const ONE_HOUR_MS = 3600 * 1000;

    // Check if 1 hour has elapsed or if first time as Pro
    if (now - lastRefreshTime >= ONE_HOUR_MS || lastRefreshTime === 0) {
      setIsRefreshing(true);
      try {
        const res = await fetch('/api/trivia/hourly-refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isPro: true }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.questions)) {
            // Append new questions without duplicates
            setQuestionDb((prev) => {
              const existingIds = new Set(prev.map((q) => q.id));
              const newUniques = data.questions.filter((q: TriviaQuestion) => !existingIds.has(q.id));
              return [...newUniques, ...prev];
            });

            setLastRefreshTime(now);
            setRefreshNotice(`⚡ Hourly Pro Trivia Refreshed! Added ${data.questions.length} brand-new questions.`);
            
            // Dismiss banner after 6 seconds
            setTimeout(() => {
              setRefreshNotice(null);
            }, 6000);
          }
        }
      } catch (e) {
        console.error('Failed hourly refresh:', e);
      } finally {
        setIsRefreshing(false);
      }
    }
  }, [isProUser, lastRefreshTime]);

  // Run hourly check on load and set up hourly interval
  useEffect(() => {
    checkAndRunHourlyRefresh();

    const interval = setInterval(() => {
      checkAndRunHourlyRefresh();
    }, 60 * 1000); // Check every minute if an hour has passed

    return () => clearInterval(interval);
  }, [checkAndRunHourlyRefresh]);

  // Mark question as answered
  const markQuestionAnswered = useCallback((questionId: string) => {
    setSeenQuestionIds((prev) => {
      if (prev.includes(questionId)) return prev;
      return [...prev, questionId];
    });
  }, []);

  // Get active randomized question set for a given category & age difficulty
  const getActiveQuestionSet = useCallback(
    (category: Category | 'All', difficulty: AgeGroup): {
      questions: TriviaQuestion[];
      hasExhaustedFreePool: boolean;
      totalAvailable: number;
      seenCount: number;
    } => {
      // Free users only get initial base questions + community questions; Pro users get full db
      const basePool = isProUser 
        ? questionDb 
        : INITIAL_TRIVIA_QUESTIONS;

      // Filter by category
      let categoryPool = basePool;
      if (category !== 'All') {
        categoryPool = categoryPool.filter((q) => q.category === category);
      }

      // Filter by age difficulty
      const ageFiltered = categoryPool.filter((q) => q.difficulty === difficulty);
      const finalCategoryPool = ageFiltered.length >= 3 ? ageFiltered : categoryPool;

      const seenSet = new Set(seenQuestionIds);

      // Separate unseen vs seen
      const unseen = finalCategoryPool.filter((q) => !seenSet.has(q.id));
      const seen = finalCategoryPool.filter((q) => seenSet.has(q.id));

      const hasExhaustedFreePool = !isProUser && unseen.length === 0;

      let selectedQuestions: TriviaQuestion[] = [];

      if (unseen.length >= 3) {
        // Prioritize brand new unseen questions first!
        selectedQuestions = shuffleArray(unseen);
      } else {
        // Mix remaining unseen with shuffled seen questions so user still gets a randomized set
        selectedQuestions = shuffleArray([...unseen, ...shuffleArray(seen)]);
      }

      return {
        questions: selectedQuestions,
        hasExhaustedFreePool,
        totalAvailable: finalCategoryPool.length,
        seenCount: seen.length,
      };
    },
    [isProUser, questionDb, seenQuestionIds]
  );

  // Force manual refresh for Pro users
  const triggerManualHourlyRefresh = useCallback(() => {
    setLastRefreshTime(0); // Reset timer to trigger immediately
  }, []);

  return {
    questionDb,
    seenQuestionIds,
    lastRefreshTime,
    refreshNotice,
    isRefreshing,
    markQuestionAnswered,
    getActiveQuestionSet,
    triggerManualHourlyRefresh,
  };
}
