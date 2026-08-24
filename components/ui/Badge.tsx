"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface BadgeProps {
  children: React.ReactNode;
  dot?: boolean;
  variant?: "mint" | "eucalyptus" | "bark" | "forest";
  className?: string;
}

export function Badge({
  children,
  dot = false,
  variant = "mint",
  className = "",
}: BadgeProps) {
  const shouldReduceMotion = useReducedMotion();

  const variantStyles = {
    mint: "bg-mint-100/90 text-mint-900 border-mint-300/70 shadow-sm",
    eucalyptus: "bg-eucalyptus-100/90 text-eucalyptus-900 border-eucalyptus-300/70 shadow-sm",
    bark: "bg-sand-100 text-bark-dark border-bark/30 shadow-sm",
    forest: "bg-forest-light/20 text-forest-dark border-forest/20 shadow-sm",
  };

  const dotColors = {
    mint: "bg-mint-500",
    eucalyptus: "bg-eucalyptus-500",
    bark: "bg-bark",
    forest: "bg-forest",
  };

  return (
    <span
      className={`inline-flex items-center font-eyebrow text-[11px] sm:text-xs uppercase tracking-[0.22em] px-4 py-1 rounded-full border ${variantStyles[variant]} ${className}`}
    >
      {dot && (
        <span className="relative flex h-2 w-2 mr-2.5 flex-shrink-0 items-center justify-center">
          {!shouldReduceMotion && (
            <motion.span
              animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              className={`absolute inline-flex h-full w-full rounded-full ${dotColors[variant]} opacity-75`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColors[variant]}`} />
        </span>
      )}
      {children}
    </span>
  );
}

export default Badge;
