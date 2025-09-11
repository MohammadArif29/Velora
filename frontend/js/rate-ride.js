// Velora Rate Ride JavaScript

class RateRide {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.overallRating = 0;
        this.categoryRatings = {
            punctuality: 0,
            safety: 0,
            cleanliness: 0,
            communication: 0
        };
        this.selectedTags = [];
        this.reviewText = '';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeTheme();
        this.loadRideData();
        this.setupRatingStars();
        this.setupCategoryStars();
        this.setupReviewText();
        this.setupFeedbackTags();
        this.updateSubmitButton();
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

    loadRideData() {
        // Load ride data from URL parameters or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const rideId = urlParams.get('rideId') || 'VR123456';
        
        // Update ride ID
        const rideIdElement = document.getElementById('rideId');
        if (rideIdElement) {
            rideIdElement.textContent = `#${rideId}`;
        }

        // Mock ride data - in real app, this would come from API
        const rideData = {
            captainName: 'Rajesh Kumar',
            captainVehicle: 'Auto Rickshaw • TN 07 AB 1234',
            rideRoute: 'MBU Campus → Tirupati Railway Station',
            rideFare: '₹118',
            rideDuration: '12 min',
            rideDistance: '8.5 km'
        };

        // Update UI with ride data
        document.getElementById('captainName').textContent = rideData.captainName;
        document.getElementById('captainVehicle').textContent = rideData.captainVehicle;
        document.getElementById('rideRoute').textContent = rideData.rideRoute;
        document.getElementById('rideFare').textContent = rideData.rideFare;
        document.getElementById('rideDuration').textContent = rideData.rideDuration;
        document.getElementById('rideDistance').textContent = rideData.rideDistance;
    }

    setupRatingStars() {
        const starsContainer = document.getElementById('starsContainer');
        const ratingText = document.getElementById('ratingText');
        
        if (!starsContainer) return;

        starsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('fa-star')) {
                const rating = parseInt(e.target.dataset.rating);
                this.setOverallRating(rating);
            }
        });

        // Hover effects
        starsContainer.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('fa-star')) {
                const rating = parseInt(e.target.dataset.rating);
                this.highlightStars(rating);
            }
        });

        starsContainer.addEventListener('mouseout', () => {
            this.highlightStars(this.overallRating);
        });
    }

    setOverallRating(rating) {
        this.overallRating = rating;
        this.highlightStars(rating);
        this.updateRatingText(rating);
        this.showCategoryRatings();
        this.updateSubmitButton();
    }

    highlightStars(rating) {
        const stars = document.querySelectorAll('#starsContainer i');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    updateRatingText(rating) {
        const ratingText = document.getElementById('ratingText');
        if (!ratingText) return;

        const texts = {
            1: 'Poor',
            2: 'Bad',
            3: 'Average',
            4: 'Good',
            5: 'Excellent'
        };

        ratingText.textContent = texts[rating] || 'Tap to rate';
        ratingText.className = `rating-text ${texts[rating]?.toLowerCase() || ''}`;
    }

    showCategoryRatings() {
        const categorySection = document.getElementById('ratingCategories');
        if (categorySection) {
            categorySection.style.display = 'block';
            categorySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    setupCategoryStars() {
        const categoryStars = document.querySelectorAll('.category-stars i');
        
        categoryStars.forEach(star => {
            star.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                const rating = parseInt(e.target.dataset.rating);
                this.setCategoryRating(category, rating);
            });

            // Hover effects
            star.addEventListener('mouseover', (e) => {
                const category = e.target.dataset.category;
                const rating = parseInt(e.target.dataset.rating);
                this.highlightCategoryStars(category, rating);
            });
        });

        // Reset on mouse out
        document.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('mouseout', (e) => {
                const category = e.target.closest('.category-item').querySelector('.category-stars i').dataset.category;
                this.highlightCategoryStars(category, this.categoryRatings[category]);
            });
        });
    }

    setCategoryRating(category, rating) {
        this.categoryRatings[category] = rating;
        this.highlightCategoryStars(category, rating);
        this.updateSubmitButton();
    }

    highlightCategoryStars(category, rating) {
        const categoryStars = document.querySelectorAll(`[data-category="${category}"]`);
        categoryStars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    setupReviewText() {
        const reviewTextarea = document.getElementById('reviewText');
        const charCount = document.getElementById('charCount');
        
        if (!reviewTextarea || !charCount) return;

        reviewTextarea.addEventListener('input', (e) => {
            this.reviewText = e.target.value;
            charCount.textContent = this.reviewText.length;
            this.updateSubmitButton();
        });
    }

    setupFeedbackTags() {
        const feedbackTags = document.querySelectorAll('.feedback-tag');
        
        feedbackTags.forEach(tag => {
            tag.addEventListener('click', (e) => {
                const tagValue = e.target.dataset.tag;
                this.toggleFeedbackTag(tagValue, e.target);
            });
        });
    }

    toggleFeedbackTag(tag, element) {
        if (this.selectedTags.includes(tag)) {
            this.selectedTags = this.selectedTags.filter(t => t !== tag);
            element.classList.remove('selected');
        } else {
            this.selectedTags.push(tag);
            element.classList.add('selected');
        }
        this.updateSubmitButton();
    }

    updateSubmitButton() {
        const submitBtn = document.getElementById('submitRating');
        if (!submitBtn) return;

        const hasRating = this.overallRating > 0;
        const hasCategoryRatings = Object.values(this.categoryRatings).some(rating => rating > 0);
        
        submitBtn.disabled = !hasRating;
        
        if (hasRating) {
            submitBtn.innerHTML = `<i class="fas fa-star"></i> Submit Rating`;
        } else {
            submitBtn.innerHTML = `<i class="fas fa-star"></i> Please rate first`;
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

function submitRating() {
    const rateRideInstance = window.rateRideInstance;
    if (!rateRideInstance) return;

    if (rateRideInstance.overallRating === 0) {
        rateRideInstance.showNotification('Please provide an overall rating', 'warning');
        return;
    }

    // Prepare rating data
    const ratingData = {
        overallRating: rateRideInstance.overallRating,
        categoryRatings: rateRideInstance.categoryRatings,
        reviewText: rateRideInstance.reviewText,
        selectedTags: rateRideInstance.selectedTags,
        timestamp: new Date().toISOString()
    };

    // Simulate API call
    setTimeout(() => {
        // Store rating in localStorage (in real app, this would be sent to server)
        const ratings = JSON.parse(localStorage.getItem('rideRatings') || '[]');
        ratings.push(ratingData);
        localStorage.setItem('rideRatings', JSON.stringify(ratings));

        // Clear active ride
        localStorage.removeItem('activeRideId');

        // Show thank you modal
        showThankYouModal();
    }, 1000);

    // Show processing state
    rateRideInstance.showNotification('Submitting rating...', 'info');
}

function showThankYouModal() {
    document.getElementById('thankYouModal').classList.add('active');
}

function goToDashboard() {
    window.location.href = 'student-dashboard.html';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.rateRideInstance = new RateRide();
});
