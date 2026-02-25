import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type CardProps = {
  className?: string;
  children: ReactNode;
  hover?: boolean;
};

export function Card({ className, children, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--line)] bg-white p-5',
        'shadow-card',
        hover && 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover',
        className
      )}
    >
      {children}
    </div>
  );
}
