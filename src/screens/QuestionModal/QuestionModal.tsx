import React, { useState } from 'react';

interface QuestionModalProps {
  question: { value: number; question: string; answer: string; status: string };
  activePlayer: { name: string; score: number };
  lowestScoringPlayer: { name: string; score: number };
  scoringMode: 'normal' | 'advanced';
  onCorrect: () => void;
  onWrong: () => void;
  onPass: () => void;
  onClose: () => void;
}

const QuestionModal: React.FC<QuestionModalProps> = ({ 
  question, 
  activePlayer, 
  lowestScoringPlayer, 
  scoringMode, 
  onCorrect, 
  onWrong, 
  onPass, 
  onClose 
}) => {
  const [revealed, setRevealed] = useState(false);

  const isLowest = activePlayer.score === lowestScoringPlayer.score;
  const multiplier = isLowest ? 1.5 : 1;
  const val = question.value;

  const previews = {
    correct: val * multiplier,
    wrong: scoringMode === 'normal' ? -val : -val * 0.75,
    pass: scoringMode === 'normal' ? -val * 0.5 : -val * 0.375,
  };

  const STYLES = {
    modalJagged: { clipPath: 'polygon(1% 0%, 100% 2%, 99% 98%, 0% 100%)' },
    buttonJagged: { clipPath: 'polygon(0% 0%, 95% 0%, 100% 100%, 5% 100%)' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div 
        style={STYLES.modalJagged}
        className="bg-[#0e0e0e] border-2 border-[var(--color-primary-dim)] w-full max-w-4xl p-8 md:p-12 relative overflow-hidden"
      >
        {/* Header: Value & Category */}
        <div className="flex justify-between items-start mb-12">
          <div className="bg-[var(--color-primary-dim)] text-black font-display font-bold text-4xl md:text-6xl px-6 py-2 italic tracking-tighter">
            ${val}
          </div>
          <button 
            onClick={onClose}
            className="text-[var(--color-outline)] hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-4xl">close</span>
          </button>
        </div>

        {/* Question Text */}
        <div className="mb-16">
          <h2 className="text-[var(--color-outline)] font-display font-bold text-xs tracking-[0.3em] uppercase mb-4">INCOMING_DATA_STREAM</h2>
          <p className="font-display font-bold text-3xl md:text-5xl text-white leading-tight tracking-tighter italic uppercase">
            {question.question}
          </p>
        </div>

        {/* Answer Selection / Reveal */}
        {!revealed ? (
          <div className="flex justify-center">
            <button 
              onClick={() => setRevealed(true)}
              style={STYLES.buttonJagged}
              className="bg-white text-black font-display font-bold text-2xl px-12 py-6 hover:bg-[var(--color-primary-dim)] hover:text-white transition-all active:scale-95 uppercase tracking-tighter italic"
            >
              REVEAL_ANSWER
            </button>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Answer Display */}
            <div className="bg-[var(--color-surface-container-high)] p-8 border-l-4 border-[var(--color-primary-dim)]">
              <h3 className="text-[var(--color-primary-dim)] font-display font-bold text-xs tracking-[0.3em] uppercase mb-2">VERIFIED_RESPONSE</h3>
              <p className="font-display font-bold text-4xl text-white tracking-tighter italic uppercase">
                {question.answer}
              </p>
            </div>

            {/* Score Previews & Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={onCorrect}
                className="group flex flex-col items-center bg-[var(--color-surface-container-low)] hover:bg-green-600/20 border border-green-600/30 p-4 transition-all"
              >
                <div className="text-green-500 font-display font-bold text-2xl mb-1 uppercase tracking-tight italic">CORRECT</div>
                <div className="text-green-500/60 font-display font-bold text-lg">+{previews.correct} PTS</div>
                {isLowest && <div className="text-[7px] text-green-400 font-bold tracking-widest mt-1">1.5X_UNDERDOG_BONUS</div>}
              </button>

              <button 
                onClick={onWrong}
                className="group flex flex-col items-center bg-[var(--color-surface-container-low)] hover:bg-red-600/20 border border-red-600/30 p-4 transition-all"
              >
                <div className="text-red-500 font-display font-bold text-2xl mb-1 uppercase tracking-tight italic">WRONG</div>
                <div className="text-red-500/60 font-display font-bold text-lg">{previews.wrong} PTS</div>
              </button>

              <button 
                onClick={onPass}
                className="group flex flex-col items-center bg-[var(--color-surface-container-low)] hover:bg-gray-600/20 border border-gray-600/30 p-4 transition-all"
              >
                <div className="text-gray-400 font-display font-bold text-2xl mb-1 uppercase tracking-tight italic">PASS</div>
                <div className="text-gray-400/60 font-display font-bold text-lg">{previews.pass} PTS</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionModal;
