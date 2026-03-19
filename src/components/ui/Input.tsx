import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  className = '', 
  id, 
  ...props 
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="font-display text-label-sm text-on-surface uppercase font-bold tracking-widest"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className="bg-surface-container-lowest text-on-surface font-body p-4 border-0 border-x-4 border-transparent focus:border-tertiary-container focus:outline-none transition-colors duration-200 w-full placeholder:text-surface-bright"
        {...props}
      />
    </div>
  );
};

export default Input;
