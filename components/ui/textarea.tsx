import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        {...props}
        className={cn(
          'flex min-h-[80px] w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm text-ink-800',
          'shadow-inner-soft outline-none transition-all duration-200 ease-out resize-none',
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

Textarea.displayName = 'Textarea';
