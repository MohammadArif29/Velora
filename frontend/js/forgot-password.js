// Velora Forgot Password JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn?.querySelector('.btn-text');
    const btnLoader = submitBtn?.querySelector('.btn-loader');
    const successMessage = document.getElementById('successMessage');
    
    // Form fields
    const emailInput = document.getElementById('email');
    
    // Initialize
    init();
    
    function init() {
        setupFormValidation();
        
        if (forgotPasswordForm) {
            forgotPasswordForm.addEventListener('submit', handleForgotPassword);
        }
    }
    
    // Form Validation
    function setupFormValidation() {
        if (emailInput) {
            emailInput.addEventListener('blur', () => validateEmail());
            emailInput.addEventListener('input', () => {
                if (emailInput.value.trim()) {
                    clearError('email');
                }
            });
        }
    }
    
    // Validation Functions
    function validateEmail() {
        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            showError('email', 'Email address is required');
            return false;
        }
        
        if (!emailRegex.test(email)) {
            showError('email', 'Please enter a valid email address');
            return false;
        }
        
        clearError('email');
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
    async function handleForgotPassword(e) {
        e.preventDefault();
        
        // Clear previous errors
        clearAllErrors();
        
        // Validate email
        if (!validateEmail()) {
            return;
        }
        
        // Show loading state
        setLoading(true);
        
        // Prepare form data
        const formData = {
            email: emailInput.value.trim().toLowerCase()
        };
        
        try {
            console.log('Sending forgot password request:', formData);
            const response = await fetch('/api/password/forgot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);
            
            const result = await response.json();
            console.log('Response data:', result);
            
            if (response.ok) {
                showSuccessMessage(result.message, result.resetLink);
            } else {
                handleServerErrors(result.errors || [{ field: 'general', message: result.message }]);
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            showError('email', 'Network error. Please check your connection and try again.');
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
                forgotPasswordForm.insertBefore(generalError, forgotPasswordForm.firstChild);
                
                // Remove after 5 seconds
                setTimeout(() => {
                    if (generalError.parentNode) {
                        generalError.parentNode.removeChild(generalError);
                    }
                }, 5000);
            }
        });
    }
    
    function showSuccessMessage(message, resetLink) {
        if (successMessage) {
            const successText = document.getElementById('successText');
            if (successText) {
                successText.innerHTML = `
                    ${message}
                    ${resetLink ? 
                        `<br><br><small style="color: var(--text-secondary);">
                            <strong>Development Mode:</strong><br>
                            <a href="${resetLink}" style="color: var(--primary-base); text-decoration: underline;">
                                Click here to reset password directly
                            </a>
                        </small>` : ''
                    }
                `;
            }
            successMessage.classList.add('show');
            
            // Hide the form
            forgotPasswordForm.style.display = 'none';
            
            // Show additional instructions
            showEmailInstructions();
        }
    }
    
    function showEmailInstructions() {
        // Create additional instructions element
        const instructionsDiv = document.createElement('div');
        instructionsDiv.className = 'email-instructions';
        instructionsDiv.style.cssText = `
            background: var(--bg-secondary);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 20px;
            margin-top: 24px;
            text-align: center;
        `;
        
        instructionsDiv.innerHTML = `
            <div style="margin-bottom: 16px;">
                <i class="fas fa-envelope" style="font-size: 48px; color: var(--primary-base); margin-bottom: 16px;"></i>
                <h3 style="color: var(--text-primary); margin-bottom: 8px;">Check Your Email</h3>
                <p style="color: var(--text-secondary); font-size: 14px;">
                    We've sent a password reset link to <strong>${emailInput.value}</strong>
                </p>
            </div>
            
            <div style="display: grid; gap: 8px; text-align: left; color: var(--text-secondary); font-size: 14px; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-clock" style="color: var(--highlight-accent);"></i>
                    <span>The link will expire in 1 hour</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-shield-alt" style="color: var(--highlight-accent);"></i>
                    <span>Check your spam folder if you don't see it</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-redo" style="color: var(--highlight-accent);"></i>
                    <span>You can request a new link if needed</span>
                </div>
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                <button onclick="location.reload()" class="btn btn-outline" style="font-size: 14px;">
                    <i class="fas fa-redo"></i>
                    Send Another Link
                </button>
                <a href="login.html" class="btn btn-primary" style="font-size: 14px;">
                    <i class="fas fa-arrow-left"></i>
                    Back to Login
                </a>
            </div>
        `;
        
        // Insert after success message
        successMessage.parentNode.insertBefore(instructionsDiv, successMessage.nextSibling);
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Enter key on email field
        if (e.key === 'Enter' && e.target === emailInput) {
            e.preventDefault();
            handleForgotPassword(e);
        }
        
        // Escape key to clear form
        if (e.key === 'Escape') {
            if (emailInput) emailInput.value = '';
            clearAllErrors();
        }
    });
    
    // Auto-focus email field
    if (emailInput) {
        emailInput.focus();
    }
});
