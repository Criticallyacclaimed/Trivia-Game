import React, { useState } from 'react';
import { GeoPricing } from '../types';
import { sound } from '../lib/soundEffects';
import { triggerProUnlockConfetti } from '../lib/confetti';
import { Zap, ShieldCheck, Check, Sparkles, Lock, Globe, CreditCard } from 'lucide-react';

interface LifetimeUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  geoPricing: GeoPricing | null;
  onUnlockSuccess: () => void;
}

export const LifetimeUnlockModal: React.FC<LifetimeUnlockModalProps> = ({
  isOpen,
  onClose,
  geoPricing,
  onUnlockSuccess,
}) => {
  const [purchasing, setPurchasing] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  if (!isOpen) return null;

  const handleSimulatePurchase = () => {
    sound.playClick();
    setPurchasing(true);

    setTimeout(() => {
      setPurchasing(false);
      setUnlocked(true);
      sound.playVictory();
      triggerProUnlockConfetti();
      onUnlockSuccess();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/80 rounded-[2rem] p-6 sm:p-8 max-w-lg w-full shadow-lg relative overflow-hidden animate-scaleUp">
        
        {/* Background Decorative Glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-600 fill-indigo-600" />
            <span className="text-xs font-black text-indigo-700 uppercase tracking-wider">Lifetime Pro Upgrade</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors font-bold"
          >
            ✕
          </button>
        </div>

        {unlocked ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-indigo-950 mb-2">Lifetime Pro Unlocked!</h2>
            <p className="text-xs text-slate-500 font-medium mb-6">
              Thank you for supporting MindSpark Trivia World! All categories, voice engines, and cloud sync are now permanently active on your account.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm transition-all"
            >
              Start Playing Unlimited Pro
            </button>
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-100 text-xs font-bold mb-2">
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                <span>Localized Promo for Country: {geoPricing?.country || 'Global'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 tracking-tight mb-2">
                Lifetime Access for <span className="text-indigo-600">{geoPricing?.priceText || '$0.10'}</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                One-time pay as low as 10 cents based on country login. Zero recurring subscriptions ever.
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-2.5 mb-6 bg-sky-50/60 p-4 rounded-2xl border border-sky-100">
              {(geoPricing?.unlockedFeatures || [
                'Lifetime Unlimited Pro Access',
                'All 8 Categorized Picture Trivia Topics',
                'Custom Voice-Command Speech Controls',
                'Unlimited Cross-Device Cloud Syncing',
                'Multiplayer Matchmaking & Private Rooms',
                'Community Question Creator & AI Generator'
              ]).map((feat, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-slate-700 font-bold">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {/* Simulated Payment Trigger */}
            <button
              onClick={handleSimulatePurchase}
              disabled={purchasing}
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm sm:text-base shadow-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5 text-white" />
              <span>{purchasing ? 'Processing Lifetime Unlock...' : `Unlock Lifetime Access Now (${geoPricing?.priceText || '$0.10'})`}</span>
            </button>
            <p className="text-[10px] text-slate-400 font-bold text-center mt-3">
              Instant activation • No hidden fees • Cross-platform cloud synced
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
