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
    "inline-flex items-center justify-center font-medium transition-all duration-300 active:scale-[0.97] cursor-pointer";

  const variants = {
    primary:
      "bg-bark text-white rounded-full hover:bg-bark-dark shadow-soft hover:shadow-lifted hover:scale-[1.02]",
    mint:
      "bg-gradient-to-r from-mint-500 to-mint-600 text-white rounded-full hover:from-mint-600 hover:to-mint-700 shadow-glow hover:scale-[1.02]",
    outline:
      "border-2 border-mint-500 text-mint-700 bg-white/80 backdrop-blur-sm rounded-full hover:bg-mint-100 hover:border-mint-600 shadow-sm",
    ghost: "text-sage-700 hover:text-mint-600 rounded-full hover:bg-mint-50/50",
    glass:
      "bg-white/20 backdrop-blur-md text-white border border-white/40 hover:bg-white/30 rounded-full shadow-soft",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-3.5 text-base md:text-lg font-semibold",
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
