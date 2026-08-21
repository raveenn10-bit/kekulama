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
    <div className={`mb-12 ${isCenter ? "text-center max-w-2xl mx-auto" : "text-left max-w-2xl"} ${className}`}>
      {badge && (
        <div className={`mb-4 ${isCenter ? "flex justify-center" : "flex justify-start"}`}>
          <Badge dot>{badge}</Badge>
        </div>
      )}
      
      <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-sage-900 mb-6">
        {title}{" "}
        {highlight && (
          <span className="italic text-bark">{highlight}</span>
        )}
      </h2>
      
      {subtitle && (
        <p className="text-base text-sage-600 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default SectionHeading;
