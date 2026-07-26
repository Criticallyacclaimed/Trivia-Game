import React, { useState } from 'react';
import { Category, AgeGroup, TriviaQuestion } from '../types';
import { CATEGORIES_CONFIG } from '../data/triviaDatabase';
import { sound } from '../lib/soundEffects';
import { 
  Sparkles, Layers, Lock, Play, ArrowRight, 
  Brain, Plus, RefreshCw, Zap
} from 'lucide-react';

interface CategorySelectorProps {
  ageGroup: AgeGroup;
  onChangeAgeGroup: (age: AgeGroup) => void;
  onSelectCategory: (category: Category) => void;
  isProUnlocked: boolean;
  onOpenUnlockModal: () => void;
  onQuestionsGenerated: (questions: TriviaQuestion[]) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  ageGroup,
  onChangeAgeGroup,
  onSelectCategory,
  isProUnlocked,
  onOpenUnlockModal,
  onQuestionsGenerated,
}) => {
  const [loadingAiCategory, setLoadingAiCategory] = useState<string | null>(null);

  // Generate dynamic AI questions via server endpoint
  const handleGenerateAiQuiz = async (categoryTitle: Category) => {
    sound.playClick();
    setLoadingAiCategory(categoryTitle);

    try {
      const res = await fetch('/api/gemini/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: categoryTitle,
          difficulty: ageGroup,
          count: 5
        })
      });
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        onQuestionsGenerated(data.questions);
        sound.playVictory();
      }
    } catch (e) {
      console.error('Failed to generate AI questions', e);
    } finally {
      setLoadingAiCategory(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Category Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-extrabold uppercase tracking-wider mb-3">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>Categorized Picture Trivia</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-indigo-900 mb-3 tracking-tight">
          Pick Your Favorite Topic
        </h1>
        <p className="text-slate-500 text-sm sm:text-base font-medium">
          Every trivia question features rich visual context images. Designed for all ages from curious kids to wise seniors.
        </p>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {CATEGORIES_CONFIG.map((cat, idx) => {
          const isDemoUnlocked = idx < 3 || isProUnlocked; // 3 categories free in demo mode
          const isLoading = loadingAiCategory === cat.id;

          return (
            <div
              key={cat.id}
              className="group relative bg-white border border-slate-200/80 hover:border-indigo-300 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between p-2"
            >
              {/* Image Banner */}
              <div className="relative h-44 overflow-hidden rounded-[1.5rem]">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                
                {/* Demo / Pro Badge */}
                <div className="absolute top-3 right-3">
                  {isDemoUnlocked ? (
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-500 text-slate-950 font-black text-[10px] shadow-sm">
                      Free Demo
                    </span>
                  ) : (
                    <button
                      onClick={() => { onOpenUnlockModal(); sound.playClick(); }}
                      className="px-2.5 py-1 rounded-xl bg-slate-900/90 text-amber-300 border border-slate-700 text-[10px] font-extrabold flex items-center gap-1 shadow-md hover:scale-105 transition-all"
                    >
                      <Lock className="w-3 h-3 text-amber-400" /> Pro ($0.10)
                    </button>
                  )}
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                    {cat.title}
                  </h3>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-600 mb-5 leading-relaxed font-medium">
                  {cat.description}
                </p>

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      if (isDemoUnlocked) {
                        onSelectCategory(cat.id);
                        sound.playClick();
                      } else {
                        onOpenUnlockModal();
                        sound.playClick();
                      }
                    }}
                    className={`w-full py-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-sm ${
                      isDemoUnlocked
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-[1.02]'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {isDemoUnlocked ? (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        <span>Play {cat.title}</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-amber-500" />
                        <span>Unlock for $0.10</span>
                      </>
                    )}
                  </button>

                  {/* AI Questions Generator Button */}
                  {isDemoUnlocked && (
                    <button
                      onClick={() => handleGenerateAiQuiz(cat.id)}
                      disabled={isLoading}
                      className="w-full py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 font-extrabold text-[11px] transition-all flex items-center justify-center gap-1.5"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                          <span>Generating AI Quiz...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Fresh Gemini AI Quiz</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
