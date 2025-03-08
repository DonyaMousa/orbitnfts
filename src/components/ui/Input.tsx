import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-lg border bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500',
            {
              'border-red-500 focus:border-red-500 focus:ring-red-500': error,
              'border-gray-200 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700': !error,
              'pl-10': leftIcon,
              'pr-10': rightIcon,
            },
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input