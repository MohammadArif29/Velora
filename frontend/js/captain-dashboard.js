// Velora Captain Dashboard JavaScript

class CaptainDashboard {
    constructor() {
        this.isOnline = true;
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
        this.initializeRideManagement();
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
        
        console.log(`Captain Dashboard theme switched to: ${theme}`);
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
        window.location.href = 'captain-kyc.html';
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
    window.location.href = 'captain-requests.html';
}

function manageActiveRides() {
    console.log('Managing active rides...');
    // TODO: Implement active rides management
}

function viewEarnings() {
    console.log('Viewing earnings...');
    window.captainDashboard?.showEarningsModal();
}

function viewVehicleInfo() {
    console.log('Viewing vehicle info...');
    window.captainDashboard?.showVehicleInfoModal();
}

function updateProfile() {
    console.log('Updating profile...');
    window.captainDashboard?.showProfileModal();
}

function startKYC() {
    // This will be handled by the CaptainDashboard class
}

function viewKYCStatus() {
    // This will be handled by the CaptainDashboard class
}

    // Ride Management Functions
    async initializeRideManagement() {
        try {
            await this.checkAuth();
            await this.loadAvailableRides();
            this.startRidePolling();
        } catch (error) {
            console.error('Error initializing ride management:', error);
        }
    }

    async checkAuth() {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await fetch('/api/auth/verify', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Authentication failed');
            }

            const data = await response.json();
            this.currentUser = data.user;
        } catch (error) {
            throw error;
        }
    }

    async loadAvailableRides() {
        try {
            const response = await fetch('/api/rides/available', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
                }
            });

            const data = await response.json();

            if (data.success) {
                this.displayAvailableRides(data.rides);
            }
        } catch (error) {
            console.error('Error loading available rides:', error);
        }
    }

    displayAvailableRides(rides) {
        const ridesList = document.getElementById('ridesList');
        if (!ridesList) return;

        ridesList.innerHTML = '';

        if (rides.length === 0) {
            ridesList.innerHTML = `
                <div class="no-rides">
                    <i class="fas fa-car"></i>
                    <p>No available rides at the moment</p>
                </div>
            `;
            return;
        }

        rides.forEach(ride => {
            const rideCard = document.createElement('div');
            rideCard.className = 'ride-card';
            rideCard.innerHTML = `
                <div class="ride-card-header">
                    <div class="ride-info">
                        <h5>Ride Request</h5>
                        <span class="ride-time">${new Date(ride.requested_at).toLocaleTimeString()}</span>
                    </div>
                    <div class="ride-fare">₹${ride.fare_amount}</div>
                </div>
                <div class="ride-card-content">
                    <div class="ride-location">
                        <div class="location-item">
                            <i class="fas fa-circle pickup"></i>
                            <span>${ride.pickup_location}</span>
                        </div>
                        <div class="location-item">
                            <i class="fas fa-map-marker-alt dropoff"></i>
                            <span>${ride.dropoff_location}</span>
                        </div>
                    </div>
                    <div class="ride-details">
                        <div class="detail-item">
                            <i class="fas fa-user"></i>
                            <span>${ride.student_username}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-route"></i>
                            <span>${ride.distance_km} km</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-clock"></i>
                            <span>${ride.estimated_duration} min</span>
                        </div>
                    </div>
                    <div class="ride-actions">
                        <button class="btn btn-success btn-sm" onclick="acceptRide(${ride.id})">
                            <i class="fas fa-check"></i>
                            Accept
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="viewRideDetails(${ride.id})">
                            <i class="fas fa-eye"></i>
                            View
                        </button>
                    </div>
                </div>
            `;
            ridesList.appendChild(rideCard);
        });
    }

    async acceptRide(rideId) {
        try {
            const response = await fetch(`/api/rides/${rideId}/accept`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
                }
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification('Ride accepted successfully!', 'success');
                await this.loadAvailableRides();
                await this.loadCurrentRide(rideId);
            } else {
                this.showNotification(data.message || 'Failed to accept ride', 'error');
            }
        } catch (error) {
            console.error('Error accepting ride:', error);
            this.showNotification('Failed to accept ride', 'error');
        }
    }

    async loadCurrentRide(rideId) {
        try {
            const response = await fetch(`/api/rides/${rideId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
                }
            });

            const data = await response.json();

            if (data.success) {
                this.displayCurrentRide(data.ride);
            }
        } catch (error) {
            console.error('Error loading current ride:', error);
        }
    }

    displayCurrentRide(ride) {
        const currentRideDiv = document.getElementById('currentRide');
        const pickupAddress = document.getElementById('pickupAddress');
        const dropoffAddress = document.getElementById('dropoffAddress');
        const studentName = document.getElementById('studentName');
        const rideFare = document.getElementById('rideFare');
        const rideStatusBadge = document.getElementById('rideStatusBadge');

        if (currentRideDiv && pickupAddress && dropoffAddress && studentName && rideFare && rideStatusBadge) {
            pickupAddress.textContent = ride.pickup_location;
            dropoffAddress.textContent = ride.dropoff_location;
            studentName.textContent = ride.student_username;
            rideFare.textContent = `₹${ride.fare_amount}`;
            
            switch (ride.status) {
                case 'accepted':
                    rideStatusBadge.textContent = 'Accepted';
                    rideStatusBadge.style.background = '#10b981';
                    break;
                case 'arrived':
                    rideStatusBadge.textContent = 'Arrived';
                    rideStatusBadge.style.background = '#3b82f6';
                    break;
                case 'started':
                    rideStatusBadge.textContent = 'In Progress';
                    rideStatusBadge.style.background = '#8b5cf6';
                    break;
            }
            
            currentRideDiv.style.display = 'block';
            this.currentRide = ride;
        }
    }

    async markArrived() {
        if (!this.currentRide) return;

        try {
            const response = await fetch(`/api/rides/${this.currentRide.id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    status: 'arrived'
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification('Arrived at pickup location', 'success');
                this.updateRideActions('arrived');
            } else {
                this.showNotification(data.message || 'Failed to update status', 'error');
            }
        } catch (error) {
            console.error('Error marking arrived:', error);
            this.showNotification('Failed to update status', 'error');
        }
    }

    async startRide() {
        if (!this.currentRide) return;

        try {
            const response = await fetch(`/api/rides/${this.currentRide.id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    status: 'started'
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification('Ride started', 'success');
                this.updateRideActions('started');
            } else {
                this.showNotification(data.message || 'Failed to start ride', 'error');
            }
        } catch (error) {
            console.error('Error starting ride:', error);
            this.showNotification('Failed to start ride', 'error');
        }
    }

    async completeRide() {
        if (!this.currentRide) return;

        try {
            const response = await fetch(`/api/rides/${this.currentRide.id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    status: 'completed'
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification('Ride completed successfully!', 'success');
                this.resetCurrentRide();
            } else {
                this.showNotification(data.message || 'Failed to complete ride', 'error');
            }
        } catch (error) {
            console.error('Error completing ride:', error);
            this.showNotification('Failed to complete ride', 'error');
        }
    }

    async cancelRide() {
        if (!this.currentRide) return;

        if (!confirm('Are you sure you want to cancel this ride?')) {
            return;
        }

        try {
            const response = await fetch(`/api/rides/${this.currentRide.id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    status: 'cancelled',
                    cancellation_reason: 'Cancelled by captain'
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification('Ride cancelled', 'success');
                this.resetCurrentRide();
            } else {
                this.showNotification(data.message || 'Failed to cancel ride', 'error');
            }
        } catch (error) {
            console.error('Error cancelling ride:', error);
            this.showNotification('Failed to cancel ride', 'error');
        }
    }

    updateRideActions(status) {
        const arrivedBtn = document.getElementById('arrivedBtn');
        const startRideBtn = document.getElementById('startRideBtn');
        const completeRideBtn = document.getElementById('completeRideBtn');

        if (arrivedBtn && startRideBtn && completeRideBtn) {
            switch (status) {
                case 'accepted':
                    arrivedBtn.style.display = 'inline-flex';
                    startRideBtn.style.display = 'none';
                    completeRideBtn.style.display = 'none';
                    break;
                case 'arrived':
                    arrivedBtn.style.display = 'none';
                    startRideBtn.style.display = 'inline-flex';
                    completeRideBtn.style.display = 'none';
                    break;
                case 'started':
                    arrivedBtn.style.display = 'none';
                    startRideBtn.style.display = 'none';
                    completeRideBtn.style.display = 'inline-flex';
                    break;
            }
        }
    }

    resetCurrentRide() {
        const currentRideDiv = document.getElementById('currentRide');
        if (currentRideDiv) {
            currentRideDiv.style.display = 'none';
        }
        this.currentRide = null;
        this.loadAvailableRides();
    }

    startRidePolling() {
        setInterval(() => {
            if (this.isOnline) {
                this.loadAvailableRides();
            }
        }, 10000);
    }

    async toggleOnlineStatus() {
        try {
            this.isOnline = !this.isOnline;
            
            const response = await fetch('/api/rides/status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    isOnline: this.isOnline
                })
            });

            const data = await response.json();

            if (data.success) {
                this.updateStatusUI();
                this.showNotification(
                    this.isOnline ? 'You are now online' : 'You are now offline',
                    'success'
                );
            } else {
                this.isOnline = !this.isOnline;
                this.showNotification('Failed to update status', 'error');
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            this.isOnline = !this.isOnline;
            this.showNotification('Failed to update status', 'error');
        }
    }

    updateStatusUI() {
        const statusToggle = document.getElementById('statusToggle');
        const statusText = document.getElementById('statusText');

        if (statusToggle && statusText) {
            if (this.isOnline) {
                statusToggle.classList.add('online');
                statusText.textContent = 'Online';
            } else {
                statusToggle.classList.remove('online');
                statusText.textContent = 'Go Online';
            }
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    showProfileModal() {
        const userInfo = JSON.parse(localStorage.getItem('velora_user') || '{}');
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content profile-modal">
                <div class="modal-header">
                    <h3>Captain Profile Settings</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="captainProfileForm" class="profile-form">
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
                            <label for="licenseNumber">License Number</label>
                            <input type="text" id="licenseNumber" name="licenseNumber" value="${userInfo.licenseNumber || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="vehicleNumber">Vehicle Number</label>
                            <input type="text" id="vehicleNumber" name="vehicleNumber" value="${userInfo.vehicleNumber || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="vehicleType">Vehicle Type</label>
                            <select id="vehicleType" name="vehicleType" required>
                                <option value="auto" ${userInfo.vehicleType === 'auto' ? 'selected' : ''}>Auto Rickshaw</option>
                                <option value="car" ${userInfo.vehicleType === 'car' ? 'selected' : ''}>Car</option>
                                <option value="bike" ${userInfo.vehicleType === 'bike' ? 'selected' : ''}>Bike</option>
                            </select>
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
        document.getElementById('captainProfileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateCaptainProfile();
        });
    }

    showEarningsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content earnings-modal">
                <div class="modal-header">
                    <h3>Earnings Report</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="earnings-summary">
                        <div class="earnings-card">
                            <div class="earnings-icon">
                                <i class="fas fa-rupee-sign"></i>
                            </div>
                            <div class="earnings-content">
                                <div class="earnings-amount">₹2,450</div>
                                <div class="earnings-label">Today's Earnings</div>
                            </div>
                        </div>
                        <div class="earnings-card">
                            <div class="earnings-icon">
                                <i class="fas fa-calendar-week"></i>
                            </div>
                            <div class="earnings-content">
                                <div class="earnings-amount">₹15,200</div>
                                <div class="earnings-label">This Week</div>
                            </div>
                        </div>
                        <div class="earnings-card">
                            <div class="earnings-icon">
                                <i class="fas fa-calendar-alt"></i>
                            </div>
                            <div class="earnings-content">
                                <div class="earnings-amount">₹58,500</div>
                                <div class="earnings-label">This Month</div>
                            </div>
                        </div>
                    </div>
                    <div class="earnings-chart">
                        <h4>Earnings Trend</h4>
                        <div class="chart-placeholder">
                            <i class="fas fa-chart-line"></i>
                            <p>Earnings chart will be displayed here</p>
                        </div>
                    </div>
                    <div class="recent-transactions">
                        <h4>Recent Transactions</h4>
                        <div class="transaction-list">
                            <div class="transaction-item">
                                <div class="transaction-info">
                                    <div class="transaction-type">Ride Payment</div>
                                    <div class="transaction-time">2 hours ago</div>
                                </div>
                                <div class="transaction-amount">+₹180</div>
                            </div>
                            <div class="transaction-item">
                                <div class="transaction-info">
                                    <div class="transaction-type">Ride Payment</div>
                                    <div class="transaction-time">4 hours ago</div>
                                </div>
                                <div class="transaction-amount">+₹150</div>
                            </div>
                            <div class="transaction-item">
                                <div class="transaction-info">
                                    <div class="transaction-type">Platform Fee</div>
                                    <div class="transaction-time">Yesterday</div>
                                </div>
                                <div class="transaction-amount">-₹20</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    showVehicleInfoModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content vehicle-modal">
                <div class="modal-header">
                    <h3>Vehicle Information</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="vehicle-info">
                        <div class="vehicle-image">
                            <i class="fas fa-car"></i>
                        </div>
                        <div class="vehicle-details">
                            <h4>Vehicle Details</h4>
                            <div class="detail-item">
                                <span class="label">Vehicle Number:</span>
                                <span class="value">AP 03 AB 1234</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Vehicle Type:</span>
                                <span class="value">Auto Rickshaw</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">RC Number:</span>
                                <span class="value">RC123456789</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Insurance Expiry:</span>
                                <span class="value">15 Dec 2024</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">PUC Expiry:</span>
                                <span class="value">20 Nov 2024</span>
                            </div>
                        </div>
                    </div>
                    <div class="vehicle-actions">
                        <button class="btn btn-primary">
                            <i class="fas fa-edit"></i>
                            Update Vehicle Info
                        </button>
                        <button class="btn btn-secondary">
                            <i class="fas fa-upload"></i>
                            Upload Documents
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    async updateCaptainProfile() {
        const form = document.getElementById('captainProfileForm');
        const formData = new FormData(form);
        const profileData = Object.fromEntries(formData.entries());
        
        try {
            const token = localStorage.getItem('velora_token');
            const response = await fetch('/api/captain/profile', {
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

// Global functions for HTML onclick handlers
function toggleOnlineStatus() {
    if (window.captainDashboard) {
        window.captainDashboard.toggleOnlineStatus();
    }
}

function refreshRides() {
    if (window.captainDashboard) {
        window.captainDashboard.loadAvailableRides();
    }
}

function acceptRide(rideId) {
    if (window.captainDashboard) {
        window.captainDashboard.acceptRide(rideId);
    }
}

function viewRideDetails(rideId) {
    if (window.captainDashboard) {
        window.captainDashboard.loadCurrentRide(rideId);
    }
}

function markArrived() {
    if (window.captainDashboard) {
        window.captainDashboard.markArrived();
    }
}

function startRide() {
    if (window.captainDashboard) {
        window.captainDashboard.startRide();
    }
}

function completeRide() {
    if (window.captainDashboard) {
        window.captainDashboard.completeRide();
    }
}

function cancelRide() {
    if (window.captainDashboard) {
        window.captainDashboard.cancelRide();
    }
}

function callStudent() {
    alert('Calling student...');
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.captainDashboard = new CaptainDashboard();
});
