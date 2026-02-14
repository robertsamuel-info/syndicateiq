import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface AlertBadgeProps {
  severity: 'info' | 'warning' | 'critical' | 'success';
  message: string;
  timestamp?: Date;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function AlertBadge({ severity, message, timestamp, action }: AlertBadgeProps) {
  const config = {
    info: {
      icon: Info,
      borderColor: 'border-l-cyan-500/50',
      textColor: 'text-white',
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/20',
    },
    warning: {
      icon: AlertTriangle,
      borderColor: 'border-l-amber-500/50',
      textColor: 'text-white',
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/20',
    },
    critical: {
      icon: AlertCircle,
      borderColor: 'border-l-red-500/50',
      textColor: 'text-white',
      iconColor: 'text-red-400',
      iconBg: 'bg-red-500/20',
    },
    success: {
      icon: CheckCircle2,
      borderColor: 'border-l-green-500/50',
      textColor: 'text-white',
      iconColor: 'text-green-400',
      iconBg: 'bg-green-500/20',
    },
  };

  const { icon: Icon, borderColor, textColor, iconColor, iconBg } = config[severity];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ x: 4, scale: 1.01 }}
      className={`
        glass-sm ${borderColor}
        border-l-4 rounded-xl p-4
        border border-white/10
        shadow-lg hover:shadow-xl hover:scale-[1.02]
        hover:bg-white/12
        transition-all duration-300
        text-white
      `}
    >
      <div className="flex items-start gap-3">
        <div className={`
          ${iconBg}
          p-2 rounded-lg flex-shrink-0 backdrop-blur-sm
        `}>
          <Icon size={20} className={iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`${textColor} font-medium text-sm leading-relaxed`}>
            {message}
          </p>
          {timestamp && (
            <p className="text-xs text-white/50 mt-1.5">
              {timestamp.toLocaleString()}
            </p>
          )}
        </div>
        {action && (
          <button
            onClick={action.onClick}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-medium
              ${textColor} ${iconBg}
              hover:opacity-80 transition-opacity
              flex-shrink-0 backdrop-blur-sm
            `}
          >
            {action.label}
          </button>
        )}
      </div>
    </motion.div>
  );
}
