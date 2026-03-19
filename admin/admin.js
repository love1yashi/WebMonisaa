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

// Modal-based prompt/confirm helpers (replaces browser prompt/confirm)
let _modalResolver = null;

function _showOverlay(show, overlayId = "adminModalsOverlay") {
  const overlay = document.getElementById(overlayId);
  if (overlay) overlay.style.display = show ? "flex" : "none";
}

function _closeModalOverlay(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = "none";
  _showOverlay(false, "adminModalsOverlay");
}

function openInputModal({ title = "Input", label = "Value", value = "", type = "text", placeholder = "" } = {}) {
  return new Promise((resolve) => {
    const modal = document.getElementById("inputModal");
    if (!modal) return resolve(null);

    const titleEl = document.getElementById("inputModalTitle");
    const labelEl = document.getElementById("inputModalLabel");
    const inputEl = document.getElementById("inputModalField");
    const okBtn = document.getElementById("inputModalOk");
    const cancelBtn = document.getElementById("inputModalCancel");

    titleEl.textContent = title;
    labelEl.textContent = label;
    inputEl.type = type;
    inputEl.value = value || "";
    inputEl.placeholder = placeholder || "";

    const cleanup = (result) => {
      modal.style.display = "none";
      _showOverlay(false, "inputConfirmOverlay");
      okBtn.removeEventListener("click", onOk);
      cancelBtn.removeEventListener("click", onCancel);
      inputEl.removeEventListener("keyup", onKeyUp);
      _modalResolver = null;
      resolve(result);
    };

    const onOk = () => cleanup(inputEl.value.trim() === "" ? null : inputEl.value);
    const onCancel = () => cleanup(null);
    const onKeyUp = (e) => {
      if (e.key === "Enter") onOk();
      if (e.key === "Escape") onCancel();
    };

    okBtn.addEventListener("click", onOk);
    cancelBtn.addEventListener("click", onCancel);
    inputEl.addEventListener("keyup", onKeyUp);

    _showOverlay(true, "inputConfirmOverlay");
    modal.style.display = "block";
    inputEl.focus();
    inputEl.select();

    _modalResolver = cleanup;
  });
}

function closeInputModal() {
  if (_modalResolver) {
    _modalResolver(null);
  }
}

function openConfirmModal(message = "Are you sure?") {
  return new Promise((resolve) => {
    const modal = document.getElementById("confirmModal");
    if (!modal) return resolve(false);

    const messageEl = document.getElementById("confirmModalMessage");
    const okBtn = document.getElementById("confirmModalOk");
    const cancelBtn = document.getElementById("confirmModalCancel");

    messageEl.textContent = message;

    const cleanup = (result) => {
      modal.style.display = "none";
      _showOverlay(false, "inputConfirmOverlay");
      okBtn.removeEventListener("click", onOk);
      cancelBtn.removeEventListener("click", onCancel);
      _modalResolver = null;
      resolve(result);
    };

    const onOk = () => cleanup(true);
    const onCancel = () => cleanup(false);

    okBtn.addEventListener("click", onOk);
    cancelBtn.addEventListener("click", onCancel);

    _showOverlay(true, "inputConfirmOverlay");
    modal.style.display = "block";

    _modalResolver = cleanup;
  });
}

function closeConfirmModal() {
  if (_modalResolver) {
    _modalResolver(false);
  }
}

window.openInputModal = openInputModal;
window.openConfirmModal = openConfirmModal;
window.closeInputModal = closeInputModal;
window.closeConfirmModal = closeConfirmModal;

// Open admin form modals in grid overlay
function openAdminModal(modalId) {
  const overlay = document.getElementById("adminModalsOverlay");
  const modal = document.getElementById(modalId);
  if (overlay && modal) {
    overlay.style.display = "flex";
    modal.style.display = "block";
  }
}

function closeAdminModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = "none";
  
  // Check if any modal is still visible
  const overlay = document.getElementById("adminModalsOverlay");
  if (overlay) {
    const visibleModals = overlay.querySelectorAll(".admin-modal-content[style*='display: block']");
    if (visibleModals.length === 0) {
      overlay.style.display = "none";
    }
  }
}

window.openAdminModal = openAdminModal;
window.closeAdminModal = closeAdminModal;

// Edit admin username
window.editAdminUsername = async function () {
  const currentAdmin = JSON.parse(localStorage.getItem("currentAdmin"));
  const admins = JSON.parse(localStorage.getItem("adminAccounts")) || [];

  const adminId = currentAdmin
    ? currentAdmin.id
    : admins.length > 0
      ? admins[0].id
      : null;
  if (!adminId) return;

  const admin = admins.find((a) => a.id === adminId);
  const newUsername = await openInputModal({
    title: "Update Username",
    label: "New username",
    value: admin ? admin.username : "",
    placeholder: "Enter username",
  });

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
window.editAdminPassword = async function () {
  const currentAdmin = JSON.parse(localStorage.getItem("currentAdmin"));
  const admins = JSON.parse(localStorage.getItem("adminAccounts")) || [];

  const adminId = currentAdmin
    ? currentAdmin.id
    : admins.length > 0
      ? admins[0].id
      : null;
  if (!adminId) return;

  const newPassword = await openInputModal({
    title: "Change Password",
    label: "New password",
    type: "password",
    placeholder: "Enter new password",
  });

  if (!newPassword) return;

  const confirmPassword = await openInputModal({
    title: "Change Password",
    label: "Confirm password",
    type: "password",
    placeholder: "Re-enter new password",
  });

  if (!confirmPassword) return;

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
window.deleteUser = async function (userId) {
  const confirmed = await openConfirmModal("Are you sure you want to delete this user?");
  if (!confirmed) return;

  let users = JSON.parse(localStorage.getItem("users")) || [];
  users = users.filter((u) => u.id !== userId);
  localStorage.setItem("users", JSON.stringify(users));
  loadUsers();
};

// Edit user
window.editUser = async function (userId) {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find((u) => u.id === userId);
  if (user) {
    const newName = await openInputModal({
      title: "Edit User",
      label: "New name",
      value: user.name,
      placeholder: "Enter user name",
    });

    if (!newName) return;

    const newEmail = await openInputModal({
      title: "Edit User",
      label: "New email",
      value: user.email,
      placeholder: "Enter user email",
      type: "email",
    });

    if (!newEmail) return;

    const index = users.findIndex((u) => u.id === userId);
    users[index] = { ...users[index], name: newName, email: newEmail };
    localStorage.setItem("users", JSON.stringify(users));
    loadUsers();
  }
};

function setupAddUserBtn() {
  const addUserBtn = document.getElementById("addUserBtn");
  if (addUserBtn) {
    addUserBtn.addEventListener("click", () => {
      // Clear form
      document.getElementById("addUserForm").reset();
      // Open modal with all fields visible
      openAdminModal("addUserModal");
    });
  }

  // Handle Add User Form Submission
  const addUserForm = document.getElementById("addUserForm");
  if (addUserForm) {
    addUserForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const name = document.getElementById("userName").value.trim();
      const email = document.getElementById("userEmail").value.trim();
      const password = document.getElementById("userPassword").value.trim();

      if (!name || !email || !password) {
        alert("All fields are required!");
        return;
      }

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
      
      closeAdminModal("addUserModal");
      alert("User added successfully!");
      loadUsers();
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
window.deleteProduct = async function (productId) {
  const confirmed = await openConfirmModal("Are you sure you want to delete this product?");
  if (!confirmed) return;

  let products = JSON.parse(localStorage.getItem("products")) || [];
  products = products.filter((p) => p.id !== productId);
  localStorage.setItem("products", JSON.stringify(products));
  loadProducts();
};

// Edit product
window.editProduct = async function (productId) {
  const products = JSON.parse(localStorage.getItem("products")) || [];
  const product = products.find((p) => p.id === productId);
  if (product) {
    const newName = await openInputModal({
      title: "Edit Product",
      label: "Product name",
      value: product.name,
      placeholder: "Enter product name",
    });
    if (!newName) return;

    const newPrice = await openInputModal({
      title: "Edit Product",
      label: "Product price",
      value: product.price,
      placeholder: "Enter product price",
      type: "number",
    });
    if (!newPrice) return;

    const newStock = await openInputModal({
      title: "Edit Product",
      label: "Product stock",
      value: product.stock,
      placeholder: "Enter product stock",
      type: "number",
    });
    if (!newStock) return;

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
};

function setupAddProductBtn() {
  const addProductBtn = document.getElementById("addProductBtn");
  if (addProductBtn) {
    addProductBtn.addEventListener("click", () => {
      // Clear form
      document.getElementById("addProductForm").reset();
      // Open modal with all fields visible
      openAdminModal("addProductModal");
    });
  }

  // Handle Add Product Form Submission
  const addProductForm = document.getElementById("addProductForm");
  if (addProductForm) {
    addProductForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const name = document.getElementById("productName").value.trim();
      const price = document.getElementById("productPrice").value.trim();
      const category = document.getElementById("productCategory").value.trim();
      const stock = document.getElementById("productStock").value.trim();

      if (!name || !price || !category || !stock) {
        alert("All fields are required!");
        return;
      }

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
      
      closeAdminModal("addProductModal");
      alert("Product added successfully!");
      loadProducts();
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
window.deleteCategory = async function (categoryId) {
  const confirmed = await openConfirmModal("Are you sure you want to delete this category?");
  if (!confirmed) return;

  let categories = JSON.parse(localStorage.getItem("categories")) || [];
  categories = categories.filter((c) => c.id !== categoryId);
  localStorage.setItem("categories", JSON.stringify(categories));
  loadCategories();
};

// Edit category
window.editCategory = async function (categoryId) {
  const categories = JSON.parse(localStorage.getItem("categories")) || [];
  const category = categories.find((c) => c.id === categoryId);
  if (category) {
    const newName = await openInputModal({
      title: "Edit Category",
      label: "Category name",
      value: category.name,
      placeholder: "Enter category name",
    });
    if (!newName) return;

    const newDesc = await openInputModal({
      title: "Edit Category",
      label: "Category description",
      value: category.description,
      placeholder: "Enter category description",
    });
    if (newDesc === null) return;

    const index = categories.findIndex((c) => c.id === categoryId);
    categories[index] = {
      ...categories[index],
      name: newName,
      description: newDesc,
    };
    localStorage.setItem("categories", JSON.stringify(categories));
    loadCategories();
  }
};

function setupAddCategoryBtn() {
  const addCategoryBtn = document.getElementById("addCategoryBtn");
  if (addCategoryBtn) {
    addCategoryBtn.addEventListener("click", async () => {
      const name = await openInputModal({
        title: "New Category",
        label: "Category name",
        placeholder: "Enter category name",
      });
      if (!name) return;

      const description = await openInputModal({
        title: "New Category",
        label: "Category description",
        placeholder: "Enter category description",
      });
      if (description === null) return;

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
window.deleteSupplier = async function (supplierId) {
  const confirmed = await openConfirmModal("Are you sure you want to delete this supplier?");
  if (!confirmed) return;

  let suppliers = JSON.parse(localStorage.getItem("suppliers")) || [];
  suppliers = suppliers.filter((s) => s.id !== supplierId);
  localStorage.setItem("suppliers", JSON.stringify(suppliers));
  loadSuppliers();
};

// Edit supplier
window.editSupplier = async function (supplierId) {
  const suppliers = JSON.parse(localStorage.getItem("suppliers")) || [];
  const supplier = suppliers.find((s) => s.id === supplierId);
  if (supplier) {
    const newName = await openInputModal({
      title: "Edit Supplier",
      label: "Supplier name",
      value: supplier.name,
      placeholder: "Enter supplier name",
    });
    if (!newName) return;

    const newContact = await openInputModal({
      title: "Edit Supplier",
      label: "Supplier contact",
      value: supplier.contact,
      placeholder: "Enter supplier contact",
    });
    if (newContact === null) return;

    const newEmail = await openInputModal({
      title: "Edit Supplier",
      label: "Supplier email",
      value: supplier.email,
      placeholder: "Enter supplier email",
      type: "email",
    });
    if (newEmail === null) return;

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
};

function setupAddSupplierBtn() {
  const addSupplierBtn = document.getElementById("addSupplierBtn");
  if (addSupplierBtn) {
    addSupplierBtn.addEventListener("click", async () => {
      const name = await openInputModal({
        title: "New Supplier",
        label: "Supplier name",
        placeholder: "Enter supplier name",
      });
      if (!name) return;

      const contact = await openInputModal({
        title: "New Supplier",
        label: "Supplier contact",
        placeholder: "Enter supplier contact",
      });
      if (contact === null) return;

      const email = await openInputModal({
        title: "New Supplier",
        label: "Supplier email",
        placeholder: "Enter supplier email",
        type: "email",
      });
      if (email === null) return;

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
