// =====================
// SLIDER FUNCTIONALITY
// =====================
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');

function showSlide(n) {
    slides.forEach(slide => {
        slide.classList.remove('active');
        slide.classList.remove('prev');
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

showSlide(0);

// =====================
// TAB FUNCTIONALITY (Product Tabs)
// =====================
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// =====================
// CATEGORY CARDS
// =====================
document.querySelectorAll('.col-card').forEach(card => {
    card.addEventListener('click', () => {
        const category = card.querySelector('.col-overlay').textContent.trim().toLowerCase();
        window.location.href = `?category=${category}`;
    });
});

// =====================
// NEWSLETTER
// =====================
const emailBox = document.querySelector('.email-box');
if (emailBox) {
    emailBox.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = emailBox.querySelector('input').value;
        if (email) {
            showToast('Thank you for subscribing!', 'success');
            emailBox.querySelector('input').value = '';
        }
    });
}

// =====================
// TOAST NOTIFICATION
// =====================
function showToast(message, type = 'success') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// Export for use in other modules
window.showToast = showToast;

// =====================
// LOGIN FORM HANDLER
// =====================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (window.authFunctions) {
            const result = window.authFunctions.loginUser(email, password);
            if (result.success) {
                showToast('Login successful!', 'success');
                window.authFunctions.updateUserUI();
                const loginModal = document.getElementById('loginModal');
                if (loginModal) loginModal.style.display = 'none';
                window.location.reload();
            } else {
                showToast(result.message, 'error');
            }
        }
    });
}

// =====================
// ADD TO CART FROM LIST
// =====================
const productsListData = {
    'd1': { name: 'HAYAT DRESS', price: 89, image: 'images/hayatdress.jpg' },
    'd2': { name: 'MUNEERAH DRESS', price: 89, image: 'images/muneerahdress.jpg' },
    'd3': { name: 'NYLA DRESS', price: 89, image: 'images/nylahdress.jpg' },
    'd4': { name: 'HAFSA DRESS', price: 89, image: 'images/hafsahdress.jpg' },
    'd5': { name: 'RASHIDA DRESS', price: 89, image: 'images/rashidadress.jpg' },
    'd6': { name: 'HILYAH LOOSE TYPE DRESS', price: 89, image: 'images/hilyadress.jpg' },
    'd7': { name: 'HABEEBAH DRESS', price: 89, image: 'images/habeebahdress.jpg' },
    's1': { name: 'FRENCH MOUSSE', price: 39, image: 'images/frenchmousse1.jpg' },
    's2': { name: 'BELGIAN HIJAB', price: 59, image: 'images/belgian1.jpg' },
    'n1': { name: 'SINGLE CURVE NIQAB', price: 59, image: 'images/niqab1.jpg' }
};

function addToCartFromList(productId) {
    const product = productsListData[productId];
    if (product && window.cartFunctions) {
        const cartItem = {
            id: productId,
            name: product.name,
            price: product.price,
            color: 'Default',
            quantity: 1,
            image: product.image
        };
        window.cartFunctions.addToCart(cartItem);
        showToast('Added ' + product.name + ' to cart!', 'success');
    }
}

window.addToCartFromList = addToCartFromList;

// =====================
// SIGNUP FORM HANDLER
// =====================
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        
        if (password !== confirmPassword) {
            showToast('Passwords do not match!', 'error');
            return;
        }
        
        if (window.authFunctions) {
            const result = window.authFunctions.registerUser(name, email, password);
            if (result.success) {
                showToast('Account created successfully!', 'success');
                window.authFunctions.updateUserUI();
                const signupModal = document.getElementById('signupModal');
                if (signupModal) signupModal.style.display = 'none';
                window.location.reload();
            } else {
                showToast(result.message, 'error');
            }
        }
    });
}

// =====================
// ADMIN LOGIN FORM HANDLER
// =====================
const adminLoginForm = document.getElementById('adminLoginForm');
if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;
        
        if (window.authFunctions) {
            const result = window.authFunctions.adminLogin(username, password);
            if (result.success) {
                showToast('Admin login successful!', 'success');
                window.authFunctions.updateUserUI();
                const adminLoginModal = document.getElementById('adminLoginModal');
                if (adminLoginModal) adminLoginModal.style.display = 'none';
                const adminDashboardModal = document.getElementById('adminDashboardModal');
                if (adminDashboardModal) adminDashboardModal.style.display = 'block';
                if (window.adminFunctions) {
                    window.adminFunctions.initAdmin();
                }
            } else {
                showToast(result.message, 'error');
            }
        }
    });
}
