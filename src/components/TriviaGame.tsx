import React, { useState, useEffect, useCallback } from 'react';
import { TriviaQuestion, UserAccount, AgeGroup } from '../types';
import { sound } from '../lib/soundEffects';
import { triggerCelebrationConfetti, triggerStreakConfetti } from '../lib/confetti';
import { hapticSuccess, hapticFailure, hapticVictory, hapticLight } from '../lib/haptics';
import { 
  Sparkles, Volume2, HelpCircle, CheckCircle2, XCircle, 
  Timer, Award, ArrowRight, RotateCcw, Brain, Zap, 
  Mic, Lightbulb, Share2, ShieldCheck, MessageSquare, ChevronRight, Trophy, PartyPopper
} from 'lucide-react';

interface TriviaGameProps {
  questions: TriviaQuestion[];
  user: UserAccount;
  ageGroup: AgeGroup;
  onChangeAgeGroup: (age: AgeGroup) => void;
  onGameComplete: (score: number, correctCount: number, totalCount: number) => void;
  isListening: boolean;
  activeVoiceCommand: string | null;
  onOpenUnlockModal: () => void;
  onAnswerQuestion?: (questionId: string) => void;
  hasExhaustedFreePool?: boolean;
  refreshNotice?: string | null;
  onTriggerRefresh?: () => void;
  isRefreshingPro?: boolean;
  seenCount?: number;
  totalAvailableCount?: number;
}

export const TriviaGame: React.FC<TriviaGameProps> = ({
  questions,
  user,
  ageGroup,
  onChangeAgeGroup,
  onGameComplete,
  isListening,
  activeVoiceCommand,
  onOpenUnlockModal,
  onAnswerQuestion,
  hasExhaustedFreePool = false,
  refreshNotice,
  onTriggerRefresh,
  isRefreshingPro = false,
  seenCount = 0,
  totalAvailableCount = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [timerActive, setTimerActive] = useState(true);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [hintUsed, setHintUsed] = useState(false);
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [loadingAiExplanation, setLoadingAiExplanation] = useState(false);
  const [isGameFinished, setIsGameFinished] = useState(false);

  const currentQuestion = questions[currentIndex] || questions[0];

  // Configure timer based on Age Group & User Preference
  const getTimerDuration = useCallback(() => {
    if (ageGroup === 'Seniors') return 40; // Relaxed slow timer for seniors
    if (ageGroup === 'Kids') return 30; // Friendly timer for kids
    return user.timerSpeedSeconds || 20; // Default adult timer
  }, [ageGroup, user.timerSpeedSeconds]);

  // Reset for question
  useEffect(() => {
    if (!currentQuestion) return;
    setSelectedOption(null);
    setIsAnswered(false);
    setTimeLeft(getTimerDuration());
    setTimerActive(true);
    setEliminatedOptions([]);
    setHintUsed(false);
    setAiExplanation(null);

    // Auto read aloud if enabled
    if (user.autoReadAloud) {
      sound.speakText(currentQuestion.question);
    }
  }, [currentIndex, currentQuestion, getTimerDuration, user.autoReadAloud]);

  // Countdown timer effect
  useEffect(() => {
    if (!timerActive || isAnswered || isGameFinished) return;

    if (timeLeft <= 0) {
      handleSelectOption(-1); // Time out
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, isAnswered, isGameFinished, timeLeft]);

  // Handle Option Selection
  const handleSelectOption = useCallback((optionIndex: number) => {
    if (isAnswered || isGameFinished) return;

    if (currentQuestion) {
      onAnswerQuestion?.(currentQuestion.id);
    }

    setSelectedOption(optionIndex);
    setIsAnswered(true);
    setTimerActive(false);

    const isCorrect = optionIndex === currentQuestion.correctAnswer;

    if (isCorrect) {
      sound.playCorrect();
      hapticSuccess();
      const streakBonus = streak * 50;
      const timeBonus = timeLeft * 10;
      const addedScore = 100 + streakBonus + timeBonus;
      
      setScore((prev) => prev + addedScore);
      setStreak((prev) => prev + 1);
      setCorrectCount((prev) => prev + 1);

      if ((streak + 1) % 3 === 0) {
        triggerStreakConfetti();
      }
    } else {
      sound.playWrong();
      hapticFailure();
      setStreak(0);
    }
  }, [isAnswered, isGameFinished, currentQuestion, streak, timeLeft]);

  // Process Voice Commands
  useEffect(() => {
    if (!activeVoiceCommand || isAnswered) return;

    if (activeVoiceCommand === 'Option A') handleSelectOption(0);
    if (activeVoiceCommand === 'Option B') handleSelectOption(1);
    if (activeVoiceCommand === 'Option C') handleSelectOption(2);
    if (activeVoiceCommand === 'Option D') handleSelectOption(3);
    if (activeVoiceCommand === 'Show Hint') handleUseHint();
  }, [activeVoiceCommand, isAnswered, handleSelectOption]);

  // Use 50/50 Hint
  const handleUseHint = () => {
    if (hintUsed || isAnswered) return;
    sound.playClick();
    setHintUsed(true);

    const wrongIndexes = [0, 1, 2, 3].filter((idx) => idx !== currentQuestion.correctAnswer);
    // Randomly keep 1 wrong, eliminate 2
    const shuffled = wrongIndexes.sort(() => 0.5 - Math.random());
    setEliminatedOptions([shuffled[0], shuffled[1]]);
  };

  // Read question text out loud
  const handleReadAloud = () => {
    sound.playClick();
    sound.speakText(currentQuestion.question + ". Options are: " + currentQuestion.options.join(", "));
  };

  // Ask Gemini AI for deeper explanation
  const handleFetchAiExplanation = async () => {
    if (!currentQuestion) return;
    sound.playClick();
    setShowExplanationModal(true);
    setLoadingAiExplanation(true);

    try {
      const res = await fetch('/api/gemini/explain-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion.question,
          answer: currentQuestion.options[currentQuestion.correctAnswer],
          difficulty: ageGroup
        })
      });
      const data = await res.json();
      setAiExplanation(data.explanation || currentQuestion.explanation);
    } catch (e) {
      setAiExplanation(currentQuestion.explanation);
    } finally {
      setLoadingAiExplanation(false);
    }
  };

  // Next Question
  const handleNextQuestion = () => {
    sound.playClick();
    sound.stopSpeech();

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsGameFinished(true);
      sound.playVictory();
      hapticVictory();
      const accuracy = questions.length > 0 ? (correctCount / questions.length) : 1;
      triggerCelebrationConfetti(accuracy);
      onGameComplete(score, correctCount, questions.length);
    }
  };

  // Restart Quiz
  const handleRestartQuiz = () => {
    sound.playClick();
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setIsGameFinished(false);
    setIsAnswered(false);
  };

  // Font size adjustments for Seniors/Accessibility
  const getFontSizeClass = () => {
    if (user.fontSizePreference === 'extra-large' || ageGroup === 'Seniors') {
      return 'text-2xl sm:text-3xl leading-snug';
    }
    if (user.fontSizePreference === 'large') {
      return 'text-xl sm:text-2xl leading-normal';
    }
    return 'text-lg sm:text-xl leading-relaxed';
  };

  if (!currentQuestion) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
      
      {/* Age Group Difficulty Selector Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white p-3 sm:p-4 rounded-[2rem] border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Difficulty Target:</span>
          <div className="flex items-center gap-1 bg-sky-50 p-1 rounded-2xl border border-sky-100">
            {(['Kids', 'Adults', 'Seniors'] as AgeGroup[]).map((group) => (
              <button
                key={group}
                onClick={() => { onChangeAgeGroup(group); sound.playClick(); }}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                  ageGroup === group
                    ? group === 'Kids'
                      ? 'bg-pink-500 text-white shadow-sm'
                      : group === 'Seniors'
                      ? 'bg-amber-400 text-amber-950 shadow-sm'
                      : 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-indigo-900'
                }`}
              >
                {group === 'Kids' ? '🧒 Kids' : group === 'Seniors' ? '👵 Seniors' : '🧑 Adults'}
              </button>
            ))}
          </div>
        </div>

        {/* Live Score & Streak */}
        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-black">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{score} PTS</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-900 font-black">
            <Award className="w-4 h-4 text-indigo-600" />
            <span>{streak}🔥 Streak</span>
          </div>
        </div>
      </div>

      {/* Main Gameplay Screen or Completion View */}
      {!isGameFinished ? (
        <>
          {/* Question Refresh & Pool Status Header */}
          {user.lifetimeUnlocked ? (
            <div className="mb-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white p-3.5 sm:p-4 rounded-2xl border border-indigo-700/50 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl">
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black text-amber-300 uppercase tracking-wider">⚡ Hourly Pro Trivia Engine Active</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">Auto-Refreshes Every Hour</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium">New non-repeating AI trivia questions are automatically added to your database every hour!</p>
                </div>
              </div>
              <button
                onClick={onTriggerRefresh}
                disabled={isRefreshingPro}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition-all shadow-xs flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>{isRefreshingPro ? 'Updating...' : 'Check Hourly Updates ⚡'}</span>
              </button>
            </div>
          ) : (
            <div className={`mb-4 p-3.5 sm:p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 transition-all ${
              hasExhaustedFreePool 
                ? 'bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border-orange-300/80' 
                : 'bg-amber-50/80 border-amber-200/80'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-amber-950">Standard Free Question Pool</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-950 text-[10px] font-extrabold">
                      {seenCount}/{totalAvailableCount} Seen
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800 font-medium">
                    {hasExhaustedFreePool 
                      ? 'You have completed all free standard questions! Upgrade to Pro for automated hourly trivia updates.' 
                      : 'Non-premium users play from the standard question pool. Upgrade to Pro to get automated hourly trivia updates!'}
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenUnlockModal}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs shadow-xs transition-all hover:scale-105"
              >
                Unlock Hourly Pro Updates ($0.10)
              </button>
            </div>
          )}

          {/* Toast Notification Banner for Hourly Updates */}
          {refreshNotice && (
            <div className="mb-4 bg-emerald-600 text-white text-xs font-black p-3 rounded-2xl shadow-md flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{refreshNotice}</span>
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-200/80 rounded-[2rem] p-5 sm:p-8 shadow-sm relative overflow-hidden">
          
          {/* Animated Timer Bar */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full mb-6 overflow-hidden relative">
            <div
              className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                timeLeft <= 5 ? 'bg-rose-500 animate-pulse' : timeLeft <= 10 ? 'bg-amber-400' : 'bg-indigo-600'
              }`}
              style={{ width: `${(timeLeft / getTimerDuration()) * 100}%` }}
            />
          </div>

          {/* Question Header & Read Aloud */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-100">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
                {currentQuestion.category}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReadAloud}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-indigo-700 transition-all flex items-center gap-1.5 text-xs font-bold"
                title="Read question out loud (Text-to-Speech)"
              >
                <Volume2 className="w-4 h-4" />
                <span className="hidden sm:inline">Listen</span>
              </button>

              <button
                onClick={handleUseHint}
                disabled={hintUsed || isAnswered}
                className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                  hintUsed
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                }`}
              >
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>50/50 Hint</span>
              </button>
            </div>
          </div>

          {/* Question Image (Picture Trivia Feature) */}
          <div className="relative w-full h-48 sm:h-72 rounded-2xl overflow-hidden mb-6 border border-slate-200 shadow-inner group">
            <img
              src={currentQuestion.imageUrl}
              alt={currentQuestion.question}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
            
            {/* Visual Context Tag */}
            <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-700 text-xs text-slate-200 font-semibold">
              🖼️ Visual Trivia Context
            </div>

            {/* Voice Command Active Listener Overlay */}
            {isListening && (
              <div className="absolute top-3 right-3 bg-rose-500 text-white backdrop-blur-md px-3 py-1.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg animate-bounce">
                <Mic className="w-4 h-4 animate-pulse" />
                <span>Say "Option A, B, C or D"</span>
              </div>
            )}
          </div>

          {/* Question Text */}
          <h2 className={`font-black text-indigo-950 mb-6 ${getFontSizeClass()}`}>
            {currentQuestion.question}
          </h2>

          {/* Answer Option Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
            {currentQuestion.options.map((option, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx];
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQuestion.correctAnswer;
              const isEliminated = eliminatedOptions.includes(idx);

              let optionStyle = 'bg-slate-50 text-slate-800 border-slate-200 hover:border-indigo-400 hover:bg-sky-50/50';

              if (isAnswered) {
                if (isCorrect) {
                  optionStyle = 'bg-emerald-50 text-emerald-950 border-emerald-500 font-extrabold ring-2 ring-emerald-400/50';
                } else if (isSelected && !isCorrect) {
                  optionStyle = 'bg-rose-50 text-rose-950 border-rose-500 font-extrabold';
                } else {
                  optionStyle = 'bg-slate-100 text-slate-400 border-slate-200 opacity-50';
                }
              } else if (isEliminated) {
                optionStyle = 'bg-slate-100 text-slate-400 border-slate-200 line-through opacity-40 pointer-events-none';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered || isEliminated}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between group ${optionStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm border transition-all ${
                      isAnswered && isCorrect
                        ? 'bg-emerald-500 text-white border-emerald-600'
                        : isAnswered && isSelected
                        ? 'bg-rose-500 text-white border-rose-600'
                        : 'bg-white text-slate-700 border-slate-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600'
                    }`}>
                      {letter}
                    </span>
                    <span className="font-extrabold text-sm sm:text-base">{option}</span>
                  </div>

                  {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner & AI Explainer Button */}
          {isAnswered && (
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
              <div>
                <div className="text-xs font-black text-indigo-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-indigo-600" /> Explanation Fact
                </div>
                <p className="text-sm text-slate-700 font-medium">{currentQuestion.explanation}</p>
              </div>

              <button
                onClick={handleFetchAiExplanation}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm hover:scale-105 transition-all flex items-center gap-1.5 whitespace-nowrap self-end sm:self-auto"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Ask Gemini AI</span>
              </button>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Mic className="w-3.5 h-3.5 text-slate-400" />
              <span>Voice commands enabled</span>
            </div>

            {isAnswered && (
              <button
                onClick={handleNextQuestion}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm sm:text-base shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'Complete Quiz'}</span>
                <ArrowRight className="w-5 h-5 text-white" />
              </button>
            )}
          </div>

        </div>
      </>
      ) : (
        /* Quiz Completion Summary Screen */
        <div className="bg-white border border-slate-200/80 rounded-[2rem] p-6 sm:p-10 text-center shadow-sm relative overflow-hidden animate-fadeIn">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-600 p-1 mb-6 shadow-lg shadow-indigo-200 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-amber-300" />
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-indigo-950 mb-2">
            Quiz Completed! 🎉
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mb-8 font-medium">
            You scored <span className="text-indigo-600 font-black">{score} Points</span> with <span className="text-emerald-600 font-black">{Math.round((correctCount / questions.length) * 100)}% Accuracy</span>!
          </p>

          <div className="grid grid-cols-3 gap-3 mb-8 max-w-lg mx-auto">
            <div className="bg-sky-50 p-4 rounded-2xl border border-sky-100">
              <div className="text-2xl font-black text-indigo-900">{score}</div>
              <div className="text-xs text-slate-500 font-extrabold">Total Score</div>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
              <div className="text-2xl font-black text-emerald-700">{correctCount}/{questions.length}</div>
              <div className="text-xs text-emerald-800 font-extrabold">Correct</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
              <div className="text-2xl font-black text-purple-700">+{score / 10} XP</div>
              <div className="text-xs text-purple-800 font-extrabold">XP Gained</div>
            </div>
          </div>

          {!user.lifetimeUnlocked && (
            <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-pink-500/10 border border-orange-500/30 rounded-2xl p-5 mb-8 max-w-lg mx-auto text-left">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-white text-sm">Enjoying Demo Mode?</h3>
              </div>
              <p className="text-xs text-slate-300 mb-3">
                Unlock lifetime unlimited categories, voice packs, custom question creator, and cloud sync for as low as 10 cents!
              </p>
              <button
                onClick={onOpenUnlockModal}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-extrabold text-xs shadow-md hover:scale-[1.02] transition-all"
              >
                Unlock Lifetime Pro Access ($0.10)
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                sound.playVictory();
                triggerCelebrationConfetti(correctCount / questions.length);
              }}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm transition-all shadow-md hover:scale-105 flex items-center gap-2"
            >
              <PartyPopper className="w-4 h-4 text-amber-300" />
              <span>Celebrate Again! 🎉</span>
            </button>
            <button
              onClick={handleRestartQuiz}
              className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span>Play Again</span>
            </button>
          </div>
        </div>
      )}

      {/* AI Explanation Modal */}
      {showExplanationModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-scaleUp">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="font-extrabold text-lg text-white">Gemini AI Explainer</h3>
              </div>
              <button
                onClick={() => setShowExplanationModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {loadingAiExplanation ? (
              <div className="py-8 text-center space-y-3">
                <Brain className="w-10 h-10 text-purple-400 animate-pulse mx-auto" />
                <p className="text-xs text-slate-400 font-medium">Asking Gemini AI for deep trivia insights...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 text-sm text-slate-200 leading-relaxed">
                  {aiExplanation}
                </div>
                <button
                  onClick={() => setShowExplanationModal(false)}
                  className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all"
                >
                  Got It!
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
