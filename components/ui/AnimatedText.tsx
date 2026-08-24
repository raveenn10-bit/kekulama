"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { LUXURY_EASING, LUXURY_DURATION } from "@/lib/motion";

interface AnimatedWordsProps {
  text: string;
  className?: string;
  highlightWords?: string[];
  highlightClassName?: string;
  delay?: number;
}

export function AnimatedWords({
  text,
  className = "",
  highlightWords = [],
  highlightClassName = "italic font-normal bg-gradient-to-r from-mint-600 via-forest to-bark bg-clip-text text-transparent px-1",
  delay = 0,
}: AnimatedWordsProps) {
  const shouldReduceMotion = useReducedMotion();
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.045, delayChildren: delay * i },
    }),
  };

  const child = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 20,
      rotateZ: shouldReduceMotion ? 0 : 1.5,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateZ: 0,
      transition: {
        type: "spring",
        damping: 24,
        stiffness: 120,
        duration: LUXURY_DURATION.medium,
        ease: LUXURY_EASING.editorial,
      },
    },
  };

  return (
    <motion.span
      className={`inline-flex flex-wrap ${className}`}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {words.map((word, index) => {
        const isHighlighted = highlightWords.some((hw) =>
          word.toLowerCase().includes(hw.toLowerCase())
        );

        return (
          <span key={index} className="overflow-hidden inline-block mr-[0.26em] pb-1">
            <motion.span
              variants={child}
              className={`inline-block ${
                isHighlighted ? highlightClassName : ""
              }`}
            >
              {word}
            </motion.span>
          </span>
        );
      })}
    </motion.span>
  );
}

export default AnimatedWords;
