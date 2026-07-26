import React, { useState, useEffect } from 'react';
import { TriviaQuestion, MultiplayerPlayer } from '../types';
import { sound } from '../lib/soundEffects';
import { triggerCelebrationConfetti } from '../lib/confetti';
import { hapticSuccess, hapticFailure, hapticVictory, hapticLight } from '../lib/haptics';
import { 
  Users, Bot, Smartphone, Trophy, Play, CheckCircle2, 
  XCircle, RotateCcw, Share2, Copy, Sparkles, UserPlus, Shield, Check
} from 'lucide-react';

interface MultiplayerHubProps {
  questions: TriviaQuestion[];
  onOpenUnlockModal: () => void;
  isProUnlocked: boolean;
}

interface AiBotOption {
  id: string;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  accuracy: number;
  description: string;
  avatar: string;
  icon: string;
  badgeStyle: string;
}

const AI_BOTS: AiBotOption[] = [
  {
    id: 'einstein',
    name: 'Einstein Bot',
    difficulty: 'Hard',
    accuracy: 0.9,
    description: 'Master mind! High accuracy science & history genius (90% accuracy)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    icon: '🤖',
    badgeStyle: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  {
    id: 'whiz_kid',
    name: 'Whiz Kid Bot',
    difficulty: 'Medium',
    accuracy: 0.7,
    description: 'Smart companion! Loves nature, cartoons & pop culture (70% accuracy)',
    avatar: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=150&q=80',
    icon: '🐱',
    badgeStyle: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  {
    id: 'buddy',
    name: 'Buddy Bot',
    difficulty: 'Easy',
    accuracy: 0.5,
    description: 'Friendly beginner bot! Great for quick casual practice (50% accuracy)',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    icon: '🐶',
    badgeStyle: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
];

export const MultiplayerHub: React.FC<MultiplayerHubProps> = ({
  questions,
  onOpenUnlockModal,
  isProUnlocked,
}) => {
  const [mode, setMode] = useState<'pass_play' | 'versus_ai' | 'online_room'>('pass_play');
  const [selectedAiBotId, setSelectedAiBotId] = useState<string>('whiz_kid');
  
  // Pass & Play setup
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [players, setPlayers] = useState<MultiplayerPlayer[]>([
    { id: '1', name: 'Player 1 (Kid)', avatar: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=150&q=80', score: 0, streak: 0 },
    { id: '2', name: 'Player 2 (Grandpa)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', score: 0, streak: 0 },
  ]);
  
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [roomCode] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());
  const [copiedCode, setCopiedCode] = useState(false);

  const currentQuestion = questions[currentQuestionIndex] || questions[0];
  const activePlayer = players[activePlayerIndex];

  // Reset Game Progress State
  const resetGameState = () => {
    setGameStarted(false);
    setCurrentQuestionIndex(0);
    setActivePlayerIndex(0);
    setIsAnswered(false);
    setSelectedOption(null);
  };

  // Switch Mode and Cancel Ongoing Game
  const handleSelectMode = (newMode: 'pass_play' | 'versus_ai' | 'online_room') => {
    sound.playClick();
    setMode(newMode);
    resetGameState();

    if (newMode === 'pass_play') {
      const newPlayers: MultiplayerPlayer[] = Array.from({ length: playerCount }, (_, i) => ({
        id: `${i + 1}`,
        name: `Player ${i + 1}`,
        avatar: [
          'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=150&q=80',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        ][i % 4],
        score: 0,
        streak: 0,
      }));
      setPlayers(newPlayers);
    } else if (newMode === 'versus_ai') {
      const selectedBot = AI_BOTS.find((b) => b.id === selectedAiBotId) || AI_BOTS[0];
      setPlayers([
        { id: '1', name: 'You (Human)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', score: 0, streak: 0 },
        {
          id: '2',
          name: `${selectedBot.name} ${selectedBot.icon}`,
          avatar: selectedBot.avatar,
          score: 0,
          streak: 0,
          isAI: true,
          aiDifficulty: selectedBot.difficulty,
          aiAccuracy: selectedBot.accuracy,
        },
      ]);
    } else if (newMode === 'online_room') {
      setPlayers([
        { id: '1', name: 'Host (You)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', score: 0, streak: 0 },
        { id: '2', name: 'Guest Player', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', score: 0, streak: 0 },
      ]);
    }
  };

  // Select AI Bot difficulty
  const handleSelectBot = (botId: string) => {
    sound.playClick();
    setSelectedAiBotId(botId);
    const selectedBot = AI_BOTS.find((b) => b.id === botId) || AI_BOTS[0];
    setPlayers([
      { id: '1', name: 'You (Human)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', score: 0, streak: 0 },
      {
        id: '2',
        name: `${selectedBot.name} ${selectedBot.icon}`,
        avatar: selectedBot.avatar,
        score: 0,
        streak: 0,
        isAI: true,
        aiDifficulty: selectedBot.difficulty,
        aiAccuracy: selectedBot.accuracy,
      },
    ]);
  };

  // Cancel Current Match
  const handleCancelMatch = () => {
    sound.playClick();
    resetGameState();
  };

  // Update Player count for Pass & Play
  const handleUpdatePlayerCount = (count: number) => {
    sound.playClick();
    setPlayerCount(count);
    const newPlayers: MultiplayerPlayer[] = Array.from({ length: count }, (_, i) => ({
      id: `${i + 1}`,
      name: `Player ${i + 1}`,
      avatar: [
        'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=150&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      ][i % 4],
      score: 0,
      streak: 0,
    }));
    setPlayers(newPlayers);
  };

  // Start Multiplayer match
  const handleStartMatch = () => {
    sound.playClick();
    sound.playVictory();
    setPlayers((prev) => prev.map((p) => ({ ...p, score: 0, streak: 0 })));
    setGameStarted(true);
    setCurrentQuestionIndex(0);
    setActivePlayerIndex(0);
    setIsAnswered(false);
    setSelectedOption(null);
  };

  // Handle Turn Answer
  const handleAnswerQuestion = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIndex);
    setIsAnswered(true);

    const isCorrect = optionIndex === currentQuestion.correctAnswer;

    if (isCorrect) {
      sound.playCorrect();
      hapticSuccess();
      setPlayers((prev) =>
        prev.map((p, idx) =>
          idx === activePlayerIndex
            ? { ...p, score: p.score + 100 + p.streak * 20, streak: p.streak + 1 }
            : p
        )
      );
    } else {
      sound.playWrong();
      hapticFailure();
      setPlayers((prev) =>
        prev.map((p, idx) => (idx === activePlayerIndex ? { ...p, streak: 0 } : p))
      );
    }
  };

  // AI Turn Handler
  useEffect(() => {
    if (!gameStarted || isAnswered || mode !== 'versus_ai') return;
    const currentP = players[activePlayerIndex];
    if (currentP?.isAI) {
      const timer = setTimeout(() => {
        const q = questions[currentQuestionIndex] || questions[0];
        let chosenOption = q.correctAnswer;
        const accuracy = currentP.aiAccuracy ?? 0.7;
        if (Math.random() > accuracy) {
          const wrongOptions = [0, 1, 2, 3].filter((i) => i !== q.correctAnswer);
          chosenOption = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
        }
        handleAnswerQuestion(chosenOption);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [gameStarted, activePlayerIndex, isAnswered, currentQuestionIndex, mode, questions, players]);

  // Move to next player turn
  const handleNextTurn = () => {
    sound.playClick();
    setIsAnswered(false);
    setSelectedOption(null);

    // Rotate player
    const nextPlayerIdx = (activePlayerIndex + 1) % players.length;
    setActivePlayerIndex(nextPlayerIdx);

    // Advance question after full round
    if (nextPlayerIdx === 0) {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        // End of match
        sound.playVictory();
        hapticVictory();
        triggerCelebrationConfetti(1.0);
      }
    }
  };

  // Copy Room Code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    sound.playClick();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-extrabold uppercase tracking-wider mb-3">
          <Users className="w-4 h-4 text-indigo-600" />
          <span>Cross-Generational Multiplayer</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-indigo-950 mb-2">
          Play Together on Mobile or Tablet
        </h1>
        <p className="text-slate-500 text-sm font-medium">
          Challenge your kids, parents, and grandparents in local Pass & Play, Versus AI, or Private Room mode!
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex justify-center gap-2 mb-8 bg-sky-100/60 p-2 rounded-2xl border border-sky-200/60 max-w-md mx-auto">
        <button
          onClick={() => handleSelectMode('pass_play')}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 ${
            mode === 'pass_play'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-indigo-900'
          }`}
        >
          <Smartphone className="w-4 h-4" /> Pass & Play
        </button>

        <button
          onClick={() => handleSelectMode('versus_ai')}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 ${
            mode === 'versus_ai'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-indigo-900'
          }`}
        >
          <Bot className="w-4 h-4" /> Versus AI
        </button>

        <button
          onClick={() => handleSelectMode('online_room')}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 ${
            mode === 'online_room'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-indigo-900'
          }`}
        >
          <Users className="w-4 h-4" /> Live Room
        </button>
      </div>

      {!gameStarted ? (
        /* Setup View */
        <div className="bg-white border border-slate-200/80 rounded-[2rem] p-6 sm:p-10 shadow-sm max-w-xl mx-auto text-center">
          
          {mode === 'pass_play' && (
            <div>
              <h3 className="text-xl font-black text-indigo-950 mb-1">Local Pass & Play</h3>
              <p className="text-xs text-slate-500 font-medium mb-6">Take turns answering questions on a single phone or tablet!</p>

              <div className="mb-6">
                <label className="text-xs font-bold text-slate-600 block mb-3">Number of Players:</label>
                <div className="flex justify-center gap-3">
                  {[2, 3, 4].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleUpdatePlayerCount(num)}
                      className={`w-12 h-12 rounded-2xl font-black text-base border transition-all ${
                        playerCount === num
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Player list */}
              <div className="space-y-3 mb-8 text-left">
                {players.map((p, idx) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-2xl bg-sky-50/60 border border-sky-100">
                    <div className="flex items-center gap-3">
                      <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-xl object-cover" referrerPolicy="no-referrer" />
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          setPlayers((prev) => prev.map((pl, i) => (i === idx ? { ...pl, name } : pl)));
                        }}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <span className="text-xs text-indigo-600 font-bold">Player {idx + 1}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleStartMatch}
                className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base shadow-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>Start Pass & Play Match</span>
              </button>
            </div>
          )}

          {mode === 'versus_ai' && (
            <div>
              <h3 className="text-xl font-black text-indigo-950 mb-1">Versus AI Bots</h3>
              <p className="text-xs text-slate-500 font-medium mb-6">Choose an AI bot difficulty level and test your trivia skills!</p>

              <div className="space-y-3 mb-8 text-left">
                {AI_BOTS.map((bot) => {
                  const isSelected = selectedAiBotId === bot.id;
                  return (
                    <button
                      key={bot.id}
                      type="button"
                      onClick={() => handleSelectBot(bot.id)}
                      className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between group ${
                        isSelected
                          ? 'bg-indigo-50/90 border-indigo-600 shadow-sm ring-2 ring-indigo-500/20'
                          : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-sky-50/40'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="relative">
                          <img
                            src={bot.avatar}
                            alt={bot.name}
                            className="w-11 h-11 rounded-2xl object-cover border border-slate-200"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute -bottom-1 -right-1 text-xs">{bot.icon}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-black text-slate-900 group-hover:text-indigo-950">
                              {bot.name}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${bot.badgeStyle}`}>
                              {bot.difficulty}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">
                            {bot.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex-shrink-0 ml-3">
                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-300 bg-slate-50 group-hover:border-slate-400'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {(() => {
                const activeBot = AI_BOTS.find((b) => b.id === selectedAiBotId) || AI_BOTS[0];
                return (
                  <button
                    type="button"
                    onClick={handleStartMatch}
                    className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base shadow-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Bot className="w-5 h-5 text-white" />
                    <span>Challenge {activeBot.name} ({activeBot.difficulty})</span>
                  </button>
                );
              })()}
            </div>
          )}

          {mode === 'online_room' && (
            <div>
              <h3 className="text-xl font-black text-indigo-950 mb-1">Simulated Live Room</h3>
              <p className="text-xs text-slate-500 font-medium mb-6">Host a private match with room code for cross-platform play!</p>

              <div className="bg-sky-50/80 border border-sky-100 p-4 rounded-2xl mb-6">
                <span className="text-xs font-bold text-slate-600 block mb-1">Your Private Room Code:</span>
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-2xl font-black text-indigo-900 tracking-widest">{roomCode}</span>
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center gap-1 hover:bg-indigo-700 transition-all"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              <button
                onClick={handleStartMatch}
                className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base shadow-sm hover:scale-[1.02] transition-all"
              >
                Launch Room Match
              </button>
            </div>
          )}

        </div>
      ) : (
        /* Active Multiplayer Gameplay */
        <div className="bg-white border border-slate-200/80 rounded-[2rem] p-6 sm:p-8 shadow-sm">
          
          {/* Active Header with Exit/Cancel match */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-wider">
              {mode === 'pass_play' ? '📱 Pass & Play Match' : mode === 'versus_ai' ? '🤖 Versus AI Match' : '🌐 Live Room Match'}
            </span>
            <button
              onClick={handleCancelMatch}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Cancel Match</span>
            </button>
          </div>

          {/* Live Scoreboard Header */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {players.map((p, idx) => (
              <div
                key={p.id}
                className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                  idx === activePlayerIndex
                    ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-400/40'
                    : 'bg-slate-50 border-slate-200 opacity-70'
                }`}
              >
                <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-xl object-cover" referrerPolicy="no-referrer" />
                <div>
                  <div className="text-xs font-bold text-slate-800 truncate max-w-[90px]">{p.name}</div>
                  <div className="text-sm font-black text-indigo-600">{p.score} PTS</div>
                </div>
              </div>
            ))}
          </div>

          {/* Turn Alert */}
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl mb-6 text-center">
            <span className="text-xs font-extrabold text-indigo-700 uppercase tracking-wider block">Current Turn:</span>
            <h3 className="text-lg sm:text-xl font-black text-indigo-950 flex items-center justify-center gap-2">
              <span>{activePlayer?.name}'s Turn</span>
              {activePlayer?.isAI && <Bot className="w-5 h-5 text-indigo-600" />}
            </h3>
          </div>

          {/* Question Card */}
          <div className="mb-6">
            <div className="relative h-48 rounded-2xl overflow-hidden mb-4 border border-slate-200">
              <img src={currentQuestion.imageUrl} alt={currentQuestion.question} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-indigo-950 mb-4">{currentQuestion.question}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQuestion.correctAnswer;

                let btnStyle = 'bg-slate-50 text-slate-800 border-slate-200 hover:border-indigo-400';
                if (isAnswered) {
                  if (isCorrect) btnStyle = 'bg-emerald-50 text-emerald-950 border-emerald-500 font-bold';
                  else if (isSelected) btnStyle = 'bg-rose-50 text-rose-950 border-rose-500';
                  else btnStyle = 'bg-slate-100 text-slate-400 border-slate-200';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswerQuestion(idx)}
                    disabled={isAnswered}
                    className={`p-4 rounded-2xl border text-left transition-all ${btnStyle}`}
                  >
                    <span className="font-bold text-sm">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {isAnswered && (
            <button
              onClick={handleNextTurn}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-sm hover:scale-[1.02] transition-all"
            >
              Next Player's Turn
            </button>
          )}

        </div>
      )}

    </div>
  );
};

