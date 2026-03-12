// =====================
// CART MODULE (Database Version)
// =====================

const API_BASE = ""; // Same origin

// Get current user
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

function getCurrentUserEmail() {
  const currentUser = getCurrentUser();
  return currentUser ? currentUser.email : null;
}

// State
let cart = [];
let products = [];

// =====================
// CART UI ELEMENTS
// =====================
const cartSidebar = document.getElementById("cartSidebar");
const cartOverlay = document.getElementById("cartOverlay");
const cartItems = document.getElementById("cartItems");
const cartBadge = document.getElementById("cartBadge");
const cartTotal = document.getElementById("cartTotal");
const cartIcon = document.getElementById("cartIcon");
const closeCartBtn = document.getElementById("closeCart");
const checkoutBtn = document.getElementById("checkoutBtn");
const selectedTotal = document.getElementById("selectedTotal");

// =====================
// API FUNCTIONS
// =====================

// Fetch products from database
async function fetchProducts() {
  try {
    const response = await fetch(`${API_BASE}/api/products`);
    const data = await response.json();
    if (data.success) {
      products = data.products;
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

// Fetch cart from database
async function fetchCart() {
  const userEmail = getCurrentUserEmail();
  if (!userEmail) {
    cart = [];
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE}/api/cart?email=${encodeURIComponent(userEmail)}`,
    );
    const data = await response.json();
    if (data.success) {
      cart = data.items.map((item) => ({
        id: item.id,
        cartId: item.cart_id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
        selected: item.selected === 1,
      }));
    }
  } catch (error) {
    console.error("Error fetching cart:", error);
    cart = [];
  }
}

// Add to cart in database
async function addToCartDb(productId, quantity = 1) {
  const userEmail = getCurrentUserEmail();
  if (!userEmail) {
    if (typeof showToast === "function") {
      showToast("Please login to add items to cart!", "error");
    }
    return false;
  }

  try {
    const response = await fetch(`${API_BASE}/api/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userEmail, productId, quantity }),
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error adding to cart:", error);
    return false;
  }
}

// Update cart quantity in database
async function updateCartQuantityDb(cartId, quantity) {
  try {
    const response = await fetch(`${API_BASE}/api/cart/${cartId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error updating cart:", error);
    return false;
  }
}

// Remove from cart in database
async function removeFromCartDb(cartId) {
  try {
    const response = await fetch(`${API_BASE}/api/cart/${cartId}`, {
      method: "DELETE",
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error removing from cart:", error);
    return false;
  }
}

// Clear cart in database
async function clearCartDb() {
  const userEmail = getCurrentUserEmail();
  if (!userEmail) return false;

  try {
    const response = await fetch(
      `${API_BASE}/api/cart?email=${encodeURIComponent(userEmail)}`,
      {
        method: "DELETE",
      },
    );
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error clearing cart:", error);
    return false;
  }
}

// =====================
// CART UI FUNCTIONS
// =====================

// Open cart
function openCart() {
  if (cartSidebar && cartOverlay) {
    cartSidebar.classList.add("active");
    cartOverlay.classList.add("active");
  }
}

// Close cart
function closeCart() {
  if (cartSidebar && cartOverlay) {
    cartSidebar.classList.remove("active");
    cartOverlay.classList.remove("active");
  }
}

// Add to cart (UI + Database)
async function addToCart(id, name, price) {
  const success = await addToCartDb(parseInt(id), 1);

  if (success) {
    await fetchCart();
    updateCartUI();
    if (typeof showToast === "function") {
      showToast(`${name} added to cart!`, "success");
    }
  }
}

// Toggle item selection
async function toggleItemSelection(id) {
  const item = cart.find((item) => item.id === id);
  if (item) {
    item.selected = !item.selected;
    await updateCartQuantityDb(item.cartId, item.quantity);
    updateCartUI();
  }
}

// Select all items
async function selectAllItems(selectAll) {
  for (const item of cart) {
    item.selected = selectAll;
    await updateCartQuantityDb(item.cartId, item.quantity);
  }
  updateCartUI();
}

// Update cart UI
function updateCartUI() {
  // Update badge
  if (cartBadge) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;
    cartBadge.style.display = totalItems > 0 ? "flex" : "none";
  }

  // Update cart items
  if (cartItems) {
    if (cart.length === 0) {
      cartItems.innerHTML = '<p class="empty-cart-msg">Your cart is empty.</p>';
    } else {
      cartItems.innerHTML =
        `
                <div class="cart-select-all">
                    <label>
                        <input type="checkbox" id="selectAllCheckbox" onchange="toggleSelectAll(this.checked)" ${cart.every((item) => item.selected) ? "checked" : ""}>
                        <span>Select All</span>
                    </label>
                </div>
            ` +
        cart
          .map(
            (item) => `
                <div class="cart-item ${item.selected ? "selected" : ""}">
                    <div class="cart-item-checkbox">
                        <input type="checkbox" ${item.selected ? "checked" : ""} onchange="toggleItemSelection('${item.id}')">
                    </div>
                    <img src="images/${item.image || "home1.jpg"}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/80x100?text=${encodeURIComponent(item.name)}'">
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">₱${item.price.toFixed(2)}</div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn" onclick="cartUpdateQuantity('${item.id}', -1)">-</button>
                            <span class="quantity-value">${item.quantity}</span>
                            <button class="quantity-btn" onclick="cartUpdateQuantity('${item.id}', 1)">+</button>
                            <button class="remove-item" onclick="cartRemoveItem('${item.id}')">&times;</button>
                        </div>
                    </div>
                </div>
            `,
          )
          .join("");
    }
  }

  // Update total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (cartTotal) {
    cartTotal.textContent = `₱${total.toFixed(2)}`;
  }

  // Update selected total
  const selectedItems = cart.filter((item) => item.selected);
  const selectedTotalAmount = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  if (selectedTotal) {
    selectedTotal.textContent = `Selected: ₱${selectedTotalAmount.toFixed(2)}`;
  }
}

// Global function for updating quantity
window.cartUpdateQuantity = async function (id, change) {
  const item = cart.find((item) => item.id === id);
  if (item) {
    const newQuantity = item.quantity + change;
    if (newQuantity <= 0) {
      await cartRemoveItem(id);
    } else {
      await updateCartQuantityDb(item.cartId, newQuantity);
      await fetchCart();
      updateCartUI();
    }
  }
};

// Global function for removing item
window.cartRemoveItem = async function (id) {
  const item = cart.find((item) => item.id === id);
  if (item) {
    await removeFromCartDb(item.cartId);
    await fetchCart();
    updateCartUI();
    if (typeof showToast === "function") {
      showToast("Item removed from cart!", "success");
    }
  }
};

// Global function for toggling selection
window.toggleItemSelection = toggleItemSelection;

// Global function for select all
window.toggleSelectAll = async function (selectAll) {
  await selectAllItems(selectAll);
};

// =====================
// ADDRESS MANAGEMENT (Database)
// =====================

// Get addresses from database
async function getUserAddresses() {
  const userEmail = getCurrentUserEmail();
  if (!userEmail) return [];

  try {
    const response = await fetch(
      `${API_BASE}/api/addresses?email=${encodeURIComponent(userEmail)}`,
    );
    const data = await response.json();
    if (data.success) {
      return data.addresses;
    }
  } catch (error) {
    console.error("Error fetching addresses:", error);
  }
  return [];
}

// Save address to database
async function saveAddressDb(address) {
  const userEmail = getCurrentUserEmail();
  if (!userEmail) return null;

  try {
    const response = await fetch(`${API_BASE}/api/addresses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userEmail, address }),
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error saving address:", error);
    return null;
  }
}

// Delete address from database
async function deleteAddressDb(addressId) {
  try {
    const response = await fetch(`${API_BASE}/api/addresses/${addressId}`, {
      method: "DELETE",
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error deleting address:", error);
    return false;
  }
}

// Render saved addresses
async function renderSavedAddresses() {
  const savedAddressesDiv = document.getElementById("savedAddresses");
  if (!savedAddressesDiv) return;

  const addresses = await getUserAddresses();

  if (addresses.length === 0) {
    savedAddressesDiv.innerHTML = "<p>No saved addresses.</p>";
    return;
  }

  savedAddressesDiv.innerHTML = addresses
    .map(
      (addr) => `
        <div class="address-card ${addr.is_default ? "default" : ""}" style="border: 1px solid #ddd; padding: 10px; margin: 5px 0; border-radius: 5px; ${addr.is_default ? "border-color: #4a4e69; background: #f8f9fa;" : ""}">
            <label style="display: flex; align-items: flex-start; cursor: pointer;">
                <input type="radio" name="selectedAddress" value="${addr.id}" ${addr.is_default ? "checked" : ""} style="margin-right: 10px; margin-top: 3px;">
                <div>
                    <strong>${addr.name}</strong> ${addr.is_default ? '<span style="background: #4a4e69; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; margin-left: 5px;">DEFAULT</span>' : ""}<br>
                    <span style="color: #666;">${addr.phone}</span><br>
                    <span style="color: #666;">${addr.street}, ${addr.barangay}</span><br>
                    <span style="color: #666;">${addr.city}, ${addr.province} ${addr.postal}</span>
                </div>
            </label>
            <button onclick="deleteAddress(${addr.id})" style="float: right; background: #dc3545; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px; font-size: 12px;">Delete</button>
        </div>
    `,
    )
    .join("");
}

// =====================
// CHECKOUT FUNCTIONS
// =====================

// Open checkout modal
function openCheckout() {
  const checkoutModal = document.getElementById("checkoutModal");
  if (checkoutModal) {
    checkoutModal.style.display = "block";
    renderCheckoutItems();
    renderSavedAddresses();
  }
}

// Close checkout modal
function closeCheckout() {
  const checkoutModal = document.getElementById("checkoutModal");
  if (checkoutModal) {
    checkoutModal.style.display = "none";
  }

  const addressForm = document.getElementById("addAddressForm");
  if (addressForm) {
    addressForm.style.display = "none";
  }
}

// Render checkout items
function renderCheckoutItems() {
  const checkoutItemsDiv = document.getElementById("checkoutItems");
  const checkoutTotalSpan = document.getElementById("checkoutTotal");

  if (!checkoutItemsDiv) return;

  const selectedItems = cart.filter((item) => item.selected);

  if (selectedItems.length === 0) {
    checkoutItemsDiv.innerHTML = "<p>No items selected.</p>";
    if (checkoutTotalSpan) checkoutTotalSpan.textContent = "₱0.00";
    return;
  }

  checkoutItemsDiv.innerHTML = selectedItems
    .map(
      (item) => `
        <div class="checkout-item" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
            <div>
                <strong>${item.name}</strong><br>
                <span style="color: #666;">Qty: ${item.quantity}</span>
            </div>
            <div>₱${(item.price * item.quantity).toFixed(2)}</div>
        </div>
    `,
    )
    .join("");

  const total = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  if (checkoutTotalSpan) {
    checkoutTotalSpan.textContent = `₱${total.toFixed(2)}`;
  }
}

// Place order
async function placeOrder() {
  const isAdminLoggedIn = localStorage.getItem("isAdminLoggedIn") === "true";
  if (isAdminLoggedIn) {
    if (typeof showToast === "function")
      showToast("Admins cannot checkout. Please use a user account.", "error");
    return;
  }

  const selectedItems = cart.filter((item) => item.selected);

  if (selectedItems.length === 0) {
    if (typeof showToast === "function")
      showToast("Please select items to checkout!", "error");
    return;
  }

  const currentUser = getCurrentUser();
  if (!currentUser) {
    if (typeof showToast === "function")
      showToast("Please login to checkout!", "error");
    closeCheckout();
    const loginModal = document.getElementById("loginModal");
    if (loginModal) loginModal.style.display = "block";
    return;
  }

  const selectedAddressRadio = document.querySelector(
    'input[name="selectedAddress"]:checked',
  );
  if (!selectedAddressRadio) {
    if (typeof showToast === "function")
      showToast("Please select a shipping address!", "error");
    return;
  }

  const addresses = await getUserAddresses();
  const selectedAddress = addresses.find(
    (addr) => addr.id === parseInt(selectedAddressRadio.value),
  );

  if (!selectedAddress) {
    if (typeof showToast === "function")
      showToast("Please select a valid shipping address!", "error");
    return;
  }

  const total = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  try {
    const response = await fetch(`${API_BASE}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userEmail: currentUser.email,
        customerName: currentUser.name,
        items: selectedItems,
        total: total,
        shippingAddress: selectedAddress,
      }),
    });

    const data = await response.json();

    if (data.success) {
      await fetchCart();
      updateCartUI();
      closeCheckout();
      closeCart();

      if (typeof showToast === "function") {
        showToast("Order placed successfully!", "success");
      }
    } else {
      if (typeof showToast === "function") {
        showToast(data.message || "Error placing order!", "error");
      }
    }
  } catch (error) {
    console.error("Error placing order:", error);
    if (typeof showToast === "function") {
      showToast("Error placing order!", "error");
    }
  }
}

// =====================
// CHECKOUT EVENT LISTENERS
// =====================

function setupCheckout() {
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      const selectedItems = cart.filter((item) => item.selected);
      if (selectedItems.length === 0) {
        if (typeof showToast === "function")
          showToast("Please select items to checkout!", "error");
        return;
      }
      closeCart();
      openCheckout();
    });
  }

  const closeCheckoutBtn = document.getElementById("closeCheckout");
  if (closeCheckoutBtn) {
    closeCheckoutBtn.addEventListener("click", closeCheckout);
  }

  const addAddressBtn = document.getElementById("addAddressBtn");
  const addAddressForm = document.getElementById("addAddressForm");

  if (addAddressBtn && addAddressForm) {
    addAddressBtn.addEventListener("click", () => {
      addAddressForm.style.display =
        addAddressForm.style.display === "none" ? "block" : "none";
    });
  }

  const cancelAddressBtn = document.getElementById("cancelAddressBtn");
  if (cancelAddressBtn) {
    cancelAddressBtn.addEventListener("click", () => {
      const addAddressForm = document.getElementById("addAddressForm");
      if (addAddressForm) {
        addAddressForm.style.display = "none";
      }
      document.getElementById("addressName").value = "";
      document.getElementById("addressPhone").value = "";
      document.getElementById("addressStreet").value = "";
      document.getElementById("addressBarangay").value = "";
      document.getElementById("addressCity").value = "";
      document.getElementById("addressProvince").value = "";
      document.getElementById("addressPostal").value = "";
    });
  }

  const saveAddressBtn = document.getElementById("saveAddressBtn");
  if (saveAddressBtn) {
    saveAddressBtn.addEventListener("click", async () => {
      const name = document.getElementById("addressName").value.trim();
      const phone = document.getElementById("addressPhone").value.trim();
      const street = document.getElementById("addressStreet").value.trim();
      const barangay = document.getElementById("addressBarangay").value.trim();
      const city = document.getElementById("addressCity").value.trim();
      const province = document.getElementById("addressProvince").value.trim();
      const postal = document.getElementById("addressPostal").value.trim();

      if (
        !name ||
        !phone ||
        !street ||
        !barangay ||
        !city ||
        !province ||
        !postal
      ) {
        if (typeof showToast === "function")
          showToast("Please fill in all address fields!", "error");
        return;
      }

      const success = await saveAddressDb({
        name,
        phone,
        street,
        barangay,
        city,
        province,
        postal,
      });

      if (success) {
        document.getElementById("addressName").value = "";
        document.getElementById("addressPhone").value = "";
        document.getElementById("addressStreet").value = "";
        document.getElementById("addressBarangay").value = "";
        document.getElementById("addressCity").value = "";
        document.getElementById("addressProvince").value = "";
        document.getElementById("addressPostal").value = "";

        const addAddressForm = document.getElementById("addAddressForm");
        if (addAddressForm) addAddressForm.style.display = "none";

        await renderSavedAddresses();

        if (typeof showToast === "function")
          showToast("Address saved successfully!", "success");
      }
    });
  }

  const placeOrderBtn = document.getElementById("placeOrderBtn");
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener("click", placeOrder);
  }
}

// Delete address function
window.deleteAddress = async function (addressId) {
  if (confirm("Are you sure you want to delete this address?")) {
    await deleteAddressDb(addressId);
    await renderSavedAddresses();
    if (typeof showToast === "function")
      showToast("Address deleted!", "success");
  }
};

// =====================
// CART EVENT LISTENERS
// =====================

if (cartIcon) {
  cartIcon.addEventListener("click", openCart);
}

if (closeCartBtn) {
  closeCartBtn.addEventListener("click", closeCart);
}

if (cartOverlay) {
  cartOverlay.addEventListener("click", closeCart);
}

// Add to cart buttons
document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const productCard = btn.closest(".product-card");
    const id = productCard.dataset.id;
    const name = productCard.dataset.name;
    const price = parseFloat(productCard.dataset.price);

    addToCart(id, name, price);
  });
});

// Initialize cart
async function initCart() {
  await fetchCart();
  updateCartUI();
  setupCheckout();
}

initCart();

// Export functions
window.getCart = function () {
  return cart;
};

window.getSelectedItems = function () {
  return cart.filter((item) => item.selected);
};

window.getCartTotal = function () {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

window.getSelectedTotal = function () {
  const selectedItems = cart.filter((item) => item.selected);
  return selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
};

window.getCartItemCount = function () {
  const selectedItems = cart.filter((item) => item.selected);
  return selectedItems.reduce((sum, item) => sum + item.quantity, 0);
};

window.loadUserCart = async function () {
  await fetchCart();
  updateCartUI();
};

window.clearCart = async function () {
  await clearCartDb();
  cart = [];
  updateCartUI();
};
