// Ride Booking JavaScript
class RideBooking {
    constructor() {
        this.currentRide = null;
        this.userLocation = null;
        this.rideStatusInterval = null;
        this.init();
    }

    async init() {
        try {
            await this.checkAuth();
            this.initializeTheme();
            this.setupEventListeners();
            await this.getCurrentLocation();
            console.log('✅ Ride booking initialized successfully');
        } catch (error) {
            console.error('❌ Ride booking initialization error:', error);
            this.showNotification('Please login to book a ride', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
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

    initializeTheme() {
        const themeToggle = document.getElementById('themeToggle');
        const currentTheme = localStorage.getItem('theme') || 'light';
        
        document.documentElement.setAttribute('data-theme', currentTheme);
        
        if (themeToggle) {
            themeToggle.innerHTML = currentTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
    }

    setupEventListeners() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', this.toggleTheme.bind(this));
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.logout.bind(this));
        }

        const pickupInput = document.getElementById('pickupLocation');
        const dropoffInput = document.getElementById('dropoffLocation');
        
        if (pickupInput) {
            pickupInput.addEventListener('input', this.validateInputs.bind(this));
        }
        
        if (dropoffInput) {
            dropoffInput.addEventListener('input', this.validateInputs.bind(this));
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
    }

    async logout() {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            
            if (token) {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
            
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            localStorage.removeItem('userId');
            sessionStorage.removeItem('userId');
            
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout error:', error);
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = 'login.html';
        }
    }

    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    console.log('Current location:', this.userLocation);
                    resolve(this.userLocation);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000
                }
            );
        });
    }

    async getCurrentLocation(type) {
        try {
            this.showLoading(true);
            
            if (!navigator.geolocation) {
                throw new Error('Geolocation is not supported');
            }

            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000
                });
            });

            const { latitude, longitude } = position.coords;
            const address = await this.reverseGeocode(latitude, longitude);
            
            const inputId = type === 'pickup' ? 'pickupLocation' : 'dropoffLocation';
            const input = document.getElementById(inputId);
            
            if (input) {
                input.value = address;
                this.validateInputs();
            }
            
            this.showNotification('Location updated successfully', 'success');
        } catch (error) {
            console.error('Error getting current location:', error);
            this.showNotification('Failed to get current location', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async reverseGeocode(latitude, longitude) {
        try {
            const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            
            const data = await response.json();
            
            if (data.locality && data.principalSubdivision) {
                return `${data.locality}, ${data.principalSubdivision}`;
            } else if (data.city && data.countryName) {
                return `${data.city}, ${data.countryName}`;
            } else {
                return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            }
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        }
    }

    swapLocations() {
        const pickupInput = document.getElementById('pickupLocation');
        const dropoffInput = document.getElementById('dropoffLocation');
        
        if (pickupInput && dropoffInput) {
            const temp = pickupInput.value;
            pickupInput.value = dropoffInput.value;
            dropoffInput.value = temp;
            this.validateInputs();
        }
    }

    validateInputs() {
        const pickupInput = document.getElementById('pickupLocation');
        const dropoffInput = document.getElementById('dropoffLocation');
        const bookBtn = document.getElementById('bookRideBtn');
        
        if (pickupInput && dropoffInput && bookBtn) {
            const isValid = pickupInput.value.trim() && dropoffInput.value.trim();
            bookBtn.disabled = !isValid;
        }
    }

    async calculateFare() {
        try {
            const pickupInput = document.getElementById('pickupLocation');
            const dropoffInput = document.getElementById('dropoffLocation');
            
            if (!pickupInput.value.trim() || !dropoffInput.value.trim()) {
                this.showNotification('Please enter both pickup and dropoff locations', 'warning');
                return;
            }

            this.showLoading(true);

            const pickupCoords = await this.geocode(pickupInput.value);
            const dropoffCoords = await this.geocode(dropoffInput.value);

            if (!pickupCoords || !dropoffCoords) {
                throw new Error('Could not find coordinates for one or both locations');
            }

            const response = await fetch('/api/rides/calculate-fare', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    pickup_latitude: pickupCoords.latitude,
                    pickup_longitude: pickupCoords.longitude,
                    dropoff_latitude: dropoffCoords.latitude,
                    dropoff_longitude: dropoffCoords.longitude
                })
            });

            const data = await response.json();

            if (data.success) {
                this.displayFare(data);
            } else {
                throw new Error(data.message || 'Failed to calculate fare');
            }
        } catch (error) {
            console.error('Error calculating fare:', error);
            this.showNotification('Failed to calculate fare. Please check your locations.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async geocode(address) {
        try {
            const response = await fetch(
                `https://api.bigdatacloud.net/data/forward-geocode-client?query=${encodeURIComponent(address)}&localityLanguage=en`
            );
            
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                const result = data.results[0];
                return {
                    latitude: result.latitude,
                    longitude: result.longitude
                };
            }
            
            return null;
        } catch (error) {
            console.error('Geocoding error:', error);
            return null;
        }
    }

    displayFare(fareData) {
        const fareSection = document.getElementById('fareSection');
        const distanceValue = document.getElementById('distanceValue');
        const durationValue = document.getElementById('durationValue');
        const totalFare = document.getElementById('totalFare');

        if (fareSection && distanceValue && durationValue && totalFare) {
            distanceValue.textContent = `${fareData.distance.toFixed(1)} km`;
            durationValue.textContent = `${fareData.estimatedDuration} min`;
            totalFare.textContent = `₹${fareData.fare}`;
            
            fareSection.style.display = 'block';
            this.fareData = fareData;
        }
    }

    async bookRide() {
        try {
            const pickupInput = document.getElementById('pickupLocation');
            const dropoffInput = document.getElementById('dropoffLocation');
            const specialInstructions = document.getElementById('specialInstructions');
            
            if (!pickupInput.value.trim() || !dropoffInput.value.trim()) {
                this.showNotification('Please enter both pickup and dropoff locations', 'warning');
                return;
            }

            if (!this.fareData) {
                this.showNotification('Please calculate fare first', 'warning');
                return;
            }

            this.showLoading(true);

            const pickupCoords = await this.geocode(pickupInput.value);
            const dropoffCoords = await this.geocode(dropoffInput.value);

            if (!pickupCoords || !dropoffCoords) {
                throw new Error('Could not find coordinates for one or both locations');
            }

            const response = await fetch('/api/rides/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    pickup_location: pickupInput.value.trim(),
                    dropoff_location: dropoffInput.value.trim(),
                    pickup_latitude: pickupCoords.latitude,
                    pickup_longitude: pickupCoords.longitude,
                    dropoff_latitude: dropoffCoords.latitude,
                    dropoff_longitude: dropoffCoords.longitude,
                    special_instructions: specialInstructions.value.trim()
                })
            });

            const data = await response.json();

            if (data.success) {
                this.currentRide = {
                    id: data.rideId,
                    pickup: pickupInput.value.trim(),
                    dropoff: dropoffInput.value.trim(),
                    fare: data.fare,
                    distance: data.distance,
                    estimatedDuration: data.estimatedDuration
                };

                this.showRideStatus();
                this.startRideStatusPolling();
                this.showNotification('Ride request sent! Searching for captain...', 'success');
            } else {
                throw new Error(data.message || 'Failed to book ride');
            }
        } catch (error) {
            console.error('Error booking ride:', error);
            this.showNotification('Failed to book ride. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    showRideStatus() {
        const rideStatus = document.getElementById('rideStatus');
        const statusPickup = document.getElementById('statusPickup');
        const statusDropoff = document.getElementById('statusDropoff');
        const statusFare = document.getElementById('statusFare');

        if (rideStatus && statusPickup && statusDropoff && statusFare) {
            statusPickup.textContent = this.currentRide.pickup;
            statusDropoff.textContent = this.currentRide.dropoff;
            statusFare.textContent = `₹${this.currentRide.fare}`;
            
            rideStatus.style.display = 'block';
        }
    }

    startRideStatusPolling() {
        this.rideStatusInterval = setInterval(async () => {
            try {
                const response = await fetch(`/api/rides/${this.currentRide.id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
                    }
                });

                const data = await response.json();

                if (data.success) {
                    this.updateRideStatus(data.ride);
                }
            } catch (error) {
                console.error('Error polling ride status:', error);
            }
        }, 3000);
    }

    updateRideStatus(ride) {
        const statusBadge = document.getElementById('statusBadge');
        const captainInfo = document.getElementById('captainInfo');

        if (statusBadge) {
            switch (ride.status) {
                case 'requested':
                    statusBadge.textContent = 'Searching for captain...';
                    statusBadge.style.background = '#f59e0b';
                    break;
                case 'accepted':
                    statusBadge.textContent = 'Captain found!';
                    statusBadge.style.background = '#10b981';
                    this.showCaptainInfo(ride);
                    break;
                case 'arrived':
                    statusBadge.textContent = 'Captain has arrived';
                    statusBadge.style.background = '#3b82f6';
                    break;
                case 'started':
                    statusBadge.textContent = 'Ride in progress';
                    statusBadge.style.background = '#8b5cf6';
                    break;
                case 'completed':
                    statusBadge.textContent = 'Ride completed';
                    statusBadge.style.background = '#10b981';
                    this.stopRideStatusPolling();
                    break;
                case 'cancelled':
                    statusBadge.textContent = 'Ride cancelled';
                    statusBadge.style.background = '#ef4444';
                    this.stopRideStatusPolling();
                    break;
            }
        }
    }

    showCaptainInfo(ride) {
        const captainInfo = document.getElementById('captainInfo');
        const captainName = document.getElementById('captainName');
        const captainRating = document.getElementById('captainRating');
        const vehicleInfo = document.getElementById('vehicleInfo');

        if (captainInfo && captainName && captainRating && vehicleInfo) {
            captainName.textContent = ride.captain_name || 'Captain';
            captainRating.textContent = '⭐ 4.8';
            vehicleInfo.textContent = 'Vehicle Info';
            
            captainInfo.style.display = 'block';
        }
    }

    async cancelRide() {
        if (!this.currentRide) return;

        if (!confirm('Are you sure you want to cancel this ride?')) {
            return;
        }

        try {
            this.showLoading(true);

            const response = await fetch(`/api/rides/${this.currentRide.id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    status: 'cancelled',
                    cancellation_reason: 'Cancelled by student'
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification('Ride cancelled successfully', 'success');
                this.resetRideBooking();
            } else {
                throw new Error(data.message || 'Failed to cancel ride');
            }
        } catch (error) {
            console.error('Error cancelling ride:', error);
            this.showNotification('Failed to cancel ride. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    callCaptain() {
        this.showNotification('Calling captain...', 'info');
    }

    stopRideStatusPolling() {
        if (this.rideStatusInterval) {
            clearInterval(this.rideStatusInterval);
            this.rideStatusInterval = null;
        }
    }

    resetRideBooking() {
        this.currentRide = null;
        this.stopRideStatusPolling();
        
        const rideStatus = document.getElementById('rideStatus');
        const captainInfo = document.getElementById('captainInfo');
        
        if (rideStatus) rideStatus.style.display = 'none';
        if (captainInfo) captainInfo.style.display = 'none';
    }

    showLoading(show) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            if (show) {
                loadingOverlay.classList.add('show');
            } else {
                loadingOverlay.classList.remove('show');
            }
        }
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-circle' : 
                    type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
        
        notification.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;

        container.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
}

// Global functions
function goBack() {
    window.history.back();
}

function getCurrentLocation(type) {
    if (window.rideBooking) {
        window.rideBooking.getCurrentLocation(type);
    }
}

function swapLocations() {
    if (window.rideBooking) {
        window.rideBooking.swapLocations();
    }
}

function calculateFare() {
    if (window.rideBooking) {
        window.rideBooking.calculateFare();
    }
}

function bookRide() {
    if (window.rideBooking) {
        window.rideBooking.bookRide();
    }
}

function cancelRide() {
    if (window.rideBooking) {
        window.rideBooking.cancelRide();
    }
}

function callCaptain() {
    if (window.rideBooking) {
        window.rideBooking.callCaptain();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.rideBooking = new RideBooking();
});