import { ReactNode } from "react";
import { motion } from "framer-motion";

interface PitchDeckSlideProps {
  children: ReactNode;
  className?: string;
}

export const PitchDeckSlide = ({ children, className = "" }: PitchDeckSlideProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className={`w-full h-full flex flex-col ${className}`}
    >
      {children}
    </motion.div>
  );
};
