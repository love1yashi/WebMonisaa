// Main JavaScript for PHP version
// Slider, Toast, Cart Badge, Modals

let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');

// Slider functionality
function showSlide(n) {
    slides.forEach(slide => {
        slide.classList.remove('active', 'prev');
    });
    dots.forEach(dot => dot.classList.remove('active'));
    
    for (let i = 0; i < n; i++) {
        slides[i].classList.add('prev');
    }
    slides[n].classList.add('active');
    dots[n].classList.add('active');
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

setInterval(nextSlide, 5000);
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        currentSlide = index;
        showSlide(currentSlide);
    });
});

// Toast notifications
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.getElementById('toastContainer').appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// Update cart badge
function updateCartBadge() {
    fetch('api/cart.php?action=get')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const total = data.items.reduce((sum, item) => sum + item.quantity, 0);
                const badge = document.getElementById('cartBadge');
                badge.textContent = total;
                badge.style.display = total > 0 ? 'flex' : 'none';
                sessionStorage.setItem('cart_count', total);
            }
        });
}

// Add to cart
function addToCart(productId, quantity = 1) {
    const formData = new FormData();
    formData.append('action', 'add');
    formData.append('product_id', productId);
    formData.append('quantity', quantity);
    
    fetch('api/cart.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showToast('Added to cart!');
            updateCartBadge();
        } else {
            showToast(data.message || 'Error adding to cart', 'error');
        }
    });
}

// Toggle modals
function toggleModal(id, show = true) {
    const modal = document.getElementById(id);
    modal.style.display = show ? 'block' : 'none';
}

document.querySelectorAll('.close-modal, .close-cart').forEach(btn => {
    btn.addEventListener('click', () => toggleModal(btn.closest('.modal')?.id || 'cartSidebar'));
});

// Cart toggle
document.getElementById('cartIcon')?.addEventListener('click', () => {
    document.getElementById('cartSidebar').classList.toggle('active');
    document.getElementById('cartOverlay')?.classList.toggle('active');
});

// Load cart on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', e => {
            if (e.target === modal) toggleModal(modal.id, false);
        });
    });
});

// Export functions for global use
window.showToast = showToast;
window.addToCart = addToCart;
window.updateCartBadge = updateCartBadge;
window.toggleModal = toggleModal;

