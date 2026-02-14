import { type InputHTMLAttributes, forwardRef, useRef, useImperativeHandle } from 'react';
import { cn } from '../../lib/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, type, className, ...props }, ref) => {
    const isNumber = type === 'number';
    const inputRef = useRef<HTMLInputElement>(null);
    
    // Expose the ref to parent
    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);
    
    const handleIncrement = () => {
      if (inputRef.current) {
        const currentValue = parseFloat(inputRef.current.value) || 0;
        const step = parseFloat(inputRef.current.step) || 1;
        const newValue = currentValue + step;
        inputRef.current.value = newValue.toString();
        inputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
        inputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };
    
    const handleDecrement = () => {
      if (inputRef.current) {
        const currentValue = parseFloat(inputRef.current.value) || 0;
        const step = parseFloat(inputRef.current.step) || 1;
        const min = parseFloat(inputRef.current.min);
        const newValue = Math.max(isNaN(min) ? 0 : min, currentValue - step);
        inputRef.current.value = newValue.toString();
        inputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
        inputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };
    
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-white/80 mb-2 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={inputRef}
            type={type}
            className={cn(
              'border-input data-[placeholder]:text-muted-foreground',
              'focus-visible:border-ring focus-visible:ring-ring/50',
              'flex w-full items-center rounded-lg border bg-background px-4 py-3 text-sm',
              'whitespace-nowrap shadow-xs transition-all outline-none',
              'focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
              'hover:bg-accent/50 text-foreground',
              'glass-sm border-white/20 hover:border-white/30 focus-visible:border-cyan-400/60 focus-visible:shadow-[0_0_0_3px_rgba(6,182,212,0.2)]',
              isNumber && 'pr-12',
              error && 'border-destructive focus-visible:ring-destructive/20 aria-invalid:ring-destructive/20',
              className
            )}
            style={isNumber ? {
              MozAppearance: 'textfield',
            } : undefined}
            {...props}
          />
          {isNumber && (
            <>
              <style>{`
                input[type="number"]::-webkit-inner-spin-button,
                input[type="number"]::-webkit-outer-spin-button {
                  -webkit-appearance: none;
                  margin: 0;
                }
              `}</style>
              <div className="absolute inset-y-0 right-0 flex flex-col items-stretch pr-1.5 py-1 pointer-events-auto">
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={handleIncrement}
                  className="flex-1 flex items-center justify-center hover:bg-white/10 rounded-t-md transition-colors cursor-pointer group min-h-[20px]"
                  aria-label="Increment"
                >
                  <svg className="w-3.5 h-3.5 text-white/50 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <div className="w-full h-px bg-white/10" />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={handleDecrement}
                  className="flex-1 flex items-center justify-center hover:bg-white/10 rounded-b-md transition-colors cursor-pointer group min-h-[20px]"
                  aria-label="Decrement"
                >
                  <svg className="w-3.5 h-3.5 text-white/50 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </>
          )}
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

Input.displayName = 'Input';
