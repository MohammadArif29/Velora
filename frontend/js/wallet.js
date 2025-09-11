// Velora Wallet JavaScript

class Wallet {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.walletBalance = parseFloat(localStorage.getItem('walletBalance')) || 1250.00;
        this.transactions = JSON.parse(localStorage.getItem('walletTransactions')) || this.getMockTransactions();
        this.paymentMethods = JSON.parse(localStorage.getItem('paymentMethods')) || this.getMockPaymentMethods();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeTheme();
        this.updateWalletBalance();
        this.renderTransactions();
        this.renderPaymentMethods();
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

        // Amount selection
        const amountOptions = document.querySelectorAll('.amount-option');
        amountOptions.forEach(option => {
            option.addEventListener('click', () => this.selectAmount(option));
        });

        // Custom amount input
        const customAmount = document.getElementById('customAmount');
        if (customAmount) {
            customAmount.addEventListener('input', () => this.handleCustomAmount());
        }

        // Withdraw method selection
        const withdrawMethod = document.getElementById('withdrawMethod');
        if (withdrawMethod) {
            withdrawMethod.addEventListener('change', () => this.toggleWithdrawDetails());
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

    updateWalletBalance() {
        const balanceElement = document.getElementById('walletBalance');
        if (balanceElement) {
            balanceElement.textContent = this.walletBalance.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }
    }

    getMockTransactions() {
        return [
            {
                id: 1,
                type: 'credit',
                title: 'Ride Payment',
                description: 'Payment for ride to Tirupati Railway Station',
                amount: 118.00,
                time: '2 hours ago',
                icon: 'fas fa-car'
            },
            {
                id: 2,
                type: 'credit',
                title: 'Wallet Top-up',
                description: 'Added money via UPI',
                amount: 500.00,
                time: '1 day ago',
                icon: 'fas fa-plus'
            },
            {
                id: 3,
                type: 'debit',
                title: 'Ride Payment',
                description: 'Payment for ride to SV Shopping Mall',
                amount: 95.00,
                time: '2 days ago',
                icon: 'fas fa-car'
            },
            {
                id: 4,
                type: 'credit',
                title: 'Referral Bonus',
                description: 'Bonus for referring a friend',
                amount: 100.00,
                time: '3 days ago',
                icon: 'fas fa-gift'
            },
            {
                id: 5,
                type: 'debit',
                title: 'Ride Payment',
                description: 'Payment for ride to Cinepolis Mall',
                amount: 105.00,
                time: '5 days ago',
                icon: 'fas fa-car'
            }
        ];
    }

    getMockPaymentMethods() {
        return [
            {
                id: 1,
                type: 'upi',
                name: 'Google Pay',
                info: '****1234',
                icon: 'fab fa-google-pay'
            },
            {
                id: 2,
                type: 'card',
                name: 'HDFC Credit Card',
                info: '****5678',
                icon: 'fas fa-credit-card'
            },
            {
                id: 3,
                type: 'bank',
                name: 'SBI Bank Account',
                info: '****9012',
                icon: 'fas fa-university'
            }
        ];
    }

    renderTransactions() {
        const transactionsList = document.getElementById('transactionsList');
        if (!transactionsList) return;

        const recentTransactions = this.transactions.slice(0, 5);
        
        transactionsList.innerHTML = recentTransactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-icon ${transaction.type}">
                    <i class="${transaction.icon}"></i>
                </div>
                <div class="transaction-details">
                    <div class="transaction-title">${transaction.title}</div>
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-time">${transaction.time}</div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'credit' ? '+' : '-'}₹${transaction.amount.toFixed(2)}
                </div>
            </div>
        `).join('');
    }

    renderPaymentMethods() {
        const paymentMethodsList = document.getElementById('paymentMethodsList');
        if (!paymentMethodsList) return;

        paymentMethodsList.innerHTML = this.paymentMethods.map(method => `
            <div class="payment-method-item">
                <div class="payment-method-icon ${method.type}">
                    <i class="${method.icon}"></i>
                </div>
                <div class="payment-method-details">
                    <div class="payment-method-name">${method.name}</div>
                    <div class="payment-method-info">${method.info}</div>
                </div>
                <div class="payment-method-actions">
                    <button class="method-action-btn" onclick="editPaymentMethod(${method.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="method-action-btn" onclick="deletePaymentMethod(${method.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    selectAmount(option) {
        // Remove selected class from all options
        document.querySelectorAll('.amount-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Add selected class to clicked option
        option.classList.add('selected');
        
        // Clear custom amount input
        const customAmount = document.getElementById('customAmount');
        if (customAmount) {
            customAmount.value = '';
        }
    }

    handleCustomAmount() {
        const customAmount = document.getElementById('customAmount');
        if (!customAmount) return;

        // Remove selected class from all amount options
        document.querySelectorAll('.amount-option').forEach(opt => {
            opt.classList.remove('selected');
        });

        // Validate custom amount
        const amount = parseFloat(customAmount.value);
        if (amount < 10) {
            customAmount.value = '';
            this.showNotification('Minimum amount is ₹10', 'warning');
        } else if (amount > 50000) {
            customAmount.value = '50000';
            this.showNotification('Maximum amount is ₹50,000', 'warning');
        }
    }

    toggleWithdrawDetails() {
        const withdrawMethod = document.getElementById('withdrawMethod');
        const bankDetails = document.getElementById('bankDetails');
        const upiDetails = document.getElementById('upiDetails');
        
        if (!withdrawMethod || !bankDetails || !upiDetails) return;

        if (withdrawMethod.value === 'bank') {
            bankDetails.style.display = 'block';
            upiDetails.style.display = 'none';
        } else if (withdrawMethod.value === 'upi') {
            bankDetails.style.display = 'none';
            upiDetails.style.display = 'block';
        }
    }

    addTransaction(type, title, description, amount) {
        const transaction = {
            id: Date.now(),
            type,
            title,
            description,
            amount: parseFloat(amount),
            time: 'Just now',
            icon: type === 'credit' ? 'fas fa-plus' : 'fas fa-minus'
        };

        this.transactions.unshift(transaction);
        localStorage.setItem('walletTransactions', JSON.stringify(this.transactions));
        this.renderTransactions();
    }

    updateBalance(amount, type) {
        if (type === 'credit') {
            this.walletBalance += amount;
        } else if (type === 'debit') {
            this.walletBalance -= amount;
        }

        localStorage.setItem('walletBalance', this.walletBalance.toString());
        this.updateWalletBalance();
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

function showSettings() {
    alert('Settings feature coming soon!');
}

function addMoney() {
    document.getElementById('addMoneyModal').classList.add('active');
    loadPaymentOptions();
}

function closeAddMoneyModal() {
    document.getElementById('addMoneyModal').classList.remove('active');
    // Reset form
    document.querySelectorAll('.amount-option').forEach(opt => opt.classList.remove('selected'));
    document.getElementById('customAmount').value = '';
}

function withdrawMoney() {
    document.getElementById('withdrawModal').classList.add('active');
}

function closeWithdrawModal() {
    document.getElementById('withdrawModal').classList.remove('active');
    // Reset form
    document.getElementById('withdrawAmount').value = '';
    document.getElementById('accountNumber').value = '';
    document.getElementById('upiId').value = '';
}

function loadPaymentOptions() {
    const paymentOptions = document.getElementById('paymentOptions');
    if (!paymentOptions) return;

    const methods = window.walletInstance?.paymentMethods || [];
    
    paymentOptions.innerHTML = methods.map(method => `
        <div class="payment-option" onclick="selectPaymentMethod(${method.id})">
            <div class="payment-option-icon ${method.type}">
                <i class="${method.icon}"></i>
            </div>
            <div class="payment-option-details">
                <div class="payment-option-name">${method.name}</div>
                <div class="payment-option-info">${method.info}</div>
            </div>
        </div>
    `).join('');
}

function selectPaymentMethod(methodId) {
    // Remove selected class from all options
    document.querySelectorAll('.payment-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Add selected class to clicked option
    event.currentTarget.classList.add('selected');
}

function processPayment() {
    const selectedAmount = getSelectedAmount();
    if (!selectedAmount || selectedAmount < 10) {
        window.walletInstance?.showNotification('Please select a valid amount', 'warning');
        return;
    }

    // Simulate payment processing
    setTimeout(() => {
        window.walletInstance?.updateBalance(selectedAmount, 'credit');
        window.walletInstance?.addTransaction('credit', 'Wallet Top-up', 'Added money via UPI', selectedAmount);
        window.walletInstance?.showNotification(`₹${selectedAmount} added to wallet successfully!`, 'success');
        closeAddMoneyModal();
    }, 2000);

    // Show processing state
    window.walletInstance?.showNotification('Processing payment...', 'info');
}

function getSelectedAmount() {
    const selectedOption = document.querySelector('.amount-option.selected');
    if (selectedOption) {
        return parseFloat(selectedOption.dataset.amount);
    }
    
    const customAmount = document.getElementById('customAmount');
    if (customAmount && customAmount.value) {
        return parseFloat(customAmount.value);
    }
    
    return null;
}

function processWithdrawal() {
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    const method = document.getElementById('withdrawMethod').value;
    
    if (!amount || amount < 10) {
        window.walletInstance?.showNotification('Please enter a valid amount', 'warning');
        return;
    }
    
    if (amount > window.walletInstance?.walletBalance) {
        window.walletInstance?.showNotification('Insufficient balance', 'error');
        return;
    }
    
    if (method === 'bank' && !document.getElementById('accountNumber').value) {
        window.walletInstance?.showNotification('Please enter account number', 'warning');
        return;
    }
    
    if (method === 'upi' && !document.getElementById('upiId').value) {
        window.walletInstance?.showNotification('Please enter UPI ID', 'warning');
        return;
    }
    
    // Simulate withdrawal processing
    setTimeout(() => {
        window.walletInstance?.updateBalance(amount, 'debit');
        window.walletInstance?.addTransaction('debit', 'Withdrawal', `Withdrawn to ${method.toUpperCase()}`, amount);
        window.walletInstance?.showNotification(`₹${amount} withdrawal initiated successfully!`, 'success');
        closeWithdrawModal();
    }, 2000);

    // Show processing state
    window.walletInstance?.showNotification('Processing withdrawal...', 'info');
}

function viewTransactions() {
    alert('Full transaction history coming soon!');
}

function viewAllTransactions() {
    alert('Full transaction history coming soon!');
}

function showPaymentMethods() {
    alert('Payment methods management coming soon!');
}

function addPaymentMethod() {
    alert('Add payment method feature coming soon!');
}

function editPaymentMethod(methodId) {
    alert(`Edit payment method ${methodId} coming soon!`);
}

function deletePaymentMethod(methodId) {
    if (confirm('Are you sure you want to delete this payment method?')) {
        const methods = window.walletInstance?.paymentMethods || [];
        window.walletInstance.paymentMethods = methods.filter(m => m.id !== methodId);
        localStorage.setItem('paymentMethods', JSON.stringify(window.walletInstance.paymentMethods));
        window.walletInstance?.renderPaymentMethods();
        window.walletInstance?.showNotification('Payment method deleted', 'success');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.walletInstance = new Wallet();
});
