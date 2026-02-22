// =====================
// MODAL MODULE
// =====================

const modals = {
    login: document.getElementById('loginModal'),
    signup: document.getElementById('signupModal'),
    adminLogin: document.getElementById('adminLoginModal'),
    adminDashboard: document.getElementById('adminDashboardModal'),
    myOrders: document.getElementById('myOrdersModal')
};

function openModal(modal) {
    if (modal) modal.style.display = 'block';
}

function closeModal(modal) {
    if (modal) modal.style.display = 'none';
}

function closeAllModals() {
    Object.values(modals).forEach(modal => closeModal(modal));
}

// Modal event listeners
function setupModalListeners() {
    // Close modal buttons
    const closeLogin = document.getElementById('closeLogin');
    const closeSignup = document.getElementById('closeSignup');
    const closeAdminLogin = document.getElementById('closeAdminLogin');
    const closeAdminDashboard = document.getElementById('closeAdminDashboard');
    const closeMyOrders = document.getElementById('closeMyOrders');
    
    if (closeLogin) closeLogin.addEventListener('click', () => closeModal(modals.login));
    if (closeSignup) closeSignup.addEventListener('click', () => closeModal(modals.signup));
    if (closeAdminLogin) closeAdminLogin.addEventListener('click', () => closeModal(modals.adminLogin));
    if (closeAdminDashboard) closeAdminDashboard.addEventListener('click', () => closeModal(modals.adminDashboard));
    if (closeMyOrders) closeMyOrders.addEventListener('click', () => closeModal(modals.myOrders));
    
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
}

// Export functions
window.modalFunctions = {
    modals,
    openModal,
    closeModal,
    closeAllModals,
    setupModalListeners
};

// Initialize modal functions when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (window.modalFunctions) {
        window.modalFunctions.setupModalListeners();
    }
});
