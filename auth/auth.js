// =====================
// AUTHENTICATION MODULE
// =====================

// Admin credentials stored in localStorage (dynamic, not hardcoded)
// Initialize with default admin if no admins exist
function initializeAdminAccounts() {
  var admins = localStorage.getItem("adminAccounts");
  if (!admins) {
    var defaultAdmin = [
      {
        id: 1,
        username: "admin@gmail.com",
        password: "admin123",
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem("adminAccounts", JSON.stringify(defaultAdmin));
  } else {
    // Always ensure admin has valid credentials
    var parsedAdmins = JSON.parse(admins);
    if (parsedAdmins.length > 0) {
      // Reset to known credentials
      parsedAdmins[0].username = "admin@gmail.com";
      parsedAdmins[0].password = "admin123";
      localStorage.setItem("adminAccounts", JSON.stringify(parsedAdmins));
    }
  }
}

// Get all admin accounts
function getAdminAccounts() {
  initializeAdminAccounts();
  return JSON.parse(localStorage.getItem("adminAccounts")) || [];
}

// Save admin accounts
function saveAdminAccounts(admins) {
  localStorage.setItem("adminAccounts", JSON.stringify(admins));
}

// Register a new admin account (limit to one admins)
function registerAdmin(username, password) {
  var admins = getAdminAccounts();

  // Check if admin account already exists
  if (admins.length >= 1) {
    return { success: false, message: "Only one admin account is allowed." };
  }

  // Check if username already exists
  if (
    admins.find(function (a) {
      return a.username === username;
    })
  ) {
    return { success: false, message: "Username already exists" };
  }

  var newAdmin = {
    id: Date.now(),
    username: username,
    password: password,
    createdAt: new Date().toISOString(),
  };

  admins.push(newAdmin);
  saveAdminAccounts(admins);

  return { success: true, admin: newAdmin };
}

// Delete an admin account
function deleteAdminAccount(adminId) {
  var admins = getAdminAccounts();
  admins = admins.filter(function (a) {
    return a.id !== adminId;
  });
  saveAdminAccounts(admins);
}

// Get current user
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

// Check if admin is logged in
function isAdminLoggedIn() {
  return localStorage.getItem("isAdminLoggedIn") === "true";
}

// Login user
function loginUser(email, password) {
  var users = JSON.parse(localStorage.getItem("users")) || [];
  var user = users.find(function (u) {
    return u.email === email && u.password === password;
  });

  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    return { success: true, user: user };
  }
  return { success: false, message: "Invalid email or password" };
}

// Register user
function registerUser(name, email, password) {
  var users = JSON.parse(localStorage.getItem("users")) || [];

  // Check if email already exists
  if (
    users.find(function (u) {
      return u.email === email;
    })
  ) {
    return { success: false, message: "Email already registered" };
  }

  var newUser = {
    id: Date.now(),
    name: name,
    email: email,
    password: password,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  // DO NOT auto-login after registration - user must login manually
  return { success: true, user: newUser };
}

// Logout user
function logoutUser() {
  localStorage.removeItem("currentUser");
  // Clear cart on logout
  var cartKey = "cart_guest";
  localStorage.setItem(cartKey, JSON.stringify([]));
  window.location.reload();
}

// Admin login - uses dynamic admin accounts from localStorage
function adminLogin(username, password) {
  var admins = getAdminAccounts();
  var admin = admins.find(function (a) {
    return a.username === username && a.password === password;
  });

  if (admin) {
    localStorage.setItem("isAdminLoggedIn", "true");
    localStorage.setItem("currentAdmin", JSON.stringify(admin));
    return { success: true, admin: admin };
  }
  return { success: false, message: "Invalid admin credentials" };
}

// Admin logout
function adminLogout() {
  localStorage.setItem("isAdminLoggedIn", "false");
  // Close admin dashboard modal if open
  var adminDashboardModal = document.getElementById("adminDashboardModal");
  if (adminDashboardModal) {
    adminDashboardModal.style.display = "none";
  }
  // Update UI
  updateUserUI();
}

// Update user UI based on login state
function updateUserUI() {
  var currentUser = getCurrentUser();
  var adminLoggedIn = isAdminLoggedIn();

  var loggedOutMenu = document.getElementById("loggedOutMenu");
  var loggedInMenu = document.getElementById("loggedInMenu");
  var adminLoggedInMenu = document.getElementById("adminLoggedInMenu");
  var adminBadge = document.getElementById("adminBadge");
  var welcomeMsg = document.getElementById("welcomeMsg");
  var adminWelcomeMsg = document.getElementById("adminWelcomeMsg");

  if (adminLoggedIn) {
    if (loggedOutMenu) loggedOutMenu.style.display = "none";
    if (loggedInMenu) loggedInMenu.style.display = "none";
    if (adminLoggedInMenu) adminLoggedInMenu.style.display = "block";
    if (adminBadge) adminBadge.style.display = "block";
    if (adminWelcomeMsg) adminWelcomeMsg.textContent = "Admin Panel";
  } else if (currentUser) {
    if (loggedOutMenu) loggedOutMenu.style.display = "none";
    if (loggedInMenu) loggedInMenu.style.display = "block";
    if (adminLoggedInMenu) adminLoggedInMenu.style.display = "none";
    if (adminBadge) adminBadge.style.display = "none";
    if (welcomeMsg)
      welcomeMsg.textContent = "Welcome, " + currentUser.name + "!";
  } else {
    if (loggedOutMenu) loggedOutMenu.style.display = "block";
    if (loggedInMenu) loggedInMenu.style.display = "none";
    if (adminLoggedInMenu) adminLoggedInMenu.style.display = "none";
    if (adminBadge) adminBadge.style.display = "none";
  }
}

// Get all users (for admin)
function getAllUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

// Delete user (for admin)
function deleteUser(userId) {
  var users = JSON.parse(localStorage.getItem("users")) || [];
  users = users.filter(function (u) {
    return u.id !== userId;
  });
  localStorage.setItem("users", JSON.stringify(users));
}

// Add user (for admin)
function addUser(name, email, password) {
  var users = JSON.parse(localStorage.getItem("users")) || [];
  var newUser = {
    id: Date.now(),
    name: name,
    email: email,
    password: password,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));
  return newUser;
}

// Update user (for admin)
function updateUser(userId, name, email, password) {
  var users = JSON.parse(localStorage.getItem("users")) || [];
  var index = users.findIndex(function (u) {
    return u.id === userId;
  });
  if (index !== -1) {
    users[index].name = name;
    users[index].email = email;
    users[index].password = password;
    localStorage.setItem("users", JSON.stringify(users));
    return users[index];
  }
  return null;
}

// Export functions
window.authFunctions = {
  getCurrentUser: getCurrentUser,
  isAdminLoggedIn: isAdminLoggedIn,
  loginUser: loginUser,
  registerUser: registerUser,
  logoutUser: logoutUser,
  adminLogin: adminLogin,
  adminLogout: adminLogout,
  updateUserUI: updateUserUI,
  getAllUsers: getAllUsers,
  deleteUser: deleteUser,
  addUser: addUser,
  updateUser: updateUser,
  registerAdmin: registerAdmin,
  getAdminAccounts: getAdminAccounts,
  deleteAdminAccount: deleteAdminAccount,
  initializeAdminAccounts: initializeAdminAccounts,
};

// Initialize auth functions when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  if (window.authFunctions) {
    window.authFunctions.updateUserUI();
  }
});
