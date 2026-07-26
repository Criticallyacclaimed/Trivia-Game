import React, { useState, useEffect } from 'react';
import { LeaderboardEntry, AgeGroup } from '../types';
import { sound } from '../lib/soundEffects';
import { Trophy, Award, Flame, Globe, Filter, Sparkles, ShieldCheck } from 'lucide-react';

interface LeaderboardsViewProps {
  currentUserId: string;
}

export const LeaderboardsView: React.FC<LeaderboardsViewProps> = ({ currentUserId }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [selectedAge, setSelectedAge] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboards')
      .then((res) => res.json())
      .then((data) => {
        setEntries(data.leaderboards || []);
      })
      .catch((e) => console.warn('Leaderboard fetch error', e))
      .finally(() => setLoading(false));
  }, []);

  const filteredEntries = entries.filter((e) => {
    if (selectedAge === 'All') return true;
    return e.ageGroup === selectedAge;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      {/* Leaderboard Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-extrabold uppercase tracking-wider mb-3">
          <Trophy className="w-4 h-4 text-amber-600" />
          <span>Daily Global Ranks</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-indigo-950 mb-2">
          Daily MindSpark Hall of Fame
        </h1>
        <p className="text-slate-500 text-sm font-medium">
          Top trivia masters across Kids, Adults, and Senior age groups!
        </p>
      </div>

      {/* Age Filter Tabs */}
      <div className="flex justify-center gap-2 mb-8 bg-sky-100/60 p-2 rounded-2xl border border-sky-200/60 max-w-md mx-auto">
        {['All', 'Kids', 'Adults', 'Seniors'].map((age) => (
          <button
            key={age}
            onClick={() => { setSelectedAge(age); sound.playClick(); }}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
              selectedAge === age
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-indigo-900'
            }`}
          >
            {age === 'All' ? '🌟 All Ranks' : age === 'Kids' ? '🧒 Kids' : age === 'Seniors' ? '👵 Seniors' : '🧑 Adults'}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white border border-slate-200/80 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider">
            <span>Rank</span>
            <span>•</span>
            <span>Player</span>
          </div>
          <div className="flex items-center gap-6 text-xs font-black text-slate-500 uppercase tracking-wider">
            <span className="hidden sm:inline">Category</span>
            <span>Score</span>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm font-medium">Loading daily leaderboard...</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredEntries.map((entry, idx) => {
              const isTop1 = idx === 0;
              const isTop2 = idx === 1;
              const isTop3 = idx === 2;

              return (
                <div
                  key={entry.id}
                  className={`p-4 sm:px-6 flex items-center justify-between hover:bg-sky-50/50 transition-colors ${
                    entry.id === currentUserId ? 'bg-amber-50 border-l-4 border-amber-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Rank Number / Badge */}
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm">
                      {isTop1 ? (
                        <span className="text-xl">🥇</span>
                      ) : isTop2 ? (
                        <span className="text-xl">🥈</span>
                      ) : isTop3 ? (
                        <span className="text-xl">🥉</span>
                      ) : (
                        <span className="text-slate-400 font-bold">#{idx + 1}</span>
                      )}
                    </div>

                    {/* Avatar & Username */}
                    <img src={entry.avatar} alt={entry.username} className="w-10 h-10 rounded-xl object-cover" referrerPolicy="no-referrer" />
                    <div>
                      <div className="text-sm font-black text-indigo-950 flex items-center gap-2">
                        <span>{entry.username}</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] text-slate-600 font-bold border border-slate-200">
                          {entry.country}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 font-medium">
                        <span className="text-indigo-600 font-bold">{entry.ageGroup} Group</span>
                        <span>•</span>
                        <span>{entry.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="hidden sm:inline text-xs text-slate-500 font-bold">{entry.category}</span>
                    <div className="text-right">
                      <div className="text-base sm:text-lg font-black text-indigo-900">{entry.score}</div>
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Points</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
