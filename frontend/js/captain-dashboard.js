// Velora Captain Dashboard JavaScript

class CaptainDashboard {
    constructor() {
        this.isOnline = true;
        this.currentTheme = localStorage.getItem('velora-theme') || 'dark';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeTheme();
        this.updateUserInfo();
        this.loadDashboardData();
        this.setupMobileNavigation();
        this.setupDesktopSidebar();
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

        // Status toggle
        const statusToggle = document.getElementById('statusToggle');
        if (statusToggle) {
            statusToggle.addEventListener('click', () => this.toggleStatus());
        }

        // Mobile menu
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileNavClose = document.getElementById('mobileNavClose');
        const mobileOverlay = document.getElementById('mobileOverlay');
        
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
        }
        
        if (mobileNavClose) {
            mobileNavClose.addEventListener('click', () => this.closeMobileMenu());
        }
        
        if (mobileOverlay) {
            mobileOverlay.addEventListener('click', () => this.closeMobileMenu());
        }

        // Desktop sidebar
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleDesktopSidebar());
        }

        // Logout buttons
        const logoutBtn = document.getElementById('logoutBtn');
        const logoutBtnDesktop = document.getElementById('logoutBtnDesktop');
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
        
        if (logoutBtnDesktop) {
            logoutBtnDesktop.addEventListener('click', () => this.logout());
        }

        // Go online button
        const goOnlineBtn = document.getElementById('goOnlineBtn');
        if (goOnlineBtn) {
            goOnlineBtn.addEventListener('click', () => this.goOnline());
        }

        // KYC buttons
        const startKYCBtn = document.querySelector('[onclick="startKYC()"]');
        const viewKYCStatusBtn = document.querySelector('[onclick="viewKYCStatus()"]');
        
        if (startKYCBtn) {
            startKYCBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.startKYC();
            });
        }
        
        if (viewKYCStatusBtn) {
            viewKYCStatusBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.viewKYCStatus();
            });
        }

        // Window resize handler
        window.addEventListener('resize', () => this.handleResize());
    }

    initializeTheme() {
        this.setTheme(this.currentTheme);
    }

    setTheme(theme) {
        const body = document.body;
        const themeToggleMobile = document.getElementById('themeToggleMobile');
        const themeToggle = document.getElementById('themeToggle');
        
        // Remove existing theme classes
        body.classList.remove('light-theme', 'dark-theme');
        
        // Add new theme class
        body.classList.add(`${theme}-theme`);
        
        // Update theme toggle icons
        const iconClass = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        
        if (themeToggleMobile) {
            themeToggleMobile.querySelector('i').className = iconClass;
        }
        
        if (themeToggle) {
            themeToggle.querySelector('i').className = iconClass;
        }
        
        // Save theme preference
        localStorage.setItem('velora-theme', theme);
        this.currentTheme = theme;
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    toggleStatus() {
        this.isOnline = !this.isOnline;
        const statusBtn = document.getElementById('statusToggle');
        const statusDot = statusBtn.querySelector('.status-dot');
        
        if (this.isOnline) {
            statusBtn.classList.remove('offline');
            statusBtn.classList.add('online');
            statusBtn.innerHTML = '<span class="status-dot"></span>ONLINE';
            this.showNotification('You are now online', 'success');
        } else {
            statusBtn.classList.remove('online');
            statusBtn.classList.add('offline');
            statusBtn.innerHTML = '<span class="status-dot"></span>OFFLINE';
            this.showNotification('You are now offline', 'info');
        }
    }

    setupMobileNavigation() {
        const mobileNav = document.getElementById('mobileNav');
        const mobileOverlay = document.getElementById('mobileOverlay');
        
        // Close mobile menu when clicking on nav items
        const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
        mobileNavItems.forEach(item => {
            item.addEventListener('click', (e) => {
                if (!item.id.includes('logout')) {
                    e.preventDefault();
                    this.closeMobileMenu();
                }
            });
        });
    }

    setupDesktopSidebar() {
        const desktopSidebar = document.getElementById('desktopSidebar');
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth < 768 && 
                !desktopSidebar.contains(e.target) && 
                !document.getElementById('sidebarToggle').contains(e.target)) {
                this.closeDesktopSidebar();
            }
        });
    }

    toggleMobileMenu() {
        const mobileNav = document.getElementById('mobileNav');
        const mobileOverlay = document.getElementById('mobileOverlay');
        
        mobileNav.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
        document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    }

    closeMobileMenu() {
        const mobileNav = document.getElementById('mobileNav');
        const mobileOverlay = document.getElementById('mobileOverlay');
        
        mobileNav.classList.remove('active');
        mobileOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    toggleDesktopSidebar() {
        const desktopSidebar = document.getElementById('desktopSidebar');
        desktopSidebar.classList.toggle('collapsed');
    }

    closeDesktopSidebar() {
        const desktopSidebar = document.getElementById('desktopSidebar');
        desktopSidebar.classList.add('collapsed');
    }

    handleResize() {
        const mobileNav = document.getElementById('mobileNav');
        const mobileOverlay = document.getElementById('mobileOverlay');
        
        // Close mobile menu on desktop
        if (window.innerWidth >= 768) {
            mobileNav.classList.remove('active');
            mobileOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    updateUserInfo() {
        // Get user info from localStorage or API
        const userInfo = JSON.parse(localStorage.getItem('velora_user') || '{}');
        
        if (userInfo.username) {
            const userNameElements = document.querySelectorAll('#userName, .mobile-user-info h4');
            const userAvatarElements = document.querySelectorAll('#userAvatar, .mobile-user-avatar');
            const welcomeNameElement = document.getElementById('welcomeName');
            
            userNameElements.forEach(el => el.textContent = userInfo.username);
            userAvatarElements.forEach(el => el.textContent = userInfo.username.charAt(0).toUpperCase());
            if (welcomeNameElement) {
                welcomeNameElement.textContent = userInfo.username.split(' ')[0];
            }
        }
    }

    loadDashboardData() {
        // Load stats data
        this.loadStats();
        
        // Load recent activity
        this.loadRecentActivity();
        
        // Load notifications
        this.loadNotifications();
    }

    loadStats() {
        // Mock data - replace with actual API calls
        const stats = {
            todayEarnings: 2450,
            ridesCompleted: 8,
            rating: 4.9,
            onlineTime: '7.5hrs'
        };

        // Update stat values
        const statValues = document.querySelectorAll('.stat-value');
        if (statValues[0]) statValues[0].textContent = `₹${stats.todayEarnings.toLocaleString()}`;
        if (statValues[1]) statValues[1].textContent = stats.ridesCompleted;
        if (statValues[2]) statValues[2].textContent = stats.rating;
        if (statValues[3]) statValues[3].textContent = stats.onlineTime;
    }

    loadRecentActivity() {
        // Mock activity data - replace with actual API calls
        const activities = [
            {
                type: 'completed',
                title: 'Ride Completed',
                description: 'Picked up John from MBU to Railway Station - ₹180',
                time: '30 min ago',
                icon: 'fas fa-check'
            },
            {
                type: 'started',
                title: 'Ride Started',
                description: 'En route to pick up Sarah from Hostel Block A',
                time: '1 hour ago',
                icon: 'fas fa-car'
            },
            {
                type: 'rating',
                title: 'Rating Received',
                description: 'Student rated you 5 stars with positive feedback',
                time: '2 hours ago',
                icon: 'fas fa-star'
            },
            {
                type: 'payment',
                title: 'Payment Received',
                description: '₹150 credited to your wallet',
                time: '3 hours ago',
                icon: 'fas fa-money-bill-wave'
            }
        ];

        // Update activity list
        const activityList = document.querySelector('.activity-list');
        if (activityList) {
            activityList.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <div class="activity-icon ${this.getActivityIconClass(activity.type)}">
                        <i class="${activity.icon}"></i>
                    </div>
                    <div class="activity-content">
                        <h4>${activity.title}</h4>
                        <p>${activity.description}</p>
                        <span class="activity-time">${activity.time}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    getActivityIconClass(type) {
        const iconClasses = {
            'completed': 'success',
            'started': 'primary',
            'rating': 'info',
            'payment': 'warning'
        };
        return iconClasses[type] || 'info';
    }

    loadNotifications() {
        // Mock notification count
        const notificationBadges = document.querySelectorAll('.notification-badge');
        notificationBadges.forEach(badge => {
            badge.textContent = '3';
        });
    }

    goOnline() {
        this.isOnline = true;
        this.toggleStatus();
        this.showNotification('Welcome back! You are now online and ready to accept rides.', 'success');
    }

    startKYC() {
        this.showNotification('KYC verification process will be implemented soon!', 'info');
        // TODO: Implement KYC flow
        console.log('Starting KYC process...');
    }

    viewKYCStatus() {
        this.showNotification('KYC status: Pending verification', 'warning');
        // TODO: Show KYC status modal
        console.log('Viewing KYC status...');
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            // Clear user data
            localStorage.removeItem('velora_user');
            localStorage.removeItem('velora_token');
            
            // Redirect to login
            window.location.href = 'login.html';
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
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
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
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

// Global functions for onclick handlers
function viewRideRequests() {
    console.log('Viewing ride requests...');
    // TODO: Implement ride requests view
}

function manageActiveRides() {
    console.log('Managing active rides...');
    // TODO: Implement active rides management
}

function viewEarnings() {
    console.log('Viewing earnings...');
    // TODO: Implement earnings view
}

function updateProfile() {
    console.log('Updating profile...');
    // TODO: Implement profile update
}

function startKYC() {
    // This will be handled by the CaptainDashboard class
}

function viewKYCStatus() {
    // This will be handled by the CaptainDashboard class
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CaptainDashboard();
});
