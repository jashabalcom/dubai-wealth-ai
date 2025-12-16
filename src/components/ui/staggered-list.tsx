import * as React from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { smoothTransition, quickTransition } from "@/lib/motion";

interface StaggeredListProps {
  children: React.ReactNode;
  staggerDelay?: number;
  initialDelay?: number;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  className?: string;
  itemClassName?: string;
}

const StaggeredList: React.FC<StaggeredListProps> = ({ 
  children, 
  staggerDelay = 0.05, 
  initialDelay = 0.1,
  direction = "up",
  distance = 20,
  className,
  itemClassName,
}) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: initialDelay,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: staggerDelay / 2,
        staggerDirection: -1,
      },
    },
  };

  const getDirectionOffset = () => {
    switch (direction) {
      case "up": return { y: distance };
      case "down": return { y: -distance };
      case "left": return { x: distance };
      case "right": return { x: -distance };
      default: return { y: distance };
    }
  };

  const itemVariants: Variants = {
    hidden: { 
      opacity: 0, 
      ...getDirectionOffset(),
    },
    visible: { 
      opacity: 1, 
      x: 0,
      y: 0,
      transition: smoothTransition,
    },
    exit: { 
      opacity: 0,
      ...getDirectionOffset(),
      transition: quickTransition,
    },
  };

  const childArray = React.Children.toArray(children);

  return (
    <motion.div
      className={cn(className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <AnimatePresence mode="popLayout">
        {childArray.map((child, index) => (
          <motion.div
            key={React.isValidElement(child) ? child.key || index : index}
            variants={itemVariants}
            className={itemClassName}
            layout
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};
StaggeredList.displayName = "StaggeredList";

// Simple fade-in list without stagger (for simpler use cases)
interface FadeListProps {
  children: React.ReactNode;
  className?: string;
}

const FadeList: React.FC<FadeListProps> = ({ children, className }) => {
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={quickTransition}
    >
      {children}
    </motion.div>
  );
};
FadeList.displayName = "FadeList";

export { StaggeredList, FadeList };
