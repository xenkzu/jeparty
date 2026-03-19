import React from 'react';

interface CategoryColumnProps {
  category: string;
  points: number[];
  onPointClick: (points: number) => void;
}

const CategoryColumn: React.FC<CategoryColumnProps> = ({ category, points, onPointClick }) => {
  return (
    <div className="flex flex-col space-y-4 items-center">
      <div className="bg-blue-900/50 border border-blue-500 rounded px-4 py-2 text-white font-bold text-lg w-32 text-center uppercase tracking-wider">
        {category}
      </div>
      {points.map((p, i) => (
        <button
          key={i}
          onClick={() => onPointClick(p)}
          className="bg-blue-700 hover:bg-blue-600 text-yellow-400 font-bold text-2xl py-6 w-32 border-2 border-blue-400 rounded-lg shadow transition-all hover:scale-110 active:scale-95"
        >
          {p}
        </button>
      ))}
    </div>
  );
};

export default CategoryColumn;
