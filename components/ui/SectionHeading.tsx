import React from "react";
import { Badge } from "./Badge";

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

  return (
    <div
      className={`mb-12 md:mb-16 2xl:mb-20 ${
        isCenter ? "text-center max-w-3xl 2xl:max-w-4xl mx-auto" : "text-left max-w-2xl 2xl:max-w-3xl"
      } ${className}`}
    >
      {badge && (
        <div
          className={`mb-4 2xl:mb-5 ${isCenter ? "flex justify-center" : "flex justify-start"}`}
        >
          <Badge dot variant="mint" className="bg-mint-100/80 text-mint-900 border-mint-300/80 shadow-sm 2xl:text-xs">
            {badge}
          </Badge>
        </div>
      )}

      <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl text-forest font-normal leading-[1.12] tracking-lux-tight mb-5">
        {title}{" "}
        {highlight && (
          <span className="italic font-normal bg-gradient-to-r from-mint-600 via-forest to-bark bg-clip-text text-transparent px-1">
            {highlight}
          </span>
        )}
      </h2>

      {/* Luxury Minimalist Accent Divider */}
      <div className={`flex items-center gap-2 mb-5 ${isCenter ? "justify-center" : "justify-start"}`}>
        <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-mint-400/60 to-mint-400" />
        <div className="w-1.5 h-1.5 rounded-full bg-mint-500/80" />
        <div className="w-8 h-[1px] bg-gradient-to-r from-mint-400 via-mint-400/60 to-transparent" />
      </div>

      {subtitle && (
        <p className="font-body font-light text-sm sm:text-base md:text-lg 2xl:text-xl text-sage-600 leading-lux-relaxed max-w-2xl 2xl:max-w-3xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default SectionHeading;
