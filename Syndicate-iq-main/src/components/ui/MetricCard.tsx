import { type ComponentType } from 'react';
import { motion } from 'framer-motion';
import type { LucideProps } from 'lucide-react';
import { cn } from '../../lib/utils/cn';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ComponentType<LucideProps>;
  trend?: {
    value: string;
    positive: boolean;
  };
  color?: 'blue' | 'green' | 'amber' | 'red' | 'slate' | 'gold';
  size?: 'sm' | 'md' | 'lg';
}

const colorConfig = {
  blue: {
    bg: 'bg-gradient-to-br from-semantic-info-50 to-semantic-info-100/50',
    border: 'border-semantic-info-200',
    iconBg: 'bg-semantic-info-500',
    iconColor: 'text-white',
    valueColor: 'text-semantic-info-700',
    titleColor: 'text-semantic-info-600',
  },
  green: {
    bg: 'bg-gradient-to-br from-semantic-success-50 to-semantic-success-100/50',
    border: 'border-semantic-success-200',
    iconBg: 'bg-semantic-success-500',
    iconColor: 'text-white',
    valueColor: 'text-semantic-success-700',
    titleColor: 'text-semantic-success-600',
  },
  amber: {
    bg: 'bg-gradient-to-br from-semantic-warning-50 to-semantic-warning-100/50',
    border: 'border-semantic-warning-200',
    iconBg: 'bg-semantic-warning-500',
    iconColor: 'text-white',
    valueColor: 'text-semantic-warning-700',
    titleColor: 'text-semantic-warning-600',
  },
  red: {
    bg: 'bg-gradient-to-br from-semantic-danger-50 to-semantic-danger-100/50',
    border: 'border-semantic-danger-200',
    iconBg: 'bg-semantic-danger-500',
    iconColor: 'text-white',
    valueColor: 'text-semantic-danger-700',
    titleColor: 'text-semantic-danger-600',
  },
  slate: {
    bg: 'bg-gradient-to-br from-gray-50 to-gray-100/50',
    border: 'border-gray-200',
    iconBg: 'bg-gray-600',
    iconColor: 'text-white',
    valueColor: 'text-gray-900',
    titleColor: 'text-gray-600',
  },
  gold: {
    bg: 'bg-gradient-to-br from-accent-50 to-accent-100/50',
    border: 'border-accent-200',
    iconBg: 'bg-accent-gold',
    iconColor: 'text-white',
    valueColor: 'text-accent-700',
    titleColor: 'text-accent-600',
  },
};

const sizeConfig = {
  sm: {
    padding: 'p-4',
    iconSize: 20,
    valueSize: 'text-2xl',
    titleSize: 'text-xs',
  },
  md: {
    padding: 'p-6',
    iconSize: 24,
    valueSize: 'text-3xl',
    titleSize: 'text-sm',
  },
  lg: {
    padding: 'p-8',
    iconSize: 28,
    valueSize: 'text-4xl',
    titleSize: 'text-base',
  },
};

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'slate',
  size = 'md',
}: MetricCardProps) {
  const config = colorConfig[color];
  const sizeStyle = sizeConfig[size];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.6 }}
      className={cn(
        sizeStyle.padding,
        'relative overflow-hidden',
        'h-full flex flex-col',
        'group'
      )}
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        borderRadius: '1.25rem',
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.5),
          0 2px 8px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.2),
          inset 0 -1px 0 rgba(255, 255, 255, 0.05)
        `,
      }}
    >
      {/* Animated gradient overlay - top right corner */}
      <motion.div
        className="absolute top-0 right-0 w-48 h-48 rounded-full blur-2xl opacity-40"
        style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.4) 0%, rgba(16, 185, 129, 0.3) 50%, rgba(147, 51, 234, 0.2) 100%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Secondary glow effect */}
      <motion.div
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-xl opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Top highlight line */}
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-50"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4) 50%, transparent)',
        }}
      />

      {/* Animated shimmer effect on hover */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
          transform: 'translateX(-100%)',
        }}
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 1,
          ease: 'linear',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header with icon */}
        <div className="flex items-start justify-between mb-4">
          <h3 className={`${sizeStyle.titleSize} text-white/70 font-semibold uppercase tracking-wider group-hover:text-white/90 transition-colors`}>
            {title}
          </h3>
          {Icon && (
            <motion.div
              className="p-2.5 rounded-xl flex-shrink-0 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                boxShadow: '0 4px 16px rgba(6, 182, 212, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              {/* Icon glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-teal-400/20 rounded-xl blur-sm" />
              <Icon size={sizeStyle.iconSize} className="text-cyan-400 relative z-10 drop-shadow-lg" />
            </motion.div>
          )}
        </div>

        {/* Value */}
        <div className="mb-2 flex-grow">
          <motion.p
            className={`
              ${sizeStyle.valueSize}
              font-bold tracking-tight text-white
              drop-shadow-lg
            `}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {value}
          </motion.p>
        </div>

        {/* Subtitle and Trend */}
        <div className="flex items-center justify-between mt-auto">
          {subtitle && (
            <p className="text-xs text-white/60 font-medium group-hover:text-white/80 transition-colors">
              {subtitle}
            </p>
          )}
          {trend && (
            <motion.div
              className="flex items-center gap-1"
              whileHover={{ scale: 1.1 }}
            >
              <span
                className={`text-xs font-semibold ${
                  trend.positive ? 'text-cyan-400' : 'text-red-400'
                }`}
              >
                {trend.positive ? '↑' : '↓'} {trend.value}
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom border glow on hover */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.6) 50%, transparent)',
          boxShadow: '0 0 10px rgba(6, 182, 212, 0.4)',
        }}
      />
    </motion.div>
  );
}
