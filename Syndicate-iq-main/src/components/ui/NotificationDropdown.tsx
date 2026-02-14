import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, FileCheck, FileText, X, Clock } from 'lucide-react';
import { notificationService, type Notification } from '@/lib/services/notificationService';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

export function NotificationDropdown({ isOpen, onClose, triggerRef }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateNotifications = () => {
      setNotifications(notificationService.getNotifications());
      setUnreadCount(notificationService.getUnreadCount());
    };

    updateNotifications();
    const unsubscribe = notificationService.subscribe(updateNotifications);

    // Calculate position based on trigger button
    const updatePosition = () => {
      if (triggerRef?.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 8, // 8px gap (mt-2)
          right: window.innerWidth - rect.right,
        });
      }
    };

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Don't close if clicking on the trigger button
        if (triggerRef?.current && triggerRef.current.contains(event.target as Node)) {
          return;
        }
        onClose();
      }
    };

    if (isOpen) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      unsubscribe();
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  const handleMarkAsRead = (id: string) => {
    notificationService.markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'due_diligence':
        return <FileCheck className="h-5 w-5 text-cyan-400" />;
      case 'esg_veritas':
        return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case 'document_processing':
        return <FileText className="h-5 w-5 text-blue-400" />;
      default:
        return <Bell className="h-5 w-5 text-white/60" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'due_diligence':
        return 'border-cyan-500/30 bg-cyan-500/10';
      case 'esg_veritas':
        return 'border-emerald-500/30 bg-emerald-500/10';
      case 'document_processing':
        return 'border-blue-500/30 bg-blue-500/10';
      default:
        return 'border-white/20 bg-white/5';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const dropdownContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            right: `${position.right}px`,
            zIndex: 99999,
          }}
          className="w-96 max-h-[500px] overflow-hidden rounded-xl glass-lg border border-white/20 backdrop-blur-xl shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-white" />
              <h3 className="font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-500/30">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-white/60 hover:text-white transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-[400px]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <Bell className="h-8 w-8 text-white/30" />
                  </div>
                  <div>
                    <p className="text-white font-medium">No updates</p>
                    <p className="text-white/60 text-sm mt-1">You're all caught up!</p>
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleMarkAsRead(notification.id)}
                    className={`p-4 cursor-pointer transition-all hover:bg-white/5 border-l-4 ${
                      notification.read 
                        ? 'border-transparent opacity-60' 
                        : getNotificationColor(notification.type)
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-semibold ${
                            notification.read ? 'text-white/70' : 'text-white'
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0 mt-1.5"
                            />
                          )}
                        </div>
                        <p className="text-xs text-white/60 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-3 w-3 text-white/40" />
                          <span className="text-xs text-white/40">
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-white/10 bg-white/5">
              <button
                onClick={() => {
                  notificationService.clearAll();
                  onClose();
                }}
                className="w-full text-xs text-white/60 hover:text-white transition-colors text-center"
              >
                Clear all notifications
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Render using portal to ensure it's above all content
  if (typeof document !== 'undefined') {
    return createPortal(dropdownContent, document.body);
  }
  
  return null;
}
