import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SwipeHintProps {
  label: string;
  /** Tailwind breakpoint class that hides the hint once the grid layout takes over */
  hideClass?: string;
  tone?: "light" | "dark";
}

/**
 * Mobile-only hint for horizontal snap rows. Uses SVG icons instead of emoji
 * so it renders consistently across platforms and screen readers skip the glyphs.
 */
export function SwipeHint({ label, hideClass = "md:hidden", tone = "light" }: SwipeHintProps) {
  const color = tone === "dark" ? "text-mint-100/80" : "text-sage-600";
  return (
    <div
      className={`flex ${hideClass} items-center justify-center gap-2 font-eyebrow text-[11px] uppercase tracking-[0.18em] ${color} mt-3`}
    >
      <ChevronLeft size={14} aria-hidden="true" className="animate-swipe-left" />
      <span>{label}</span>
      <ChevronRight size={14} aria-hidden="true" className="animate-swipe-right" />
    </div>
  );
}

export default SwipeHint;
