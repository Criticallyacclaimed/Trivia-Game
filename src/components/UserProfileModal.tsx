import React, { useState } from 'react';
import { UserAccount } from '../types';
import { sound } from '../lib/soundEffects';
import { ACHIEVEMENTS } from '../lib/achievements';
import { triggerStreakConfetti } from '../lib/confetti';
import { hapticLight, hapticSuccess } from '../lib/haptics';
import { User, Award, ShieldCheck, Check, Lock, Star } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  onSaveUser: (updated: Partial<UserAccount>) => void;
  onLoginSSO: (provider: 'google' | 'apple', name: string, email: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onSaveUser,
  onLoginSSO,
}) => {
  const [activeBadgeTab, setActiveBadgeTab] = useState<'all' | 'unlocked' | 'locked'>('all');

  if (!isOpen) return null;

  // Calculate achievement metrics
  const userBadgeSet = new Set(user.badges || []);
  const processedAchievements = ACHIEVEMENTS.map((ach) => {
    const isUnlocked = userBadgeSet.has(ach.title) || userBadgeSet.has(ach.id) || ach.checkUnlocked(user);
    const progress = ach.getProgress(user);
    return {
      ...ach,
      isUnlocked,
      progress,
    };
  });

  const unlockedCount = processedAchievements.filter((a) => a.isUnlocked).length;

  const filteredAchievements = processedAchievements.filter((ach) => {
    if (activeBadgeTab === 'unlocked') return ach.isUnlocked;
    if (activeBadgeTab === 'locked') return !ach.isUnlocked;
    return true;
  });

  const handleBadgeClick = (ach: (typeof processedAchievements)[0]) => {
    sound.playClick();
    hapticLight();
    if (ach.isUnlocked) {
      sound.playCorrect();
      hapticSuccess();
      triggerStreakConfetti();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200/80 rounded-[2rem] p-6 sm:p-8 max-w-2xl w-full shadow-lg relative my-8 animate-scaleUp max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-100 text-indigo-700">
              <User className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-indigo-950">Your MindSpark Profile</h2>
              <p className="text-xs text-slate-500 font-medium">Manage preferences & view earned achievements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors font-bold"
          >
            ✕
          </button>
        </div>

        {/* User Profile Card */}
        <div className="flex items-center gap-4 bg-gradient-to-r from-sky-50/80 to-indigo-50/50 p-4 sm:p-5 rounded-2xl border border-sky-100 mb-6">
          <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-2xl object-cover ring-4 ring-indigo-500/20 shadow-sm" referrerPolicy="no-referrer" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-black text-indigo-950 truncate">{user.name}</h3>
              <span className="px-2.5 py-1 rounded-full bg-indigo-600 text-white text-xs font-black shadow-sm flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                <span>Level {user.level}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mb-2 truncate">{user.email}</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                {user.provider === 'google' ? 'Google SSO' : user.provider === 'apple' ? 'Apple ID' : 'Guest Account'}
              </span>
              {user.lifetimeUnlocked && (
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Lifetime Pro
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SSO Options for Guest */}
        {user.provider === 'guest' && (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6">
            <span className="text-xs font-bold text-slate-700 block mb-2.5">Sync Progress across devices with SSO:</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  sound.playClick();
                  onLoginSSO('google', 'Alex (Google User)', 'alex.google@mindspark.app');
                }}
                className="py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <span>Google Login</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onLoginSSO('apple', 'Taylor (Apple User)', 'taylor.apple@mindspark.app');
                }}
                className="py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <span>Apple Login</span>
              </button>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-100 text-center">
            <div className="text-xl font-black text-amber-900">{user.highestScore}</div>
            <div className="text-[10px] text-amber-700 font-black uppercase">High Score</div>
          </div>
          <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-100 text-center">
            <div className="text-xl font-black text-emerald-900">{user.totalCorrect}/{user.totalQuestions}</div>
            <div className="text-[10px] text-emerald-700 font-black uppercase">Correct</div>
          </div>
          <div className="bg-indigo-50/80 p-3.5 rounded-2xl border border-indigo-100 text-center">
            <div className="text-xl font-black text-indigo-900">{user.highestStreak}🔥</div>
            <div className="text-[10px] text-indigo-700 font-black uppercase">Best Streak</div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500 stroke-[2.5]" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                Milestone Badges ({unlockedCount}/{ACHIEVEMENTS.length})
              </h3>
            </div>

            {/* Badges Filter Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
              {(['all', 'unlocked', 'locked'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    sound.playClick();
                    setActiveBadgeTab(tab);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                    activeBadgeTab === tab ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
            {filteredAchievements.map((ach) => (
              <div
                key={ach.id}
                onClick={() => handleBadgeClick(ach)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                  ach.isUnlocked
                    ? `${ach.badgeStyle.bg} ${ach.badgeStyle.border} ${ach.badgeStyle.text} shadow-xs hover:scale-[1.02]`
                    : 'bg-slate-50/80 border-slate-200 text-slate-400 grayscale opacity-75 hover:grayscale-0 hover:opacity-100'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-xs ${ach.badgeStyle.iconBg}`}>
                        {ach.icon}
                      </div>
                      <div>
                        <h4 className="text-xs font-black leading-tight text-slate-900">{ach.title}</h4>
                        <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider border mt-0.5 ${
                          ach.tier === 'Diamond' ? 'bg-indigo-100 text-indigo-900 border-indigo-200' :
                          ach.tier === 'Gold' ? 'bg-amber-100 text-amber-900 border-amber-200' :
                          ach.tier === 'Silver' ? 'bg-slate-200 text-slate-800 border-slate-300' :
                          'bg-orange-100 text-orange-900 border-orange-200'
                        }`}>
                          {ach.tier}
                        </span>
                      </div>
                    </div>

                    {ach.isUnlocked ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-black flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" /> Unlocked
                      </span>
                    ) : (
                      <span className="p-1 rounded-full bg-slate-200 text-slate-500 text-[10px]">
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed mb-2">
                    {ach.description}
                  </p>
                </div>

                {/* Progress bar for locked or milestone tracking */}
                <div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1">
                    <span>{ach.requirementText}</span>
                    <span>{ach.isUnlocked ? '100%' : `${Math.floor(ach.progress.percentage)}%`}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        ach.isUnlocked ? 'bg-emerald-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${ach.isUnlocked ? 100 : ach.progress.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accessibility & Voice Settings */}
        <div className="space-y-4 mb-6">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-700 block">Accessibility & Senior Sizing:</span>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 font-bold">Font Size Scale:</span>
              <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200">
                {(['normal', 'large', 'extra-large'] as const).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => { onSaveUser({ fontSizePreference: sz }); sound.playClick(); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize ${
                      user.fontSizePreference === sz ? 'bg-indigo-600 text-white' : 'text-slate-600'
                    }`}
                  >
                    {sz === 'extra-large' ? 'XL (Seniors)' : sz}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 font-bold">Auto Read Aloud (TTS):</span>
              <button
                onClick={() => { onSaveUser({ autoReadAloud: !user.autoReadAloud }); sound.playClick(); }}
                className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                  user.autoReadAloud ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                {user.autoReadAloud ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-sm border border-slate-200 transition-all"
        >
          Close Profile
        </button>

      </div>
    </div>
  );
};

