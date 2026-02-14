import { cn } from '../../lib/utils/cn';

export interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function Progress({
  value,
  max = 100,
  className,
  showLabel = false,
  variant = 'default',
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const variantStyles = {
    default: 'bg-accent-gold',
    success: 'bg-semantic-success',
    warning: 'bg-semantic-warning',
    danger: 'bg-semantic-danger',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Progress</span>
          <span className="text-sm font-medium text-gray-300">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
        <div
          className={cn('h-full transition-all duration-300 rounded-full', variantStyles[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full h-8 w-8 border-b-2 border-accent-gold',
        className
      )}
    />
  );
}
