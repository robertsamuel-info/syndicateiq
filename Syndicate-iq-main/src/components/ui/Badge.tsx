import type { ReactNode } from 'react';
import { cn } from '../../lib/utils/cn';

export interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  const variants = {
    success: 'bg-semantic-success/20 text-semantic-success border-semantic-success/30',
    warning: 'bg-semantic-warning/20 text-semantic-warning border-semantic-warning/30',
    danger: 'bg-semantic-danger/20 text-semantic-danger border-semantic-danger/30',
    info: 'bg-semantic-info/20 text-semantic-info border-semantic-info/30',
    default: 'bg-gray-800 text-gray-300 border-gray-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
