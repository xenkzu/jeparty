import React from 'react';

interface EndScreenProps {
  onRestart: () => void;
}

const EndScreen: React.FC<EndScreenProps> = ({ onRestart }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
      <h1 className="text-4xl font-bold text-yellow-500">Game Over!</h1>
      <p className="text-2xl font-semibold text-gray-200">The winner is: Player 1!</p>
      <button 
        onClick={onRestart}
        className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
      >
        Play Again
      </button>
    </div>
  );
};

export default EndScreen;
