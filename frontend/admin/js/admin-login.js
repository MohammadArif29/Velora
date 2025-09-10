// Velora Admin Login JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const adminLoginForm = document.getElementById('adminLoginForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn?.querySelector('.btn-text');
    const btnLoader = submitBtn?.querySelector('.btn-loader');
    const successMessage = document.getElementById('successMessage');
    
    // Form fields
    const adminIdInput = document.getElementById('adminId');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    
    // Password toggle
    const passwordToggle = document.getElementById('passwordToggle');
    
    // System status
    const systemStatus = document.getElementById('systemStatus');
    
    // Initialize
    init();
    
    function init() {
        setupPasswordToggle();
        setupFormValidation();
        checkSystemStatus();
        
        if (adminLoginForm) {
            adminLoginForm.addEventListener('submit', handleAdminLogin);
        }
        
        // Auto-focus admin ID field
        if (adminIdInput) {
            adminIdInput.focus();
        }
        
        // Check if already logged in
        checkExistingSession();
    }
    
    // Check existing admin session
    async function checkExistingSession() {
        try {
            const response = await fetch('/api/admin/verify', {
                method: 'GET',
                credentials: 'include'
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    // Already logged in, redirect to dashboard
                    window.location.href = 'dashboard.html';
                }
            }
        } catch (error) {
            // Not logged in, continue with login form
            console.log('No existing session found');
        }
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
    
    // Form Validation
    function setupFormValidation() {
        if (adminIdInput) {
            adminIdInput.addEventListener('blur', () => validateAdminId());
            adminIdInput.addEventListener('input', () => {
                if (adminIdInput.value.trim()) {
                    clearError('adminId');
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
    function validateAdminId() {
        const adminId = adminIdInput.value.trim();
        
        if (!adminId) {
            showError('adminId', 'Admin ID is required');
            return false;
        }
        
        if (adminId.length < 3) {
            showError('adminId', 'Please enter a valid admin ID');
            return false;
        }
        
        clearError('adminId');
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
    async function handleAdminLogin(e) {
        e.preventDefault();
        
        // Clear previous errors
        clearAllErrors();
        
        // Validate all fields
        const validations = [
            validateAdminId(),
            validatePassword()
        ];
        
        if (!validations.every(Boolean)) {
            return;
        }
        
        // Show loading state
        setLoading(true);
        
        // Prepare form data
        const formData = {
            adminId: adminIdInput.value.trim(),
            password: passwordInput.value,
            rememberMe: rememberMeCheckbox.checked
        };
        
        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                // Store admin data
                localStorage.setItem('velora_admin', JSON.stringify(result.admin));
                
                // Show success message
                showSuccessMessage(result.admin);
                
                // Redirect to admin dashboard
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
                
            } else {
                handleServerErrors(result.errors || [{ field: 'general', message: result.message }]);
            }
        } catch (error) {
            console.error('Admin login error:', error);
            showError('adminId', 'Network error. Please check your connection and try again.');
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
                // Show general error as alert
                showGeneralError(error.message);
            }
        });
    }
    
    function showGeneralError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message show';
        errorDiv.style.cssText = `
            background: rgba(255, 78, 205, 0.1);
            border: 1px solid var(--alert-warning);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 20px;
            text-align: center;
            color: var(--alert-warning);
            font-weight: 600;
        `;
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle" style="margin-right: 8px;"></i>
            ${message}
        `;
        
        adminLoginForm.insertBefore(errorDiv, adminLoginForm.firstChild);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
    
    function showSuccessMessage(admin) {
        if (successMessage) {
            const messageContent = successMessage.querySelector('div');
            messageContent.innerHTML = `
                <strong>Welcome back, ${admin.username}! 👋</strong><br>
                Access Level: ${admin.role.toUpperCase()}<br>
                Redirecting to admin dashboard...
            `;
            successMessage.classList.add('show');
            
            // Hide the form
            adminLoginForm.style.display = 'none';
        }
    }
    
    // System Status Check
    async function checkSystemStatus() {
        try {
            const response = await fetch('/api', {
                method: 'GET'
            });
            
            if (response.ok) {
                updateSystemStatus('online', 'System Online');
            } else {
                updateSystemStatus('warning', 'System Issues');
            }
        } catch (error) {
            updateSystemStatus('offline', 'System Offline');
        }
    }
    
    function updateSystemStatus(status, text) {
        if (systemStatus) {
            const statusDot = systemStatus.querySelector('.status-dot');
            const statusText = systemStatus.querySelector('span');
            
            // Remove existing status classes
            statusDot.classList.remove('online', 'warning', 'offline');
            
            // Add new status class
            statusDot.classList.add(status);
            statusText.textContent = text;
            
            // Update colors based on status
            switch (status) {
                case 'online':
                    statusDot.style.background = 'var(--highlight-accent)';
                    break;
                case 'warning':
                    statusDot.style.background = '#FFA500';
                    break;
                case 'offline':
                    statusDot.style.background = 'var(--alert-warning)';
                    break;
            }
        }
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Enter key to submit
        if (e.key === 'Enter' && (e.target === adminIdInput || e.target === passwordInput)) {
            e.preventDefault();
            handleAdminLogin(e);
        }
        
        // Escape key to clear form
        if (e.key === 'Escape') {
            if (adminIdInput) adminIdInput.value = '';
            if (passwordInput) passwordInput.value = '';
            clearAllErrors();
        }
    });
    
    // Security: Prevent right-click and dev tools
    if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
        
        document.addEventListener('keydown', function(e) {
            // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
                (e.ctrlKey && e.key === 'U')) {
                e.preventDefault();
            }
        });
    }
    
    // Auto-refresh system status every 30 seconds
    setInterval(checkSystemStatus, 30000);
});
