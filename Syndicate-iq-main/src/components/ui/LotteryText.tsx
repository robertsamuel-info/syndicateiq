import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

interface LotteryTextProps {
  text: string;
  className?: string;
  delay?: number;
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
const REPEAT_INTERVAL = 10000; // 10 seconds

export function LotteryText({ text, className = '', delay = 0 }: LotteryTextProps) {
  const [displayText, setDisplayText] = useState<string[]>([]);
  const [lockedIndices, setLockedIndices] = useState<Set<number>>(new Set());
  const [blur, setBlur] = useState(10);
  const [opacity, setOpacity] = useState(0);
  const intervalsRef = useRef<NodeJS.Timeout[]>([]);
  const repeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lockedIndicesRef = useRef<Set<number>>(new Set());

  const animate = () => {
    // Reset state
    const initialChars = text.split('').map(() => CHARS[Math.floor(Math.random() * CHARS.length)]);
    setDisplayText(initialChars);
    lockedIndicesRef.current = new Set();
    setLockedIndices(new Set());
    setBlur(10);
    setOpacity(0);

    // Fade in with blur
    const fadeInInterval = setInterval(() => {
      setBlur(prev => Math.max(0, prev - 0.5));
      setOpacity(prev => Math.min(1, prev + 0.05));
    }, 20);

    setTimeout(() => {
      clearInterval(fadeInInterval);
      setBlur(0);
      setOpacity(1);
    }, 400);

    // Clear any existing intervals
    intervalsRef.current.forEach(interval => clearInterval(interval));
    intervalsRef.current = [];

    // Start animation after delay
    const timeout = setTimeout(() => {
      const targetChars = text.split('');
      
      // Animate each character with staggered timing (slower)
      targetChars.forEach((targetChar, index) => {
        const iterations = 25 + Math.floor(Math.random() * 30); // More iterations for slower effect
        const speed = 80 + Math.floor(Math.random() * 60); // Slower speed (80-140ms)
        
        let iteration = 0;
        const interval = setInterval(() => {
          iteration++;
          
          setDisplayText((prev) => {
            const newText = [...prev];
            
            if (iteration < iterations && !lockedIndicesRef.current.has(index)) {
              // Show random character
              newText[index] = CHARS[Math.floor(Math.random() * CHARS.length)];
            } else if (!lockedIndicesRef.current.has(index)) {
              // Lock in the target character
              newText[index] = targetChar;
              lockedIndicesRef.current.add(index);
              setLockedIndices(new Set(lockedIndicesRef.current));
              clearInterval(interval);
            }
            
            return newText;
          });
        }, speed);

        intervalsRef.current.push(interval);
      });
    }, delay);

    return () => {
      clearTimeout(timeout);
      clearInterval(fadeInInterval);
      intervalsRef.current.forEach(interval => clearInterval(interval));
    };
  };

  useEffect(() => {
    // Initial animation
    animate();

    // Set up repeat every 10 seconds
    repeatTimeoutRef.current = setInterval(() => {
      animate();
    }, REPEAT_INTERVAL);

    return () => {
      if (repeatTimeoutRef.current) clearInterval(repeatTimeoutRef.current);
      intervalsRef.current.forEach(interval => clearInterval(interval));
    };
  }, [text, delay]);

  return (
    <motion.div 
      className={`flex items-center ${className}`}
      style={{
        filter: `blur(${blur}px)`,
        opacity: opacity,
      }}
      transition={{
        filter: { duration: 0.4, ease: 'easeOut' },
        opacity: { duration: 0.4, ease: 'easeOut' },
      }}
    >
      {displayText.map((char, index) => {
        const isLocked = lockedIndices.has(index);
        const isTarget = char === text[index];
        
        return (
          <motion.span
            key={index}
            className="inline-block"
            initial={{ opacity: 0, y: -20, rotateX: -90 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              rotateX: 0,
              scale: isLocked && isTarget ? [1, 1.15, 1] : 1,
            }}
            transition={{
              opacity: { duration: 0.3 },
              y: { duration: 0.3 },
              rotateX: { duration: 0.4, delay: index * 0.08 },
              scale: { 
                duration: 0.5, 
                delay: isLocked ? (index * 0.08) + 0.15 : 0,
                times: [0, 0.5, 1]
              }
            }}
            style={{
              color: isLocked && isTarget
                ? 'rgb(6, 182, 212)' 
                : isLocked
                ? 'rgba(255, 255, 255, 0.9)'
                : 'rgba(255, 255, 255, 0.5)',
              textShadow: isLocked && isTarget
                ? '0 0 15px rgba(6, 182, 212, 0.9), 0 0 30px rgba(6, 182, 212, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3)'
                : 'none',
              transition: 'color 0.2s ease, text-shadow 0.2s ease',
              transformStyle: 'preserve-3d',
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        );
      })}
    </motion.div>
  );
}
