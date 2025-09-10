// Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.currentUser = null;
        this.charts = {};
        this.init();
    }

    async init() {
        try {
            // Check admin authentication
            await this.checkAuth();
            
            // Initialize dashboard
            this.initializeDashboard();
            this.setupEventListeners();
            this.loadDashboardData();
            
            console.log('✅ Admin Dashboard initialized successfully');
        } catch (error) {
            console.error('❌ Dashboard initialization error:', error);
            this.handleAuthError();
        }
    }

    async checkAuth() {
        try {
            const response = await fetch('/api/admin/verify', {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Authentication failed');
            }

            const data = await response.json();
            this.currentUser = data.admin;
            
            // Update UI with admin info
            const usernameElement = document.getElementById('adminUsername');
            if (usernameElement) {
                usernameElement.textContent = this.currentUser.username;
            }
            
        } catch (error) {
            console.error('Auth check failed:', error);
            throw error;
        }
    }

    initializeDashboard() {
        // Initialize theme
        this.initializeTheme();
        
        // Initialize navigation
        this.initializeNavigation();
        
        // Initialize charts
        this.initializeCharts();
    }

    initializeTheme() {
        // Load saved theme or default to dark
        const savedTheme = localStorage.getItem('velora-theme') || 'dark';
        this.setTheme(savedTheme);
        
        // Theme toggle functionality
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                this.setTheme(newTheme);
            });
        }
    }

    setTheme(theme) {
        const body = document.body;
        const themeToggle = document.getElementById('themeToggle');
        
        // Remove existing theme classes
        body.classList.remove('light-theme', 'dark-theme');
        
        // Add new theme class
        body.classList.add(`${theme}-theme`);
        
        // Update theme toggle icon
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
            }
        }
        
        // Save theme preference
        localStorage.setItem('velora-theme', theme);
    }

    initializeNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('.admin-section');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = link.getAttribute('href').substring(1);
                
                // Update active nav item
                navLinks.forEach(l => l.parentElement.classList.remove('active'));
                link.parentElement.classList.add('active');
                
                // Show target section
                sections.forEach(section => {
                    section.classList.remove('active');
                    if (section.id === targetId) {
                        section.classList.add('active');
                    }
                });
                
                // Load section data
                this.loadSectionData(targetId);
            });
        });
    }

    initializeCharts() {
        // Ride Trends Chart
        const rideTrendsCtx = document.getElementById('rideTrendsChart');
        if (rideTrendsCtx) {
            this.charts.rideTrends = new Chart(rideTrendsCtx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Rides',
                        data: [12, 19, 3, 5, 2, 3, 9],
                        borderColor: '#5A31F4',
                        backgroundColor: 'rgba(90, 49, 244, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // User Growth Chart
        const userGrowthCtx = document.getElementById('userGrowthChart');
        if (userGrowthCtx) {
            this.charts.userGrowth = new Chart(userGrowthCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Students', 'Drivers', 'Admins'],
                    datasets: [{
                        data: [75, 20, 5],
                        backgroundColor: ['#5A31F4', '#2CE5FF', '#20E3B2'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    }

    setupEventListeners() {
        // Logout functionality
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Chart period controls
        const chartControls = document.querySelectorAll('.chart-controls .btn');
        chartControls.forEach(btn => {
            btn.addEventListener('click', () => {
                chartControls.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updateChartData(btn.dataset.period);
            });
        });
    }

    async loadDashboardData() {
        try {
            this.showLoading(true);
            
            // Load stats
            await this.loadStats();
            
            // Load recent activity
            await this.loadRecentActivity();
            
            // Load users table
            await this.loadUsers();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showNotification('Error loading dashboard data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async loadStats() {
        try {
            // Mock data for now - replace with actual API calls
            const stats = {
                totalUsers: 1250,
                totalDrivers: 85,
                totalRides: 3420,
                totalRevenue: 125000
            };

            // Update stat cards
            document.getElementById('totalUsers').textContent = stats.totalUsers.toLocaleString();
            document.getElementById('totalDrivers').textContent = stats.totalDrivers.toLocaleString();
            document.getElementById('totalRides').textContent = stats.totalRides.toLocaleString();
            document.getElementById('totalRevenue').textContent = `₹${stats.totalRevenue.toLocaleString()}`;

        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async loadRecentActivity() {
        try {
            const activities = [
                {
                    type: 'user_registered',
                    message: 'New student registered: John Doe',
                    time: '2 minutes ago',
                    icon: 'fas fa-user-plus'
                },
                {
                    type: 'ride_completed',
                    message: 'Ride completed: MBU → Railway Station',
                    time: '5 minutes ago',
                    icon: 'fas fa-check-circle'
                },
                {
                    type: 'driver_approved',
                    message: 'Driver approved: Captain Rajesh',
                    time: '10 minutes ago',
                    icon: 'fas fa-car'
                },
                {
                    type: 'payment_received',
                    message: 'Payment received: ₹150',
                    time: '15 minutes ago',
                    icon: 'fas fa-rupee-sign'
                }
            ];

            const activityList = document.getElementById('recentActivity');
            if (activityList) {
                activityList.innerHTML = activities.map(activity => `
                    <div class="activity-item">
                        <div class="activity-icon">
                            <i class="${activity.icon}"></i>
                        </div>
                        <div class="activity-content">
                            <p>${activity.message}</p>
                            <span class="activity-time">${activity.time}</span>
                        </div>
                    </div>
                `).join('');
            }

        } catch (error) {
            console.error('Error loading recent activity:', error);
        }
    }

    async loadUsers() {
        try {
            // Mock user data - replace with actual API call
            const users = [
                {
                    id: 'STU001',
                    username: 'john_doe',
                    email: 'john@mbu.edu',
                    type: 'Student',
                    status: 'Active',
                    created: '2024-01-15'
                },
                {
                    id: 'CAP001',
                    username: 'rajesh_kumar',
                    email: 'rajesh@velora.com',
                    type: 'Captain',
                    status: 'Active',
                    created: '2024-01-10'
                }
            ];

            const tableBody = document.getElementById('usersTableBody');
            if (tableBody) {
                tableBody.innerHTML = users.map(user => `
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.username}</td>
                        <td>${user.email}</td>
                        <td>
                            <span class="badge badge-${user.type.toLowerCase()}">${user.type}</span>
                        </td>
                        <td>
                            <span class="status status-${user.status.toLowerCase()}">${user.status}</span>
                        </td>
                        <td>${user.created}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-outline" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" title="Delete">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }

        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    loadSectionData(sectionId) {
        switch (sectionId) {
            case 'users':
                this.loadUsers();
                break;
            case 'drivers':
                this.loadDrivers();
                break;
            case 'rides':
                this.loadRides();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
            case 'settings':
                this.loadSettings();
                break;
            case 'security':
                this.loadSecurity();
                break;
        }
    }

    async logout() {
        try {
            const response = await fetch('/api/admin/logout', {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                window.location.href = '/admin/login.html';
            } else {
                throw new Error('Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Force redirect even if API fails
            window.location.href = '/admin/login.html';
        }
    }

    showLoading(show) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = show ? 'flex' : 'none';
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
            <span>${message}</span>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    handleAuthError() {
        // Redirect to login if authentication fails
        window.location.href = '/admin/login.html';
    }

    updateChartData(period) {
        // Update chart data based on selected period
        console.log(`Updating chart data for period: ${period}`);
        // Implementation for updating chart data
    }

    // Additional methods for other sections
    loadDrivers() {
        console.log('Loading drivers...');
    }

    loadRides() {
        console.log('Loading rides...');
    }

    loadAnalytics() {
        console.log('Loading analytics...');
    }

    loadSettings() {
        console.log('Loading settings...');
    }

    loadSecurity() {
        console.log('Loading security...');
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard();
});
