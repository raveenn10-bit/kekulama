"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  LUXURY_EASING,
  LUXURY_DURATION,
  luxuryStaggerContainer,
  luxuryFadeUp,
} from "@/lib/motion";

interface MotionRevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
  className?: string;
  viewportAmount?: number;
  once?: boolean;
}

export function MotionReveal({
  children,
  delay = 0,
  duration = LUXURY_DURATION.medium,
  yOffset = 18,
  className = "",
  viewportAmount = 0.15,
  once = true,
}: MotionRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: viewportAmount }}
      transition={{
        duration,
        delay,
        ease: LUXURY_EASING.quintOut,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface MotionStaggerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  initialDelay?: number;
  className?: string;
  viewportAmount?: number;
  once?: boolean;
}

export function MotionStagger({
  children,
  staggerDelay = 0.08,
  initialDelay = 0.05,
  className = "",
  viewportAmount = 0.15,
  once = true,
}: MotionStaggerProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={luxuryStaggerContainer(staggerDelay, initialDelay)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: viewportAmount }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export const MotionItem = motion.div;
export const motionItemVariants = luxuryFadeUp;
