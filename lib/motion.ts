import { Variants } from "framer-motion";

/**
 * Luxury Motion Design System
 * Inspired by haute horlogerie, luxury automotive, and high-end editorial experiences.
 * Principles: Restraint, precision, seamless deceleration, zero jarring bounces.
 */

// Custom cubic bezier easing curves
export const LUXURY_EASING = {
  // Signature luxury quintic ease-out: starts with swift purpose, glides to a stop
  quintOut: [0.16, 1, 0.3, 1] as const,
  // Editorial slow drape for monumental headlines and imagery
  editorial: [0.22, 1, 0.36, 1] as const,
  // Smooth symmetrical ease for loops and continuous transitions
  smooth: [0.25, 0.1, 0.25, 1] as const,
  // Soft hover transition
  hover: [0.33, 1, 0.68, 1] as const,
};

export const LUXURY_DURATION = {
  fast: 0.35,
  medium: 0.65,
  slow: 0.95,
  monumental: 1.25,
  ambient: 28,
};

// Container Stagger Variants
export const luxuryStaggerContainer = (staggerChildren = 0.08, delayChildren = 0.05): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren,
      ease: LUXURY_EASING.quintOut,
    },
  },
});

// Refined Fade Up Variant (Restrained displacement: 16-24px, not 50-100px)
export const luxuryFadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: LUXURY_DURATION.medium,
      ease: LUXURY_EASING.quintOut,
    },
  },
};

// Monumental Headline Reveal Variant
export const luxuryHeadlineReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: LUXURY_DURATION.slow,
      ease: LUXURY_EASING.editorial,
    },
  },
};

// Subtle Fade In (zero displacement)
export const luxuryFadeIn: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: LUXURY_DURATION.slow,
      ease: LUXURY_EASING.quintOut,
    },
  },
};

// Image Unveil with scale settling
export const luxuryImageUnveil: Variants = {
  hidden: {
    opacity: 0,
    scale: 1.04,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: LUXURY_DURATION.monumental,
      ease: LUXURY_EASING.editorial,
    },
  },
};

// Tactile Card Hover Micro-motion
export const luxuryCardHover: Variants = {
  initial: {
    y: 0,
    transition: {
      duration: 0.35,
      ease: LUXURY_EASING.hover,
    },
  },
  hover: {
    y: -4,
    transition: {
      duration: 0.35,
      ease: LUXURY_EASING.hover,
    },
  },
};

// Button Press Feedback
export const luxuryButtonTap: Variants = {
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.15,
      ease: LUXURY_EASING.smooth,
    },
  },
};
