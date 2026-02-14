import { type ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import { cn } from '../../lib/utils/cn';

export interface AlertProps {
  variant?: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

const icons = {
  info: Info,
  warning: AlertCircle,
  error: XCircle,
  success: CheckCircle,
};

const variantStyles = {
  info: 'bg-semantic-info/10 border-semantic-info/30 text-semantic-info',
  warning: 'bg-semantic-warning/10 border-semantic-warning/30 text-semantic-warning',
  error: 'bg-semantic-danger/10 border-semantic-danger/30 text-semantic-danger',
  success: 'bg-semantic-success/10 border-semantic-success/30 text-semantic-success',
};

export function Alert({
  variant = 'info',
  title,
  children,
  onClose,
  className,
}: AlertProps) {
  const Icon = icons[variant];

  return (
    <div
      className={cn(
        'rounded-lg border p-4 flex items-start gap-3',
        variantStyles[variant],
        className
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        <div className="text-sm">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
