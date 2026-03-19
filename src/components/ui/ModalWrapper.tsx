import React from 'react';

interface ModalWrapperProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  className?: string;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({ 
  children, 
  isOpen, 
  onClose,
  className = ''
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* The Glass Rule: surface_bright at 80% with 24px blur */}
      <div 
        className="absolute inset-0 bg-surface-bright/80 backdrop-blur-[24px]"
        onClick={onClose}
      />
      
      {/* Structural Modal Content Tile */}
      <div className={`relative z-10 w-full max-w-2xl bg-surface shadow-ambient border border-outline-variant/20 sm:p-12 p-6 flex flex-col gap-8 ${className}`}>
        {children}
      </div>
    </div>
  );
};

export default ModalWrapper;
