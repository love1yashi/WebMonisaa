// =====================
// SLIDER FUNCTIONALITY
// =====================
let currentSlide = 0;
const slides = document.querySelectorAll(".slide");
const dots = document.querySelectorAll(".dot");

function showSlide(n) {
  slides.forEach((slide) => {
    slide.classList.remove("active");
    slide.classList.remove("prev");
  });

  dots.forEach((dot) => dot.classList.remove("active"));

  for (let i = 0; i < n; i++) {
    slides[i].classList.add("prev");
  }

  slides[n].classList.add("active");
  dots[n].classList.add("active");
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}

setInterval(nextSlide, 5000);

dots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    currentSlide = index;
    showSlide(currentSlide);
  });
});

showSlide(0);

// =====================
// TAB FUNCTIONALITY (Product Tabs)
// =====================
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".tab-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// =====================
// CATEGORY CARDS
// =====================
document.querySelectorAll(".col-card").forEach((card) => {
  card.addEventListener("click", () => {
    const category = card
      .querySelector(".col-overlay")
      .textContent.trim()
      .toLowerCase();
    window.location.href = `?category=${category}`;
  });
});

// =====================
// NEWSLETTER
// =====================
const emailBox = document.querySelector(".email-box");
if (emailBox) {
  emailBox.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = emailBox.querySelector("input").value;
    if (email) {
      showToast("Thank you for subscribing!", "success");
      emailBox.querySelector("input").value = "";
    }
  });
}

// =====================
// TOAST NOTIFICATION
// =====================
function showToast(message, type = "success") {
  const existingToast = document.querySelector(".toast");
  if (existingToast) existingToast.remove();

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// Export for use in other modules
window.showToast = showToast;

// =====================
// TOGGLE PASSWORD VISIBILITY
// =====================
function togglePassword(passwordFieldId, iconId) {
  const passwordField = document.getElementById(passwordFieldId);
  const iconElement = document.getElementById(iconId);

  if (passwordField && iconElement) {
    if (passwordField.type === "password") {
      passwordField.type = "text";
      iconElement.textContent = "🙈";
    } else {
      passwordField.type = "password";
      iconElement.textContent = "👁";
    }
  }
}

window.togglePassword = togglePassword;

// =====================
// LOGIN FORM HANDLER
// =====================
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    if (window.authFunctions) {
      // First, check if it's an admin login
      // Force initialize admin accounts to ensure we have correct credentials
      window.authFunctions.initializeAdminAccounts();
      const admins = window.authFunctions.getAdminAccounts();
      const admin = admins.find(
        (a) => a.username === email && a.password === password,
      );

      if (admin) {
        // Admin login - set admin session and go to full screen admin dashboard
        localStorage.setItem("isAdminLoggedIn", "true");
        localStorage.setItem("currentAdmin", JSON.stringify(admin));
        showToast("Admin login successful!", "success");
        const loginModal = document.getElementById("loginModal");
        if (loginModal) loginModal.style.display = "none";
        // Open admin dashboard in full screen - redirect to admin page
        window.location.href = "admin/index.html";
        return;
      }

      // If not admin, try regular user login
      const result = window.authFunctions.loginUser(email, password);
      if (result.success) {
        showToast("Login successful!", "success");
        window.authFunctions.updateUserUI();
        const loginModal = document.getElementById("loginModal");
        if (loginModal) loginModal.style.display = "none";
        window.location.reload();
      } else {
        showToast(result.message, "error");
      }
    }
  });
}

// =====================
// ADD TO CART FROM LIST
// =====================
const productsListData = {
  d1: { name: "HAYAT DRESS", price: 89, image: "images/hayatdress.jpg" },
  d2: { name: "MUNEERAH DRESS", price: 89, image: "images/muneerahdress.jpg" },
  d3: { name: "NYLA DRESS", price: 89, image: "images/nylahdress.jpg" },
  d4: { name: "HAFSA DRESS", price: 89, image: "images/hafsahdress.jpg" },
  d5: { name: "RASHIDA DRESS", price: 89, image: "images/rashidadress.jpg" },
  d6: {
    name: "HILYAH LOOSE TYPE DRESS",
    price: 89,
    image: "images/hilyadress.jpg",
  },
  d7: { name: "HABEEBAH DRESS", price: 89, image: "images/habeebahdress.jpg" },
  s1: { name: "FRENCH MOUSSE", price: 39, image: "images/frenchmousse1.jpg" },
  s2: { name: "BELGIAN HIJAB", price: 59, image: "images/belgian1.jpg" },
  n1: { name: "SINGLE CURVE NIQAB", price: 59, image: "images/niqab1.jpg" },
};

function addToCartFromList(productId) {
  const product = productsListData[productId];
  if (product) {
    // Try to use cartFunctions if available, otherwise use direct addToCart
    if (window.cartFunctions && window.cartFunctions.addToCart) {
      const cartItem = {
        id: productId,
        name: product.name,
        price: product.price,
        color: "Default",
        quantity: 1,
        image: product.image,
      };
      window.cartFunctions.addToCart(cartItem);
    } else if (window.addToCart) {
      // Fallback to direct addToCart function if available
      window.addToCart(productId, product.name, product.price);
    } else {
      // Last resort: directly add to localStorage cart
      const cartKey = "cart_guest";
      let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
      const existingItem = cart.find((item) => item.id === productId);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({
          id: productId,
          name: product.name,
          price: product.price,
          quantity: 1,
          selected: false,
        });
      }
      localStorage.setItem(cartKey, JSON.stringify(cart));
      // Update cart badge
      updateCartBadge();
    }
    showToast("Added " + product.name + " to cart!", "success");
  }
}

// Update cart badge directly
function updateCartBadge() {
  const cartBadge = document.getElementById("cartBadge");
  if (cartBadge) {
    const cartKey = "cart_guest";
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;
    cartBadge.style.display = totalItems > 0 ? "flex" : "none";
  }
}

window.addToCartFromList = addToCartFromList;

// =====================
// SIGNUP FORM HANDLER
// =====================
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById(
      "signupConfirmPassword",
    ).value;

    if (password !== confirmPassword) {
      showToast("Passwords do not match!", "error");
      return;
    }

    if (window.authFunctions) {
      const result = window.authFunctions.registerUser(name, email, password);
      if (result.success) {
        // Show success message - do NOT auto-login
        showToast("Account created successfully! Please login.", "success");

        // Close signup modal
        const signupModal = document.getElementById("signupModal");
        if (signupModal) signupModal.style.display = "none";

        // Clear the signup form
        document.getElementById("signupForm").reset();

        // Open login modal after a short delay
        setTimeout(() => {
          const loginModal = document.getElementById("loginModal");
          if (loginModal) loginModal.style.display = "block";
        }, 500);
      } else {
        showToast(result.message, "error");
      }
    }
  });
}

// =====================
// ADMIN LOGIN FORM HANDLER
// =====================
const adminLoginForm = document.getElementById("adminLoginForm");
if (adminLoginForm) {
  adminLoginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("adminUsername").value;
    const password = document.getElementById("adminPassword").value;

    if (window.authFunctions) {
      const result = window.authFunctions.adminLogin(username, password);
      if (result.success) {
        showToast("Admin login successful!", "success");
        window.authFunctions.updateUserUI();
        const adminLoginModal = document.getElementById("adminLoginModal");
        if (adminLoginModal) adminLoginModal.style.display = "none";
        const adminDashboardModal = document.getElementById(
          "adminDashboardModal",
        );
        if (adminDashboardModal) adminDashboardModal.style.display = "block";
        if (window.adminFunctions) {
          window.adminFunctions.initAdmin();
        }
      } else {
        showToast(result.message, "error");
      }
    }
  });
}

// =====================
// ADMIN REGISTRATION FORM HANDLER
// =====================
// Switch to registration form
const goToAdminRegister = document.getElementById("goToAdminRegister");
if (goToAdminRegister) {
  goToAdminRegister.addEventListener("click", function (e) {
    e.preventDefault();
    document.getElementById("adminLoginSection").style.display = "none";
    document.getElementById("adminRegisterSection").style.display = "block";
  });
}

// Switch back to login form
const goToAdminLogin = document.getElementById("goToAdminLogin");
if (goToAdminLogin) {
  goToAdminLogin.addEventListener("click", function (e) {
    e.preventDefault();
    document.getElementById("adminRegisterSection").style.display = "none";
    document.getElementById("adminLoginSection").style.display = "block";
  });
}

// Handle admin registration
const adminRegisterForm = document.getElementById("adminRegisterForm");
if (adminRegisterForm) {
  adminRegisterForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("registerAdminUsername").value;
    const password = document.getElementById("registerAdminPassword").value;
    const confirmPassword = document.getElementById(
      "registerAdminConfirmPassword",
    ).value;

    if (password !== confirmPassword) {
      showToast("Passwords do not match!", "error");
      return;
    }

    if (window.authFunctions) {
      const result = window.authFunctions.registerAdmin(username, password);
      if (result.success) {
        showToast(
          "Admin registered successfully! You can now login.",
          "success",
        );
        // Switch back to login form
        document.getElementById("adminRegisterSection").style.display = "none";
        document.getElementById("adminLoginSection").style.display = "block";
        // Clear the registration form
        document.getElementById("adminRegisterForm").reset();
      } else {
        showToast(result.message, "error");
      }
    }
  });
}
