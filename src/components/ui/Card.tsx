import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, title, className = '' }) => {
  return (
    <div className={`bg-[#2c2c2c] border border-gray-700 rounded-xl shadow-lg p-6 ${className}`}>
      {title && <h3 className="text-xl font-bold mb-4 text-blue-400">{title}</h3>}
      {children}
    </div>
  );
};

export default Card;
