// Velora Authentication JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const signupForm = document.getElementById('signupForm');
    const typeOptions = document.querySelectorAll('.type-option');
    const studentIdGroup = document.getElementById('studentIdGroup');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn?.querySelector('.btn-text');
    const btnLoader = submitBtn?.querySelector('.btn-loader');
    
    // Form fields
    const fullNameInput = document.getElementById('fullName');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const mobileInput = document.getElementById('mobile');
    const studentIdInput = document.getElementById('studentId');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const termsCheckbox = document.getElementById('terms');
    
    // Password toggles
    const passwordToggle = document.getElementById('passwordToggle');
    const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
    
    // User type selection
    let selectedUserType = null;
    
    // Initialize
    init();
    
    function init() {
        setupUserTypeSelection();
        setupPasswordToggles();
        setupFormValidation();
        setupPasswordStrength();
        
        if (signupForm) {
            signupForm.addEventListener('submit', handleSignup);
        }
    }
    
    // User Type Selection
    function setupUserTypeSelection() {
        typeOptions.forEach(option => {
            option.addEventListener('click', function() {
                const type = this.dataset.type;
                selectUserType(type);
            });
        });
    }
    
    function selectUserType(type) {
        // Remove previous selection
        typeOptions.forEach(option => option.classList.remove('selected'));
        
        // Add selection to clicked option
        const selectedOption = document.querySelector(`[data-type="${type}"]`);
        selectedOption.classList.add('selected');
        
        // Update radio button
        const radioInput = document.getElementById(type);
        radioInput.checked = true;
        
        // Show/hide student ID field
        if (type === 'student') {
            studentIdGroup.style.display = 'block';
            studentIdGroup.classList.add('show');
            studentIdInput.required = true;
        } else {
            studentIdGroup.style.display = 'none';
            studentIdGroup.classList.remove('show');
            studentIdInput.required = false;
            studentIdInput.value = '';
            clearError('studentId');
        }
        
        selectedUserType = type;
    }
    
    // Password Toggles
    function setupPasswordToggles() {
        if (passwordToggle) {
            passwordToggle.addEventListener('click', () => togglePassword('password'));
        }
        if (confirmPasswordToggle) {
            confirmPasswordToggle.addEventListener('click', () => togglePassword('confirmPassword'));
        }
    }
    
    function togglePassword(fieldName) {
        const input = document.getElementById(fieldName);
        const toggle = document.getElementById(`${fieldName}Toggle`);
        const icon = toggle.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }
    
    // Form Validation
    function setupFormValidation() {
        // Real-time validation
        if (usernameInput) {
            usernameInput.addEventListener('blur', () => validateUsername());
            usernameInput.addEventListener('input', debounce(() => validateUsername(), 500));
        }
        
        if (emailInput) {
            emailInput.addEventListener('blur', () => validateEmail());
        }
        
        if (mobileInput) {
            mobileInput.addEventListener('input', () => validateMobile());
        }
        
        if (studentIdInput) {
            studentIdInput.addEventListener('blur', () => validateStudentId());
        }
        
        if (passwordInput) {
            passwordInput.addEventListener('input', () => {
                validatePassword();
                updatePasswordStrength();
            });
        }
        
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', () => validateConfirmPassword());
        }
    }
    
    // Password Strength
    function setupPasswordStrength() {
        const strengthFill = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');
        
        if (passwordInput && strengthFill && strengthText) {
            passwordInput.addEventListener('input', updatePasswordStrength);
        }
    }
    
    function updatePasswordStrength() {
        const password = passwordInput.value;
        const strengthFill = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');
        
        if (!password) {
            strengthFill.className = 'strength-fill';
            strengthText.textContent = 'Password strength';
            return;
        }
        
        let score = 0;
        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            numbers: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        
        score = Object.values(checks).filter(Boolean).length;
        
        if (score < 2) {
            strengthFill.className = 'strength-fill weak';
            strengthText.textContent = 'Weak password';
        } else if (score < 3) {
            strengthFill.className = 'strength-fill fair';
            strengthText.textContent = 'Fair password';
        } else if (score < 4) {
            strengthFill.className = 'strength-fill good';
            strengthText.textContent = 'Good password';
        } else {
            strengthFill.className = 'strength-fill strong';
            strengthText.textContent = 'Strong password';
        }
    }
    
    // Validation Functions
    function validateUsername() {
        const username = usernameInput.value.trim();
        
        if (!username) {
            showError('username', 'Username is required');
            return false;
        }
        
        if (username.length < 3 || username.length > 20) {
            showError('username', 'Username must be 3-20 characters');
            return false;
        }
        
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            showError('username', 'Username can only contain letters, numbers, and underscores');
            return false;
        }
        
        clearError('username');
        return true;
    }
    
    function validateEmail() {
        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            showError('email', 'Email is required');
            return false;
        }
        
        if (!emailRegex.test(email)) {
            showError('email', 'Please enter a valid email address');
            return false;
        }
        
        clearError('email');
        return true;
    }
    
    function validateMobile() {
        const mobile = mobileInput.value.trim();
        const mobileRegex = /^[6-9]\d{9}$/;
        
        if (!mobile) {
            showError('mobile', 'Mobile number is required');
            return false;
        }
        
        if (!mobileRegex.test(mobile)) {
            showError('mobile', 'Please enter a valid 10-digit Indian mobile number');
            return false;
        }
        
        clearError('mobile');
        return true;
    }
    
    function validateStudentId() {
        if (selectedUserType !== 'student') return true;
        
        const studentId = studentIdInput.value.trim();
        const studentIdRegex = /^[0-9]{5}[A-Za-z][0-9]{6}$/;
        
        if (!studentId) {
            showError('studentId', 'Student ID is required');
            return false;
        }
        
        if (!studentIdRegex.test(studentId)) {
            showError('studentId', 'Please enter a valid student ID (e.g., 22102A041057)');
            return false;
        }
        
        clearError('studentId');
        return true;
    }
    
    function validatePassword() {
        const password = passwordInput.value;
        
        if (!password) {
            showError('password', 'Password is required');
            return false;
        }
        
        if (password.length < 8) {
            showError('password', 'Password must be at least 8 characters');
            return false;
        }
        
        if (!/(?=.*[a-z])/.test(password)) {
            showError('password', 'Password must contain at least one lowercase letter');
            return false;
        }
        
        if (!/(?=.*[A-Z])/.test(password)) {
            showError('password', 'Password must contain at least one uppercase letter');
            return false;
        }
        
        if (!/(?=.*\d)/.test(password)) {
            showError('password', 'Password must contain at least one number');
            return false;
        }
        
        if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
            showError('password', 'Password must contain at least one special character');
            return false;
        }
        
        clearError('password');
        return true;
    }
    
    function validateConfirmPassword() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (!confirmPassword) {
            showError('confirmPassword', 'Please confirm your password');
            return false;
        }
        
        if (password !== confirmPassword) {
            showError('confirmPassword', 'Passwords do not match');
            return false;
        }
        
        clearError('confirmPassword');
        return true;
    }
    
    function validateUserType() {
        if (!selectedUserType) {
            alert('Please select whether you are a Student or Captain');
            return false;
        }
        return true;
    }
    
    function validateTerms() {
        if (!termsCheckbox.checked) {
            showError('terms', 'You must agree to the Terms of Service and Privacy Policy');
            return false;
        }
        clearError('terms');
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
    async function handleSignup(e) {
        e.preventDefault();
        
        // Clear previous errors
        clearAllErrors();
        
        // Validate all fields
        const validations = [
            validateUserType(),
            validateUsername(),
            validateEmail(),
            validateMobile(),
            validateStudentId(),
            validatePassword(),
            validateConfirmPassword(),
            validateTerms()
        ];
        
        if (!validations.every(Boolean)) {
            return;
        }
        
        // Show loading state
        setLoading(true);
        
        // Prepare form data
        const formData = {
            userType: selectedUserType,
            fullName: fullNameInput.value.trim(),
            username: usernameInput.value.trim(),
            email: emailInput.value.trim(),
            mobile: mobileInput.value.trim(),
            studentId: selectedUserType === 'student' ? studentIdInput.value.trim() : null,
            password: passwordInput.value
        };
        
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showSuccessMessage(result.message, result.uniqueId);
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 3000);
            } else {
                handleServerErrors(result.errors || [{ field: 'general', message: result.message }]);
            }
        } catch (error) {
            console.error('Signup error:', error);
            showError('general', 'Network error. Please try again.');
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
                alert(error.message);
            }
        });
    }
    
    function showSuccessMessage(message, uniqueId) {
        // Create success message element
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message show';
        successDiv.innerHTML = `
            <div>
                <strong>Account Created Successfully!</strong><br>
                ${message}<br>
                Your unique ID: <strong>${uniqueId}</strong>
            </div>
        `;
        
        // Insert before form
        signupForm.parentNode.insertBefore(successDiv, signupForm);
        
        // Hide form
        signupForm.style.display = 'none';
    }
    
    // Utility Functions
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
});
