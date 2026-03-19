import React from 'react';

interface QuestionModalProps {
  onClose: () => void;
  onAnswerCorrect: () => void;
  onAnswerIncorrect: () => void;
}

const QuestionModal: React.FC<QuestionModalProps> = ({ onClose, onAnswerCorrect, onAnswerIncorrect }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#1e1e1e] border-2 border-blue-500 rounded-2xl shadow-2xl p-8 max-w-2xl w-full space-y-8 animate-in fade-in zoom-in duration-300">
        <h2 className="text-3xl font-bold text-center text-blue-400">The Question...</h2>
        <p className="text-xl text-center text-white">This is a placeholder for your question content.</p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button 
            onClick={onAnswerCorrect}
            className="w-full sm:w-auto px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            Correct!
          </button>
          <button 
            onClick={onAnswerIncorrect}
            className="w-full sm:w-auto px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            Wrong!
          </button>
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            Skip/Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionModal;
