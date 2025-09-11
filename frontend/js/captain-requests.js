// Velora Captain Requests JavaScript

class CaptainRequests {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.isOnline = true;
        this.currentFilter = 'all';
        this.requests = [];
        this.selectedRequest = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeTheme();
        this.loadMockRequests();
        this.setupAvailabilityToggle();
        this.setupFilters();
        this.startRealTimeUpdates();
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

    setupAvailabilityToggle() {
        const toggle = document.getElementById('availabilityToggle');
        const statusText = document.getElementById('statusText');
        
        if (toggle) {
            toggle.addEventListener('change', (e) => {
                this.isOnline = e.target.checked;
                this.updateAvailabilityStatus();
            });
        }
    }

    updateAvailabilityStatus() {
        const statusText = document.getElementById('statusText');
        if (statusText) {
            statusText.textContent = this.isOnline ? 'Online' : 'Offline';
        }
        
        if (this.isOnline) {
            this.showNotification('You are now online and will receive ride requests', 'success');
        } else {
            this.showNotification('You are now offline and will not receive new requests', 'warning');
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
                this.filterRequests();
            });
        });
    }

    loadMockRequests() {
        this.requests = [
            {
                id: 1,
                studentName: 'Priya Sharma',
                studentId: '22102A041057',
                pickup: 'MBU Campus - Main Gate',
                destination: 'Tirupati Railway Station',
                distance: '8.5 km',
                duration: '12 min',
                fare: '₹118',
                rideType: 'solo',
                requestTime: '2 min ago',
                specialInstructions: 'Please call when you arrive',
                studentPhone: '+91 9876543210',
                studentRating: 4.8
            },
            {
                id: 2,
                studentName: 'Rahul Kumar',
                studentId: '22102A041058',
                pickup: 'MBU Campus - Hostel Block A',
                destination: 'SV Shopping Mall',
                distance: '6.8 km',
                duration: '10 min',
                fare: '₹95',
                rideType: 'shared',
                requestTime: '5 min ago',
                specialInstructions: 'I have luggage',
                studentPhone: '+91 9876543211',
                studentRating: 4.6
            },
            {
                id: 3,
                studentName: 'Sneha Reddy',
                studentId: '22102A041059',
                pickup: 'MBU Campus - Library',
                destination: 'Tirupati Bus Stand',
                distance: '7.2 km',
                duration: '11 min',
                fare: '₹102',
                rideType: 'solo',
                requestTime: '8 min ago',
                specialInstructions: 'Urgent - need to catch bus',
                studentPhone: '+91 9876543212',
                studentRating: 4.9
            }
        ];
        
        this.renderRequests();
    }

    filterRequests() {
        let filteredRequests = this.requests;
        
        switch (this.currentFilter) {
            case 'nearby':
                filteredRequests = this.requests.filter(req => 
                    parseFloat(req.distance) <= 5.0
                );
                break;
            case 'solo':
                filteredRequests = this.requests.filter(req => req.rideType === 'solo');
                break;
            case 'shared':
                filteredRequests = this.requests.filter(req => req.rideType === 'shared');
                break;
            default:
                filteredRequests = this.requests;
        }
        
        this.renderRequests(filteredRequests);
    }

    renderRequests(requests = this.requests) {
        const requestsList = document.getElementById('requestsList');
        const emptyState = document.getElementById('emptyState');
        const requestsCount = document.getElementById('requestsCount');
        
        if (!requestsList) return;
        
        if (requests.length === 0) {
            requestsList.style.display = 'none';
            emptyState.style.display = 'block';
            requestsCount.textContent = '0 requests';
            return;
        }
        
        requestsList.style.display = 'block';
        emptyState.style.display = 'none';
        requestsCount.textContent = `${requests.length} request${requests.length !== 1 ? 's' : ''}`;
        
        requestsList.innerHTML = requests.map(request => this.createRequestCard(request)).join('');
    }

    createRequestCard(request) {
        const rideTypeText = request.rideType === 'solo' ? 'Solo' : 'Shared';
        const rideTypeClass = request.rideType === 'solo' ? 'solo' : 'shared';
        
        return `
            <div class="request-card" onclick="showRequestDetails(${request.id})">
                <div class="request-header">
                    <div class="request-info">
                        <h4>${request.studentName}</h4>
                        <p>${request.studentId} • ${request.requestTime}</p>
                    </div>
                    <div class="request-badge ${rideTypeClass}">${rideTypeText}</div>
                </div>
                
                <div class="request-route">
                    <div class="route-point">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${request.pickup}</span>
                    </div>
                    <div class="route-line"></div>
                    <div class="route-point">
                        <i class="fas fa-flag"></i>
                        <span>${request.destination}</span>
                    </div>
                </div>
                
                <div class="request-details">
                    <div class="detail-item">
                        <div class="detail-label">Distance</div>
                        <div class="detail-value">${request.distance}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Duration</div>
                        <div class="detail-value">${request.duration}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Fare</div>
                        <div class="detail-value">${request.fare}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Student Rating</div>
                        <div class="detail-value">
                            <i class="fas fa-star" style="color: #FFA500; font-size: 12px;"></i>
                            ${request.studentRating}
                        </div>
                    </div>
                </div>
                
                <div class="request-actions">
                    <button class="btn btn-outline" onclick="event.stopPropagation(); rejectRequest(${request.id})">
                        <i class="fas fa-times"></i>
                        Reject
                    </button>
                    <button class="btn btn-primary" onclick="event.stopPropagation(); acceptRequest(${request.id})">
                        <i class="fas fa-check"></i>
                        Accept
                    </button>
                </div>
            </div>
        `;
    }

    showRequestDetails(requestId) {
        const request = this.requests.find(r => r.id === requestId);
        if (!request) return;
        
        this.selectedRequest = request;
        
        const modal = document.getElementById('requestModal');
        const details = document.getElementById('requestDetails');
        
        if (details) {
            details.innerHTML = `
                <div class="student-info">
                    <h4>${request.studentName}</h4>
                    <p>Student ID: ${request.studentId}</p>
                    <p>Phone: ${request.studentPhone}</p>
                    <div class="student-rating">
                        <i class="fas fa-star" style="color: #FFA500;"></i>
                        <span>${request.studentRating} (${request.rideType === 'solo' ? 'Solo' : 'Shared'} Ride)</span>
                    </div>
                </div>
                
                <div class="route-info">
                    <h5>Route Details</h5>
                    <div class="route-details">
                        <div class="route-point">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${request.pickup}</span>
                        </div>
                        <div class="route-line"></div>
                        <div class="route-point">
                            <i class="fas fa-flag"></i>
                            <span>${request.destination}</span>
                        </div>
                    </div>
                </div>
                
                <div class="ride-info">
                    <h5>Ride Information</h5>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="label">Distance:</span>
                            <span class="value">${request.distance}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Duration:</span>
                            <span class="value">${request.duration}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Fare:</span>
                            <span class="value">${request.fare}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Request Time:</span>
                            <span class="value">${request.requestTime}</span>
                        </div>
                    </div>
                </div>
                
                ${request.specialInstructions ? `
                    <div class="special-instructions">
                        <h5>Special Instructions</h5>
                        <p>${request.specialInstructions}</p>
                    </div>
                ` : ''}
            `;
        }
        
        if (modal) {
            modal.classList.add('active');
        }
    }

    startRealTimeUpdates() {
        // Simulate new requests coming in
        setInterval(() => {
            if (this.isOnline && Math.random() > 0.7) {
                this.addNewRequest();
            }
        }, 15000); // Check every 15 seconds
    }

    addNewRequest() {
        const newRequest = {
            id: Date.now(),
            studentName: 'New Student',
            studentId: '22102A041060',
            pickup: 'MBU Campus - Canteen',
            destination: 'Cinepolis Mall',
            distance: '7.5 km',
            duration: '11 min',
            fare: '₹105',
            rideType: Math.random() > 0.5 ? 'solo' : 'shared',
            requestTime: 'Just now',
            specialInstructions: 'Please be on time',
            studentPhone: '+91 9876543213',
            studentRating: 4.7
        };
        
        this.requests.unshift(newRequest);
        this.filterRequests();
        
        // Show notification
        this.showNotification('New ride request available!', 'info');
        
        // Add pulse animation to new request
        setTimeout(() => {
            const newCard = document.querySelector(`[onclick="showRequestDetails(${newRequest.id})"]`);
            if (newCard) {
                newCard.classList.add('new');
                setTimeout(() => {
                    newCard.classList.remove('new');
                }, 2000);
            }
        }, 100);
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

function refreshRequests() {
    window.captainRequestsInstance?.loadMockRequests();
    window.captainRequestsInstance?.showNotification('Requests refreshed', 'success');
}

function showRequestDetails(requestId) {
    window.captainRequestsInstance?.showRequestDetails(requestId);
}

function closeRequestModal() {
    document.getElementById('requestModal').classList.remove('active');
}

function acceptRequest(requestId) {
    const request = window.captainRequestsInstance?.requests.find(r => r.id === requestId);
    if (!request) return;
    
    // Remove request from list
    window.captainRequestsInstance.requests = window.captainRequestsInstance.requests.filter(r => r.id !== requestId);
    window.captainRequestsInstance.filterRequests();
    
    // Show success message
    window.captainRequestsInstance?.showNotification(`Ride request accepted! Contact ${request.studentName} at ${request.studentPhone}`, 'success');
    
    // Close modal if open
    closeRequestModal();
    
    // In a real app, this would redirect to ride tracking
    setTimeout(() => {
        if (confirm('Redirect to ride tracking?')) {
            window.location.href = 'ride-tracking.html?rideId=VR' + requestId;
        }
    }, 2000);
}

function rejectRequest(requestId) {
    const request = window.captainRequestsInstance?.requests.find(r => r.id === requestId);
    if (!request) return;
    
    // Remove request from list
    window.captainRequestsInstance.requests = window.captainRequestsInstance.requests.filter(r => r.id !== requestId);
    window.captainRequestsInstance.filterRequests();
    
    // Show info message
    window.captainRequestsInstance?.showNotification('Ride request rejected', 'info');
    
    // Close modal if open
    closeRequestModal();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.captainRequestsInstance = new CaptainRequests();
});
