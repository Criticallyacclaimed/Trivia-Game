import React, { useState } from 'react';
import { UserAccount, GeoPricing, AgeGroup } from '../types';
import { 
  Mic, MicOff, Cloud, CloudOff, Sparkles, Trophy, 
  User, Volume2, VolumeX, Type, ShieldCheck, Zap, 
  Lock, Globe, Smartphone, Heart, HelpCircle, Layers
} from 'lucide-react';
import { sound } from '../lib/soundEffects';

interface NavbarProps {
  user: UserAccount;
  isOnline: boolean;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  geoPricing: GeoPricing | null;
  isListening: boolean;
  toggleListening: () => void;
  onOpenUnlockModal: () => void;
  onOpenProfileModal: () => void;
  onChangeAgeGroup: (age: AgeGroup) => void;
  activeTab: 'play' | 'categories' | 'multiplayer' | 'leaderboards' | 'submit' | 'senior';
  setActiveTab: (tab: 'play' | 'categories' | 'multiplayer' | 'leaderboards' | 'submit' | 'senior') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  isOnline,
  syncStatus,
  geoPricing,
  isListening,
  toggleListening,
  onOpenUnlockModal,
  onOpenProfileModal,
  onChangeAgeGroup,
  activeTab,
  setActiveTab,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);

  const handleToggleSound = () => {
    sound.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) sound.playClick();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-sky-100 text-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveTab('play'); sound.playClick(); }}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl sm:text-2xl tracking-tight text-indigo-900">
                  MindSpark<span className="text-indigo-500">Trivia</span>
                </span>
                <span className="hidden md:inline-block px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider uppercase rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                  Bento Edition
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-500 font-medium">
                For Kids, Adults & Seniors
              </p>
            </div>
          </div>

          {/* Navigation Links - Desktop & Tablet */}
          <nav className="hidden lg:flex items-center gap-1 bg-sky-100/60 p-1.5 rounded-2xl border border-sky-200/60">
            <button
              onClick={() => { setActiveTab('play'); sound.playClick(); }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'play'
                  ? 'bg-indigo-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-indigo-900 hover:bg-white/60'
              }`}
            >
              <Zap className="w-4 h-4" /> Quick Play
            </button>

            <button
              onClick={() => { setActiveTab('categories'); sound.playClick(); }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'categories'
                  ? 'bg-indigo-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-indigo-900 hover:bg-white/60'
              }`}
            >
              <Layers className="w-4 h-4" /> Categories
            </button>

            <button
              onClick={() => { setActiveTab('multiplayer'); sound.playClick(); }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'multiplayer'
                  ? 'bg-indigo-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-indigo-900 hover:bg-white/60'
              }`}
            >
              <Smartphone className="w-4 h-4" /> Multiplayer
            </button>

            <button
              onClick={() => { setActiveTab('leaderboards'); sound.playClick(); }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'leaderboards'
                  ? 'bg-indigo-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-indigo-900 hover:bg-white/60'
              }`}
            >
              <Trophy className="w-4 h-4" /> Leaderboard
            </button>

            <button
              onClick={() => { setActiveTab('submit'); sound.playClick(); }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'submit'
                  ? 'bg-indigo-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-indigo-900 hover:bg-white/60'
              }`}
            >
              <Heart className="w-4 h-4" /> Submit Quiz
            </button>
          </nav>

          {/* Action Tools & User Account */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Voice Command Button */}
            <button
              onClick={toggleListening}
              title={isListening ? "Voice Commands Active - Listening..." : "Enable Voice Commands"}
              className={`relative p-2 sm:p-2.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-600 shadow-md animate-pulse'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {isListening ? (
                <>
                  <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  <span className="hidden md:inline text-xs font-bold text-white">Listening...</span>
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                </>
              ) : (
                <>
                  <MicOff className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                  <span className="hidden md:inline text-xs font-semibold">Voice Off</span>
                </>
              )}
            </button>

            {/* Sound Toggle */}
            <button
              onClick={handleToggleSound}
              className="p-2 sm:p-2.5 rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all"
              title={soundEnabled ? "Mute sound effects" : "Enable sound effects"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />}
            </button>

            {/* Sync / Offline Status Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              {isOnline ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-800 font-bold">Cloud Synced</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-amber-800 font-bold">Offline Mode</span>
                </>
              )}
            </div>

            {/* Lifetime Pro Badge / Demo Upgrade Button */}
            {user.lifetimeUnlocked ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Lifetime Pro</span>
              </div>
            ) : (
              <button
                onClick={() => { onOpenUnlockModal(); sound.playClick(); }}
                className="group relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 shadow-md flex items-center gap-1.5"
              >
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Upgrade</span>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-400 text-emerald-950 text-[10px] font-black ml-0.5">
                  {geoPricing?.priceText || '$0.10'}
                </span>
              </button>
            )}

            {/* User Profile Trigger */}
            <button
              onClick={() => { onOpenProfileModal(); sound.playClick(); }}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all text-left"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl object-cover ring-2 ring-indigo-500/20"
                referrerPolicy="no-referrer"
              />
              <div className="hidden xl:block">
                <div className="text-xs font-bold text-slate-800 truncate max-w-[100px]">
                  {user.name}
                </div>
                <div className="text-[10px] text-amber-700 font-bold flex items-center gap-1">
                  Level {user.level} • {user.xp} XP
                </div>
              </div>
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Sticky Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-sky-100 py-2 px-3 shadow-lg">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button
            onClick={() => { setActiveTab('play'); sound.playClick(); }}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
              activeTab === 'play' ? 'text-indigo-600 scale-110' : 'text-slate-500'
            }`}
          >
            <Zap className="w-5 h-5" />
            <span>Play</span>
          </button>

          <button
            onClick={() => { setActiveTab('categories'); sound.playClick(); }}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
              activeTab === 'categories' ? 'text-indigo-600 scale-110' : 'text-slate-500'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span>Topics</span>
          </button>

          <button
            onClick={() => { setActiveTab('multiplayer'); sound.playClick(); }}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
              activeTab === 'multiplayer' ? 'text-indigo-600 scale-110' : 'text-slate-500'
            }`}
          >
            <Smartphone className="w-5 h-5" />
            <span>Versus</span>
          </button>

          <button
            onClick={() => { setActiveTab('leaderboards'); sound.playClick(); }}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
              activeTab === 'leaderboards' ? 'text-indigo-600 scale-110' : 'text-slate-500'
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span>Ranks</span>
          </button>

          <button
            onClick={() => { setActiveTab('submit'); sound.playClick(); }}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
              activeTab === 'submit' ? 'text-indigo-600 scale-110' : 'text-slate-500'
            }`}
          >
            <Heart className="w-5 h-5" />
            <span>Submit</span>
          </button>
        </div>
      </div>
    </header>
  );
};
