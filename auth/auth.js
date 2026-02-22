// =====================
// AUTHENTICATION MODULE
// =====================

// Admin credentials (in real app, this should be on server)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Get current user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Check if admin is logged in
function isAdminLoggedIn() {
    return localStorage.getItem('isAdminLoggedIn') === 'true';
}

// Login user
function loginUser(email, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { success: true, user };
    }
    return { success: false, message: 'Invalid email or password' };
}

// Register user
function registerUser(name, email, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if email already exists
    if (users.find(u => u.email === email)) {
        return { success: false, message: 'Email already registered' };
    }
    
    const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    return { success: true, user: newUser };
}

// Logout user
function logoutUser() {
    localStorage.removeItem('currentUser');
    // Clear cart on logout
    const cartKey = 'cart_guest';
    localStorage.setItem(cartKey, JSON.stringify([]));
    window.location.reload();
}

// Admin login
function adminLogin(username, password) {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        localStorage.setItem('isAdminLoggedIn', 'true');
        return { success: true };
    }
    return { success: false, message: 'Invalid admin credentials' };
}

// Admin logout
function adminLogout() {
    localStorage.setItem('isAdminLoggedIn', 'false');
    // Close admin dashboard modal if open
    const adminDashboardModal = document.getElementById('adminDashboardModal');
    if (adminDashboardModal) {
        adminDashboardModal.style.display = 'none';
    }
    // Update UI
    updateUserUI();
}

// Update user UI based on login state
function updateUserUI() {
    const currentUser = getCurrentUser();
    const adminLoggedIn = isAdminLoggedIn();
    
    const loggedOutMenu = document.getElementById('loggedOutMenu');
    const loggedInMenu = document.getElementById('loggedInMenu');
    const adminLoggedInMenu = document.getElementById('adminLoggedInMenu');
    const adminBadge = document.getElementById('adminBadge');
    const welcomeMsg = document.getElementById('welcomeMsg');
    const adminWelcomeMsg = document.getElementById('adminWelcomeMsg');
    
    if (adminLoggedIn) {
        if (loggedOutMenu) loggedOutMenu.style.display = 'none';
        if (loggedInMenu) loggedInMenu.style.display = 'none';
        if (adminLoggedInMenu) adminLoggedInMenu.style.display = 'block';
        if (adminBadge) adminBadge.style.display = 'block';
        if (adminWelcomeMsg) adminWelcomeMsg.textContent = 'Admin Panel';
    } else if (currentUser) {
        if (loggedOutMenu) loggedOutMenu.style.display = 'none';
        if (loggedInMenu) loggedInMenu.style.display = 'block';
        if (adminLoggedInMenu) adminLoggedInMenu.style.display = 'none';
        if (adminBadge) adminBadge.style.display = 'none';
        if (welcomeMsg) welcomeMsg.textContent = `Welcome, ${currentUser.name}!`;
    } else {
        if (loggedOutMenu) loggedOutMenu.style.display = 'block';
        if (loggedInMenu) loggedInMenu.style.display = 'none';
        if (adminLoggedInMenu) adminLoggedInMenu.style.display = 'none';
        if (adminBadge) adminBadge.style.display = 'none';
    }
}

// Get all users (for admin)
function getAllUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

// Delete user (for admin)
function deleteUser(userId) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    users = users.filter(u => u.id !== userId);
    localStorage.setItem('users', JSON.stringify(users));
}

// Add user (for admin)
function addUser(name, email, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    return newUser;
}

// Update user (for admin)
function updateUser(userId, name, email, password) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
        users[index] = { ...users[index], name, email, password };
        localStorage.setItem('users', JSON.stringify(users));
        return users[index];
    }
    return null;
}

// Export functions
window.authFunctions = {
    getCurrentUser,
    isAdminLoggedIn,
    loginUser,
    registerUser,
    logoutUser,
    adminLogin,
    adminLogout,
    updateUserUI,
    getAllUsers,
    deleteUser,
    addUser,
    updateUser
};

// Initialize auth functions when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (window.authFunctions) {
        window.authFunctions.updateUserUI();
    }
});
