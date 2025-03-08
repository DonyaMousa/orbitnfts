import React, { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { Spinner } from "./Spinner";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "glass";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      leftIcon,
      rightIcon,
      children,
      fullWidth,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-all duration-300 relative overflow-hidden group",
          {
            "bg-white/15 dark:bg-white/10 backdrop-blur-md text-gray-800 dark:text-white border border-white/40 dark:border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.3),inset_0_0_20px_rgba(255,255,255,0.2)] dark:shadow-[0_0_15px_rgba(255,255,255,0.2),inset_0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.5),inset_0_0_25px_rgba(255,255,255,0.3)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.3),inset_0_0_25px_rgba(255,255,255,0.2)] hover:bg-white/20 dark:hover:bg-white/15 hover:border-white/60 dark:hover:border-white/30 after:absolute after:inset-0 after:content-[''] after:bg-gradient-to-r after:from-transparent after:via-white/30 after:to-transparent after:translate-x-[-200%] after:group-hover:animate-shimmer":
              variant === "primary",
            "bg-gray-500 text-white hover:bg-gray-600": variant === "secondary",
            "border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800":
              variant === "outline",
            "hover:bg-gray-100 dark:hover:bg-gray-800": variant === "ghost",
            "relative text-white font-semibold py-[0.15rem] px-[0.15rem] bg-[conic-gradient(var(--tw-gradient-stops))] from-purple-700 via-pink-500 via-30% via-blue-500 via-60% to-emerald-400 to-90% animate-border-rotate overflow-hidden before:absolute before:inset-[2px] before:rounded-[5px] before:bg-black/80 before:backdrop-blur-xl before:content-[''] before:z-[0] transition-all duration-300 hover:bg-[length:200%_200%] hover:animate-border-rotate-faster hover:shadow-[0_0_25px_rgba(168,85,247,0.4)]":
              variant === "glass",
            "px-3 py-1.5 text-sm": size === "sm",
            "px-4 py-2": size === "md",
            "px-6 py-3 text-lg": size === "lg",
            "w-full": fullWidth,
            "opacity-50 cursor-not-allowed": disabled || isLoading,
          },
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center">
          {isLoading && <Spinner className="mr-2" />}
          {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
          <span className="relative">
            {children}
            {variant === "glass" && (
              <span className="absolute -inset-1 blur-sm bg-gradient-to-r from-purple-600/30 via-pink-500/30 to-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
            )}
          </span>
          {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
        </span>
        {variant === "glass" && (
          <>
            <span className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0)_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
            <span className="absolute top-0 left-0 h-full w-[150%] z-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-[100%] transition-transform duration-1000"></span>
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
