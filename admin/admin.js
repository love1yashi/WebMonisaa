// =====================
// ADMIN MODULE
// =====================

// Load admin profile
function loadAdminProfile() {
  const adminUsernameDisplay = document.getElementById("adminUsernameDisplay");
  const adminCreatedAt = document.getElementById("adminCreatedAt");

  if (!adminUsernameDisplay) return;

  const currentAdmin = JSON.parse(localStorage.getItem("currentAdmin"));
  const admins = JSON.parse(localStorage.getItem("adminAccounts")) || [];

  let admin = currentAdmin || (admins.length > 0 ? admins[0] : null);

  if (admin) {
    adminUsernameDisplay.textContent = admin.username;
    if (adminCreatedAt) {
      adminCreatedAt.textContent = new Date(
        admin.createdAt,
      ).toLocaleDateString();
    }
  } else {
    adminUsernameDisplay.textContent = "No admin";
    if (adminCreatedAt) {
      adminCreatedAt.textContent = "-";
    }
  }
}

// Edit admin username
window.editAdminUsername = function () {
  const currentAdmin = JSON.parse(localStorage.getItem("currentAdmin"));
  const admins = JSON.parse(localStorage.getItem("adminAccounts")) || [];

  const adminId = currentAdmin
    ? currentAdmin.id
    : admins.length > 0
      ? admins[0].id
      : null;
  if (!adminId) return;

  const admin = admins.find((a) => a.id === adminId);
  const newUsername = prompt(
    "Enter new username:",
    admin ? admin.username : "",
  );

  if (newUsername && newUsername.trim() !== "") {
    if (admins.find((a) => a.username === newUsername && a.id !== adminId)) {
      alert("Username already exists!");
      return;
    }

    const index = admins.findIndex((a) => a.id === adminId);
    if (index !== -1) {
      admins[index].username = newUsername;
      localStorage.setItem("adminAccounts", JSON.stringify(admins));

      if (currentAdmin) {
        currentAdmin.username = newUsername;
        localStorage.setItem("currentAdmin", JSON.stringify(currentAdmin));
      }

      loadAdminProfile();
      alert("Username updated successfully!");
    }
  }
};

// Edit admin password
window.editAdminPassword = function () {
  const currentAdmin = JSON.parse(localStorage.getItem("currentAdmin"));
  const admins = JSON.parse(localStorage.getItem("adminAccounts")) || [];

  const adminId = currentAdmin
    ? currentAdmin.id
    : admins.length > 0
      ? admins[0].id
      : null;
  if (!adminId) return;

  const newPassword = prompt("Enter new password:");
  const confirmPassword = prompt("Confirm new password:");

  if (!newPassword || !confirmPassword) return;

  if (newPassword !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  const index = admins.findIndex((a) => a.id === adminId);
  if (index !== -1) {
    admins[index].password = newPassword;
    localStorage.setItem("adminAccounts", JSON.stringify(admins));

    if (currentAdmin) {
      currentAdmin.password = newPassword;
      localStorage.setItem("currentAdmin", JSON.stringify(currentAdmin));
    }

    alert("Password updated successfully!");
  }
};

// Admin tab switching (for modal version)
function setupAdminTabs() {
  const adminTabs = document.querySelectorAll(".admin-tab");
  const tabsContainer = document.querySelector(".admin-tabs-scroll");

  if (!adminTabs || adminTabs.length === 0) return;

  adminTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      adminTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const tabContents = document.querySelectorAll(".admin-content");
      tabContents.forEach((content) => (content.style.display = "none"));

      const tabName = tab.getAttribute("data-tab");
      const selectedTab = document.getElementById(tabName + "Tab");
      if (selectedTab) {
        selectedTab.style.display = "block";
      }

      // Load admin profile when Admin tab is clicked
      if (tabName === "admin") {
        loadAdminProfile();
      }
    });
  });

  // Setup scroll navigation for tabs
  if (tabsContainer) {
    const scrollLeftBtn = document.createElement("button");
    scrollLeftBtn.className = "admin-tabs-nav prev";
    scrollLeftBtn.innerHTML = "&#8249;";
    scrollLeftBtn.onclick = () => {
      tabsContainer.scrollBy({ left: -150, behavior: "smooth" });
    };

    const scrollRightBtn = document.createElement("button");
    scrollRightBtn.className = "admin-tabs-nav next";
    scrollRightBtn.innerHTML = "&#8250;";
    scrollRightBtn.onclick = () => {
      tabsContainer.scrollBy({ left: 150, behavior: "smooth" });
    };

    const navContainer = document.createElement("div");
    navContainer.className = "admin-tabs-container";
    tabsContainer.parentNode.insertBefore(navContainer, tabsContainer);
    navContainer.appendChild(scrollLeftBtn);
    navContainer.appendChild(tabsContainer);
    navContainer.appendChild(scrollRightBtn);
  }
}

// Users management
function loadUsers() {
  const usersList = document.getElementById("usersList");
  if (!usersList) return;

  const users = JSON.parse(localStorage.getItem("users")) || [];

  if (users.length === 0) {
    usersList.innerHTML =
      '<tr><td colspan="5" class="empty-message">No users registered yet.</td></tr>';
    return;
  }

  usersList.innerHTML = users
    .map(
      (user) => `
        <tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editUser(${user.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteUser(${user.id})">Delete</button>
                </div>
            </td>
        </tr>
    `,
    )
    .join("");
}

// Delete user
window.deleteUser = function (userId) {
  if (confirm("Are you sure you want to delete this user?")) {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    users = users.filter((u) => u.id !== userId);
    localStorage.setItem("users", JSON.stringify(users));
    loadUsers();
  }
};

// Edit user
window.editUser = function (userId) {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find((u) => u.id === userId);
  if (user) {
    const newName = prompt("Enter new name:", user.name);
    const newEmail = prompt("Enter new email:", user.email);
    if (newName && newEmail) {
      const index = users.findIndex((u) => u.id === userId);
      users[index] = { ...users[index], name: newName, email: newEmail };
      localStorage.setItem("users", JSON.stringify(users));
      loadUsers();
    }
  }
};

function setupAddUserBtn() {
  const addUserBtn = document.getElementById("addUserBtn");
  if (addUserBtn) {
    addUserBtn.addEventListener("click", () => {
      const name = prompt("Enter user name:");
      const email = prompt("Enter user email:");
      const password = prompt("Enter user password:");

      if (name && email && password) {
        const users = JSON.parse(localStorage.getItem("users")) || [];

        if (users.find((u) => u.email === email)) {
          alert("Email already exists!");
          return;
        }

        const newUser = {
          id: Date.now(),
          name,
          email,
          password,
          createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));
        loadUsers();
      }
    });
  }
}

// Products management
function loadProducts() {
  const productsTableBody = document.getElementById("productsTableBody");
  if (!productsTableBody) return;

  const products = JSON.parse(localStorage.getItem("products")) || [];

  if (products.length === 0) {
    productsTableBody.innerHTML =
      '<tr><td colspan="6" class="empty-message">No products yet.</td></tr>';
    return;
  }

  productsTableBody.innerHTML = products
    .map(
      (product) => `
        <tr>
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>₱${product.price}</td>
            <td>${product.category || "N/A"}</td>
            <td>${product.stock || 0}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editProduct(${product.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
                </div>
            </td>
        </tr>
    `,
    )
    .join("");
}

// Delete product
window.deleteProduct = function (productId) {
  if (confirm("Are you sure you want to delete this product?")) {
    let products = JSON.parse(localStorage.getItem("products")) || [];
    products = products.filter((p) => p.id !== productId);
    localStorage.setItem("products", JSON.stringify(products));
    loadProducts();
  }
};

// Edit product
window.editProduct = function (productId) {
  const products = JSON.parse(localStorage.getItem("products")) || [];
  const product = products.find((p) => p.id === productId);
  if (product) {
    const newName = prompt("Enter product name:", product.name);
    const newPrice = prompt("Enter product price:", product.price);
    const newStock = prompt("Enter product stock:", product.stock);

    if (newName && newPrice) {
      const index = products.findIndex((p) => p.id === productId);
      products[index] = {
        ...products[index],
        name: newName,
        price: parseFloat(newPrice),
        stock: parseInt(newStock),
      };
      localStorage.setItem("products", JSON.stringify(products));
      loadProducts();
    }
  }
};

function setupAddProductBtn() {
  const addProductBtn = document.getElementById("addProductBtn");
  if (addProductBtn) {
    addProductBtn.addEventListener("click", () => {
      const name = prompt("Enter product name:");
      const price = prompt("Enter product price:");
      const category = prompt("Enter product category:");
      const stock = prompt("Enter product stock:");

      if (name && price) {
        const products = JSON.parse(localStorage.getItem("products")) || [];

        const newProduct = {
          id: Date.now(),
          name,
          price: parseFloat(price),
          category,
          stock: parseInt(stock) || 0,
        };

        products.push(newProduct);
        localStorage.setItem("products", JSON.stringify(products));
        loadProducts();
      }
    });
  }
}

// Categories management
function loadCategories() {
  const categoriesTableBody = document.getElementById("categoriesTableBody");
  if (!categoriesTableBody) return;

  const categories = JSON.parse(localStorage.getItem("categories")) || [];

  if (categories.length === 0) {
    categoriesTableBody.innerHTML =
      '<tr><td colspan="5" class="empty-message">No categories yet.</td></tr>';
    return;
  }

  categoriesTableBody.innerHTML = categories
    .map(
      (cat) => `
        <tr>
            <td>${cat.id}</td>
            <td>${cat.name}</td>
            <td>${cat.description || "N/A"}</td>
            <td>${cat.productCount || 0}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editCategory(${cat.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteCategory(${cat.id})">Delete</button>
                </div>
            </td>
        </tr>
    `,
    )
    .join("");
}

// Delete category
window.deleteCategory = function (categoryId) {
  if (confirm("Are you sure you want to delete this category?")) {
    let categories = JSON.parse(localStorage.getItem("categories")) || [];
    categories = categories.filter((c) => c.id !== categoryId);
    localStorage.setItem("categories", JSON.stringify(categories));
    loadCategories();
  }
};

// Edit category
window.editCategory = function (categoryId) {
  const categories = JSON.parse(localStorage.getItem("categories")) || [];
  const category = categories.find((c) => c.id === categoryId);
  if (category) {
    const newName = prompt("Enter category name:", category.name);
    const newDesc = prompt("Enter category description:", category.description);

    if (newName) {
      const index = categories.findIndex((c) => c.id === categoryId);
      categories[index] = {
        ...categories[index],
        name: newName,
        description: newDesc,
      };
      localStorage.setItem("categories", JSON.stringify(categories));
      loadCategories();
    }
  }
};

function setupAddCategoryBtn() {
  const addCategoryBtn = document.getElementById("addCategoryBtn");
  if (addCategoryBtn) {
    addCategoryBtn.addEventListener("click", () => {
      const name = prompt("Enter category name:");
      const description = prompt("Enter category description:");

      if (name) {
        const categories = JSON.parse(localStorage.getItem("categories")) || [];

        const newCategory = {
          id: Date.now(),
          name,
          description,
          productCount: 0,
        };

        categories.push(newCategory);
        localStorage.setItem("categories", JSON.stringify(categories));
        loadCategories();
      }
    });
  }
}

// Suppliers management
function loadSuppliers() {
  const suppliersTableBody = document.getElementById("suppliersTableBody");
  if (!suppliersTableBody) return;

  const suppliers = JSON.parse(localStorage.getItem("suppliers")) || [];

  if (suppliers.length === 0) {
    suppliersTableBody.innerHTML =
      '<tr><td colspan="6" class="empty-message">No suppliers yet.</td></tr>';
    return;
  }

  suppliersTableBody.innerHTML = suppliers
    .map(
      (supplier) => `
        <tr>
            <td>${supplier.id}</td>
            <td>${supplier.name}</td>
            <td>${supplier.contact || "N/A"}</td>
            <td>${supplier.email || "N/A"}</td>
            <td>${supplier.products || 0}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editSupplier(${supplier.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteSupplier(${supplier.id})">Delete</button>
                </div>
            </td>
        </tr>
    `,
    )
    .join("");
}

// Delete supplier
window.deleteSupplier = function (supplierId) {
  if (confirm("Are you sure you want to delete this supplier?")) {
    let suppliers = JSON.parse(localStorage.getItem("suppliers")) || [];
    suppliers = suppliers.filter((s) => s.id !== supplierId);
    localStorage.setItem("suppliers", JSON.stringify(suppliers));
    loadSuppliers();
  }
};

// Edit supplier
window.editSupplier = function (supplierId) {
  const suppliers = JSON.parse(localStorage.getItem("suppliers")) || [];
  const supplier = suppliers.find((s) => s.id === supplierId);
  if (supplier) {
    const newName = prompt("Enter supplier name:", supplier.name);
    const newContact = prompt("Enter supplier contact:", supplier.contact);
    const newEmail = prompt("Enter supplier email:", supplier.email);

    if (newName) {
      const index = suppliers.findIndex((s) => s.id === supplierId);
      suppliers[index] = {
        ...suppliers[index],
        name: newName,
        contact: newContact,
        email: newEmail,
      };
      localStorage.setItem("suppliers", JSON.stringify(suppliers));
      loadSuppliers();
    }
  }
};

function setupAddSupplierBtn() {
  const addSupplierBtn = document.getElementById("addSupplierBtn");
  if (addSupplierBtn) {
    addSupplierBtn.addEventListener("click", () => {
      const name = prompt("Enter supplier name:");
      const contact = prompt("Enter supplier contact:");
      const email = prompt("Enter supplier email:");

      if (name) {
        const suppliers = JSON.parse(localStorage.getItem("suppliers")) || [];

        const newSupplier = {
          id: Date.now(),
          name,
          contact,
          email,
          products: 0,
        };

        suppliers.push(newSupplier);
        localStorage.setItem("suppliers", JSON.stringify(suppliers));
        loadSuppliers();
      }
    });
  }
}

// Orders management
function loadOrders() {
  const ordersList = document.getElementById("ordersList");
  if (!ordersList) return;

  const orders = JSON.parse(localStorage.getItem("orders")) || [];

  if (orders.length === 0) {
    ordersList.innerHTML = '<p class="empty-message">No orders yet.</p>';
    return;
  }

  ordersList.innerHTML = orders
    .map((order) => {
      let shippingAddressHTML = "";
      if (order.shippingAddress) {
        const addr = order.shippingAddress;
        shippingAddressHTML = `
                <div class="order-detail">
                    <span class="order-detail-label">Shipping:</span>
                    <span>${addr.name} (${addr.phone})</span><br>
                    <span style="margin-left: 80px;">${addr.street}, ${addr.barangay}</span><br>
                    <span style="margin-left: 80px;">${addr.city}, ${addr.province} ${addr.postal}</span>
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
                <div class="order-detail">
                    <span class="order-detail-label">Customer:</span>
                    <span>${order.customerName}</span>
                </div>
                <div class="order-detail">
                    <span class="order-detail-label">Email:</span>
                    <span>${order.customerEmail}</span>
                </div>
                <div class="order-detail">
                    <span class="order-detail-label">Total:</span>
                    <span>₱${order.total.toFixed(2)}</span>
                </div>
                <div class="order-detail">
                    <span class="order-detail-label">Date:</span>
                    <span>${new Date(order.date).toLocaleDateString()}</span>
                </div>
                ${shippingAddressHTML}
            </div>
            <div style="margin-top: 15px;">
                <button class="btn-edit" onclick="updateOrderStatus(${order.id}, 'processing')">Mark Processing</button>
                <button class="btn-edit" onclick="updateOrderStatus(${order.id}, 'shipped')">Mark Shipped</button>
                <button class="btn-edit" onclick="updateOrderStatus(${order.id}, 'delivered')">Mark Delivered</button>
            </div>
        </div>
    `;
    })
    .join("");
}

// Update order status
window.updateOrderStatus = function (orderId, status) {
  let orders = JSON.parse(localStorage.getItem("orders")) || [];
  const index = orders.findIndex((o) => o.id === orderId);
  if (index !== -1) {
    orders[index].status = status;
    localStorage.setItem("orders", JSON.stringify(orders));
    loadOrders();
  }
};

// Initialize admin functions
function initAdmin() {
  setupAdminTabs();
  loadAdminProfile();
  loadUsers();
  loadProducts();
  loadCategories();
  loadSuppliers();
  loadOrders();
  setupAddUserBtn();
  setupAddProductBtn();
  setupAddCategoryBtn();
  setupAddSupplierBtn();
}

// Export functions
window.adminFunctions = {
  initAdmin,
  loadUsers,
  loadProducts,
  loadCategories,
  loadSuppliers,
  loadOrders,
  loadAdminProfile,
};
