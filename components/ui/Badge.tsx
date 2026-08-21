import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

export function Badge({ children, dot = false, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center bg-bark/10 text-bark text-xs font-medium uppercase tracking-wider px-3 py-1 rounded-full ${className}`}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-bark mr-2 flex-shrink-0" />
      )}
      {children}
    </span>
  );
}
