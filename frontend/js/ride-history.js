// Velora Ride History JavaScript

class RideHistory {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.currentView = 'list';
        this.currentFilters = {
            dateRange: 'all',
            rideType: 'all',
            rideStatus: 'all'
        };
        this.rides = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeTheme();
        this.loadRideHistory();
        this.setupFilters();
        this.setupViewToggle();
        this.renderRides();
        this.renderCharts();
        this.updateStats();
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

    loadRideHistory() {
        // Load from localStorage or create mock data
        this.rides = JSON.parse(localStorage.getItem('veloraRideHistory') || '[]');
        
        if (this.rides.length === 0) {
            this.rides = this.getMockRideHistory();
            localStorage.setItem('veloraRideHistory', JSON.stringify(this.rides));
        }
    }

    getMockRideHistory() {
        return [
            {
                id: 'VR123456',
                date: '2024-01-15T10:30:00Z',
                pickup: 'MBU Campus - Main Gate',
                destination: 'Tirupati Railway Station',
                distance: '8.5 km',
                duration: '12 min',
                fare: 118,
                rideType: 'solo',
                status: 'completed',
                captain: 'Rajesh Kumar',
                rating: 4.8,
                waitTime: 3
            },
            {
                id: 'VR123457',
                date: '2024-01-14T16:45:00Z',
                pickup: 'MBU Campus - Hostel Block A',
                destination: 'SV Shopping Mall',
                distance: '6.8 km',
                duration: '10 min',
                fare: 95,
                rideType: 'shared',
                status: 'completed',
                captain: 'Suresh Reddy',
                rating: 4.6,
                waitTime: 5
            },
            {
                id: 'VR123458',
                date: '2024-01-13T09:15:00Z',
                pickup: 'MBU Campus - Library',
                destination: 'Tirupati Bus Stand',
                distance: '7.2 km',
                duration: '11 min',
                fare: 102,
                rideType: 'solo',
                status: 'completed',
                captain: 'Kumar Naidu',
                rating: 4.9,
                waitTime: 2
            },
            {
                id: 'VR123459',
                date: '2024-01-12T14:20:00Z',
                pickup: 'MBU Campus - Canteen',
                destination: 'Cinepolis Mall',
                distance: '7.5 km',
                duration: '11 min',
                fare: 105,
                rideType: 'solo',
                status: 'cancelled',
                captain: 'Ravi Kumar',
                rating: null,
                waitTime: 8
            },
            {
                id: 'VR123460',
                date: '2024-01-11T11:30:00Z',
                pickup: 'MBU Campus - Main Gate',
                destination: 'Tirupati Airport',
                distance: '12.3 km',
                duration: '18 min',
                fare: 185,
                rideType: 'solo',
                status: 'completed',
                captain: 'Prakash Singh',
                rating: 4.7,
                waitTime: 4
            },
            {
                id: 'VR123461',
                date: '2024-01-10T08:00:00Z',
                pickup: 'MBU Campus - Hostel Block B',
                destination: 'Tirupati Railway Station',
                distance: '8.2 km',
                duration: '12 min',
                fare: 115,
                rideType: 'shared',
                status: 'completed',
                captain: 'Amit Sharma',
                rating: 4.5,
                waitTime: 6
            }
        ];
    }

    setupFilters() {
        const filterInputs = document.querySelectorAll('#filtersSection select');
        filterInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.currentFilters[input.id] = input.value;
            });
        });
    }

    setupViewToggle() {
        const toggleBtns = document.querySelectorAll('.toggle-btn');
        toggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                toggleBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                btn.classList.add('active');
                
                this.currentView = btn.dataset.view;
                this.renderRides();
            });
        });
    }

    getFilteredRides() {
        let filteredRides = [...this.rides];
        
        // Apply date range filter
        if (this.currentFilters.dateRange !== 'all') {
            const now = new Date();
            const filterDate = new Date();
            
            switch (this.currentFilters.dateRange) {
                case 'week':
                    filterDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    filterDate.setMonth(now.getMonth() - 1);
                    break;
                case 'quarter':
                    filterDate.setMonth(now.getMonth() - 3);
                    break;
            }
            
            filteredRides = filteredRides.filter(ride => 
                new Date(ride.date) >= filterDate
            );
        }
        
        // Apply ride type filter
        if (this.currentFilters.rideType !== 'all') {
            filteredRides = filteredRides.filter(ride => 
                ride.rideType === this.currentFilters.rideType
            );
        }
        
        // Apply status filter
        if (this.currentFilters.rideStatus !== 'all') {
            filteredRides = filteredRides.filter(ride => 
                ride.status === this.currentFilters.rideStatus
            );
        }
        
        return filteredRides.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    renderRides() {
        const ridesList = document.getElementById('ridesList');
        if (!ridesList) return;

        const filteredRides = this.getFilteredRides();
        
        ridesList.className = `rides-list ${this.currentView === 'grid' ? 'grid-view' : ''}`;
        ridesList.innerHTML = filteredRides.map(ride => 
            this.createRideItem(ride)
        ).join('');
    }

    createRideItem(ride) {
        const rideDate = new Date(ride.date);
        const formattedDate = rideDate.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        const formattedTime = rideDate.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="ride-item" onclick="showRideDetails('${ride.id}')">
                <div class="ride-header">
                    <div class="ride-id">#${ride.id}</div>
                    <div class="ride-date">${formattedDate} at ${formattedTime}</div>
                </div>
                
                <div class="ride-route">
                    <div class="route-point">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${ride.pickup}</span>
                    </div>
                    <div class="route-line"></div>
                    <div class="route-point">
                        <i class="fas fa-flag"></i>
                        <span>${ride.destination}</span>
                    </div>
                </div>
                
                <div class="ride-details">
                    <div class="ride-detail-item">
                        <div class="ride-detail-label">Distance</div>
                        <div class="ride-detail-value">${ride.distance}</div>
                    </div>
                    <div class="ride-detail-item">
                        <div class="ride-detail-label">Duration</div>
                        <div class="ride-detail-value">${ride.duration}</div>
                    </div>
                    <div class="ride-detail-item">
                        <div class="ride-detail-label">Fare</div>
                        <div class="ride-detail-value">₹${ride.fare}</div>
                    </div>
                </div>
                
                <div class="ride-footer">
                    <div class="ride-status ${ride.status}">${ride.status}</div>
                    ${ride.rating ? `
                        <div class="ride-rating">
                            <i class="fas fa-star"></i>
                            <span>${ride.rating}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    updateStats() {
        const completedRides = this.rides.filter(ride => ride.status === 'completed');
        const totalRides = completedRides.length;
        const totalSpent = completedRides.reduce((sum, ride) => sum + ride.fare, 0);
        const avgRating = completedRides.reduce((sum, ride) => sum + (ride.rating || 0), 0) / completedRides.length;
        const avgWaitTime = completedRides.reduce((sum, ride) => sum + ride.waitTime, 0) / completedRides.length;
        
        document.getElementById('totalRides').textContent = totalRides;
        document.getElementById('totalSpent').textContent = `₹${totalSpent.toLocaleString()}`;
        document.getElementById('avgRating').textContent = avgRating.toFixed(1);
        document.getElementById('avgWaitTime').textContent = `${avgWaitTime.toFixed(1)} min`;
    }

    renderCharts() {
        this.renderRidesChart();
        this.renderSpendingChart();
    }

    renderRidesChart() {
        const ctx = document.getElementById('ridesChart');
        if (!ctx) return;

        const completedRides = this.rides.filter(ride => ride.status === 'completed');
        const ridesByDay = this.getRidesByDay(completedRides);
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ridesByDay.labels,
                datasets: [{
                    label: 'Rides',
                    data: ridesByDay.data,
                    borderColor: 'var(--primary-base)',
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
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    renderSpendingChart() {
        const ctx = document.getElementById('spendingChart');
        if (!ctx) return;

        const completedRides = this.rides.filter(ride => ride.status === 'completed');
        const spendingByDay = this.getSpendingByDay(completedRides);
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: spendingByDay.labels,
                datasets: [{
                    label: 'Spending (₹)',
                    data: spendingByDay.data,
                    backgroundColor: 'var(--highlight-accent)',
                    borderColor: 'var(--highlight-accent)',
                    borderWidth: 1
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

    getRidesByDay(rides) {
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last7Days.push(date.toISOString().split('T')[0]);
        }
        
        const ridesByDay = last7Days.map(date => {
            return rides.filter(ride => 
                ride.date.startsWith(date)
            ).length;
        });
        
        return {
            labels: last7Days.map(date => 
                new Date(date).toLocaleDateString('en-IN', { weekday: 'short' })
            ),
            data: ridesByDay
        };
    }

    getSpendingByDay(rides) {
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last7Days.push(date.toISOString().split('T')[0]);
        }
        
        const spendingByDay = last7Days.map(date => {
            return rides
                .filter(ride => ride.date.startsWith(date))
                .reduce((sum, ride) => sum + ride.fare, 0);
        });
        
        return {
            labels: last7Days.map(date => 
                new Date(date).toLocaleDateString('en-IN', { weekday: 'short' })
            ),
            data: spendingByDay
        };
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

function showFilters() {
    const filtersSection = document.getElementById('filtersSection');
    if (filtersSection) {
        filtersSection.style.display = filtersSection.style.display === 'none' ? 'block' : 'none';
    }
}

function clearFilters() {
    document.getElementById('dateRange').value = 'all';
    document.getElementById('rideType').value = 'all';
    document.getElementById('rideStatus').value = 'all';
    
    window.rideHistoryInstance.currentFilters = {
        dateRange: 'all',
        rideType: 'all',
        rideStatus: 'all'
    };
    
    window.rideHistoryInstance.renderRides();
}

function applyFilters() {
    window.rideHistoryInstance.renderRides();
    document.getElementById('filtersSection').style.display = 'none';
    window.rideHistoryInstance.showNotification('Filters applied successfully', 'success');
}

function showRideDetails(rideId) {
    const ride = window.rideHistoryInstance.rides.find(r => r.id === rideId);
    if (!ride) return;

    const modal = document.getElementById('rideDetailsModal');
    const rideDetails = document.getElementById('rideDetails');
    
    if (rideDetails) {
        const rideDate = new Date(ride.date);
        rideDetails.innerHTML = `
            <div class="detail-section">
                <div class="detail-label">Ride ID</div>
                <div class="detail-value">#${ride.id}</div>
            </div>
            
            <div class="detail-section">
                <div class="detail-label">Date & Time</div>
                <div class="detail-value">${rideDate.toLocaleString()}</div>
            </div>
            
            <div class="detail-section">
                <div class="detail-label">Route</div>
                <div class="detail-value">${ride.pickup} → ${ride.destination}</div>
            </div>
            
            <div class="detail-section">
                <div class="detail-label">Captain</div>
                <div class="detail-value">${ride.captain}</div>
            </div>
            
            <div class="detail-section">
                <div class="detail-label">Distance</div>
                <div class="detail-value">${ride.distance}</div>
            </div>
            
            <div class="detail-section">
                <div class="detail-label">Duration</div>
                <div class="detail-value">${ride.duration}</div>
            </div>
            
            <div class="detail-section">
                <div class="detail-label">Fare</div>
                <div class="detail-value">₹${ride.fare}</div>
            </div>
            
            <div class="detail-section">
                <div class="detail-label">Ride Type</div>
                <div class="detail-value">${ride.rideType.charAt(0).toUpperCase() + ride.rideType.slice(1)}</div>
            </div>
            
            <div class="detail-section">
                <div class="detail-label">Status</div>
                <div class="detail-value">${ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}</div>
            </div>
            
            ${ride.rating ? `
                <div class="detail-section">
                    <div class="detail-label">Rating</div>
                    <div class="detail-value">${ride.rating}/5 ⭐</div>
                </div>
            ` : ''}
            
            <div class="detail-section">
                <div class="detail-label">Wait Time</div>
                <div class="detail-value">${ride.waitTime} minutes</div>
            </div>
        `;
    }
    
    if (modal) {
        modal.classList.add('active');
    }
}

function closeRideDetailsModal() {
    document.getElementById('rideDetailsModal').classList.remove('active');
}

function loadMoreRides() {
    window.rideHistoryInstance.showNotification('Loading more rides...', 'info');
    // In a real app, this would load more rides from the server
    setTimeout(() => {
        window.rideHistoryInstance.showNotification('No more rides to load', 'info');
    }, 1000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.rideHistoryInstance = new RideHistory();
});
