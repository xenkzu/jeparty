import React from 'react';

interface TileProps {
  children: React.ReactNode;
  level?: 1 | 2;
  slashed?: boolean;
  className?: string;
  onClick?: () => void;
}

const Tile: React.FC<TileProps> = ({ 
  children, 
  level = 1, 
  slashed = false, 
  className = '',
  onClick
}) => {
  // Layering Principle: Level 1 content areas, Level 2 interactive cards
  const levelStyles = {
    1: 'bg-surface-container-low',
    2: 'bg-surface-container-highest',
  };

  // Slashed Geometry: e.g. a 5-degree tilt on the right side
  const slashClass = slashed ? '[clip-path:polygon(0_0,100%_0,95%_100%,0%_100%)]' : '';

  return (
    <div 
      onClick={onClick}
      className={`p-6 flex flex-col gap-8 transition-colors duration-200 ${levelStyles[level]} ${slashClass} ${onClick ? 'cursor-pointer hover:bg-surface-bright' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default Tile;
