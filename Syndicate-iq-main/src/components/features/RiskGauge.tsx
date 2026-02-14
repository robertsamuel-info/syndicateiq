import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface RiskGaugeProps {
  score: number; // 0-100
  label: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function RiskGauge({ score, label, size = 'md', showLabel = true }: RiskGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  const sizeClasses = {
    sm: { container: 'w-40 h-40', text: 'text-4xl', label: 'text-xs', badge: 'px-2.5 py-1', labelText: 'text-xs' },
    md: { container: 'w-56 h-56', text: 'text-6xl', label: 'text-sm', badge: 'px-3 py-1.5', labelText: 'text-sm' },
    lg: { container: 'w-72 h-72', text: 'text-7xl', label: 'text-base', badge: 'px-4 py-2', labelText: 'text-base' },
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return { 
      primary: '#10B981', 
      secondary: '#34D399', 
      bg: 'rgba(236, 253, 245, 0.9)',
      glow: 'rgba(16, 185, 129, 0.4)',
      text: '#059669'
    };
    if (score < 60) return { 
      primary: '#F59E0B', 
      secondary: '#FBBF24', 
      bg: 'rgba(255, 251, 235, 0.9)',
      glow: 'rgba(245, 158, 11, 0.4)',
      text: '#D97706'
    };
    return { 
      primary: '#EF4444', 
      secondary: '#F87171', 
      bg: 'rgba(254, 242, 242, 0.9)',
      glow: 'rgba(239, 68, 68, 0.5)',
      text: '#DC2626'
    };
  };

  const getRiskLabel = (score: number) => {
    if (score < 30) return 'Low Risk';
    if (score < 60) return 'Medium Risk';
    return 'High Risk';
  };

  const colors = getRiskColor(score);
  const riskLabel = getRiskLabel(score);
  const sizeStyle = sizeClasses[size];

  // Animate score on mount/change
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  // Calculate arc path
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const progressPercentage = (score / 100) * 100;

  return (
    <div className="flex flex-col items-start justify-center">
      <div className={`relative ${sizeStyle.container} flex items-center justify-start`}>
        {/* Subtle outer glow effect */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${colors.primary}40 0%, transparent 60%)`,
            filter: 'blur(20px)',
            opacity: 0.3,
          }}
        />

        {/* SVG Circle - Centered */}
        <svg 
          className="w-full h-full" 
          viewBox="0 0 200 200"
          style={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-90deg)',
          }}
        >
          <defs>
            {/* Animated multicolor gradient for progress */}
            <linearGradient id={`gradient-${score}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="1">
                <animate
                  attributeName="stop-color"
                  values="#EF4444;#8B5CF6;#EC4899;#06B6D4;#EF4444"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="33%" stopColor="#8B5CF6" stopOpacity="1">
                <animate
                  attributeName="stop-color"
                  values="#8B5CF6;#EC4899;#06B6D4;#EF4444;#8B5CF6"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="66%" stopColor="#EC4899" stopOpacity="1">
                <animate
                  attributeName="stop-color"
                  values="#EC4899;#06B6D4;#EF4444;#8B5CF6;#EC4899"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="1">
                <animate
                  attributeName="stop-color"
                  values="#06B6D4;#EF4444;#8B5CF6;#EC4899;#06B6D4"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </stop>
            </linearGradient>
            {/* Professional glow filter */}
            <filter id={`glow-${score}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background track */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          
          {/* Progress arc with live multicolor animation */}
          <motion.circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={`url(#gradient-${score})`}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 2, ease: [0.4, 0, 0.2, 1] }}
            style={{
              filter: `url(#glow-${score}) drop-shadow(0 0 15px rgba(239, 68, 68, 0.5))`,
            }}
          />
          
          {/* Animated multicolor overlay for extra effect */}
          <motion.circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={`url(#gradient-${score})`}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ 
              strokeDashoffset: offset,
              opacity: [0.6, 0.9, 0.6],
            }}
            transition={{ 
              strokeDashoffset: { duration: 2, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
            }}
            style={{
              filter: 'blur(2px)',
              mixBlendMode: 'screen',
            }}
          />
        </svg>

        {/* Center content - Perfectly centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Score number - Large, bold, with multicolor animated gradient */}
          <motion.div
            className={`${sizeStyle.text} font-black mb-3 relative z-10`}
            style={{ 
              background: 'linear-gradient(90deg, #EF4444 0%, #8B5CF6 25%, #EC4899 50%, #06B6D4 75%, #EF4444 100%)',
              backgroundSize: '200% 100%',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              backgroundPosition: ['0%', '200%', '0%'],
            }}
            transition={{ 
              scale: { duration: 0.5, delay: 0.5, type: 'spring', stiffness: 200 },
              opacity: { duration: 0.5, delay: 0.5 },
              backgroundPosition: { duration: 4, repeat: Infinity, ease: 'linear' }
            }}
          >
            {animatedScore}
          </motion.div>

          {/* Risk label badge - Clean pill shaped with multicolor text */}
          <motion.div
            className={`
              ${sizeStyle.badge} ${sizeStyle.label} font-bold rounded-full
              relative z-10
            `}
            style={{
              backgroundColor: colors.bg,
              boxShadow: `
                0 0 10px ${colors.primary}40,
                0 2px 8px rgba(0, 0, 0, 0.1),
                inset 0 1px 2px rgba(255, 255, 255, 0.9)
              `,
            }}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <motion.span
              style={{
                background: 'linear-gradient(90deg, #EF4444 0%, #8B5CF6 25%, #EC4899 50%, #06B6D4 75%, #EF4444 100%)',
                backgroundSize: '200% 100%',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
              animate={{
                backgroundPosition: ['0%', '200%', '0%'],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              {riskLabel}
            </motion.span>
          </motion.div>
        </div>

      </div>
      
      {/* Label text below - Left aligned with multicolor animation */}
      {showLabel && (
        <motion.p
          className={`mt-6 text-left ${sizeStyle.labelText} font-medium relative z-10`}
          style={{
            background: 'linear-gradient(90deg, #EF4444 0%, #8B5CF6 25%, #EC4899 50%, #06B6D4 75%, #EF4444 100%)',
            backgroundSize: '200% 100%',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            backgroundPosition: ['0%', '200%', '0%'],
          }}
          transition={{ 
            opacity: { duration: 0.5, delay: 0.9 },
            y: { duration: 0.5, delay: 0.9 },
            backgroundPosition: { duration: 4, repeat: Infinity, ease: 'linear', delay: 1 }
          }}
        >
          {label}
        </motion.p>
      )}
    </div>
  );
}
