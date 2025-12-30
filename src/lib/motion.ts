import { Variants, Transition } from 'framer-motion';

// Shared spring configurations
export const springTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
};

export const smoothTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 25,
};

export const gentleTransition: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 20,
};

export const quickTransition: Transition = {
  duration: 0.2,
  ease: [0.4, 0, 0.2, 1],
};

// Fade variants
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

// Fade up variants
export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: smoothTransition,
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: quickTransition,
  },
};

// Scale variants
export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: springTransition,
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: quickTransition,
  },
};

// Slide variants
export const slideLeftVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const slideRightVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

// Stagger container variants
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

// Stagger item variants
export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: smoothTransition,
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: quickTransition,
  },
};

// Card hover variants
export const cardHoverVariants: Variants = {
  rest: { 
    scale: 1, 
    y: 0,
    boxShadow: '0 4px 20px -2px hsl(220 40% 8% / 0.08)',
  },
  hover: { 
    scale: 1.02, 
    y: -4,
    boxShadow: '0 20px 40px -15px hsl(35 25% 70% / 0.25)',
    transition: smoothTransition,
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};

// Button variants
export const buttonVariants: Variants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: springTransition,
  },
  tap: { 
    scale: 0.97,
    transition: { duration: 0.1 },
  },
};

// Tab indicator variants
export const tabIndicatorVariants: Variants = {
  inactive: { 
    opacity: 0,
    scale: 0.9,
  },
  active: { 
    opacity: 1,
    scale: 1,
    transition: springTransition,
  },
};

// Tab content variants
export const tabContentVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 20 : -20,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: smoothTransition,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 20 : -20,
    opacity: 0,
    transition: quickTransition,
  }),
};

// List item variants with index-based delay
export const listItemVariants = (index: number): Variants => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ...smoothTransition,
      delay: index * 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      ...quickTransition,
      delay: index * 0.02,
    },
  },
});

// Pop in variants (for modals, tooltips)
export const popInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 10 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: springTransition,
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: quickTransition,
  },
};

// Shimmer animation for skeletons
export const shimmerVariants: Variants = {
  initial: { x: '-100%' },
  animate: { 
    x: '100%',
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'linear',
    },
  },
};

// Pulse glow animation
export const pulseGlowVariants: Variants = {
  initial: { 
    boxShadow: '0 0 0 0 hsl(35 25% 70% / 0.4)',
  },
  animate: {
    boxShadow: [
      '0 0 0 0 hsl(35 25% 70% / 0.4)',
      '0 0 0 8px hsl(35 25% 70% / 0)',
    ],
    transition: {
      duration: 1,
      ease: 'easeOut',
    },
  },
};

// Focus ring animation
export const focusRingVariants: Variants = {
  unfocused: { 
    boxShadow: '0 0 0 0 hsl(35 25% 70% / 0)',
    scale: 1,
  },
  focused: { 
    boxShadow: '0 0 0 3px hsl(35 25% 70% / 0.3)',
    scale: 1,
    transition: springTransition,
  },
};

// Expand collapse variants
export const expandVariants: Variants = {
  collapsed: { 
    height: 0, 
    opacity: 0,
    transition: quickTransition,
  },
  expanded: { 
    height: 'auto', 
    opacity: 1,
    transition: smoothTransition,
  },
};

// Rotate variants (for icons)
export const rotateVariants: Variants = {
  closed: { rotate: 0 },
  open: { 
    rotate: 180,
    transition: smoothTransition,
  },
};

// Ripple effect keyframes (used with CSS)
export const rippleKeyframes = {
  '0%': { transform: 'scale(0)', opacity: 0.5 },
  '100%': { transform: 'scale(4)', opacity: 0 },
};

// Crossfade variants for skeleton-to-content transitions
export const crossfadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

// Skeleton to content with slight lift
export const contentRevealVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
};

// Pull to refresh variants
export const pullToRefreshVariants: Variants = {
  pulling: { 
    scale: 1,
    rotate: 0,
  },
  releasing: {
    scale: 1.2,
    rotate: 180,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
  refreshing: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};
