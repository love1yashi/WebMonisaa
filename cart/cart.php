<?php
require_once '../includes/config.php';
initDB();

$page_title = 'Shopping Cart | MONISA';
?>
<?php include '../includes/header.php'; ?>
<div class="page-container">
    <h1>Shopping Cart</h1>
    <div id="cartItems">
        <!-- Dynamic cart items loaded via JS -->
    </div>
    <div class="cart-summary">
        <div class="total-section">
            <h3>Total: <span id="cartTotal">₱0.00</span></h3>
            <button class="checkout-btn" onclick="proceedToCheckout()">Proceed to Checkout</button>
        </div>
    </div>
</div>
<?php include '../includes/footer.php'; ?>

<script>
loadCart();
function loadCart() {
    fetch('../api/cart.php?action=get')
        .then(res => res.json())
        .then(data => {
            if (data.success && data.items.length > 0) {
                document.getElementById('cartItems').innerHTML = data.items.map(item => `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="item-details">
                            <h4>${item.name}</h4>
                            <p>₱${parseFloat(item.price).toFixed(2)}</p>
                            <div class="quantity-control">
                                <button onclick="updateCartQty(${item.cart_id}, ${item.quantity - 1})">-</button>
                                <span>${item.quantity}</span>
                                <button onclick="updateCartQty(${item.cart_id}, ${item.quantity + 1})">+</button>
                            </div>
                        </div>
                        <button onclick="removeFromCart(${item.cart_id})" class="remove-btn">Remove</button>
                    </div>
                `).join('');
                const total = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                document.getElementById('cartTotal').textContent = '₱' + total.toFixed(2);
            } else {
                document.getElementById('cartItems').innerHTML = '<p>Your cart is empty</p>';
            }
        });
}

function updateCartQty(id, qty) {
    fetch('../api/cart.php?action=update', {
        method: 'POST',
        body: new URLSearchParams({id, quantity: qty})
    }).then(() => loadCart());
}

function removeFromCart(id) {
    fetch('../api/cart.php?action=delete', {
        method: 'POST',
        body: new URLSearchParams({id})
    }).then(() => loadCart());
}

function proceedToCheckout() {
    window.location.href = 'checkout.php';
}
</script>
