import React, { forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "glass"
    | "outline"
    | "frosted"
    | "holographic"
    | "neon";
  hoverEffect?: boolean;
  isInteractive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "default",
      hoverEffect = false,
      isInteractive = false,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg shadow-sm",
          {
            "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700":
              variant === "default",

            "bg-white/10 dark:bg-black/10 backdrop-blur-lg border border-white/20 dark:border-white/10":
              variant === "glass",

            "border border-gray-200 dark:border-gray-700":
              variant === "outline",

            'bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-lg before:absolute before:inset-0 before:rounded-lg before:p-[1px] before:bg-gradient-to-r before:from-white/30 before:to-white/10 before:content-[""] before:-z-10 relative overflow-hidden':
              variant === "frosted",

            'bg-white/5 dark:bg-black/5 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-lg relative before:absolute before:inset-0 before:rounded-lg before:p-[1px] before:bg-gradient-to-r before:from-purple-500/20 before:via-pink-500/20 before:to-blue-500/20 before:animate-border-rotate before:content-[""] before:-z-10 overflow-hidden':
              variant === "holographic",

            "bg-black/40 backdrop-blur-xl border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.5)] relative overflow-hidden":
              variant === "neon",

            "hover:shadow-md hover:-translate-y-1": hoverEffect,

            "cursor-pointer": isInteractive,
          },
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

export default Card;
