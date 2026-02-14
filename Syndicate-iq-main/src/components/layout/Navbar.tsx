import { User, Settings, Bell, UserPlus, LogIn, LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { NotificationDropdown } from '../ui/NotificationDropdown';
import { SettingsModal } from '../ui/SettingsModal';
import { SignUpModal } from '../ui/SignUpModal';
import { SignInModal } from '../ui/SignInModal';
import { notificationService } from '@/lib/services/notificationService';
import { getCurrentUser, signOut } from '@/lib/services/authService';

export function Navbar() {
  const navigate = useNavigate();
  const [isHoveringBell, setIsHoveringBell] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userMenuPosition, setUserMenuPosition] = useState({ top: 0, right: 0 });
  const [unreadCount, setUnreadCount] = useState(0);
  const [shouldShake, setShouldShake] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const bellButtonRef = useRef<HTMLButtonElement>(null);
  const userButtonRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const prevUnreadCountRef = useRef(0);

  useEffect(() => {
    const updateUnreadCount = () => {
      const newCount = notificationService.getUnreadCount();
      const prevCount = prevUnreadCountRef.current;
      
      // Only shake if count increased (new notification)
      if (newCount > prevCount && prevCount >= 0) {
        setShouldShake(true);
        // Reset shake after animation completes
        setTimeout(() => setShouldShake(false), 600);
      }
      
      prevUnreadCountRef.current = newCount;
      setUnreadCount(newCount);
    };

    updateUnreadCount();
    const unsubscribe = notificationService.subscribe(updateUnreadCount);

    return () => {
      unsubscribe();
    };
  }, []);

  // Load current user
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  // User menu positioning
  useEffect(() => {
    const updateUserMenuPosition = () => {
      if (userButtonRef.current) {
        const rect = userButtonRef.current.getBoundingClientRect();
        setUserMenuPosition({
          top: rect.bottom + 8,
          right: window.innerWidth - rect.right,
        });
      }
    };

    if (isUserMenuOpen) {
      updateUserMenuPosition();
      window.addEventListener('resize', updateUserMenuPosition);
      window.addEventListener('scroll', updateUserMenuPosition, true);
    }

    return () => {
      window.removeEventListener('resize', updateUserMenuPosition);
      window.removeEventListener('scroll', updateUserMenuPosition, true);
    };
  }, [isUserMenuOpen]);

  // Click outside handler for user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        if (userButtonRef.current && userButtonRef.current.contains(event.target as Node)) {
          return;
        }
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative glass-lg border-b border-white/20 px-4 md:px-6 py-4 flex items-center justify-end sticky top-0 z-50 backdrop-blur-xl"
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(6, 182, 212, 0.1) 50%, transparent 100%)',
        }}
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Subtle glow effect */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.5), transparent)',
        }}
        animate={{
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* SyndicateIQ Branding */}
      <div className="absolute left-4 md:left-6 flex items-center z-10">
        <div 
          className="flex flex-col cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate('/')}
        >
          <h1 className="text-lg md:text-xl font-bold leading-tight" style={{ color: '#87CEEB' }}>
            SyndicateIQ
          </h1>
          <motion.p
            className="text-xs text-white/60 font-medium leading-tight mt-0.5"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Ultra Platform
          </motion.p>
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-3 ml-auto">
        {/* Notification Bell with Enhanced Animations */}
        <motion.div
          onHoverStart={() => setIsHoveringBell(true)}
          onHoverEnd={() => setIsHoveringBell(false)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="relative z-[100]"
        >
          <button 
            ref={bellButtonRef}
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative p-2.5 rounded-xl hover:bg-white/12 transition-all glass-sm border border-white/10 hover:border-white/20 overflow-hidden group"
          >
            {/* Shimmer effect on hover */}
            <motion.div
              className="absolute inset-0 -translate-x-full"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)',
              }}
              animate={isHoveringBell ? {
                x: ['-100%', '200%'],
              } : {}}
              transition={{
                duration: 0.6,
                ease: 'easeInOut',
              }}
            />

            {/* Pulsing glow */}
            <motion.div
              className="absolute inset-0 rounded-xl"
              style={{
                boxShadow: '0 0 0px rgba(6, 182, 212, 0)',
              }}
              animate={isHoveringBell ? {
                boxShadow: [
                  '0 0 0px rgba(6, 182, 212, 0)',
                  '0 0 20px rgba(6, 182, 212, 0.4)',
                  '0 0 0px rgba(6, 182, 212, 0)',
                ],
              } : {}}
              transition={{
                duration: 2,
                repeat: isHoveringBell ? Infinity : 0,
                ease: 'easeInOut',
              }}
            />

            <motion.div
              key={shouldShake ? 'shake' : 'normal'}
              animate={shouldShake ? {
                rotate: [0, -15, 15, -15, 15, -10, 10, -5, 5, 0],
              } : {}}
              transition={{
                duration: 0.6,
                ease: 'easeInOut',
              }}
            >
              <Bell className="h-5 w-5 text-white relative z-10" />
            </motion.div>

            {/* Animated notification dot - only show if there are unread notifications */}
            {unreadCount > 0 && (
              <>
                <motion.span
                  className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-400 rounded-full z-20"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [1, 0.8, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                {/* Pulsing ring around notification */}
                <motion.span
                  className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-400 rounded-full z-10"
                  animate={{
                    scale: [1, 2.5, 1],
                    opacity: [0.6, 0, 0.6],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </>
            )}
          </button>
          <NotificationDropdown 
            isOpen={isNotificationOpen} 
            onClose={() => setIsNotificationOpen(false)}
            triggerRef={bellButtonRef}
          />
        </motion.div>

        {/* Settings Button with Enhanced Animations */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="hidden sm:block"
        >
          <motion.button
            onClick={() => setIsSettingsOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-all overflow-hidden group border border-transparent hover:border-white/20"
          >
            {/* Background gradient animation - Always active */}
            <motion.div
              className="absolute inset-0 opacity-100"
              style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
              }}
              animate={{
                background: [
                  'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
                  'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
                  'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Shimmer effect - Always active */}
            <motion.div
              className="absolute inset-0 -translate-x-full"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
              }}
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 0.5,
                ease: 'linear',
              }}
            />

            <div className="relative z-10 flex items-center gap-2">
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                <Settings className="h-4 w-4" />
              </motion.div>
              <span className="text-sm font-medium">Info</span>
            </div>
          </motion.button>
        </motion.div>

        {/* User Profile Section with Enhanced Animations */}
        <motion.div
          ref={userButtonRef}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl glass-sm border border-white/10 hover:bg-white/12 hover:border-white/20 transition-all cursor-pointer overflow-hidden group relative"
        >
          {/* Animated gradient background - Always active */}
          <motion.div
            className="absolute inset-0 opacity-100"
            style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
            }}
            animate={{
              background: [
                'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
                'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
                'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Shimmer effect - Always active */}
          <motion.div
            className="absolute inset-0 -translate-x-full"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), transparent)',
            }}
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              repeatDelay: 0.8,
              ease: 'linear',
            }}
          />

          {/* Subtle glow - Always active */}
          <motion.div
            className="absolute inset-0 rounded-xl"
            style={{
              boxShadow: '0 0 0px rgba(6, 182, 212, 0)',
            }}
            animate={{
              boxShadow: [
                '0 0 0px rgba(6, 182, 212, 0)',
                '0 0 25px rgba(6, 182, 212, 0.3)',
                '0 0 0px rgba(6, 182, 212, 0)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* User Avatar with animated gradient border - Always active */}
          <motion.div
            className="relative w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm z-10"
            style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
            }}
            animate={{
              borderColor: [
                'rgba(6, 182, 212, 0.3)',
                'rgba(16, 185, 129, 0.5)',
                'rgba(6, 182, 212, 0.3)',
              ],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {/* Rotating gradient ring - Always active */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, transparent, rgba(6, 182, 212, 0.3), transparent)',
              }}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <User className="h-4 w-4 text-cyan-400 relative z-10" />
          </motion.div>

          {/* User Info */}
          <div className="hidden sm:block relative z-10">
            <motion.p
              className="text-sm font-semibold text-white"
              animate={{
                color: ['rgb(255, 255, 255)', 'rgb(165, 243, 252)', 'rgb(255, 255, 255)'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {currentUser?.name || 'Guest'}
            </motion.p>
            <motion.p
              className="text-xs text-white/60"
              animate={{
                opacity: [0.6, 0.9, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {currentUser ? 'User' : 'Guest'}
            </motion.p>
          </div>
          <ChevronDown 
            className={`h-4 w-4 text-white/60 transition-transform duration-200 relative z-10 ${isUserMenuOpen ? 'rotate-180' : ''}`} 
          />
        </motion.div>
      </div>

      {/* User Dropdown Menu */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isUserMenuOpen && (
            <motion.div
              ref={userMenuRef}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'fixed',
                top: `${userMenuPosition.top}px`,
                right: `${userMenuPosition.right}px`,
                zIndex: 99999,
              }}
              className="w-56 overflow-hidden rounded-xl glass-lg border border-white/20 backdrop-blur-xl shadow-2xl"
            >
              {/* Menu Items */}
              <div className="py-2">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setIsSignUpOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors"
                >
                  <UserPlus className="h-4 w-4 text-cyan-400" />
                  <span>Sign Up</span>
                </button>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setIsSignInOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors"
                >
                  <LogIn className="h-4 w-4 text-cyan-400" />
                  <span>Sign In</span>
                </button>
                <div className="h-px bg-white/10 my-1" />
                <button
                  onClick={() => {
                    signOut();
                    setCurrentUser(null);
                    setIsUserMenuOpen(false);
                    navigate('/');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      {/* Sign Up Modal */}
      <SignUpModal
        isOpen={isSignUpOpen}
        onClose={() => setIsSignUpOpen(false)}
        onSuccess={() => {
          // After successful sign up, optionally open sign in modal
        }}
      />

      {/* Sign In Modal */}
      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        onSuccess={() => {
          // After successful sign in, refresh user state
          const user = getCurrentUser();
          setCurrentUser(user);
        }}
      />
    </motion.nav>
  );
}
