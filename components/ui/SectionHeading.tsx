"use client";

import React from "react";
import { Badge } from "./Badge";
import { AnimatedWords } from "./AnimatedText";
import { motion, useReducedMotion } from "framer-motion";
import { LUXURY_EASING, LUXURY_DURATION } from "@/lib/motion";

interface SectionHeadingProps {
  badge?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  badge,
  title,
  highlight,
  subtitle,
  align = "center",
  className = "",
}: SectionHeadingProps) {
  const isCenter = align === "center";
  const shouldReduceMotion = useReducedMotion();
  const fullText = highlight ? `${title} ${highlight}` : title;

  return (
    <div
      className={`mb-12 md:mb-16 2xl:mb-20 ${
        isCenter ? "text-center max-w-3xl 2xl:max-w-4xl mx-auto" : "text-left max-w-2xl 2xl:max-w-3xl"
      } ${className}`}
    >
      {badge && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: shouldReduceMotion ? 0 : 8 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: LUXURY_DURATION.medium, ease: LUXURY_EASING.quintOut }}
          className={`mb-4 2xl:mb-5 ${isCenter ? "flex justify-center" : "flex justify-start"}`}
        >
          <Badge dot variant="mint" className="bg-mint-100/80 text-mint-900 border-mint-300/80 shadow-sm 2xl:text-xs">
            {badge}
          </Badge>
        </motion.div>
      )}

      <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl text-forest font-normal leading-[1.12] tracking-lux-tight mb-5">
        <AnimatedWords
          text={fullText}
          highlightWords={highlight ? [highlight] : []}
          className={isCenter ? "justify-center" : "justify-start"}
        />
      </h2>

      {/* Luxury Minimalist Accent Divider with Smooth Expansion */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: LUXURY_DURATION.slow, ease: LUXURY_EASING.editorial, delay: 0.15 }}
        className={`flex items-center gap-2 mb-5 ${isCenter ? "justify-center" : "justify-start"}`}
      >
        <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-mint-400/60 to-mint-400" />
        <div className="w-1.5 h-1.5 rounded-full bg-mint-500/80" />
        <div className="w-8 h-[1px] bg-gradient-to-r from-mint-400 via-mint-400/60 to-transparent" />
      </motion.div>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: LUXURY_DURATION.medium, ease: LUXURY_EASING.quintOut, delay: 0.2 }}
          className="font-body font-light text-sm sm:text-base md:text-lg 2xl:text-xl text-sage-600 leading-lux-relaxed max-w-2xl 2xl:max-w-3xl mx-auto"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

export default SectionHeading;
