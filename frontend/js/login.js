// Velora Login JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const loginForm = document.getElementById('loginForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn?.querySelector('.btn-text');
    const btnLoader = submitBtn?.querySelector('.btn-loader');
    const successMessage = document.getElementById('successMessage');
    
    // Form fields
    const identifierInput = document.getElementById('identifier');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    
    // Password toggle
    const passwordToggle = document.getElementById('passwordToggle');
    
    // Quick access buttons
    const quickButtons = document.querySelectorAll('.quick-btn');
    
    // Initialize
    init();
    
    function init() {
        setupPasswordToggle();
        setupQuickAccess();
        setupFormValidation();
        
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
        
        // Auto-fill from localStorage if "Remember me" was checked
        loadRememberedUser();
    }
    
    // Password Toggle
    function setupPasswordToggle() {
        if (passwordToggle) {
            passwordToggle.addEventListener('click', () => {
                const input = passwordInput;
                const icon = passwordToggle.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.className = 'fas fa-eye-slash';
                } else {
                    input.type = 'password';
                    icon.className = 'fas fa-eye';
                }
            });
        }
    }
    
    // Quick Access Buttons
    function setupQuickAccess() {
        quickButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const type = this.dataset.type;
                
                // Remove active class from all buttons
                quickButtons.forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Auto-fill demo credentials (for demonstration)
                if (type === 'student') {
                    identifierInput.value = 'student@demo.com';
                    identifierInput.focus();
                } else if (type === 'captain') {
                    identifierInput.value = 'captain@demo.com';
                    identifierInput.focus();
                }
                
                // Clear any previous errors
                clearAllErrors();
            });
        });
    }
    
    // Form Validation
    function setupFormValidation() {
        if (identifierInput) {
            identifierInput.addEventListener('blur', () => validateIdentifier());
            identifierInput.addEventListener('input', () => {
                if (identifierInput.value.trim()) {
                    clearError('identifier');
                }
            });
        }
        
        if (passwordInput) {
            passwordInput.addEventListener('input', () => {
                if (passwordInput.value) {
                    clearError('password');
                }
            });
        }
    }
    
    // Validation Functions
    function validateIdentifier() {
        const identifier = identifierInput.value.trim();
        
        if (!identifier) {
            showError('identifier', 'Email or username is required');
            return false;
        }
        
        // Basic validation - can be email or username
        if (identifier.length < 3) {
            showError('identifier', 'Please enter a valid email or username');
            return false;
        }
        
        clearError('identifier');
        return true;
    }
    
    function validatePassword() {
        const password = passwordInput.value;
        
        if (!password) {
            showError('password', 'Password is required');
            return false;
        }
        
        if (password.length < 6) {
            showError('password', 'Password must be at least 6 characters');
            return false;
        }
        
        clearError('password');
        return true;
    }
    
    // Error Handling
    function showError(fieldName, message) {
        const errorElement = document.getElementById(`${fieldName}Error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }
    
    function clearError(fieldName) {
        const errorElement = document.getElementById(`${fieldName}Error`);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
    }
    
    function clearAllErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
            element.classList.remove('show');
        });
    }
    
    // Form Submission
    async function handleLogin(e) {
        e.preventDefault();
        
        // Clear previous errors
        clearAllErrors();
        
        // Validate all fields
        const validations = [
            validateIdentifier(),
            validatePassword()
        ];
        
        if (!validations.every(Boolean)) {
            return;
        }
        
        // Show loading state
        setLoading(true);
        
        // Prepare form data
        const formData = {
            identifier: identifierInput.value.trim(),
            password: passwordInput.value,
            rememberMe: rememberMeCheckbox.checked
        };
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                // Save user data
                localStorage.setItem('velora_user', JSON.stringify(result.user));
                
                // Save credentials if "Remember me" is checked
                if (formData.rememberMe) {
                    localStorage.setItem('velora_remember', identifierInput.value.trim());
                } else {
                    localStorage.removeItem('velora_remember');
                }
                
                // Show success message
                showSuccessMessage(result.user);
                
                // Redirect based on user type
                setTimeout(() => {
                    if (result.user.userType === 'student') {
                        window.location.href = '../pages/student-dashboard.html';
                    } else if (result.user.userType === 'captain') {
                        window.location.href = '../pages/captain-dashboard.html';
                    } else {
                        window.location.href = '../index.html';
                    }
                }, 2000);
                
            } else {
                handleServerErrors(result.errors || [{ field: 'general', message: result.message }]);
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('general', 'Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    }
    
    function setLoading(loading) {
        if (submitBtn && btnText && btnLoader) {
            if (loading) {
                submitBtn.disabled = true;
                btnText.style.display = 'none';
                btnLoader.style.display = 'block';
            } else {
                submitBtn.disabled = false;
                btnText.style.display = 'block';
                btnLoader.style.display = 'none';
            }
        }
    }
    
    function handleServerErrors(errors) {
        errors.forEach(error => {
            if (error.field && error.field !== 'general') {
                showError(error.field, error.message);
            } else {
                // Show general error as alert or in a general error area
                const generalError = document.createElement('div');
                generalError.className = 'error-message show';
                generalError.style.marginBottom = '16px';
                generalError.textContent = error.message;
                loginForm.insertBefore(generalError, loginForm.firstChild);
                
                // Remove after 5 seconds
                setTimeout(() => {
                    if (generalError.parentNode) {
                        generalError.parentNode.removeChild(generalError);
                    }
                }, 5000);
            }
        });
    }
    
    function showSuccessMessage(user) {
        if (successMessage) {
            const messageContent = successMessage.querySelector('div');
            messageContent.innerHTML = `
                <strong>Welcome back, ${user.fullName}!</strong><br>
                Logging you in as ${user.userType}...
            `;
            successMessage.classList.add('show');
            
            // Hide the form
            loginForm.style.display = 'none';
        }
    }
    
    function loadRememberedUser() {
        const rememberedIdentifier = localStorage.getItem('velora_remember');
        if (rememberedIdentifier && identifierInput) {
            identifierInput.value = rememberedIdentifier;
            rememberMeCheckbox.checked = true;
        }
    }
    
    // Demo functionality for quick buttons
    function setupDemoCredentials() {
        // This is for demonstration purposes
        // In production, remove this or replace with actual demo accounts
        const demoCredentials = {
            student: {
                identifier: 'demo_student',
                password: 'Student123!'
            },
            captain: {
                identifier: 'demo_captain',
                password: 'Captain123!'
            }
        };
        
        // You can use these for testing
        window.demoLogin = function(type) {
            const creds = demoCredentials[type];
            if (creds) {
                identifierInput.value = creds.identifier;
                passwordInput.value = creds.password;
            }
        };
    }
    
    // Initialize demo credentials
    setupDemoCredentials();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Enter key on form fields
        if (e.key === 'Enter' && (e.target === identifierInput || e.target === passwordInput)) {
            e.preventDefault();
            handleLogin(e);
        }
        
        // Escape key to clear form
        if (e.key === 'Escape') {
            if (identifierInput) identifierInput.value = '';
            if (passwordInput) passwordInput.value = '';
            clearAllErrors();
            quickButtons.forEach(btn => btn.classList.remove('active'));
        }
    });
});
