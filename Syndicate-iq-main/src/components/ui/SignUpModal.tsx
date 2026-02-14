import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus } from 'lucide-react';
import { Input } from './Input';
import { Button } from './Button';
import { signUp } from '@/lib/services/authService';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SignUpModal({ isOpen, onClose, onSuccess }: SignUpModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Reset form when modal opens
      setName('');
      setEmail('');
      setPassword('');
      setErrors({});
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const validatePassword = (pwd: string): string | undefined => {
    if (!pwd || pwd.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Password must contain at least one number';
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string; email?: string; password?: string } = {};

    if (!name || name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Password validation status for real-time feedback
  const passwordValidation = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const result = signUp(name, email, password);

    setIsSubmitting(false);

    if (result.success) {
      // Success - close modal and optionally trigger success callback
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } else {
      // Show error
      setErrors({ general: result.error || 'Sign up failed. Please try again.' });
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md overflow-hidden rounded-2xl glass-lg border border-white/20 backdrop-blur-xl shadow-2xl"
            onClick={(e?: React.MouseEvent) => e?.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
                  <UserPlus className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Sign Up</h2>
                  <p className="text-sm text-white/60 mt-0.5">Create your account</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {errors.general && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {errors.general}
                  </div>
                )}

                <Input
                  label="Name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  error={errors.name}
                  required
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  error={errors.email}
                  required
                />

                <div>
                  <Input
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: undefined });
                    }}
                    error={errors.password}
                    required
                  />
                  {password && (
                    <div className="mt-2 space-y-1.5">
                      <p className="text-xs text-white/60 font-medium mb-1">Password requirements:</p>
                      <div className="space-y-1">
                        <div className={`flex items-center gap-2 text-xs ${passwordValidation.length ? 'text-green-400' : 'text-white/50'}`}>
                          <span>{passwordValidation.length ? '✓' : '○'}</span>
                          <span>At least 8 characters</span>
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${passwordValidation.uppercase ? 'text-green-400' : 'text-white/50'}`}>
                          <span>{passwordValidation.uppercase ? '✓' : '○'}</span>
                          <span>One uppercase letter</span>
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${passwordValidation.lowercase ? 'text-green-400' : 'text-white/50'}`}>
                          <span>{passwordValidation.lowercase ? '✓' : '○'}</span>
                          <span>One lowercase letter</span>
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${passwordValidation.number ? 'text-green-400' : 'text-white/50'}`}>
                          <span>{passwordValidation.number ? '✓' : '○'}</span>
                          <span>One number</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                    className="flex-1"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Sign Up
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;

  return createPortal(modalContent, document.body);
}
