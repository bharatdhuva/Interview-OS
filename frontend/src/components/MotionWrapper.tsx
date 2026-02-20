import { motion, Variants } from 'framer-motion';
import React from 'react';

// common variants that can be reused throughout the app
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export const slideLeftLoop: Variants = {
  animate: {
    x: [0, -300, -600, -900, -1200, 0],
    transition: { repeat: Infinity, duration: 20, ease: 'linear' },
  },
};

interface MotionWrapperProps {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
  custom?: any;
  initial?: string;
  animate?: string;
  whileInView?: string;
  viewport?: {
    once?: boolean;
    amount?: number;
  };
}

export const MotionWrapper: React.FC<MotionWrapperProps> = ({
  children,
  className = '',
  variants,
  initial = 'hidden',
  animate = 'visible',
  whileInView,
  viewport,
  custom,
}) => (
  <motion.div
    className={className}
    variants={variants}
    initial={initial}
    animate={animate}
    whileInView={whileInView}
    viewport={viewport}
    custom={custom}
  >
    {children}
  </motion.div>
);
