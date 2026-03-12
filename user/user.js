// =====================
// USER MODULE
// =====================

// User dropdown functionality
function setupUserDropdown() {
  const userIcon = document.getElementById("userIcon");
  const userDropdown = document.getElementById("userDropdown");
  const userMenuContainer = document.querySelector(".user-menu-container");

  if (!userMenuContainer || !userDropdown) return;

  // Show dropdown on hover
  userMenuContainer.addEventListener("mouseenter", () => {
    userDropdown.classList.add("active");
  });

  // Hide dropdown when mouse leaves
  userMenuContainer.addEventListener("mouseleave", () => {
    userDropdown.classList.remove("active");
  });

  // Keep click functionality as fallback
  if (userIcon) {
    userIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle("active");
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener("click", () => {
    userDropdown.classList.remove("active");
  });
}

// Login button
function setupLoginButton() {
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      if (window.modalFunctions) {
        window.modalFunctions.closeAllModals();
        window.modalFunctions.openModal(window.modalFunctions.modals.login);
      }
    });
  }
}

// Signup button
function setupSignupButton() {
  const signupBtn = document.getElementById("signupBtn");
  if (signupBtn) {
    signupBtn.addEventListener("click", () => {
      if (window.modalFunctions) {
        window.modalFunctions.closeAllModals();
        window.modalFunctions.openModal(window.modalFunctions.modals.signup);
      }
    });
  }
}

// Logout button
function setupLogoutButton() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (window.authFunctions) {
        window.authFunctions.logoutUser();
      } else {
        localStorage.removeItem("currentUser");
        window.location.reload();
      }
    });
  }
}

// Admin logout button
function setupAdminLogoutButton() {
  const adminLogoutBtn = document.getElementById("adminLogoutBtn");
  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener("click", () => {
      if (window.authFunctions) {
        window.authFunctions.adminLogout();
      } else {
        localStorage.setItem("isAdminLoggedIn", "false");
      }
      if (window.authFunctions) {
        window.authFunctions.updateUserUI();
      }
      window.location.reload();
    });
  }
}

// Open admin dashboard button
function setupOpenAdminButton() {
  const openAdminBtn = document.getElementById("openAdminBtn");
  if (openAdminBtn) {
    openAdminBtn.addEventListener("click", () => {
      if (window.modalFunctions) {
        window.modalFunctions.closeAllModals();
        window.modalFunctions.openModal(
          document.getElementById("adminDashboardModal"),
        );
      }
    });
  }
}

// My Orders button - Load and display user's orders
function setupMyOrdersButton() {
  const myOrdersBtn = document.getElementById("myOrdersBtn");
  if (myOrdersBtn) {
    myOrdersBtn.addEventListener("click", () => {
      loadMyOrders();
      if (window.modalFunctions) {
        window.modalFunctions.closeAllModals();
        window.modalFunctions.openModal(
          document.getElementById("myOrdersModal"),
        );
      }
    });
  }
}

// Load user's orders
function loadMyOrders() {
  const myOrdersList = document.getElementById("myOrdersList");
  if (!myOrdersList) return;

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    myOrdersList.innerHTML = "<p>Please login to view your orders.</p>";
    return;
  }

  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  // Filter orders for current user
  const userOrders = orders.filter(
    (order) => order.customerEmail === currentUser.email,
  );

  if (userOrders.length === 0) {
    myOrdersList.innerHTML = "<p>You have no orders yet.</p>";
    return;
  }

  // Sort orders by date (newest first)
  userOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Build the HTML for each order card
  const ordersHTML = userOrders
    .map((order) => {
      // Build shipping address HTML if available
      let shippingAddressHTML = "";
      if (order.shippingAddress) {
        const addr = order.shippingAddress;
        shippingAddressHTML = `
                <div>
                    <span class="order-detail-label">Shipping:</span>
                    <span>${addr.name} (${addr.phone})</span><br>
                    <span style="margin-left: 70px;">${addr.street}, ${addr.barangay}</span><br>
                    <span style="margin-left: 70px;">${addr.city}, ${addr.province} ${addr.postal}</span>
                </div>
            `;
      }

      return `
        <div class="order-card">
            <div class="order-header">
                <span class="order-id">Order #${order.id}</span>
                <span class="order-status ${order.status || "pending"}">${order.status || "Pending"}</span>
            </div>
            <div class="order-details">
                <div>
                    <span class="order-detail-label">Date:</span>
                    <span>${new Date(order.date).toLocaleDateString()}</span>
                </div>
                <div>
                    <span class="order-detail-label">Total:</span>
                    <span>₱${order.total.toFixed(2)}</span>
                </div>
                ${shippingAddressHTML}
            </div>
            <div class="order-items">
                <span class="order-detail-label">Items:</span>
                <ul>
                    ${order.items
                      .map(
                        (item) => `
                        <li>${item.name} x${item.quantity} - ₱${(item.price * item.quantity).toFixed(2)}</li>
                    `,
                      )
                      .join("")}
                </ul>
            </div>
        </div>
    `;
    })
    .join("");

  // Wrap in vertical scroll container
  myOrdersList.innerHTML = `<div class="my-orders-container">${ordersHTML}</div>`;
}

// Export functions
window.userFunctions = {
  setupUserDropdown,
  setupLoginButton,
  setupSignupButton,
  setupLogoutButton,
  setupAdminLogoutButton,
  setupOpenAdminButton,
  setupMyOrdersButton,
  loadMyOrders,
};

// Initialize all user functions when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  if (window.userFunctions) {
    window.userFunctions.setupUserDropdown();
    window.userFunctions.setupLoginButton();
    window.userFunctions.setupSignupButton();
    window.userFunctions.setupLogoutButton();
    window.userFunctions.setupAdminLogoutButton();
    window.userFunctions.setupOpenAdminButton();
    window.userFunctions.setupMyOrdersButton();
  }
});
