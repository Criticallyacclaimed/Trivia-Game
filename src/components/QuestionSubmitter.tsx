import React, { useState } from 'react';
import { Category, AgeGroup } from '../types';
import { CATEGORIES_CONFIG } from '../data/triviaDatabase';
import { sound } from '../lib/soundEffects';
import { Heart, Plus, Image as ImageIcon, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface QuestionSubmitterProps {
  userName: string;
}

export const QuestionSubmitter: React.FC<QuestionSubmitterProps> = ({ userName }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState<number>(0);
  const [category, setCategory] = useState<Category>('Science & Nature');
  const [difficulty, setDifficulty] = useState<AgeGroup>('Adults');
  const [imageUrl, setImageUrl] = useState('');
  const [explanation, setExplanation] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || options.some((o) => !o.trim())) return;

    sound.playClick();
    setSubmitting(true);

    const payload = {
      question,
      options,
      correctAnswer,
      category,
      difficulty,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=800&q=80',
      explanation,
      author: userName || 'Community Member'
    };

    try {
      const res = await fetch('/api/community/submit-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        sound.playVictory();
        setSubmitted(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const sampleImages = [
    'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1547721064-da6cfb341d50?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-50 border border-pink-100 text-pink-700 text-xs font-extrabold uppercase tracking-wider mb-3">
          <Heart className="w-4 h-4 text-pink-600" />
          <span>Community Question Creator</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-indigo-950 mb-2">
          Submit Your Own Picture Trivia
        </h1>
        <p className="text-slate-500 text-sm font-medium">
          Create fun picture trivia questions to inspire kids, adults, and seniors around the world!
        </p>
      </div>

      {submitted ? (
        <div className="bg-white border border-slate-200/80 rounded-[2rem] p-8 text-center max-w-md mx-auto shadow-sm">
          <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-indigo-950 mb-2">Question Submitted!</h2>
          <p className="text-xs text-slate-500 font-medium mb-6">Your question was saved and synced to the community trivia bank.</p>
          <button
            onClick={() => {
              setSubmitted(false);
              setQuestion('');
              setOptions(['', '', '', '']);
              setImageUrl('');
              setExplanation('');
            }}
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm"
          >
            Submit Another Question
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Submission Form */}
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-sm space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Trivia Question Prompt</label>
              <textarea
                rows={3}
                required
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., Which planet is known as the Red Planet?"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Category & Difficulty */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none"
                >
                  {CATEGORIES_CONFIG.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Age Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as AgeGroup)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none"
                >
                  <option value="Kids">🧒 Kids</option>
                  <option value="Adults">🧑 Adults</option>
                  <option value="Seniors">👵 Seniors</option>
                </select>
              </div>
            </div>

            {/* Choices */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Answer Choices (Select Correct Radio)</label>
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctIndex"
                    checked={correctAnswer === idx}
                    onChange={() => setCorrectAnswer(idx)}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <input
                    type="text"
                    required
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Choice ${['A', 'B', 'C', 'D'][idx]}`}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              ))}
            </div>

            {/* Image URL / Quick Picker */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Context Picture Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium focus:outline-none mb-2"
              />
              
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-bold">Quick Sample:</span>
                {sampleImages.map((img, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setImageUrl(img)}
                    className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 hover:border-indigo-500"
                  >
                    <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>

            {/* Explanation */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Fact Explanation</label>
              <input
                type="text"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Brief interesting fact explaining why it is correct!"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-sm hover:scale-[1.02] transition-all"
            >
              {submitting ? 'Submitting...' : 'Submit Picture Trivia'}
            </button>
          </form>

          {/* Live Preview Card */}
          <div>
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-3">Live Card Preview:</span>
            <div className="bg-white border border-slate-200/80 rounded-[2rem] p-5 shadow-sm">
              <div className="relative h-44 rounded-2xl overflow-hidden mb-4 border border-slate-200 bg-slate-100">
                <img
                  src={imageUrl || 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=800&q=80'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 left-2 bg-slate-900/80 px-2.5 py-1 rounded-lg text-[10px] text-amber-300 font-extrabold">
                  {category} • {difficulty}
                </div>
              </div>

              <h3 className="font-black text-indigo-950 text-base mb-4">{question || 'Your Trivia Question Prompt Here...'}</h3>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {options.map((opt, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border text-xs font-bold ${
                      correctAnswer === i
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-500 font-black'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {['A', 'B', 'C', 'D'][i]}: {opt || 'Option'}
                  </div>
                ))}
              </div>

              <div className="text-[11px] text-slate-500 bg-sky-50/60 p-2.5 rounded-xl border border-sky-100 font-medium">
                Author: <span className="text-indigo-600 font-bold">{userName || 'You'}</span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
