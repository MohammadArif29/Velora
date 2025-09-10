// Velora Reset Password JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // State elements
    const loadingState = document.getElementById('loadingState');
    const invalidTokenState = document.getElementById('invalidTokenState');
    const resetFormState = document.getElementById('resetFormState');
    
    // Form elements
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn?.querySelector('.btn-text');
    const btnLoader = submitBtn?.querySelector('.btn-loader');
    const successMessage = document.getElementById('successMessage');
    
    // Form fields
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const userEmailSpan = document.getElementById('userEmail');
    
    // Password toggles
    const newPasswordToggle = document.getElementById('newPasswordToggle');
    const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
    
    // Get reset token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('token');
    
    // Initialize
    init();
    
    function init() {
        // Check if token exists
        if (!resetToken) {
            showInvalidTokenState('No reset token provided');
            return;
        }
        
        // Verify token
        verifyResetToken();
        
        setupPasswordToggles();
        setupFormValidation();
        setupPasswordStrength();
        
        if (resetPasswordForm) {
            resetPasswordForm.addEventListener('submit', handleResetPassword);
        }
    }
    
    // Verify reset token
    async function verifyResetToken() {
        try {
            const response = await fetch(`/api/password/verify/${resetToken}`);
            const result = await response.json();
            
            if (response.ok && result.success) {
                // Token is valid, show reset form
                showResetFormState(result.data);
            } else {
                // Token is invalid
                showInvalidTokenState(result.message || 'Invalid reset token');
            }
        } catch (error) {
            console.error('Token verification error:', error);
            showInvalidTokenState('Unable to verify reset token. Please try again.');
        }
    }
    
    // Show different states
    function showResetFormState(userData) {
        loadingState.style.display = 'none';
        invalidTokenState.style.display = 'none';
        resetFormState.style.display = 'block';
        
        // Set user email
        if (userEmailSpan && userData.email) {
            userEmailSpan.textContent = userData.email;
        }
        
        // Focus on password field
        if (newPasswordInput) {
            newPasswordInput.focus();
        }
    }
    
    function showInvalidTokenState(message) {
        loadingState.style.display = 'none';
        resetFormState.style.display = 'none';
        invalidTokenState.style.display = 'block';
        
        // Update error message if needed
        const errorText = invalidTokenState.querySelector('p');
        if (errorText && message) {
            errorText.textContent = message;
        }
    }
    
    // Password Toggles
    function setupPasswordToggles() {
        if (newPasswordToggle) {
            newPasswordToggle.addEventListener('click', () => togglePassword('newPassword'));
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
        if (newPasswordInput) {
            newPasswordInput.addEventListener('input', () => {
                validateNewPassword();
                updatePasswordStrength();
                updatePasswordRequirements();
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
        
        if (newPasswordInput && strengthFill && strengthText) {
            newPasswordInput.addEventListener('input', updatePasswordStrength);
        }
    }
    
    function updatePasswordStrength() {
        const password = newPasswordInput.value;
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
    
    function updatePasswordRequirements() {
        const password = newPasswordInput.value;
        const requirements = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        
        Object.keys(requirements).forEach(req => {
            const element = document.querySelector(`[data-requirement="${req}"]`);
            if (element) {
                const icon = element.querySelector('i');
                if (requirements[req]) {
                    element.classList.add('valid');
                    icon.className = 'fas fa-check';
                    icon.style.color = 'var(--highlight-accent)';
                } else {
                    element.classList.remove('valid');
                    icon.className = 'fas fa-times';
                    icon.style.color = 'var(--alert-warning)';
                }
            }
        });
    }
    
    // Validation Functions
    function validateNewPassword() {
        const password = newPasswordInput.value;
        
        if (!password) {
            showError('newPassword', 'New password is required');
            return false;
        }
        
        if (password.length < 8) {
            showError('newPassword', 'Password must be at least 8 characters');
            return false;
        }
        
        if (!/(?=.*[a-z])/.test(password)) {
            showError('newPassword', 'Password must contain at least one lowercase letter');
            return false;
        }
        
        if (!/(?=.*[A-Z])/.test(password)) {
            showError('newPassword', 'Password must contain at least one uppercase letter');
            return false;
        }
        
        if (!/(?=.*\d)/.test(password)) {
            showError('newPassword', 'Password must contain at least one number');
            return false;
        }
        
        if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
            showError('newPassword', 'Password must contain at least one special character');
            return false;
        }
        
        clearError('newPassword');
        return true;
    }
    
    function validateConfirmPassword() {
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (!confirmPassword) {
            showError('confirmPassword', 'Please confirm your new password');
            return false;
        }
        
        if (newPassword !== confirmPassword) {
            showError('confirmPassword', 'Passwords do not match');
            return false;
        }
        
        clearError('confirmPassword');
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
    async function handleResetPassword(e) {
        e.preventDefault();
        
        // Clear previous errors
        clearAllErrors();
        
        // Validate all fields
        const validations = [
            validateNewPassword(),
            validateConfirmPassword()
        ];
        
        if (!validations.every(Boolean)) {
            return;
        }
        
        // Show loading state
        setLoading(true);
        
        // Prepare form data
        const formData = {
            token: resetToken,
            newPassword: newPasswordInput.value,
            confirmPassword: confirmPasswordInput.value
        };
        
        try {
            const response = await fetch('/api/password/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showSuccessMessage(result.message);
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 3000);
            } else {
                handleServerErrors(result.errors || [{ field: 'general', message: result.message }]);
            }
        } catch (error) {
            console.error('Reset password error:', error);
            showError('newPassword', 'Network error. Please check your connection and try again.');
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
                // Show general error
                const generalError = document.createElement('div');
                generalError.className = 'error-message show';
                generalError.style.marginBottom = '16px';
                generalError.textContent = error.message;
                resetPasswordForm.insertBefore(generalError, resetPasswordForm.firstChild);
                
                // Remove after 5 seconds
                setTimeout(() => {
                    if (generalError.parentNode) {
                        generalError.parentNode.removeChild(generalError);
                    }
                }, 5000);
            }
        });
    }
    
    function showSuccessMessage(message) {
        if (successMessage) {
            const messageContent = successMessage.querySelector('div');
            messageContent.innerHTML = `
                <strong>Password Reset Successful! 🎉</strong><br>
                ${message}<br>
                <small style="color: var(--text-secondary); margin-top: 8px; display: block;">
                    Redirecting to login page in 3 seconds...
                </small>
            `;
            successMessage.classList.add('show');
            
            // Hide the form
            resetPasswordForm.style.display = 'none';
        }
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Enter key to submit
        if (e.key === 'Enter' && (e.target === newPasswordInput || e.target === confirmPasswordInput)) {
            e.preventDefault();
            if (resetFormState.style.display !== 'none') {
                handleResetPassword(e);
            }
        }
        
        // Escape key to clear form
        if (e.key === 'Escape') {
            if (newPasswordInput) newPasswordInput.value = '';
            if (confirmPasswordInput) confirmPasswordInput.value = '';
            clearAllErrors();
            updatePasswordStrength();
            updatePasswordRequirements();
        }
    });
});
