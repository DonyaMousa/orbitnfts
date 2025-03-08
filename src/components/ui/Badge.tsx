import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'error';
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          {
            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300': variant === 'default',
            'border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-300': variant === 'outline',
            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300': variant === 'success',
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300': variant === 'warning',
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300': variant === 'error',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export default Badge