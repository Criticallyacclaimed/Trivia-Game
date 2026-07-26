import { useState, useEffect, useCallback } from 'react';
import { UserAccount, GeoPricing } from '../types';
import { evaluateUserAchievements, Achievement } from '../lib/achievements';
import { sound } from '../lib/soundEffects';
import { triggerStreakConfetti } from '../lib/confetti';
import { hapticSuccess } from '../lib/haptics';

const STORAGE_KEY = 'mindspark_user_account_v1';
const COMMUNITY_QUESTIONS_KEY = 'mindspark_community_questions_v1';

const DEFAULT_USER: UserAccount = {
  id: 'user_' + Math.random().toString(36).substring(2, 9),
  name: 'Spark Enthusiast',
  email: 'player@mindspark.app',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  provider: 'guest',
  lifetimeUnlocked: false, // Demo mode active by default
  xp: 150,
  level: 1,
  totalGames: 3,
  totalCorrect: 12,
  totalQuestions: 15,
  highestStreak: 4,
  highestScore: 1250,
  ageGroup: 'Adults',
  country: 'US',
  currencySymbol: '$',
  badges: ['First Spark', 'Trivia Novice', 'Picture Master'],
  customVoiceEnabled: true,
  fontSizePreference: 'normal',
  highContrast: false,
  autoReadAloud: false,
  timerSpeedSeconds: 20,
};

export function useCloudSync() {
  const [user, setUser] = useState<UserAccount>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return DEFAULT_USER;
  });

  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [geoPricing, setGeoPricing] = useState<GeoPricing | null>(null);
  const [recentAchievement, setRecentAchievement] = useState<Achievement | null>(null);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('synced');
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync to LocalStorage & Server
  const saveUser = useCallback(async (updatedUser: Partial<UserAccount>) => {
    setUser((prev) => {
      let next = { ...prev, ...updatedUser };

      // Automatically evaluate achievement milestones
      const { updatedBadges, newlyUnlocked } = evaluateUserAchievements(next);
      if (newlyUnlocked.length > 0) {
        next = { ...next, badges: updatedBadges };
        const latestBadge = newlyUnlocked[0];
        setRecentAchievement(latestBadge);
        sound.playVictory();
        hapticSuccess();
        triggerStreakConfetti();

        // Auto hide notification banner after 4 seconds
        setTimeout(() => {
          setRecentAchievement(null);
        }, 4000);
      } else {
        next = { ...next, badges: updatedBadges };
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

      // Broadcast across tabs
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          const channel = new BroadcastChannel('mindspark_sync_channel');
          channel.postMessage({ type: 'USER_UPDATE', data: next });
          channel.close();
        } catch (e) {}
      }

      // Sync to cloud server if online
      if (navigator.onLine) {
        setSyncStatus('syncing');
        fetch('/api/cloud-sync/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: next.id, userData: next }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setSyncStatus('synced');
              setLastSyncedAt(new Date().toLocaleTimeString());
            }
          })
          .catch(() => {
            setSyncStatus('offline');
          });
      } else {
        setSyncStatus('offline');
      }

      return next;
    });
  }, []);

  // Fetch Geo Pricing for Lifetime Unlock ($0.10 or regional equivalent)
  useEffect(() => {
    fetch('/api/pricing/geo-discount')
      .then((res) => res.json())
      .then((data) => setGeoPricing(data))
      .catch((e) => console.warn('Pricing fetch error:', e));
  }, []);

  // Listen for multi-tab sync
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel('mindspark_sync_channel');
    channel.onmessage = (event) => {
      if (event.data?.type === 'USER_UPDATE') {
        setUser(event.data.data);
      }
    };
    return () => channel.close();
  }, []);

  // Unlock Lifetime Pro Access
  const unlockLifetimePro = useCallback(() => {
    saveUser({
      lifetimeUnlocked: true,
      badges: Array.from(new Set([...user.badges, 'Lifetime Pro Supporter', 'VIP MindSpark'])),
    });
  }, [saveUser, user.badges]);

  // Login SSO simulation (Google / Apple)
  const loginSSO = useCallback((provider: 'google' | 'apple', name: string, email: string, avatar?: string) => {
    saveUser({
      provider,
      name,
      email,
      avatar: avatar || (provider === 'google' ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80' : 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80'),
    });
  }, [saveUser]);

  const dismissRecentAchievement = useCallback(() => {
    setRecentAchievement(null);
  }, []);

  return {
    user,
    saveUser,
    isOnline,
    syncStatus,
    lastSyncedAt,
    geoPricing,
    unlockLifetimePro,
    loginSSO,
    recentAchievement,
    dismissRecentAchievement,
  };
}
