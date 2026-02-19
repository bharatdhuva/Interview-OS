import { motion, useInView } from 'framer-motion';
import React, { useRef } from 'react';

interface ScrollFadeCardProps {
  children: React.ReactNode;
  className?: string;
}

const ScrollFadeCard: React.FC<ScrollFadeCardProps> = ({ children, className = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, {
    // trigger when roughly half of the card is visible horizontally
    margin: '0px 0px -50% 0px',
  });

  const variants = {
    visible: { opacity: 1, scale: 1, x: 0 },
    hidden: { opacity: 0, scale: 0.95, x: -30 },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollFadeCard;
