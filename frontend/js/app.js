// Velora Main Application JavaScript

console.log('Velora Application Loaded');

// Theme Toggle Functionality with Dynamic CSS Loading
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    const themeCSS = document.getElementById('theme-css');
    
    // Check for saved theme preference or default to 'dark'
    const currentTheme = localStorage.getItem('theme') || 'dark';
    
    // Load the appropriate theme CSS
    loadTheme(currentTheme);
    
    themeToggle.addEventListener('click', function() {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Add theme switching class to prevent transition flashing
        document.body.classList.add('theme-switching');
        
        // Load new theme
        loadTheme(newTheme);
        
        // Remove theme switching class after a short delay
        setTimeout(() => {
            document.body.classList.remove('theme-switching');
        }, 100);
    });
    
    function loadTheme(theme) {
        // Update HTML data attribute
        html.setAttribute('data-theme', theme);
        
        // Update theme CSS file
        const themeFileName = theme === 'dark' ? 'dark-theme.css' : 'light-theme.css';
        themeCSS.href = `css/${themeFileName}`;
        
        // Save theme preference
        localStorage.setItem('theme', theme);
        
        // Update toggle icon
        updateThemeIcon(theme);
        
        // Force navbar update after theme change
        setTimeout(() => {
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                // Remove any inline styles to let CSS handle it
                navbar.style.background = '';
                navbar.style.boxShadow = '';
                
                // Trigger scroll event to update navbar state
                const scrollEvent = new Event('scroll');
                window.dispatchEvent(scrollEvent);
            }
        }, 100);
        
        console.log(`Theme switched to: ${theme}`);
    }
    
    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
            icon.title = 'Switch to light mode';
        } else {
            icon.className = 'fas fa-moon';
            icon.title = 'Switch to dark mode';
        }
    }
});

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Button Click Handlers
document.addEventListener('DOMContentLoaded', function() {
    // Login Button
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            alert('Login functionality will be implemented soon!');
            // TODO: Redirect to login page
        });
    }
    
    // Signup Buttons
    const signupBtns = document.querySelectorAll('#signupBtn, #getStartedBtn, #ctaSignupBtn');
    signupBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', function() {
                alert('Student signup functionality will be implemented soon!');
                // TODO: Redirect to student signup page
            });
        }
    });
    
    // Driver Signup Button
    const driverBtn = document.getElementById('ctaDriverBtn');
    if (driverBtn) {
        driverBtn.addEventListener('click', function() {
            alert('Driver registration functionality will be implemented soon!');
            // TODO: Redirect to driver signup page
        });
    }
    
    // Learn More Button
    const learnMoreBtn = document.getElementById('learnMoreBtn');
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', function() {
            alert('Demo video will be available soon!');
            // TODO: Show demo video modal
        });
    }
});

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.querySelector('.nav-menu');
    const navAuth = document.querySelector('.nav-auth');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            // Toggle mobile menu visibility
            navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
            navAuth.style.display = navAuth.style.display === 'flex' ? 'none' : 'flex';
            
            // Toggle hamburger animation
            this.classList.toggle('active');
        });
    }
});

// Navbar scroll effect with theme awareness
document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    const html = document.documentElement;
    
    function updateNavbarOnScroll() {
        const currentTheme = html.getAttribute('data-theme');
        const isScrolled = window.scrollY > 50;
        
        // Remove any inline styles to let CSS handle it
        navbar.style.background = '';
        navbar.style.boxShadow = '';
        
        // Add or remove scrolled class
        if (isScrolled) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    
    window.addEventListener('scroll', updateNavbarOnScroll);
    
    // Initial call to set correct state
    updateNavbarOnScroll();
});

// Intersection Observer for animations
document.addEventListener('DOMContentLoaded', function() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
    
    // Observe steps
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        step.style.opacity = '0';
        step.style.transform = 'translateY(20px)';
        step.style.transition = `opacity 0.6s ease ${index * 0.2}s, transform 0.6s ease ${index * 0.2}s`;
        observer.observe(step);
    });
});

// Add loading animation
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});
