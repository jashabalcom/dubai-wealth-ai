import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";

interface ParallaxSectionProps {
  children: React.ReactNode;
  className?: string;
  speed?: number; // -1 to 1, negative = slower, positive = faster
  direction?: "up" | "down";
}

export function ParallaxSection({
  children,
  className,
  speed = 0.5,
  direction = "up",
}: ParallaxSectionProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const multiplier = direction === "up" ? -1 : 1;
  const y = useTransform(scrollYProgress, [0, 1], [0, 100 * speed * multiplier]);

  return (
    <motion.div ref={ref} style={{ y }} className={cn(className)}>
      {children}
    </motion.div>
  );
}

// Parallax background image
interface ParallaxBackgroundProps {
  src: string;
  alt?: string;
  className?: string;
  overlayClassName?: string;
  speed?: number;
  children?: React.ReactNode;
}

export function ParallaxBackground({
  src,
  alt = "",
  className,
  overlayClassName,
  speed = 0.3,
  children,
}: ParallaxBackgroundProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 30}%`]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div
        style={{ y }}
        className="absolute inset-0 -top-[10%] -bottom-[10%]"
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </motion.div>
      {/* Overlay */}
      <div className={cn("absolute inset-0 bg-secondary/60", overlayClassName)} />
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// Fade in on scroll
interface FadeInSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}

export function FadeInSection({
  children,
  className,
  delay = 0,
  direction = "up",
}: FadeInSectionProps) {
  const initialPositions = {
    up: { opacity: 0, y: 40 },
    down: { opacity: 0, y: -40 },
    left: { opacity: 0, x: 40 },
    right: { opacity: 0, x: -40 },
  };

  const animatePositions = {
    up: { opacity: 1, y: 0 },
    down: { opacity: 1, y: 0 },
    left: { opacity: 1, x: 0 },
    right: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      initial={initialPositions[direction]}
      whileInView={animatePositions[direction]}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger children animation
interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
