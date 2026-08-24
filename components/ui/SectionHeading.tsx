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
      className={`mb-12 md:mb-16 ${
        isCenter ? "text-center max-w-3xl mx-auto" : "text-left max-w-2xl"
      } ${className}`}
    >
      {badge && (
        <div
          className={`mb-4 ${isCenter ? "flex justify-center" : "flex justify-start"}`}
        >
          <Badge dot variant="mint">{badge}</Badge>
        </div>
      )}

      <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-forest font-normal leading-[1.12] tracking-lux-tight mb-5">
        {title}{" "}
        {highlight && (
          <span className="italic font-normal bg-gradient-to-r from-mint-600 via-forest to-bark bg-clip-text text-transparent px-1">
            {highlight}
          </span>
        )}
      </h2>

      {subtitle && (
        <p className="font-body font-light text-sm sm:text-base md:text-lg text-sage-600 leading-lux-relaxed max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default SectionHeading;
