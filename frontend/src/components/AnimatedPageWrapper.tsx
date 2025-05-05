"use client";

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AnimatedPageWrapperProps {
  children: ReactNode;
  className?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20, // Start slightly below
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20, // Exit slightly above
  },
};

const pageTransition = {
  type: 'tween', // Smooth transition
  ease: 'anticipate', // Adds a slight bounce effect
  duration: 0.5, // Animation duration
};

export function AnimatedPageWrapper({ children, className }: AnimatedPageWrapperProps) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}
