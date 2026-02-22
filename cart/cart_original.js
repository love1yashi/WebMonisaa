// =====================
// CART MODULE
// =====================

// Get current user email for scoped cart
function getCurrentUserEmail() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return currentUser ? currentUser.email : null;
}

// Get cart key for current user
function getCartKey() {
    const userEmail = getCurrentUserEmail();
    return userEmail ? `cart_${userEmail}` : 'cart_guest';
}

// State - customer scoped cart
let cart = JSON.parse(localStorage.getItem(getCartKey())) || [];

// =====================
// CART UI ELEMENTS
// =====================
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartItems = document.getElementById('cartItems');
const cartBadge = document.getElementById('cartBadge');
const cartTotal = document.getElementById('cartTotal');
const cartIcon = document.getElementById('cartIcon');
const closeCartBtn = document.getElementById('closeCart');
const checkoutBtn = document.getElementById('checkoutBtn');
const selectedTotal = document.getElementById('selectedTotal');

// =====================
// CART FUNCTIONS
// =====================

// Open cart
function openCart() {
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
    }
}

// Close cart
function closeCart() {
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    }
}

// Add to cart
function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id,
            name,
            price,
            quantity: 1,
            selected: false // Items unchecked by default, user must check to include in total
        });
    }
    
    saveCart();
    updateCartUI();
    if (typeof showToast === 'function') {
        showToast(`${name} added to cart!`, 'success');
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem(getCartKey(), JSON.stringify(cart));
}

// Toggle item selection
function toggleItemSelection(id) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.selected = !item.selected;
        saveCart();
        updateCartUI();
    }
}

// Select all items
function selectAllItems(selectAll) {
    cart.forEach(item => {
        item.selected = selectAll;
    });
    saveCart();
    updateCartUI();
}

// Update cart UI
function updateCartUI() {
    // Update badge - count ALL items in cart
    if (cartBadge) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalItems;
        cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    
    // Update cart items with checkboxes
    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart-msg">Your cart is empty.</p>';
        } else {
            cartItems.innerHTML = `
                <div class="cart-select-all">
                    <label>
                        <input type="checkbox" id="selectAllCheckbox" onchange="toggleSelectAll(this.checked)" ${cart.every(item => item.selected) ? 'checked' : ''}>
                        <span>Select All</span>
                    </label>
                </div>
            ` + cart.map(item => `
                <div class="cart-item ${item.selected ? 'selected' : ''}">
                    <div class="cart-item-checkbox">
                        <input type="checkbox" ${item.selected ? 'checked' : ''} onchange="toggleItemSelection('${item.id}')">
                    </div>
                    <img src="https://via.placeholder.com/80x100?text=${encodeURIComponent(item.name)}" alt="${item.name}">
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
            `).join('');
        }
    }
    
    // Update total (all items)
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartTotal) {
        cartTotal.textContent = `₱${total.toFixed(2)}`;
    }
    
    // Update selected total
    const selectedItems = cart.filter(item => item.selected);
    const selectedTotalAmount = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (selectedTotal) {
        selectedTotal.textContent = `Selected: ₱${selectedTotalAmount.toFixed(2)}`;
    }
}

// Global function for updating quantity
window.cartUpdateQuantity = function(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cartRemoveItem(id);
        } else {
            saveCart();
            updateCartUI();
        }
    }
};

// Global function for removing item
window.cartRemoveItem = function(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
    if (typeof showToast === 'function') {
        showToast('Item removed from cart!', 'success');
    }
};

// Global function for toggling selection
window.toggleItemSelection = function(id) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.selected = !item.selected;
        saveCart();
        updateCartUI();
    }
};

// Global function for select all
window.toggleSelectAll = function(selectAll) {
    selectAllItems(selectAll);
};

// =====================
// ADDRESS MANAGEMENT
// =====================

// Get addresses for current user
function getUserAddresses() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return [];
    
    const allAddresses = JSON.parse(localStorage.getItem('userAddresses')) || [];
    return allAddresses.filter(addr => addr.userEmail === currentUser.email);
}

// Save address for user
function saveAddress(address) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return null;
    
    const allAddresses = JSON.parse(localStorage.getItem('userAddresses')) || [];
    
    const newAddress = {
        id: Date.now(),
        userEmail: currentUser.email,
        ...address,
        isDefault: allAddresses.filter(addr => addr.userEmail === currentUser.email).length === 0
    };
    
    allAddresses.push(newAddress);
    localStorage.setItem('userAddresses', JSON.stringify(allAddresses));
    return newAddress;
}

// Get default address
function getDefaultAddress() {
    const addresses = getUserAddresses();
    return addresses.find(addr => addr.isDefault) || addresses[0] || null;
}

// Set default address
function setDefaultAddress(addressId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const allAddresses = JSON.parse(localStorage.getItem('userAddresses')) || [];
    
    allAddresses.forEach(addr => {
        if (addr.userEmail === currentUser.email) {
            addr.isDefault = addr.id === addressId;
        }
    });
    
    localStorage.setItem('userAddresses', JSON.stringify(allAddresses));
}

// Delete address
function deleteAddress(addressId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    let allAddresses = JSON.parse(localStorage.getItem('userAddresses')) || [];
    const wasDefault = allAddresses.find(addr => addr.id === addressId)?.isDefault;
    
    allAddresses = allAddresses.filter(addr => addr.id !== addressId);
    
    // If deleted address was default, make first remaining address default
    if (wasDefault && allAddresses.length > 0) {
        const userAddresses = allAddresses.filter(addr => addr.userEmail === currentUser.email);
        if (userAddresses.length > 0) {
            userAddresses[0].isDefault = true;
        }
    }
    
    localStorage.setItem('userAddresses', JSON.stringify(allAddresses));
}

// Render saved addresses in checkout
function renderSavedAddresses() {
    const savedAddressesDiv = document.getElementById('savedAddresses');
    if (!savedAddressesDiv) return;
    
    const addresses = getUserAddresses();
    
    if (addresses.length === 0) {
        savedAddressesDiv.innerHTML = '<p>No saved addresses.</p>';
        return;
    }
    
    savedAddressesDiv.innerHTML = addresses.map(addr => `
        <div class="address-card ${addr.isDefault ? 'default' : ''}" style="border: 1px solid #ddd; padding: 10px; margin: 5px 0; border-radius: 5px; ${addr.isDefault ? 'border-color: #4a4e69; background: #f8f9fa;' : ''}">
            <label style="display: flex; align-items: flex-start; cursor: pointer;">
                <input type="radio" name="selectedAddress" value="${addr.id}" ${addr.isDefault ? 'checked' : ''} style="margin-right: 10px; margin-top: 3px;">
                <div>
                    <strong>${addr.name}</strong> ${addr.isDefault ? '<span style="background: #4a4e69; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; margin-left: 5px;">DEFAULT</span>' : ''}<br>
                    <span style="color: #666;">${addr.phone}</span><br>
                    <span style="color: #666.barangay}</span><br>
                    <span stylereet}, ${addr="color: #666;">${addr.city}, ${addr.province} ${addr.postal}</span>
               ;">${addr.st </div>
            </label>
            <button onclick=".id})" style="float: right; background: #dc3545;deleteAddress(${addr color: white; border: none; padding: 5px 10px cursor: pointer;; border-radius: font-size:  3px;12px;">Delete</button>
        </div>
    `).join('');
}

// =====================
// CHECKOUT FUNCTIONS
// =====================

// Open checkout modal
function openCheckout() {
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        checkoutModal.style.display = 'block';
        renderCheckoutItems();
        renderSavedAddresses();
    }
}

// Close checkout modal
function closeCheckout() {
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        checkoutModal.style.display = 'none';
    }
    
    // Hide address form if open
    const addressForm = document.getElementById('addAddressForm');
    if (addressForm) {
        addressForm.style.display = 'none';
    }
}

// Render checkout items
function renderCheckoutItems() {
    const checkoutItemsDiv = document.getElementById('checkoutItems');
    const checkoutTotalSpan = document.getElementById('checkoutTotal');
    
    if (!checkoutItemsDiv) return;
    
    const selectedItems = cart.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
        checkoutItemsDiv.innerHTML = '<p>No items selected.</p>';
        if (checkoutTotalSpan) checkoutTotalSpan.textContent = '₱0.00';
        return;
    }
    
    checkoutItemsDiv.innerHTML = selectedItems.map(item => `
        <div class="checkout-item" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
            <div>
                <strong>${item.name}</strong><br>
                <span style="color: #666;">Qty: ${item.quantity}</span>
            </div>
            <div>₱${(item.price * item.quantity).toFixed(2)}</div>
        </div>
    `).join('');
    
    const total = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (checkoutTotalSpan) {
        checkoutTotalSpan.textContent = `₱${total.toFixed(2)}`;
    }
}

// Place order
function placeOrder() {
    // Check if admin is logged in
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
    if (isAdminLoggedIn) {
        if (typeof showToast === 'function') showToast('Admins cannot checkout. Please use a user account.', 'error');
        return;
    }
    
    // Get selected items
    const selectedItems = cart.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
        if (typeof showToast === 'function') showToast('Please select items to checkout!', 'error');
        return;
    }
    
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    if (!currentUser) {
        if (typeof showToast === 'function') showToast('Please login to checkout!', 'error');
        closeCheckout();
        const loginModal = document.getElementById('loginModal');
        if (loginModal) loginModal.style.display = 'block';
        return;
    }
    
    // Get selected address
    const selectedAddressRadio = document.querySelector('input[name="selectedAddress"]:checked');
    if (!selectedAddressRadio) {
        if (typeof showToast === 'function') showToast('Please select a shipping address!', 'error');
        return;
    }
    
    const addressId = parseInt(selectedAddressRadio.value);
    const addresses = getUserAddresses();
    const selectedAddress = addresses.find(addr => addr.id === addressId);
    
    if (!selectedAddress) {
        if (typeof showToast === 'function') showToast('Please select a valid shipping address!', 'error');
        return;
    }
    
    // Calculate total
    const total = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create order
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    orders.push({
        id: Date.now(),
        customerName: currentUser.name,
        customerEmail: currentUser.email,
        items: selectedItems,
        total: total,
        shippingAddress: selectedAddress,
        date: new Date().toISOString(),
        status: 'pending'
    });
    
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Remove selected items from cart
    cart = cart.filter(item => !item.selected);
    saveCart();
    updateCartUI();
    closeCheckout();
    closeCart();
    
    if (typeof showToast === 'function') {
        showToast('Order placed successfully!', 'success');
    }
}

// =====================
// CHECKOUT EVENT LISTENERS
// =====================

function setupCheckout() {
    // Checkout button in cart
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const selectedItems = cart.filter(item => item.selected);
            if (selectedItems.length === 0) {
                if (typeof showToast === 'function') showToast('Please select items to checkout!', 'error');
                return;
            }
            closeCart();
            openCheckout();
        });
    }
    
    // Close checkout modal
    const closeCheckoutBtn = document.getElementById('closeCheckout');
    if (closeCheckoutBtn) {
        closeCheckoutBtn.addEventListener('click', closeCheckout);
    }
    
    // Add address button
    const addAddressBtn = document.getElementById('addAddressBtn');
    const addAddressForm = document.getElementById('addAddressForm');
    
    if (addAddressBtn && addAddressForm) {
        addAddressBtn.addEventListener('click', () => {
            addAddressForm.style.display = addAddressForm.style.display === 'none' ? 'block' : 'none';
        });
    }
    
    // Cancel address button
    const cancelAddressBtn = document.getElementById('cancelAddressBtn');
    if (cancelAddressBtn) {
        cancelAddressBtn.addEventListener('click', () => {
            const addAddressForm = document.getElementById('addAddressForm');
            if (addAddressForm) {
                addAddressForm.style.display = 'none';
            }
            // Clear form
            document.getElementById('addressName').value = '';
            document.getElementById('addressPhone').value = '';
            document.getElementById('addressStreet').value = '';
            document.getElementById('addressBarangay').value = '';
            document.getElementById('addressCity').value = '';
            document.getElementById('addressProvince').value = '';
            document.getElementById('addressPostal').value = '';
        });
    }
    
    // Save address button
    const saveAddressBtn = document.getElementById('saveAddressBtn');
    if (saveAddressBtn) {
        saveAddressBtn.addEventListener('click', () => {
            const name = document.getElementById('addressName').value.trim();
            const phone = document.getElementById('addressPhone').value.trim();
            const street = document.getElementById('addressStreet').value.trim();
            const barangay = document.getElementById('addressBarangay').value.trim();
            const city = document.getElementById('addressCity').value.trim();
            const province = document.getElementById('addressProvince').value.trim();
            const postal = document.getElementById('addressPostal').value.trim();
            
            if (!name || !phone || !street || !barangay || !city || !province || !postal) {
                if (typeof showToast === 'function') showToast('Please fill in all address fields!', 'error');
                return;
            }
            
            saveAddress({ name, phone, street, barangay, city, province, postal });
            
            // Clear and hide form
            document.getElementById('addressName').value = '';
            document.getElementById('addressPhone').value = '';
            document.getElementById('addressStreet').value = '';
            document.getElementById('addressBarangay').value = '';
            document.getElementById('addressCity').value = '';
            document.getElementById('addressProvince').value = '';
            document.getElementById('addressPostal').value = '';
            
            const addAddressForm = document.getElementById('addAddressForm');
            if (addAddressForm) addAddressForm.style.display = 'none';
            
            renderSavedAddresses();
            
            if (typeof showToast === 'function') showToast('Address saved successfully!', 'success');
        });
    }
    
    // Place order button
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', placeOrder);
    }
}

// Delete address function
window.deleteAddress = function(addressId) {
    if (confirm('Are you sure you want to delete this address?')) {
        deleteAddress(addressId);
        renderSavedAddresses();
        if (typeof showToast === 'function') showToast('Address deleted!', 'success');
    }
};

// =====================
// CART EVENT LISTENERS
// =====================

// Open cart on icon click
if (cartIcon) {
    cartIcon.addEventListener('click', openCart);
}

// Close cart on X click
if (closeCartBtn) {
    closeCartBtn.addEventListener('click', closeCart);
}

// Close cart on overlay click
if (cartOverlay) {
    cartOverlay.addEventListener('click', closeCart);
}

// Add to cart buttons
document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const productCard = btn.closest('.product-card');
        const id = productCard.dataset.id;
        const name = productCard.dataset.name;
        const price = parseFloat(productCard.dataset.price);
        
        addToCart(id, name, price);
    });
});

// Initialize cart UI
updateCartUI();
setupCheckout();

// Initialize badge visibility on load
if (cartBadge) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
}

// Export functions
window.getCart = function() {
    return cart;
};

window.getSelectedItems = function() {
    return cart.filter(item => item.selected);
};

window.getCartTotal = function() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

window.getSelectedTotal = function() {
    const selectedItems = cart.filter(item => item.selected);
    return selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

window.getCartItemCount = function() {
    const selectedItems = cart.filter(item => item.selected);
    return selectedItems.reduce((sum, item) => sum + item.quantity, 0);
};

// Load user cart when user logs in
window.loadUserCart = function() {
    cart = JSON.parse(localStorage.getItem(getCartKey())) || [];
    updateCartUI();
};

// Clear cart when user logs out
window.clearCart = function() {
    cart = [];
    updateCartUI();
};
