"use client";

import React from "react";
import { Badge } from "./Badge";
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

  return (
    <div
      className={`mb-12 md:mb-16 2xl:mb-20 ${
        isCenter ? "text-center max-w-3xl 2xl:max-w-4xl mx-auto" : "text-left max-w-2xl 2xl:max-w-3xl"
      } ${className}`}
    >
      {badge && (
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: LUXURY_DURATION.medium, ease: LUXURY_EASING.quintOut }}
          className={`mb-4 2xl:mb-5 ${isCenter ? "flex justify-center" : "flex justify-start"}`}
        >
          <Badge dot variant="mint" className="bg-eucalyptus-100/90 text-forest font-medium tracking-[0.2em] text-[10px] sm:text-xs uppercase border border-eucalyptus-300/60 shadow-none">
            {badge}
          </Badge>
        </motion.div>
      )}

      <motion.h2
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: LUXURY_DURATION.slow, ease: LUXURY_EASING.editorial, delay: 0.05 }}
        className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl text-forest font-normal leading-[1.12] tracking-lux-tight mb-4"
      >
        {title}{" "}
        {highlight && (
          <span className="font-serif italic font-normal text-bark-dark px-0.5">
            {highlight}
          </span>
        )}
      </motion.h2>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: LUXURY_DURATION.medium, ease: LUXURY_EASING.quintOut, delay: 0.1 }}
          className="font-body font-light text-sm sm:text-base md:text-lg 2xl:text-xl text-sage-700 leading-lux-relaxed max-w-2xl 2xl:max-w-3xl mx-auto"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

export default SectionHeading;
