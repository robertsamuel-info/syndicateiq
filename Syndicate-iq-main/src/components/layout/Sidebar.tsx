import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, TrendingUp, Shield, Leaf, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils/cn';
import { motion } from 'framer-motion';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    path: '/document-processing',
    label: 'Document Processing',
    icon: FileText,
  },
  {
    path: '/due-diligence',
    label: 'Due Diligence',
    icon: TrendingUp,
  },
  {
    path: '/covenant-monitoring',
    label: 'Covenant Monitoring',
    icon: Shield,
  },
  {
    path: '/esg-monitoring',
    label: 'ESG Monitoring',
    icon: Leaf,
  },
  {
    path: '/esg-veritas',
    label: 'ESG Veritas',
    icon: Leaf,
  },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex w-72 items-start justify-center pt-8 relative">
      {/* Compact Floating Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[280px] glass-lg rounded-2xl border border-white/20 backdrop-blur-xl shadow-2xl overflow-hidden relative"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)',
        }}
      >
        {/* Subtle glow effect */}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.15), transparent 70%)',
          }}
          animate={{
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Navigation - Compact */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
              >
                <NavLink
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden',
                    isActive
                      ? 'text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/8 hover:border border-transparent hover:border-white/10'
                  )}
                >
                  {({ isActive: navActive }) => (
                    <>
                      {/* Premium Glassmorphism Background with Multicolor Animation */}
                      {navActive && (
                        <>
                          {/* Base glass layer */}
                          <motion.div
                            className="absolute inset-0 rounded-xl backdrop-blur-xl"
                            style={{
                              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(139, 92, 246, 0.15) 50%, rgba(236, 72, 153, 0.15) 100%)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                            }}
                            animate={{
                              background: [
                                'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(139, 92, 246, 0.15) 50%, rgba(236, 72, 153, 0.15) 100%)',
                                'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.15) 50%, rgba(6, 182, 212, 0.15) 100%)',
                                'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(6, 182, 212, 0.15) 50%, rgba(139, 92, 246, 0.15) 100%)',
                                'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(139, 92, 246, 0.15) 50%, rgba(236, 72, 153, 0.15) 100%)',
                              ],
                            }}
                            transition={{
                              duration: 8,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                          />

                          {/* Animated multicolor blur layers */}
                          <motion.div
                            className="absolute inset-0 rounded-xl pointer-events-none"
                            style={{
                              background: 'radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.4), transparent 50%)',
                              filter: 'blur(20px)',
                            }}
                            animate={{
                              x: ['0%', '30%', '0%'],
                              y: ['0%', '20%', '0%'],
                              scale: [1, 1.2, 1],
                              opacity: [0.6, 0.8, 0.6],
                            }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                          />
                          <motion.div
                            className="absolute inset-0 rounded-xl pointer-events-none"
                            style={{
                              background: 'radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.4), transparent 50%)',
                              filter: 'blur(20px)',
                            }}
                            animate={{
                              x: ['0%', '-30%', '0%'],
                              y: ['0%', '-20%', '0%'],
                              scale: [1, 1.2, 1],
                              opacity: [0.6, 0.8, 0.6],
                            }}
                            transition={{
                              duration: 5,
                              repeat: Infinity,
                              ease: 'easeInOut',
                              delay: 0.5,
                            }}
                          />
                          <motion.div
                            className="absolute inset-0 rounded-xl pointer-events-none"
                            style={{
                              background: 'radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.3), transparent 60%)',
                              filter: 'blur(25px)',
                            }}
                            animate={{
                              x: ['0%', '20%', '-20%', '0%'],
                              y: ['0%', '-30%', '30%', '0%'],
                              scale: [1, 1.3, 1.1, 1],
                              opacity: [0.5, 0.7, 0.6, 0.5],
                            }}
                            transition={{
                              duration: 6,
                              repeat: Infinity,
                              ease: 'easeInOut',
                              delay: 1,
                            }}
                          />

                          {/* Additional animated gradient overlay */}
                          <motion.div
                            className="absolute inset-0 rounded-xl pointer-events-none"
                            style={{
                              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(139, 92, 246, 0.2) 50%, rgba(236, 72, 153, 0.2) 100%)',
                              filter: 'blur(1px)',
                            }}
                            animate={{
                              background: [
                                'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(139, 92, 246, 0.2) 50%, rgba(236, 72, 153, 0.2) 100%)',
                                'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.2) 50%, rgba(6, 182, 212, 0.2) 100%)',
                                'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(6, 182, 212, 0.2) 50%, rgba(139, 92, 246, 0.2) 100%)',
                                'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(139, 92, 246, 0.2) 50%, rgba(236, 72, 153, 0.2) 100%)',
                              ],
                            }}
                            transition={{
                              duration: 6,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                          />

                          {/* Pulsing border glow */}
                          <motion.div
                            className="absolute inset-0 rounded-xl pointer-events-none"
                            style={{
                              border: '1px solid transparent',
                              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.4), rgba(139, 92, 246, 0.4), rgba(236, 72, 153, 0.4)) border-box',
                              WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                              WebkitMaskComposite: 'xor',
                              maskComposite: 'exclude',
                            }}
                            animate={{
                              opacity: [0.4, 0.7, 0.4],
                              boxShadow: [
                                '0 0 0px rgba(6, 182, 212, 0), 0 0 0px rgba(139, 92, 246, 0), 0 0 0px rgba(236, 72, 153, 0)',
                                '0 0 20px rgba(6, 182, 212, 0.5), 0 0 30px rgba(139, 92, 246, 0.4), 0 0 25px rgba(236, 72, 153, 0.4)',
                                '0 0 0px rgba(6, 182, 212, 0), 0 0 0px rgba(139, 92, 246, 0), 0 0 0px rgba(236, 72, 153, 0)',
                              ],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                          />

                          {/* Active indicator bar with gradient animation */}
                          <motion.div
                            layoutId="activeIndicator"
                            initial={false}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full overflow-hidden"
                          >
                            <motion.div
                              className="absolute inset-0"
                              style={{
                                background: 'linear-gradient(180deg, rgba(6, 182, 212, 1) 0%, rgba(139, 92, 246, 1) 50%, rgba(236, 72, 153, 1) 100%)',
                              }}
                              animate={{
                                background: [
                                  'linear-gradient(180deg, rgba(6, 182, 212, 1) 0%, rgba(139, 92, 246, 1) 50%, rgba(236, 72, 153, 1) 100%)',
                                  'linear-gradient(180deg, rgba(139, 92, 246, 1) 0%, rgba(236, 72, 153, 1) 50%, rgba(6, 182, 212, 1) 100%)',
                                  'linear-gradient(180deg, rgba(236, 72, 153, 1) 0%, rgba(6, 182, 212, 1) 50%, rgba(139, 92, 246, 1) 100%)',
                                  'linear-gradient(180deg, rgba(6, 182, 212, 1) 0%, rgba(139, 92, 246, 1) 50%, rgba(236, 72, 153, 1) 100%)',
                                ],
                              }}
                              transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: 'linear',
                              }}
                            />
                            <motion.div
                              className="absolute inset-0"
                              style={{
                                background: 'linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
                              }}
                              animate={{
                                y: ['-100%', '200%'],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'linear',
                              }}
                            />
                          </motion.div>

                          {/* Shimmer effect */}
                          <motion.div
                            className="absolute inset-0 -translate-x-full"
                            style={{
                              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                            }}
                            animate={{
                              x: ['-100%', '200%'],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              repeatDelay: 1,
                              ease: 'linear',
                            }}
                          />
                        </>
                      )}
                      
                      {/* Shimmer effect on hover for non-active items */}
                      {!navActive && (
                        <motion.div
                          className="absolute inset-0 -translate-x-full"
                          style={{
                            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                          }}
                          whileHover={{
                            x: ['-100%', '200%'],
                          }}
                          transition={{
                            duration: 0.6,
                            ease: 'easeInOut',
                          }}
                        />
                      )}

                      <Icon className={cn(
                        'h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110 z-10 relative',
                        navActive ? 'text-white drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'text-white/60'
                      )} />
                      <span className={cn(
                        'flex-1 font-semibold text-sm z-10 relative',
                        navActive && 'drop-shadow-[0_0_4px_rgba(6,182,212,0.6)]'
                      )}>{item.label}</span>
                      <ChevronRight
                        className={cn(
                          'h-4 w-4 transition-all text-white/40 z-10 relative',
                          'opacity-0 group-hover:opacity-100 group-hover:translate-x-1',
                          navActive && 'opacity-100 text-white/80'
                        )}
                      />
                    </>
                  )}
                </NavLink>
              </motion.div>
            );
          })}
        </nav>

        {/* LMA Footer - Clean and Professional */}
        <div className="p-4 border-t border-white/10 relative">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="rounded-2xl p-4 border border-white/10 backdrop-blur-sm relative overflow-hidden cursor-pointer group"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(30, 41, 59, 0.5) 100%)',
            }}
          >
            {/* Subtle animated gradient background */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(6, 182, 212, 0.1) 100%)',
              }}
              animate={{
                background: [
                  'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(6, 182, 212, 0.1) 100%)',
                  'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 50%, rgba(139, 92, 246, 0.1) 100%)',
                  'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(6, 182, 212, 0.1) 100%)',
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            {/* Subtle shimmer effect */}
            <motion.div
              className="absolute inset-0 -translate-x-full"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
              }}
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatDelay: 1,
                ease: 'linear',
              }}
            />

            {/* Content */}
            <div className="flex items-center gap-2 relative z-10">
              {/* Light blue dot */}
              <motion.div
                className="w-2.5 h-2.5 rounded-full relative"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div className="absolute inset-0 bg-cyan-400 rounded-full" />
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #06b6d4, #8b5cf6, #06b6d4)',
                    backgroundSize: '200% 100%',
                  }}
                  animate={{
                    backgroundPosition: ['0%', '200%', '0%'],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </motion.div>
              
              {/* LMA text with animated gradient */}
              <motion.p
                className="text-sm font-bold relative z-10"
                style={{
                  background: 'linear-gradient(90deg, #06b6d4, #8b5cf6, #06b6d4)',
                  backgroundSize: '200% 100%',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
                animate={{
                  backgroundPosition: ['0%', '200%', '0%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                LMA
              </motion.p>
            </div>

            {/* Subtle border glow */}
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                border: '1px solid rgba(6, 182, 212, 0.2)',
              }}
              animate={{
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.div>
        </div>
      </motion.div>
    </aside>
  );
}
