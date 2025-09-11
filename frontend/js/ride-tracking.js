// Velora Ride Tracking JavaScript

class RideTracking {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.rideId = this.getRideIdFromURL();
        this.rideStatus = 'assigned'; // assigned, arriving, started, completed
        this.captainData = {
            name: 'Rajesh Kumar',
            rating: 4.8,
            vehicle: 'Auto Rickshaw',
            vehicleNumber: 'TN 07 AB 1234',
            phone: '+91 9876543210',
            avatar: 'https://via.placeholder.com/60x60/5A31F4/FFFFFF?text=RK'
        };
        this.rideData = {
            pickup: 'MBU Campus',
            destination: 'Tirupati Railway Station',
            distance: '8.5 km',
            duration: '12 min',
            fare: '₹118'
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeTheme();
        this.loadRideData();
        this.startTracking();
        this.setupStatusUpdates();
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

    getRideIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('rideId') || 'VR123456';
    }

    loadRideData() {
        // Update ride ID
        const rideIdElement = document.getElementById('rideId');
        if (rideIdElement) {
            rideIdElement.textContent = `#${this.rideId}`;
        }

        // Update captain data
        const captainName = document.getElementById('captainName');
        if (captainName) {
            captainName.textContent = this.captainData.name;
        }

        const captainAvatar = document.getElementById('captainAvatar');
        if (captainAvatar) {
            captainAvatar.src = this.captainData.avatar;
            captainAvatar.alt = this.captainData.name;
        }

        // Update ride details
        this.updateRideDetails();
    }

    updateRideDetails() {
        const routeText = document.querySelector('.route-text');
        if (routeText) {
            routeText.innerHTML = `
                <span class="pickup">${this.rideData.pickup}</span>
                <i class="fas fa-arrow-right"></i>
                <span class="destination">${this.rideData.destination}</span>
            `;
        }

        // Update other ride details
        const infoItems = document.querySelectorAll('.info-item');
        infoItems.forEach(item => {
            const label = item.querySelector('.info-label span').textContent.toLowerCase();
            const value = item.querySelector('.info-value');
            
            switch (label) {
                case 'distance':
                    value.textContent = this.rideData.distance;
                    break;
                case 'duration':
                    value.textContent = this.rideData.duration;
                    break;
                case 'fare':
                    value.textContent = this.rideData.fare;
                    break;
            }
        });
    }

    startTracking() {
        // Simulate real-time updates
        this.updateCaptainLocation();
        this.updateStatusTimeline();
        
        // Update every 5 seconds
        setInterval(() => {
            this.updateCaptainLocation();
        }, 5000);
    }

    updateCaptainLocation() {
        const captainLocation = document.getElementById('captainLocation');
        const captainETA = document.getElementById('captainETA');
        
        if (captainLocation && captainETA) {
            // Simulate captain moving closer
            const distances = ['2 minutes away • 0.8 km', '1 minute away • 0.4 km', 'Arriving now • 0.1 km'];
            const etas = ['2 min', '1 min', 'Now'];
            
            const randomIndex = Math.floor(Math.random() * distances.length);
            captainLocation.textContent = distances[randomIndex];
            captainETA.textContent = etas[randomIndex];
        }
    }

    setupStatusUpdates() {
        // Simulate status progression
        setTimeout(() => {
            this.updateRideStatus('arriving');
        }, 10000);

        setTimeout(() => {
            this.updateRideStatus('started');
        }, 20000);

        setTimeout(() => {
            this.updateRideStatus('completed');
            // Redirect to rating page after completion
            setTimeout(() => {
                window.location.href = 'rate-ride.html?rideId=' + this.rideId;
            }, 3000);
        }, 60000);
    }

    updateRideStatus(newStatus) {
        this.rideStatus = newStatus;
        
        const statusBadge = document.getElementById('statusBadge');
        const timelineItems = document.querySelectorAll('.timeline-item');
        
        // Update status badge
        if (statusBadge) {
            const statusConfig = {
                'assigned': { icon: 'fas fa-user-check', text: 'Captain Assigned', color: 'var(--primary-base)' },
                'arriving': { icon: 'fas fa-car', text: 'Captain Arriving', color: 'var(--highlight-accent)' },
                'started': { icon: 'fas fa-play', text: 'Ride Started', color: 'var(--secondary-accent)' },
                'completed': { icon: 'fas fa-check-circle', text: 'Ride Completed', color: 'var(--highlight-accent)' }
            };
            
            const config = statusConfig[newStatus];
            statusBadge.innerHTML = `<i class="${config.icon}"></i><span>${config.text}</span>`;
            statusBadge.style.background = config.color;
        }

        // Update timeline
        timelineItems.forEach((item, index) => {
            item.classList.remove('completed', 'active');
            
            if (index < this.getStatusIndex(newStatus)) {
                item.classList.add('completed');
            } else if (index === this.getStatusIndex(newStatus)) {
                item.classList.add('active');
            }
        });

        // Show notification for status change
        this.showStatusNotification(newStatus);
    }

    getStatusIndex(status) {
        const statusOrder = ['assigned', 'arriving', 'started', 'completed'];
        return statusOrder.indexOf(status);
    }

    showStatusNotification(status) {
        const messages = {
            'arriving': 'Captain is arriving at your location!',
            'started': 'Your ride has started. Enjoy your journey!',
            'completed': 'Ride completed! Thank you for using Velora.'
        };

        if (messages[status]) {
            this.showNotification(messages[status], 'success');
        }
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

function showEmergencyModal() {
    document.getElementById('emergencyModal').classList.add('active');
}

function closeEmergencyModal() {
    document.getElementById('emergencyModal').classList.remove('active');
}

function callEmergency(type) {
    const numbers = {
        'police': '100',
        'ambulance': '108',
        'velora': '+91 9876543210'
    };
    
    const number = numbers[type];
    if (number) {
        window.open(`tel:${number}`);
        closeEmergencyModal();
    }
}

function callCaptain() {
    window.open(`tel:${window.rideTrackingInstance.captainData.phone}`);
}

function messageCaptain() {
    // In a real app, this would open a chat interface
    alert('Chat feature coming soon!');
}

function centerMap() {
    // In a real app, this would center the map on user's location
    console.log('Centering map...');
}

function toggleMapType() {
    // In a real app, this would toggle between map and satellite view
    console.log('Toggling map type...');
}

function cancelRide() {
    document.getElementById('cancelModal').classList.add('active');
}

function closeCancelModal() {
    document.getElementById('cancelModal').classList.remove('active');
}

function confirmCancelRide() {
    // In a real app, this would cancel the ride via API
    alert('Ride cancelled. Cancellation fee may apply.');
    closeCancelModal();
    
    // Redirect to dashboard
    setTimeout(() => {
        window.location.href = 'student-dashboard.html';
    }, 2000);
}

function shareRide() {
    if (navigator.share) {
        navigator.share({
            title: 'My Velora Ride',
            text: `I'm currently on a Velora ride. Track me here: ${window.location.href}`,
            url: window.location.href
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        const shareText = `I'm currently on a Velora ride. Track me here: ${window.location.href}`;
        navigator.clipboard.writeText(shareText).then(() => {
            window.rideTrackingInstance.showNotification('Ride details copied to clipboard!', 'success');
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.rideTrackingInstance = new RideTracking();
});
