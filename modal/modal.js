// =====================
// MODAL MODULE
// =====================

const modals = {
    login: document.getElementById('loginModal'),
    signup: document.getElementById('signupModal'),
    adminLogin: document.getElementById('adminLoginModal'),
    adminDashboard: document.getElementById('adminDashboardModal'),
    myOrders: document.getElementById('myOrdersModal'),
    terms: document.getElementById('termsModal')
};

// Track which checkbox triggered the terms modal
let currentTermsCheckbox = null;

function openModal(modal) {
    if (modal) modal.style.display = 'block';
}

function closeModal(modal) {
    if (modal) modal.style.display = 'none';
}

function closeAllModals() {
    Object.values(modals).forEach(modal => closeModal(modal));
}

// Open terms modal from a specific checkbox
function openTermsModal(checkboxElement) {
    currentTermsCheckbox = checkboxElement;
    openModal(modals.terms);
}

// Accept terms and check the checkbox
function acceptTerms() {
    if (currentTermsCheckbox) {
        currentTermsCheckbox.checked = true;
    }
    closeModal(modals.terms);
}

// Modal event listeners
function setupModalListeners() {
    // Close modal buttons
    const closeLogin = document.getElementById('closeLogin');
    const closeSignup = document.getElementById('closeSignup');
    const closeAdminLogin = document.getElementById('closeAdminLogin');
    const closeAdminDashboard = document.getElementById('closeAdminDashboard');
    const closeMyOrders = document.getElementById('closeMyOrders');
    const closeTerms = document.getElementById('closeTerms');
    
    if (closeLogin) closeLogin.addEventListener('click', () => closeModal(modals.login));
    if (closeSignup) closeSignup.addEventListener('click', () => closeModal(modals.signup));
    if (closeAdminLogin) closeAdminLogin.addEventListener('click', () => closeModal(modals.adminLogin));
    if (closeAdminDashboard) closeAdminDashboard.addEventListener('click', () => closeModal(modals.adminDashboard));
    if (closeMyOrders) closeMyOrders.addEventListener('click', () => closeModal(modals.myOrders));
    if (closeTerms) closeTerms.addEventListener('click', () => closeModal(modals.terms));
    
    // Close modal when clicking outside
    Object.entries(modals).forEach(([name, modal]) => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal(modal);
                }
            });
        }
    });
    
    // Switch between login and signup
    const goToSignup = document.getElementById('goToSignup');
    const goToLogin = document.getElementById('goToLogin');
    
    if (goToSignup) {
        goToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal(modals.login);
            openModal(modals.signup);
        });
    }
    
    if (goToLogin) {
        goToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal(modals.signup);
            openModal(modals.login);
        });
    }
    
    // Terms and Conditions links
    const loginTermsLink = document.getElementById('loginTermsLink');
    const signupTermsLink = document.getElementById('signupTermsLink');
    const adminLoginTermsLink = document.getElementById('adminLoginTermsLink');
    const adminRegisterTermsLink = document.getElementById('adminRegisterTermsLink');
    
    if (loginTermsLink) {
        loginTermsLink.addEventListener('click', (e) => {
            e.preventDefault();
            const checkbox = document.getElementById('loginTerms');
            openTermsModal(checkbox);
        });
    }
    
    if (signupTermsLink) {
        signupTermsLink.addEventListener('click', (e) => {
            e.preventDefault();
            const checkbox = document.getElementById('signupTerms');
            openTermsModal(checkbox);
        });
    }
    
    if (adminLoginTermsLink) {
        adminLoginTermsLink.addEventListener('click', (e) => {
            e.preventDefault();
            const checkbox = document.getElementById('adminLoginTerms');
            openTermsModal(checkbox);
        });
    }
    
    if (adminRegisterTermsLink) {
        adminRegisterTermsLink.addEventListener('click', (e) => {
            e.preventDefault();
            const checkbox = document.getElementById('adminRegisterTerms');
            openTermsModal(checkbox);
        });
    }
    
    // Accept terms button
    const acceptTermsBtn = document.getElementById('acceptTermsBtn');
    if (acceptTermsBtn) {
        acceptTermsBtn.addEventListener('click', acceptTerms);
    }
}

// Export functions
window.modalFunctions = {
    modals,
    openModal,
    closeModal,
    closeAllModals,
    setupModalListeners,
    openTermsModal,
    acceptTerms
};

// Initialize modal functions when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (window.modalFunctions) {
        window.modalFunctions.setupModalListeners();
    }
});
