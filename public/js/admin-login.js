class AdminLogin {
    constructor() {
        this.form = document.getElementById('adminLoginForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.passwordToggle = document.getElementById('passwordToggle');
        this.loginBtn = document.getElementById('loginBtn');
        this.errorMessage = document.getElementById('errorMessage');
        this.rememberMe = document.getElementById('rememberMe');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSavedCredentials();
    }

    setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Password toggle
        this.passwordToggle.addEventListener('click', () => {
            this.togglePasswordVisibility();
        });

        // Real-time validation
        this.emailInput.addEventListener('input', () => {
            this.clearError();
            this.validateEmail();
        });

        this.passwordInput.addEventListener('input', () => {
            this.clearError();
        });

        // Enter key handling
        this.passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleLogin();
            }
        });
    }

    async handleLogin() {
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value;

        // Validation
        if (!this.validateForm(email, password)) {
            return;
        }

        this.setLoading(true);
        this.clearError();

        try {
            // Use the custom admin login endpoint
            const response = await fetch('/admin-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include' // Important for session cookies
            });

            if (response.ok) {
                // Save credentials if remember me is checked
                if (this.rememberMe.checked) {
                    this.saveCredentials(email, password);
                } else {
                    this.clearSavedCredentials();
                }

                // Show success message
                this.showSuccess('Login successful! Redirecting...');

                // Redirect to admin panel after a short delay
                setTimeout(() => {
                    window.location.href = '/admin';
                }, 1500);

            } else {
                const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
                this.showError(errorData.message || 'Invalid credentials. Please try again.');
            }

        } catch (error) {
            console.error('Login error:', error);
            this.showError('Network error. Please check your connection and try again.');
        } finally {
            this.setLoading(false);
        }
    }

    validateForm(email, password) {
        if (!email) {
            this.showError('Please enter your email address.');
            this.emailInput.focus();
            return false;
        }

        if (!this.isValidEmail(email)) {
            this.showError('Please enter a valid email address.');
            this.emailInput.focus();
            return false;
        }

        if (!password) {
            this.showError('Please enter your password.');
            this.passwordInput.focus();
            return false;
        }

        if (password.length < 6) {
            this.showError('Password must be at least 6 characters long.');
            this.passwordInput.focus();
            return false;
        }

        return true;
    }

    validateEmail() {
        const email = this.emailInput.value.trim();
        if (email && !this.isValidEmail(email)) {
            this.emailInput.style.borderColor = '#e53e3e';
        } else {
            this.emailInput.style.borderColor = '#e2e8f0';
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    togglePasswordVisibility() {
        const type = this.passwordInput.type === 'password' ? 'text' : 'password';
        this.passwordInput.type = type;
        
        const icon = this.passwordToggle.querySelector('i');
        icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    }

    setLoading(loading) {
        this.loginBtn.disabled = loading;
        this.loginBtn.querySelector('.btn-text').style.display = loading ? 'none' : 'block';
        this.loginBtn.querySelector('.btn-loading').style.display = loading ? 'flex' : 'none';
    }

    showError(message) {
        this.errorMessage.querySelector('#errorText').textContent = message;
        this.errorMessage.style.display = 'flex';
        this.errorMessage.style.background = '#fed7d7';
        this.errorMessage.style.color = '#c53030';
        this.errorMessage.style.borderLeftColor = '#e53e3e';
    }

    showSuccess(message) {
        this.errorMessage.querySelector('#errorText').textContent = message;
        this.errorMessage.style.display = 'flex';
        this.errorMessage.style.background = '#c6f6d5';
        this.errorMessage.style.color = '#2f855a';
        this.errorMessage.style.borderLeftColor = '#38a169';
    }

    clearError() {
        this.errorMessage.style.display = 'none';
        this.emailInput.style.borderColor = '#e2e8f0';
    }

    saveCredentials(email, password) {
        localStorage.setItem('adminEmail', email);
        localStorage.setItem('adminPassword', password);
        localStorage.setItem('adminRemember', 'true');
    }

    clearSavedCredentials() {
        localStorage.removeItem('adminEmail');
        localStorage.removeItem('adminPassword');
        localStorage.removeItem('adminRemember');
    }

    loadSavedCredentials() {
        const remember = localStorage.getItem('adminRemember');
        if (remember === 'true') {
            const email = localStorage.getItem('adminEmail');
            const password = localStorage.getItem('adminPassword');
            
            if (email && password) {
                this.emailInput.value = email;
                this.passwordInput.value = password;
                this.rememberMe.checked = true;
            }
        }
    }
}

// Initialize the admin login when the page loads
document.addEventListener('DOMContentLoaded', () => {
    try {
        new AdminLogin();
    } catch (error) {
        console.error('Error initializing AdminLogin:', error);
        // Fallback: enable all form elements
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.disabled = false;
            input.readOnly = false;
        });
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.disabled = false;
        });
    }
});

// Add some visual feedback for form interactions
document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('input');
    
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', () => {
            input.parentElement.style.transform = 'scale(1)';
        });
    });
});
