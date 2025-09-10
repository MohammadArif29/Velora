// Velora Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Dashboard elements
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mainContent = document.getElementById('mainContent');
    const themeToggle = document.getElementById('themeToggle');
    const logoutBtn = document.getElementById('logoutBtn');
    const userProfile = document.getElementById('userProfile');
    const statusToggle = document.getElementById('statusToggle');
    
    // User info elements
    const userName = document.getElementById('userName');
    const userType = document.getElementById('userType');
    const userAvatar = document.getElementById('userAvatar');
    const welcomeName = document.getElementById('welcomeName');
    
    // Initialize dashboard
    init();
    
    function init() {
        loadUserData();
        setupSidebarToggle();
        setupThemeToggle();
        setupLogout();
        setupStatusToggle();
        setupNavigation();
        
        // Auto-hide sidebar on mobile
        if (window.innerWidth <= 768) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('expanded');
        }
        
        // Handle window resize
        window.addEventListener('resize', handleResize);
    }
    
    // Load user data from localStorage
    function loadUserData() {
        const userData = JSON.parse(localStorage.getItem('velora_user') || '{}');
        
        if (userData.fullName) {
            const firstName = userData.fullName.split(' ')[0];
            const initials = userData.fullName.split(' ').map(name => name[0]).join('').toUpperCase();
            
            if (userName) userName.textContent = userData.fullName;
            if (userType) userType.textContent = capitalizeFirst(userData.userType);
            if (userAvatar) userAvatar.textContent = initials;
            if (welcomeName) welcomeName.textContent = firstName;
        }
    }
    
    // Sidebar toggle functionality
    function setupSidebarToggle() {
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', toggleSidebar);
        }
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                    if (!sidebar.classList.contains('collapsed')) {
                        toggleSidebar();
                    }
                }
            }
        });
    }
    
    function toggleSidebar() {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        
        // Update toggle icon
        const icon = sidebarToggle.querySelector('i');
        if (sidebar.classList.contains('collapsed')) {
            icon.className = 'fas fa-bars';
        } else {
            icon.className = 'fas fa-times';
        }
    }
    
    // Theme toggle functionality
    function setupThemeToggle() {
        if (themeToggle) {
            themeToggle.addEventListener('click', function() {
                const html = document.documentElement;
                const currentTheme = html.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                // Add theme switching class
                document.body.classList.add('theme-switching');
                
                // Load new theme
                loadTheme(newTheme);
                
                // Remove theme switching class
                setTimeout(() => {
                    document.body.classList.remove('theme-switching');
                }, 100);
            });
        }
    }
    
    function loadTheme(theme) {
        const html = document.documentElement;
        const themeCSS = document.getElementById('theme-css');
        
        // Update HTML data attribute
        html.setAttribute('data-theme', theme);
        
        // Update theme CSS file
        const themeFileName = theme === 'dark' ? 'dark-theme.css' : 'light-theme.css';
        if (themeCSS) {
            themeCSS.href = `../css/${themeFileName}`;
        }
        
        // Save theme preference
        localStorage.setItem('theme', theme);
        
        // Update toggle icon
        updateThemeIcon(theme);
    }
    
    function updateThemeIcon(theme) {
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (theme === 'dark') {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
        }
    }
    
    // Status toggle for captains
    function setupStatusToggle() {
        if (statusToggle) {
            statusToggle.addEventListener('click', function() {
                const isOnline = this.classList.contains('online');
                
                if (isOnline) {
                    this.classList.remove('online');
                    this.classList.add('offline');
                    this.textContent = 'OFFLINE';
                    this.style.background = 'var(--text-secondary)';
                } else {
                    this.classList.remove('offline');
                    this.classList.add('online');
                    this.textContent = 'ONLINE';
                    this.style.background = 'var(--highlight-accent)';
                }
                
                // Here you would typically send the status to the server
                console.log('Status changed to:', isOnline ? 'offline' : 'online');
            });
        }
    }
    
    // Logout functionality
    function setupLogout() {
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                if (confirm('Are you sure you want to logout?')) {
                    // Clear user data
                    localStorage.removeItem('velora_user');
                    localStorage.removeItem('velora_remember');
                    
                    // Redirect to login page
                    window.location.href = '../pages/login.html';
                }
            });
        }
    }
    
    // Navigation setup
    function setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                // Don't prevent default for logout button
                if (this.id !== 'logoutBtn') {
                    e.preventDefault();
                    
                    // Remove active class from all items
                    navItems.forEach(nav => nav.classList.remove('active'));
                    
                    // Add active class to clicked item
                    this.classList.add('active');
                    
                    // Update page title
                    const title = this.querySelector('span').textContent;
                    const pageTitle = document.querySelector('.page-title');
                    if (pageTitle) {
                        pageTitle.textContent = title;
                    }
                    
                    // Here you would typically load the corresponding content
                    console.log('Navigating to:', title);
                }
            });
        });
    }
    
    // Handle window resize
    function handleResize() {
        if (window.innerWidth <= 768) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('expanded');
        } else {
            sidebar.classList.remove('collapsed');
            mainContent.classList.remove('expanded');
        }
    }
    
    // Utility functions
    function capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    // Initialize theme based on saved preference
    const savedTheme = localStorage.getItem('theme') || 'dark';
    loadTheme(savedTheme);
});

// Action functions for quick action cards
function bookRide() {
    alert('Book Ride feature - Coming Soon!\nThis will open the ride booking interface.');
}

function trackRide() {
    alert('Track Ride feature - Coming Soon!\nThis will show real-time ride tracking.');
}

function viewHistory() {
    alert('Ride History feature - Coming Soon!\nThis will display your past rides.');
}

function manageWallet() {
    alert('Wallet Management feature - Coming Soon!\nThis will open wallet interface.');
}

function viewRideRequests() {
    alert('Ride Requests feature - Coming Soon!\nThis will show incoming ride requests.');
}

function manageActiveRides() {
    alert('Active Rides feature - Coming Soon!\nThis will display your current trips.');
}

function viewEarnings() {
    alert('Earnings Report feature - Coming Soon!\nThis will show detailed earnings analytics.');
}

function updateProfile() {
    alert('Profile Update feature - Coming Soon!\nThis will open profile management interface.');
}
