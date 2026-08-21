import React from "react";

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
  const variantStyles = {
    mint: "bg-mint-100/90 text-mint-800 border-mint-300/60 shadow-sm",
    eucalyptus: "bg-eucalyptus-100/90 text-eucalyptus-800 border-eucalyptus-300/60 shadow-sm",
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
      className={`inline-flex items-center text-xs font-semibold uppercase tracking-wider px-3.5 py-1 rounded-full border ${variantStyles[variant]} ${className}`}
    >
      {dot && (
        <span
          className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 animate-pulse ${dotColors[variant]}`}
        />
      )}
      {children}
    </span>
  );
}

export default Badge;
