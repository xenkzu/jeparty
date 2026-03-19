import React from 'react';

interface GameBoardProps {
  onQuestionSelect: () => void;
  onEndGame: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ onQuestionSelect, onEndGame }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
      <h1 className="text-4xl font-bold text-green-500">Jeparty Game Board</h1>
      <p className="text-lg text-gray-300">Select a category and points to answer questions.</p>
      
      <div className="flex space-x-4">
        <button 
          onClick={onQuestionSelect}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          Select Question
        </button>
        <button 
          onClick={onEndGame}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          End Game
        </button>
      </div>
    </div>
  );
};

export default GameBoard;
