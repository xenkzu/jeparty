// src/components/ui/PageTransition.tsx
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

const variants = {
  initial: { opacity: 0, x: -20, filter: 'blur(4px)' },
  animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, x: 20, filter: 'blur(4px)' },
};

export const PageTransition = ({ children, className = "w-full h-full flex flex-col" }: { children: ReactNode, className?: string }) => (
  <motion.div
    variants={variants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);
