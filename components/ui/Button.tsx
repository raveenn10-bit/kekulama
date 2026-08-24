import React from "react";
import Link from "next/link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "mint" | "outline" | "ghost" | "glass";
  size?: "sm" | "md" | "lg";
  href?: string;
  target?: string;
  rel?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  href,
  target,
  rel,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-body font-semibold uppercase tracking-[0.15em] transition-all duration-300 active:scale-[0.97] cursor-pointer";

  const variants = {
    primary:
      "bg-bark text-white rounded-full hover:bg-bark-dark shadow-soft hover:shadow-lifted hover:scale-[1.02]",
    mint:
      "bg-gradient-to-r from-mint-500 to-mint-600 text-white rounded-full hover:from-mint-600 hover:to-mint-700 shadow-glow hover:scale-[1.02]",
    outline:
      "border border-mint-500/70 text-mint-800 bg-white/90 backdrop-blur-sm rounded-full hover:bg-mint-100 hover:border-mint-600 shadow-sm",
    ghost: "text-sage-700 hover:text-mint-700 rounded-full hover:bg-mint-50/60",
    glass:
      "bg-white/15 backdrop-blur-md text-white border border-white/30 hover:bg-white/25 rounded-full shadow-soft",
  };

  const sizes = {
    sm: "px-4 py-2 text-[11px]",
    md: "px-6 py-2.5 text-xs",
    lg: "px-8 py-3.5 text-xs sm:text-sm",
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} target={target} rel={rel} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

export default Button;
