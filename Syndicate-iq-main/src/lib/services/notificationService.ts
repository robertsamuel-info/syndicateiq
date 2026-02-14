export type NotificationType = 'due_diligence' | 'esg_veritas' | 'document_processing' | 'info' | 'success' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: Set<() => void> = new Set();

  subscribe(callback: () => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify() {
    this.listeners.forEach(callback => callback());
  }

  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      timestamp: new Date(),
      read: false,
    };
    this.notifications.unshift(newNotification);
    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }
    this.notify();
    return newNotification.id;
  }

  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  markAsRead(id: string) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.notify();
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.notify();
  }

  clearAll() {
    this.notifications = [];
    this.notify();
  }

  // Helper methods for specific notification types
  addDueDiligenceComplete(loanName?: string) {
    return this.addNotification({
      type: 'due_diligence',
      title: 'Due Diligence Completed',
      message: loanName 
        ? `Due diligence processing completed for ${loanName}`
        : 'Due diligence processing completed successfully',
    });
  }

  addESGVeritasComplete(loanName?: string) {
    return this.addNotification({
      type: 'esg_veritas',
      title: 'ESG Veritas Completed',
      message: loanName
        ? `ESG Veritas verification completed for ${loanName}`
        : 'ESG Veritas verification completed successfully',
    });
  }

  addDocumentProcessingComplete(fileName?: string) {
    return this.addNotification({
      type: 'document_processing',
      title: 'Document Processing Completed',
      message: fileName
        ? `Document "${fileName}" has been processed successfully`
        : 'Document processing completed successfully',
    });
  }
}

export const notificationService = new NotificationService();
