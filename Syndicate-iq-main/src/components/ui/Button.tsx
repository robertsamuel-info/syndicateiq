import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils/cn';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 shadow-xs hover:bg-cyan-500/30 backdrop-blur-sm',
        destructive:
          'bg-red-500/20 border border-red-500/30 text-red-400 shadow-xs hover:bg-red-500/30 backdrop-blur-sm',
        outline:
          'border border-white/20 glass shadow-xs hover:bg-white/10 text-white',
        secondary:
          'bg-white/10 border border-white/20 text-white shadow-xs hover:bg-white/20 backdrop-blur-sm',
        ghost:
          'hover:bg-white/10 hover:text-white text-white/60',
        link: 'text-cyan-400 underline-offset-4 hover:underline',
        glass:
          'glass px-6 py-3 text-white border border-white/20 hover:bg-white/12 hover:border-white/30 backdrop-blur-sm transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';

  if (loading || disabled) {
    return (
      <Comp
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center bg-inherit">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
        )}
        <span className={loading ? 'opacity-0' : ''}>{children}</span>
      </Comp>
    );
  }

  return (
    <motion.button
      data-slot="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...(props as any)}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center bg-inherit">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
      )}
      <span className={loading ? 'opacity-0' : ''}>{children}</span>
    </motion.button>
  );
}

export { Button, buttonVariants };
