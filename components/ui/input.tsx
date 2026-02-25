import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        {...props}
        className={cn(
          'flex h-10 w-full rounded-xl border border-[var(--line)] bg-white px-3.5 text-sm text-ink-800',
          'shadow-inner-soft outline-none transition-all duration-200 ease-out',
          'placeholder:text-ink-400',
          'hover:border-ink-300',
          'focus:border-spice-400 focus:ring-[3px] focus:ring-spice-100',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-ink-50',
          className
        )}
      />
    );
  }
);

Input.displayName = 'Input';
