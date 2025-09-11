// Velora Student Dashboard JavaScript

class StudentDashboard {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'dark';
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

        // Window resize handler
        window.addEventListener('resize', () => this.handleResize());
    }

    initializeTheme() {
        this.setTheme(this.currentTheme);
    }

    setTheme(theme) {
        const html = document.documentElement;
        const themeToggleMobile = document.getElementById('themeToggleMobile');
        const themeToggle = document.getElementById('themeToggle');
        const themeCSS = document.getElementById('theme-css');
        
        // Update HTML data attribute
        html.setAttribute('data-theme', theme);
        
        // Update theme CSS file
        const themeFileName = theme === 'dark' ? 'dark-theme.css' : 'light-theme.css';
        if (themeCSS) {
            themeCSS.href = `../css/${themeFileName}`;
        }
        
        // Update theme toggle icons
        const iconClass = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        
        if (themeToggleMobile) {
            themeToggleMobile.querySelector('i').className = iconClass;
        }
        
        if (themeToggle) {
            themeToggle.querySelector('i').className = iconClass;
        }
        
        // Save theme preference
        localStorage.setItem('theme', theme);
        this.currentTheme = theme;
        
        console.log(`Student Dashboard theme switched to: ${theme}`);
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
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
        
        if (userInfo.username || userInfo.fullName) {
            const userName = userInfo.fullName || userInfo.username;
            const firstName = userName.split(' ')[0];
            const initials = userName.split(' ').map(name => name[0]).join('').toUpperCase();
            
            const userNameElements = document.querySelectorAll('#userName, .mobile-user-info h4');
            const userAvatarElements = document.querySelectorAll('#userAvatar, .mobile-user-avatar');
            const welcomeNameElement = document.getElementById('welcomeName');
            
            userNameElements.forEach(el => el.textContent = userName);
            userAvatarElements.forEach(el => el.textContent = initials);
            if (welcomeNameElement) {
                welcomeNameElement.textContent = firstName;
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
            totalRides: 12,
            moneySaved: 450,
            rating: 4.8,
            timeSaved: '45min'
        };

        // Update stat values
        const statValues = document.querySelectorAll('.stat-value');
        if (statValues[0]) statValues[0].textContent = stats.totalRides;
        if (statValues[1]) statValues[1].textContent = `₹${stats.moneySaved}`;
        if (statValues[2]) statValues[2].textContent = stats.rating;
        if (statValues[3]) statValues[3].textContent = stats.timeSaved;
    }

    loadRecentActivity() {
        // Mock activity data - replace with actual API calls
        const activities = [
            {
                type: 'completed',
                title: 'Ride Completed',
                description: 'MBU Campus to Tirupati Railway Station - ₹180',
                time: '2 hours ago',
                icon: 'fas fa-check'
            },
            {
                type: 'recharged',
                title: 'Wallet Recharged',
                description: 'Added ₹500 to your wallet',
                time: 'Yesterday',
                icon: 'fas fa-plus'
            },
            {
                type: 'rating',
                title: 'Rating Received',
                description: 'Captain rated you 5 stars',
                time: '2 days ago',
                icon: 'fas fa-star'
            },
            {
                type: 'scheduled',
                title: 'Ride Scheduled',
                description: 'Tomorrow 9:00 AM to Airport',
                time: '3 days ago',
                icon: 'fas fa-calendar'
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
            'recharged': 'primary',
            'rating': 'info',
            'scheduled': 'warning'
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

    showProfileModal() {
        const userInfo = JSON.parse(localStorage.getItem('velora_user') || '{}');
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content profile-modal">
                <div class="modal-header">
                    <h3>Profile Settings</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="profileForm" class="profile-form">
                        <div class="form-group">
                            <label for="fullName">Full Name</label>
                            <input type="text" id="fullName" name="fullName" value="${userInfo.fullName || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" name="email" value="${userInfo.email || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="mobile">Mobile Number</label>
                            <input type="tel" id="mobile" name="mobile" value="${userInfo.mobile || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="studentId">Student ID</label>
                            <input type="text" id="studentId" name="studentId" value="${userInfo.studentId || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="emergencyContact">Emergency Contact</label>
                            <input type="tel" id="emergencyContact" name="emergencyContact" value="${userInfo.emergencyContact || ''}">
                        </div>
                        <div class="form-group">
                            <label for="address">Address</label>
                            <textarea id="address" name="address" rows="3">${userInfo.address || ''}</textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle form submission
        document.getElementById('profileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateProfile();
        });
    }

    showRatingsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content ratings-modal">
                <div class="modal-header">
                    <h3>Your Ratings & Reviews</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="ratings-summary">
                        <div class="overall-rating">
                            <div class="rating-number">4.8</div>
                            <div class="rating-stars">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                            </div>
                            <div class="rating-count">Based on 24 reviews</div>
                        </div>
                    </div>
                    <div class="reviews-list">
                        <div class="review-item">
                            <div class="review-header">
                                <div class="reviewer-info">
                                    <div class="reviewer-avatar">RC</div>
                                    <div class="reviewer-details">
                                        <h4>Ravi Captain</h4>
                                        <div class="review-rating">
                                            <i class="fas fa-star"></i>
                                            <i class="fas fa-star"></i>
                                            <i class="fas fa-star"></i>
                                            <i class="fas fa-star"></i>
                                            <i class="fas fa-star"></i>
                                        </div>
                                    </div>
                                </div>
                                <div class="review-date">2 days ago</div>
                            </div>
                            <div class="review-text">
                                "Excellent passenger! Very polite and punctual. Would definitely recommend."
                            </div>
                        </div>
                        <div class="review-item">
                            <div class="review-header">
                                <div class="reviewer-info">
                                    <div class="reviewer-avatar">SK</div>
                                    <div class="reviewer-details">
                                        <h4>Suresh Kumar</h4>
                                        <div class="review-rating">
                                            <i class="fas fa-star"></i>
                                            <i class="fas fa-star"></i>
                                            <i class="fas fa-star"></i>
                                            <i class="fas fa-star"></i>
                                            <i class="far fa-star"></i>
                                        </div>
                                    </div>
                                </div>
                                <div class="review-date">1 week ago</div>
                            </div>
                            <div class="review-text">
                                "Good passenger, no issues during the ride."
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    showHelpModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content help-modal">
                <div class="modal-header">
                    <h3>Help Center</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="help-sections">
                        <div class="help-section">
                            <h4><i class="fas fa-question-circle"></i> Frequently Asked Questions</h4>
                            <div class="faq-list">
                                <div class="faq-item">
                                    <div class="faq-question">How do I book a ride?</div>
                                    <div class="faq-answer">Click on "Book Ride" and select your pickup and destination locations.</div>
                                </div>
                                <div class="faq-item">
                                    <div class="faq-question">How do I pay for rides?</div>
                                    <div class="faq-answer">You can pay using your wallet, UPI, or cash on delivery.</div>
                                </div>
                                <div class="faq-item">
                                    <div class="faq-question">What if my ride is cancelled?</div>
                                    <div class="faq-answer">You'll be notified and can book another ride immediately.</div>
                                </div>
                            </div>
                        </div>
                        <div class="help-section">
                            <h4><i class="fas fa-phone"></i> Contact Support</h4>
                            <div class="contact-info">
                                <div class="contact-item">
                                    <i class="fas fa-phone"></i>
                                    <span>+91 9876543210</span>
                                </div>
                                <div class="contact-item">
                                    <i class="fas fa-envelope"></i>
                                    <span>support@velora.com</span>
                                </div>
                                <div class="contact-item">
                                    <i class="fas fa-clock"></i>
                                    <span>24/7 Support Available</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    async updateProfile() {
        const form = document.getElementById('profileForm');
        const formData = new FormData(form);
        const profileData = Object.fromEntries(formData.entries());
        
        try {
            const token = localStorage.getItem('velora_token');
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Profile updated successfully!', 'success');
                // Update localStorage
                const userInfo = JSON.parse(localStorage.getItem('velora_user') || '{}');
                Object.assign(userInfo, profileData);
                localStorage.setItem('velora_user', JSON.stringify(userInfo));
                this.updateUserInfo();
                // Close modal
                document.querySelector('.modal-overlay').remove();
            } else {
                this.showNotification(data.message || 'Failed to update profile', 'error');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            this.showNotification('Failed to update profile', 'error');
        }
    }
}

// Global functions for onclick handlers
function bookRide() {
    console.log('Booking new ride...');
    window.location.href = 'ride-booking.html';
}

function trackRide() {
    console.log('Tracking current ride...');
    // Check if user has an active ride
    const activeRideId = localStorage.getItem('activeRideId');
    if (activeRideId) {
        window.location.href = `ride-tracking.html?rideId=${activeRideId}`;
    } else {
        window.studentDashboard?.showNotification('No active ride found. Book a ride first!', 'info');
    }
}

function viewHistory() {
    console.log('Viewing ride history...');
    window.location.href = 'ride-history.html';
}

function manageWallet() {
    console.log('Managing wallet...');
    window.location.href = 'wallet.html';
}

function viewNotifications() {
    console.log('Viewing notifications...');
    window.location.href = 'notifications.html';
}

function viewProfile() {
    console.log('Viewing profile...');
    window.studentDashboard?.showProfileModal();
}

function viewRatings() {
    console.log('Viewing ratings...');
    window.studentDashboard?.showRatingsModal();
}

function viewHelpCenter() {
    console.log('Viewing help center...');
    window.studentDashboard?.showHelpModal();
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.studentDashboard = new StudentDashboard();
});
