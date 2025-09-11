// Velora Notification Service

class NotificationService {
    constructor() {
        this.notifications = JSON.parse(localStorage.getItem('veloraNotifications') || '[]');
        this.isEnabled = localStorage.getItem('notificationPermission') === 'granted';
        this.init();
    }

    init() {
        this.setupNotificationPermission();
        this.renderNotificationBadge();
        this.setupNotificationEvents();
    }

    setupNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            this.requestPermission();
        }
    }

    async requestPermission() {
        try {
            const permission = await Notification.requestPermission();
            this.isEnabled = permission === 'granted';
            localStorage.setItem('notificationPermission', permission);
            return permission;
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return 'denied';
        }
    }

    setupNotificationEvents() {
        // Listen for visibility change to update badge
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.renderNotificationBadge();
            } else {
                this.clearNotificationBadge();
            }
        });
    }

    addNotification(type, title, message, data = {}) {
        const notification = {
            id: Date.now(),
            type, // 'info', 'success', 'warning', 'error', 'ride_update', 'payment', 'promotion'
            title,
            message,
            data,
            timestamp: new Date().toISOString(),
            read: false
        };

        this.notifications.unshift(notification);
        
        // Keep only last 100 notifications
        if (this.notifications.length > 100) {
            this.notifications = this.notifications.slice(0, 100);
        }

        localStorage.setItem('veloraNotifications', JSON.stringify(this.notifications));
        
        // Show browser notification if enabled
        this.showBrowserNotification(notification);
        
        // Update UI
        this.renderNotificationBadge();
        this.showInAppNotification(notification);
    }

    showBrowserNotification(notification) {
        if (!this.isEnabled || document.visibilityState === 'visible') return;

        const iconMap = {
            'info': '🔔',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌',
            'ride_update': '🚗',
            'payment': '💳',
            'promotion': '🎉'
        };

        const browserNotification = new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: notification.id.toString(),
            requireInteraction: notification.type === 'ride_update' || notification.type === 'payment'
        });

        browserNotification.onclick = () => {
            window.focus();
            this.markAsRead(notification.id);
            browserNotification.close();
        };

        // Auto close after 5 seconds for non-important notifications
        if (notification.type !== 'ride_update' && notification.type !== 'payment') {
            setTimeout(() => {
                browserNotification.close();
            }, 5000);
        }
    }

    showInAppNotification(notification) {
        const notificationElement = document.createElement('div');
        notificationElement.className = `notification notification-${notification.type}`;
        notificationElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 16px 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 300px;
            cursor: pointer;
        `;
        
        const iconClass = {
            'info': 'fas fa-info-circle',
            'success': 'fas fa-check-circle',
            'warning': 'fas fa-exclamation-triangle',
            'error': 'fas fa-exclamation-circle',
            'ride_update': 'fas fa-car',
            'payment': 'fas fa-credit-card',
            'promotion': 'fas fa-gift'
        }[notification.type] || 'fas fa-bell';
        
        const iconColor = {
            'info': 'var(--secondary-accent)',
            'success': 'var(--highlight-accent)',
            'warning': '#FFA500',
            'error': 'var(--alert-warning)',
            'ride_update': 'var(--primary-base)',
            'payment': '#4CAF50',
            'promotion': '#FF6B6B'
        }[notification.type] || 'var(--text-secondary)';
        
        notificationElement.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <i class="${iconClass}" style="color: ${iconColor}; font-size: 16px; margin-top: 2px;"></i>
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: var(--text-primary); font-size: 14px; margin-bottom: 4px;">${notification.title}</div>
                    <div style="color: var(--text-secondary); font-size: 13px; line-height: 1.4;">${notification.message}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 4px; border-radius: 4px; font-size: 12px;">✕</button>
            </div>
        `;
        
        // Add click handler to mark as read
        notificationElement.addEventListener('click', () => {
            this.markAsRead(notification.id);
            notificationElement.remove();
        });
        
        document.body.appendChild(notificationElement);
        
        setTimeout(() => {
            notificationElement.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notificationElement.parentNode) {
                notificationElement.style.transform = 'translateX(400px)';
                setTimeout(() => {
                    if (notificationElement.parentNode) {
                        notificationElement.parentNode.removeChild(notificationElement);
                    }
                }, 300);
            }
        }, 5000);
    }

    renderNotificationBadge() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        
        // Update all notification badges
        document.querySelectorAll('.notification-badge').forEach(badge => {
            if (unreadCount > 0) {
                badge.textContent = unreadCount > 99 ? '99+' : unreadCount.toString();
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        });
    }

    clearNotificationBadge() {
        document.querySelectorAll('.notification-badge').forEach(badge => {
            badge.style.display = 'none';
        });
    }

    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            localStorage.setItem('veloraNotifications', JSON.stringify(this.notifications));
            this.renderNotificationBadge();
        }
    }

    markAllAsRead() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        localStorage.setItem('veloraNotifications', JSON.stringify(this.notifications));
        this.renderNotificationBadge();
    }

    getNotifications(limit = 20) {
        return this.notifications.slice(0, limit);
    }

    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }

    // Specific notification types
    notifyRideUpdate(title, message, data = {}) {
        this.addNotification('ride_update', title, message, data);
    }

    notifyPayment(title, message, data = {}) {
        this.addNotification('payment', title, message, data);
    }

    notifyPromotion(title, message, data = {}) {
        this.addNotification('promotion', title, message, data);
    }

    notifySuccess(title, message, data = {}) {
        this.addNotification('success', title, message, data);
    }

    notifyError(title, message, data = {}) {
        this.addNotification('error', title, message, data);
    }

    notifyWarning(title, message, data = {}) {
        this.addNotification('warning', title, message, data);
    }

    notifyInfo(title, message, data = {}) {
        this.addNotification('info', title, message, data);
    }
}

// Global notification service instance
window.notificationService = new NotificationService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationService;
}
