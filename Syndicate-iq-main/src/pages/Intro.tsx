import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RotatingText } from '@/components/ui/RotatingText';

const capabilities = [
  '24/7 Live Portfolio Intelligence',
  'AI-Powered Document Understanding',
  'Real-Time Covenant & Risk Monitoring',
  'LMA-Aligned ESG Verification',
  'Institutional-Grade Security & Audit Trails',
];

export function Intro() {
  const navigate = useNavigate();

  // Animation variants for staggered blur fade-in
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#060B16]">
      {/* Background gradient */}
      <motion.div
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="
          absolute inset-0
          bg-[linear-gradient(120deg,#0a1f2e,#090b18,#120b2e)]
          bg-[length:200%_200%]
        "
      />

      {/* Glass noise overlay */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-2xl" />

      {/* Branding */}
      <motion.div
        initial={{ opacity: 0, filter: 'blur(8px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        transition={{
          duration: 0.8,
          delay: 0.3,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className="absolute top-10 left-10 md:top-12 md:left-12 z-20"
      >
        <h1 className="text-xl md:text-2xl font-semibold text-white tracking-tight">
          Syndicate<span className="text-cyan-400">IQ</span>
        </h1>
      </motion.div>

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex h-full flex-col items-center justify-center text-center px-6"
      >
        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            duration: 1,
            delay: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="mt-4 max-w-4xl mx-auto"
        >
          {/* Text with gradient */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              The Intelligent OS for
            </span>
            <br />
            <span className="inline-flex items-center gap-2">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Syndicated
              </span>
              <RotatingText
                texts={['lending', 'finance', 'loan']}
                mainClassName="text-white font-bold"
                staggerFrom="last"
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                exit={{ y: '-120%', opacity: 0 }}
                staggerDuration={0.025}
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                rotationInterval={2000}
              />
            </span>
          </h2>
          
          {/* Mantra */}
          <motion.p
            initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{
              duration: 0.8,
              delay: 0.8,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="mt-6 text-xl md:text-2xl lg:text-3xl font-light text-white/90 text-center leading-relaxed"
          >
            Clarity at scale.
            <br />
            Confidence in every decision.
          </motion.p>
        </motion.div>

        {/* Capabilities - Horizontal Scrolling */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 1.0,
            staggerChildren: 0.1,
            delayChildren: 0.1,
          }}
          className="mt-10 w-full overflow-hidden"
        >
          <div className="flex animate-slide-left whitespace-nowrap will-change-transform">
            {[...capabilities, ...capabilities].map((capability, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{
                  duration: 0.8,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="inline-flex items-center text-white text-base mr-8"
              >
                <span className="mr-2">•</span>
                <span>{capability}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: 'blur(8px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{
            duration: 0.8,
            delay: 1.2,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="relative mt-14 inline-block will-change-transform"
        >
          {/* Outer glow layer */}
          <motion.div
            className="absolute -inset-3 rounded-full opacity-60"
            style={{
              background: 'conic-gradient(from 0deg, #06b6d4, #a855f7, #10b981, #3b82f6, #ec4899, #06b6d4)',
              filter: 'blur(16px)',
            }}
            animate={{
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              opacity: {
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
          />

          {/* Animated border wrapper with conic gradient */}
          <motion.div
            className="relative rounded-full p-[2px]"
            style={{
              background: 'conic-gradient(from 0deg, #06b6d4, #a855f7, #10b981, #3b82f6, #ec4899, #06b6d4)',
            }}
          >
            {/* Inner glow layer */}
            <motion.div
              className="absolute inset-0 rounded-full opacity-50"
              style={{
                background: 'radial-gradient(circle, rgba(6, 182, 212, 0.5), rgba(168, 85, 247, 0.4), transparent)',
                filter: 'blur(10px)',
              }}
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="
                relative z-10
                flex items-center gap-3
                rounded-full px-6 py-3
                bg-white/10 backdrop-blur-xl
                border border-transparent
                text-white/80
                hover:text-white
                hover:bg-white/20
                transition-colors
                will-change-transform
                font-bold
              "
            >
              Activate Intelligence
              <motion.div
                initial={{ x: 0 }}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                {/* Animated gradient arrow */}
                <motion.div
                  className="absolute -inset-2 opacity-50"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.6), rgba(168, 85, 247, 0.6), transparent)',
                    filter: 'blur(6px)',
                  }}
                  animate={{
                    x: ['-100%', '100%'],
                    opacity: [0, 0.8, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    repeatDelay: 1.5,
                  }}
                />
                <motion.svg
                  className="h-5 w-5 relative z-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="white"
                >
                  <motion.path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    stroke="white"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </motion.svg>
              </motion.div>
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
