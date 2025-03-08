import React from "react";
import { cn } from "../../utils/cn";

interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

export const Heading: React.FC<HeadingProps> = ({
  level = 2,
  children,
  className,
  gradient = false,
}) => {
  const baseStyles = "font-heading font-bold leading-tight";
  const sizes = {
    1: "text-4xl md:text-5xl lg:text-6xl",
    2: "text-3xl md:text-4xl",
    3: "text-2xl md:text-3xl",
    4: "text-xl md:text-2xl",
    5: "text-lg md:text-xl",
    6: "text-base md:text-lg",
  };

  const Component = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Component
      className={cn(
        baseStyles,
        sizes[level],
        gradient && "gradient-text",
        className
      )}
    >
      {children}
    </Component>
  );
};

export default Heading;
