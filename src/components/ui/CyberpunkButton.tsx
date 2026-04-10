// src/components/ui/CyberpunkButton.tsx
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CyberpunkButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
  variant?: 'primary' | 'ghost' | 'danger';
  style?: React.CSSProperties;
}

export const CyberpunkButton = ({
  onClick, disabled, className = '', children, variant = 'ghost', style
}: CyberpunkButtonProps) => {
  const clipPath = style?.clipPath as string | undefined;

  // Final Calibrated Settings: { "x": 4, "y": 18, "scaleX": 0.89, "scaleY": 1, "color": "#1a1a1a", "opacity": 1 }
  const SHADOW_X = 4;
  const SHADOW_Y = 18;
  const SHADOW_SCALE_X = 0.89;
  const SHADOW_SCALE_Y = 1;
  const SHADOW_COLOR = "#1a1a1a";
  const SHADOW_OPACITY = 1;

  return (
    <div className="relative inline-flex group isolate">
      {/* CALIBRATED SHADOW LAYER */}
      {variant === 'primary' && !disabled && (
        <motion.div
          aria-hidden
          className="absolute pointer-events-none"
          style={{ 
            clipPath,
            backgroundColor: SHADOW_COLOR,
            opacity: SHADOW_OPACITY,
            width: '100%',
            height: '100%',
            left: 0,
            top: 0,
            x: SHADOW_X,
            y: SHADOW_Y,
            scaleX: SHADOW_SCALE_X,
            scaleY: SHADOW_SCALE_Y,
            transformOrigin: 'top left'
          }}
        />
      )}

      {/* THE MAIN BUTTON */}
      <motion.button
        onClick={onClick}
        disabled={disabled}
        className={`relative z-10 m-0 border-none outline-none ${className} flex items-center justify-center`}
        style={style}
        whileHover={disabled ? {} : { x: -2, y: -2 }}
        whileTap={disabled ? {} : { x: 1, y: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {children}
        </div>
      </motion.button>
    </div>
  );
};
