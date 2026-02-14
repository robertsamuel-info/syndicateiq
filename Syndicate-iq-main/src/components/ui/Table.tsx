import { ReactNode } from 'react';
import { cn } from '../../lib/utils/cn';

export interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full border-collapse', className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <thead className={cn('bg-gray-800/50 border-b border-gray-700', className)}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className }: { children: ReactNode; className?: string }) {
  return <tbody className={className}>{children}</tbody>;
}

export function TableRow({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <tr
      className={cn(
        'border-b border-gray-800 hover:bg-gray-800/30 transition-colors',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function TableHead({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th className={cn('px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider', className)}>
      {children}
    </th>
  );
}

export function TableCell({
  children,
  className,
  colSpan,
}: {
  children: ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td className={cn('px-4 py-3 text-sm text-gray-300', className)} colSpan={colSpan}>
      {children}
    </td>
  );
}
