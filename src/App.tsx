import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { TriviaGame } from './components/TriviaGame';
import { CategorySelector } from './components/CategorySelector';
import { MultiplayerHub } from './components/MultiplayerHub';
import { LeaderboardsView } from './components/LeaderboardsView';
import { QuestionSubmitter } from './components/QuestionSubmitter';
import { LifetimeUnlockModal } from './components/LifetimeUnlockModal';
import { UserProfileModal } from './components/UserProfileModal';

import { useCloudSync } from './hooks/useCloudSync';
import { useVoiceCommands } from './hooks/useVoiceCommands';
import { useTriviaManager } from './hooks/useTriviaManager';
import { INITIAL_TRIVIA_QUESTIONS } from './data/triviaDatabase';
import { Category, AgeGroup, TriviaQuestion } from './types';
import { WifiOff, Mic, Sparkles, Award, Check } from 'lucide-react';

export default function App() {
  const {
    user,
    saveUser,
    isOnline,
    syncStatus,
    geoPricing,
    unlockLifetimePro,
    loginSSO,
    recentAchievement,
    dismissRecentAchievement,
  } = useCloudSync();

  const [activeTab, setActiveTab] = useState<'play' | 'categories' | 'multiplayer' | 'leaderboards' | 'submit' | 'senior'>('play');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(user.ageGroup || 'Adults');
  const [customQuestions, setCustomQuestions] = useState<TriviaQuestion[]>([]);

  // Trivia Manager Hook
  const {
    questionDb,
    seenQuestionIds,
    lastRefreshTime,
    refreshNotice,
    isRefreshing,
    markQuestionAnswered,
    getActiveQuestionSet,
    triggerManualHourlyRefresh,
  } = useTriviaManager(user.lifetimeUnlocked);

  // Modal states
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Voice Command Handlers
  const {
    isListening,
    transcript,
    activeCommand,
    toggleListening,
  } = useVoiceCommands({
    enabled: user.customVoiceEnabled,
  });

  // Dynamically compute randomized, non-repeating question set
  const activeQuestionData = useMemo(() => {
    if (customQuestions.length > 0) {
      return {
        questions: customQuestions,
        hasExhaustedFreePool: false,
        seenCount: 0,
        totalAvailable: customQuestions.length,
      };
    }
    return getActiveQuestionSet(selectedCategory, ageGroup);
  }, [customQuestions, getActiveQuestionSet, selectedCategory, ageGroup]);

  // Handle Game Completion
  const handleGameComplete = (score: number, correctCount: number, totalCount: number) => {
    saveUser({
      highestScore: Math.max(user.highestScore, score),
      totalQuestions: user.totalQuestions + totalCount,
      totalCorrect: user.totalCorrect + correctCount,
      totalGames: user.totalGames + 1,
      xp: user.xp + Math.floor(score / 10),
      level: Math.floor((user.xp + score / 10) / 200) + 1,
    });
  };

  // Handle Category selection from CategorySelector
  const handleSelectCategory = (cat: Category) => {
    setSelectedCategory(cat);
    setCustomQuestions([]);
    setActiveTab('play');
  };

  return (
    <div className={`min-h-screen bg-sky-50 text-slate-800 font-sans antialiased selection:bg-indigo-500 selection:text-white pb-20 ${
      user.fontSizePreference === 'extra-large' || ageGroup === 'Seniors' ? 'text-lg' : ''
    }`}>
      
      {/* Top Navbar */}
      <Navbar
        user={user}
        isOnline={isOnline}
        syncStatus={syncStatus}
        geoPricing={geoPricing}
        isListening={isListening}
        toggleListening={toggleListening}
        onOpenUnlockModal={() => setIsUnlockModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onChangeAgeGroup={(age) => {
          setAgeGroup(age);
          saveUser({ ageGroup: age });
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Voice Command Activity Notification Bar */}
      {isListening && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold py-2.5 px-4 text-center shadow-md flex items-center justify-center gap-3 animate-fadeIn my-2 max-w-7xl mx-auto rounded-2xl">
          <Mic className="w-4 h-4 animate-pulse text-amber-300" />
          <span>Voice Commands Active: Say "Option A", "Option B", "Option C", "Option D", or "Hint"</span>
          {transcript && (
            <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[11px] text-amber-200 font-semibold">
              Heard: "{transcript}"
            </span>
          )}
        </div>
      )}

      {/* Offline Mode Alert Banner */}
      {!isOnline && (
        <div className="bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold py-2.5 px-4 text-center flex items-center justify-center gap-2 max-w-7xl mx-auto rounded-2xl my-2">
          <WifiOff className="w-4 h-4 text-amber-600" />
          <span>Offline Mode Active - Pre-cached trivia question bank is ready for playing on the go!</span>
        </div>
      )}

      {/* Floating Achievement Unlocked Notification Banner */}
      {recentAchievement && (
        <div className="fixed top-20 right-4 z-50 animate-bounce cursor-pointer max-w-sm w-full" onClick={() => { setIsProfileModalOpen(true); dismissRecentAchievement(); }}>
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-600 p-0.5 rounded-2xl shadow-xl">
            <div className="bg-slate-900 text-white p-4 rounded-[0.9rem] flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 font-black text-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                {recentAchievement.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                  <Award className="w-3.5 h-3.5" />
                  <span>Achievement Unlocked!</span>
                </div>
                <h4 className="text-sm font-black text-white truncate">{recentAchievement.title}</h4>
                <p className="text-xs text-slate-300 font-medium truncate">{recentAchievement.description}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); dismissRecentAchievement(); }}
                className="text-slate-400 hover:text-white text-xs font-bold p-1"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Router */}
      <main className="transition-all duration-300">
        {activeTab === 'play' && (
          <TriviaGame
            questions={activeQuestionData.questions}
            user={user}
            ageGroup={ageGroup}
            onChangeAgeGroup={(age) => {
              setAgeGroup(age);
              saveUser({ ageGroup: age });
            }}
            onGameComplete={handleGameComplete}
            isListening={isListening}
            activeVoiceCommand={activeCommand}
            onOpenUnlockModal={() => setIsUnlockModalOpen(true)}
            onAnswerQuestion={markQuestionAnswered}
            hasExhaustedFreePool={activeQuestionData.hasExhaustedFreePool}
            refreshNotice={refreshNotice}
            onTriggerRefresh={triggerManualHourlyRefresh}
            isRefreshingPro={isRefreshing}
            seenCount={activeQuestionData.seenCount}
            totalAvailableCount={activeQuestionData.totalAvailable}
          />
        )}

        {activeTab === 'categories' && (
          <CategorySelector
            ageGroup={ageGroup}
            onChangeAgeGroup={(age) => {
              setAgeGroup(age);
              saveUser({ ageGroup: age });
            }}
            onSelectCategory={handleSelectCategory}
            isProUnlocked={user.lifetimeUnlocked}
            onOpenUnlockModal={() => setIsUnlockModalOpen(true)}
            onQuestionsGenerated={(qs) => {
              setCustomQuestions(qs);
              setActiveTab('play');
            }}
          />
        )}

        {activeTab === 'multiplayer' && (
          <MultiplayerHub
            questions={activeQuestionData.questions}
            onOpenUnlockModal={() => setIsUnlockModalOpen(true)}
            isProUnlocked={user.lifetimeUnlocked}
          />
        )}

        {activeTab === 'leaderboards' && (
          <LeaderboardsView currentUserId={user.id} />
        )}

        {activeTab === 'submit' && (
          <QuestionSubmitter userName={user.name} />
        )}
      </main>

      {/* Modals */}
      <LifetimeUnlockModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        geoPricing={geoPricing}
        onUnlockSuccess={unlockLifetimePro}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onSaveUser={saveUser}
        onLoginSSO={loginSSO}
      />

    </div>
  );
}
