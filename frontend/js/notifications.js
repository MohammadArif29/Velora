// Velora Notifications JavaScript

class Notifications {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.currentFilter = 'all';
        this.notifications = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeTheme();
        this.loadNotifications();
        this.setupFilters();
        this.renderNotifications();
    }

    setupEventListeners() {
        // Theme toggles
        const themeToggleMobile = document.getElementById('themeToggleMobile');
        const themeToggle = document.getElementById('themeToggle');
        
        if (themeToggleMobile) {
            themeToggleMobile.addEventListener('click', () => this.toggleTheme());
        }
        
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    initializeTheme() {
        this.setTheme(this.currentTheme);
    }

    setTheme(theme) {
        const html = document.documentElement;
        const themeToggleMobile = document.getElementById('themeToggleMobile');
        const themeToggle = document.getElementById('themeToggle');
        const themeCSS = document.getElementById('theme-css');
        
        html.setAttribute('data-theme', theme);
        
        const themeFileName = theme === 'dark' ? 'dark-theme.css' : 'light-theme.css';
        if (themeCSS) {
            themeCSS.href = `../css/${themeFileName}`;
        }
        
        const iconClass = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        
        if (themeToggleMobile) {
            themeToggleMobile.querySelector('i').className = iconClass;
        }
        
        if (themeToggle) {
            themeToggle.querySelector('i').className = iconClass;
        }
        
        localStorage.setItem('theme', theme);
        this.currentTheme = theme;
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    loadNotifications() {
        // Get notifications from notification service
        if (window.notificationService) {
            this.notifications = window.notificationService.getNotifications();
        } else {
            // Fallback to localStorage
            this.notifications = JSON.parse(localStorage.getItem('veloraNotifications') || '[]');
        }
    }

    setupFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                btn.classList.add('active');
                
                this.currentFilter = btn.dataset.filter;
                this.renderNotifications();
            });
        });
    }

    getFilteredNotifications() {
        if (this.currentFilter === 'all') {
            return this.notifications;
        } else if (this.currentFilter === 'unread') {
            return this.notifications.filter(n => !n.read);
        } else {
            return this.notifications.filter(n => n.type === this.currentFilter);
        }
    }

    renderNotifications() {
        const notificationsList = document.getElementById('notificationsList');
        const emptyState = document.getElementById('emptyState');
        
        if (!notificationsList) return;

        const filteredNotifications = this.getFilteredNotifications();
        
        if (filteredNotifications.length === 0) {
            notificationsList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }
        
        notificationsList.style.display = 'block';
        emptyState.style.display = 'none';
        
        notificationsList.innerHTML = filteredNotifications.map(notification => 
            this.createNotificationItem(notification)
        ).join('');
    }

    createNotificationItem(notification) {
        const timeAgo = this.getTimeAgo(notification.timestamp);
        const iconClass = this.getNotificationIconClass(notification.type);
        const unreadClass = notification.read ? '' : 'unread';
        
        return `
            <div class="notification-item ${unreadClass}" onclick="showNotificationDetails(${notification.id})">
                <div class="notification-header">
                    <div class="notification-icon ${notification.type}">
                        <i class="${iconClass}"></i>
                    </div>
                    <div class="notification-content">
                        <div class="notification-title">${notification.title}</div>
                        <div class="notification-message">${notification.message}</div>
                        <div class="notification-meta">
                            <span class="notification-time">${timeAgo}</span>
                            <span class="notification-type">${notification.type.replace('_', ' ')}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getNotificationIconClass(type) {
        const iconMap = {
            'info': 'fas fa-info-circle',
            'success': 'fas fa-check-circle',
            'warning': 'fas fa-exclamation-triangle',
            'error': 'fas fa-exclamation-circle',
            'ride_update': 'fas fa-car',
            'payment': 'fas fa-credit-card',
            'promotion': 'fas fa-gift'
        };
        return iconMap[type] || 'fas fa-bell';
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const notificationTime = new Date(timestamp);
        const diffInSeconds = Math.floor((now - notificationTime) / 1000);
        
        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes}m ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours}h ago`;
        } else if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days}d ago`;
        } else {
            return notificationTime.toLocaleDateString();
        }
    }

    showNotificationDetails(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (!notification) return;

        // Mark as read
        this.markAsRead(notificationId);

        // Show modal
        const modal = document.getElementById('notificationModal');
        const modalTitle = document.getElementById('modalTitle');
        const notificationDetails = document.getElementById('notificationDetails');
        
        if (modalTitle) {
            modalTitle.textContent = notification.title;
        }
        
        if (notificationDetails) {
            notificationDetails.innerHTML = `
                <div class="detail-section">
                    <div class="detail-label">Message</div>
                    <div class="detail-value">${notification.message}</div>
                </div>
                
                <div class="detail-section">
                    <div class="detail-label">Type</div>
                    <div class="detail-value">${notification.type.replace('_', ' ').toUpperCase()}</div>
                </div>
                
                <div class="detail-section">
                    <div class="detail-label">Time</div>
                    <div class="detail-value">${new Date(notification.timestamp).toLocaleString()}</div>
                </div>
                
                ${notification.data && Object.keys(notification.data).length > 0 ? `
                    <div class="detail-section">
                        <div class="detail-label">Additional Data</div>
                        <div class="detail-value">${JSON.stringify(notification.data, null, 2)}</div>
                    </div>
                ` : ''}
            `;
        }
        
        if (modal) {
            modal.classList.add('active');
        }
    }

    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            localStorage.setItem('veloraNotifications', JSON.stringify(this.notifications));
            
            // Update notification service if available
            if (window.notificationService) {
                window.notificationService.markAsRead(notificationId);
            }
            
            // Re-render notifications
            this.renderNotifications();
        }
    }

    markAllAsRead() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        
        localStorage.setItem('veloraNotifications', JSON.stringify(this.notifications));
        
        // Update notification service if available
        if (window.notificationService) {
            window.notificationService.markAllAsRead();
        }
        
        // Re-render notifications
        this.renderNotifications();
        
        this.showNotification('All notifications marked as read', 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
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
        `;
        
        const iconClass = {
            'success': 'fas fa-check-circle',
            'error': 'fas fa-exclamation-circle',
            'warning': 'fas fa-exclamation-triangle',
            'info': 'fas fa-info-circle'
        }[type] || 'fas fa-info-circle';
        
        const iconColor = {
            'success': 'var(--highlight-accent)',
            'error': 'var(--alert-warning)',
            'warning': '#FFA500',
            'info': 'var(--secondary-accent)'
        }[type] || 'var(--secondary-accent)';
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <i class="${iconClass}" style="color: ${iconColor}; font-size: 16px;"></i>
                <span style="color: var(--text-primary); font-size: 14px;">${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Global functions
function goBack() {
    window.history.back();
}

function showNotificationDetails(notificationId) {
    window.notificationsInstance?.showNotificationDetails(notificationId);
}

function closeNotificationModal() {
    document.getElementById('notificationModal').classList.remove('active');
}

function markAllAsRead() {
    window.notificationsInstance?.markAllAsRead();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.notificationsInstance = new Notifications();
});
