import { type SelectHTMLAttributes, forwardRef, type ReactNode } from 'react';
import { cn } from '../../lib/utils/cn';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, className, children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-white/80 mb-2 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              'border-input data-[placeholder]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50',
              'flex w-full items-center justify-between gap-2 rounded-lg border bg-background px-4 py-3 text-sm',
              'whitespace-nowrap shadow-xs transition-all outline-none',
              'focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
              'appearance-none pr-10 cursor-pointer text-foreground',
              'hover:bg-accent/50',
              'glass-sm border-white/20 hover:border-white/30 focus-visible:border-cyan-400/60 focus-visible:shadow-[0_0_0_3px_rgba(6,182,212,0.2)]',
              error && 'border-destructive focus-visible:ring-destructive/20 aria-invalid:ring-destructive/20',
              className
            )}
            {...props}
          >
            {children}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <ChevronDown className="h-5 w-5 text-white/40 transition-transform group-hover:rotate-180" />
          </div>
        </div>
        {error && (
          <p className="mt-2 text-sm font-medium text-destructive flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
