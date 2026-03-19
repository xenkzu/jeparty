import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  // 0px radius is implicit (no rounded class).
  // Focus states ensure accessibility while maintaining the brutalist aesthetic.
  const baseStyles = 'font-display font-bold uppercase tracking-wider px-8 py-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-tertiary focus:ring-offset-2 focus:ring-offset-surface active:translate-y-[2px] active:translate-x-[2px] active:shadow-none';
  
  const variantStyles = {
    primary: 'bg-tertiary-container text-on-tertiary-container shadow-hard shadow-tertiary-container hover:bg-tertiary',
    secondary: 'bg-transparent text-primary border-b-2 border-primary hover:bg-surface-container-low hover:text-tertiary hover:border-tertiary pb-[14px]',
  };

  return (
    <button 
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
