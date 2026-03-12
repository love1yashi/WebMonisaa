const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import database module
const db = require('./database');

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// =====================
// USER API ENDPOINTS
// =====================

// Register user
app.post('/api/users/register', (req, res) => {
    const { name, email, password } = req.body;
    db.getUserByEmail(email, (err, user) => {
        if (user) {
            return res.json({ success: false, message: 'Email already registered' });
        }
        db.createUser(name, email, password, (err, newUser) => {
            if (err) {
                return res.json({ success: false, message: 'Error creating user' });
            }
            res.json({ success: true, user: newUser });
        });
    });
});

// Login user
app.post('/api/users/login', (req, res) => {
    const { email, password } = req.body;
    db.getUserByEmail(email, (err, user) => {
        if (!user || user.password !== password) {
            return res.json({ success: false, message: 'Invalid email or password' });
        }
        res.json({ success: true, user });
        
    });
});

// Get all users (for admin)
app.get('/api/users', (req, res) => {
    db.getAllUsers((err, users) => {
        if (err) {
            return res.json({ success: false, message: 'Error fetching users' });
        }
        res.json({ success: true, users });
    });
});

// Delete user
app.delete('/api/users/:id', (req, res) => {
    const id = req.params.id;
    db.deleteUserById(id, (err, changes) => {
        if (err) {
            return res.json({ success: false, message: 'Error deleting user' });
        }
        res.json({ success: true });
    });
});

// =====================
// PRODUCT API ENDPOINTS
// =====================

// Get all products
app.get('/api/products', (req, res) => {
    db.getAllProducts((err, products) => {
        if (err) {
            return res.json({ success: false, message: 'Error fetching products' });
        }
        res.json({ success: true, products });
    });
});

// Get single product
app.get('/api/products/:id', (req, res) => {
    const id = req.params.id;
    db.getProductById(id, (err, product) => {
        if (err) {
            return res.json({ success: false, message: 'Error fetching product' });
        }
        res.json({ success: true, product });
    });
});

// Create product (admin)
app.post('/api/products', (req, res) => {
    const { name, price, category, image, stock, description } = req.body;
    db.createProduct(name, price, category, image, stock, description, (err, product) => {
        if (err) {
            return res.json({ success: false, message: 'Error creating product' });
        }
        res.json({ success: true, product });
    });
});

// Update product (admin)
app.put('/api/products/:id', (req, res) => {
    const id = req.params.id;
    const { name, price, category, image, stock, description } = req.body;
    db.updateProduct(id, name, price, category, image, stock, description, (err, changes) => {
        if (err) {
            return res.json({ success: false, message: 'Error updating product' });
        }
        res.json({ success: true });
    });
});

// Delete product (admin)
app.delete('/api/products/:id', (req, res) => {
    const id = req.params.id;
    db.deleteProductById(id, (err, changes) => {
        if (err) {
            return res.json({ success: false, message: 'Error deleting product' });
        }
        res.json({ success: true });
    });
});

// =====================
// CART API ENDPOINTS
// =====================

// Get cart items
app.get('/api/cart', (req, res) => {
    const email = req.query.email;
    if (!email) {
        return res.json({ success: false, message: 'Email required' });
    }
    db.getCartItems(email, (err, items) => {
        if (err) {
            return res.json({ success: false, message: 'Error fetching cart' });
        }
        res.json({ success: true, items });
    });
});

// Add to cart
app.post('/api/cart', (req, res) => {
    const { userEmail, productId, quantity } = req.body;
    if (!userEmail || !productId) {
        return res.json({ success: false, message: 'Email and product ID required' });
    }
    db.addToCart(userEmail, productId, quantity || 1, (err, result) => {
        if (err) {
            return res.json({ success: false, message: 'Error adding to cart' });
        }
        res.json({ success: true });
    });
});

// Update cart quantity
app.put('/api/cart/:id', (req, res) => {
    const id = req.params.id;
    const { quantity } = req.body;
    db.updateCartQuantity(id, quantity, (err, changes) => {
        if (err) {
            return res.json({ success: false, message: 'Error updating cart' });
        }
        res.json({ success: true });
    });
});

// Remove from cart
app.delete('/api/cart/:id', (req, res) => {
    const id = req.params.id;
    db.removeFromCart(id, (err, changes) => {
        if (err) {
            return res.json({ success: false, message: 'Error removing from cart' });
        }
        res.json({ success: true });
    });
});

// Clear cart
app.delete('/api/cart', (req, res) => {
    const email = req.query.email;
    if (!email) {
        return res.json({ success: false, message: 'Email required' });
    }
    db.clearCart(email, (err, changes) => {
        if (err) {
            return res.json({ success: false, message: 'Error clearing cart' });
        }
        res.json({ success: true });
    });
});

// =====================
// ORDER API ENDPOINTS
// =====================

// Create order
app.post('/api/orders', (req, res) => {
    const { userEmail, customerName, items, total, shippingAddress } = req.body;
    if (!userEmail || !items || !total) {
        return res.json({ success: false, message: 'Missing required fields' });
    }
    db.createOrder(userEmail, customerName, items, total, shippingAddress, (err, result) => {
        if (err) {
            return res.json({ success: false, message: 'Error creating order' });
        }
        // Clear cart after order
        db.clearCart(userEmail, () => {});
        res.json({ success: true, orderId: result.id });
    });
});

// Get all orders (admin)
app.get('/api/orders', (req, res) => {
    db.getAllOrders((err, orders) => {
        if (err) {
            return res.json({ success: false, message: 'Error fetching orders' });
        }
        res.json({ success: true, orders });
    });
});

// Get user orders
app.get('/api/orders/user', (req, res) => {
    const email = req.query.email;
    if (!email) {
        return res.json({ success: false, message: 'Email required' });
    }
    db.getOrdersByEmail(email, (err, orders) => {
        if (err) {
            return res.json({ success: false, message: 'Error fetching orders' });
        }
        res.json({ success: true, orders });
    });
});

// Update order status (admin)
app.put('/api/orders/:id/status', (req, res) => {
    const id = req.params.id;
    const { status } = req.body;
    db.updateOrderStatus(id, status, (err, changes) => {
        if (err) {
            return res.json({ success: false, message: 'Error updating order' });
        }
        res.json({ success: true });
    });
});

// =====================
// ADDRESS API ENDPOINTS
// =====================

// Get addresses
app.get('/api/addresses', (req, res) => {
    const email = req.query.email;
    if (!email) {
        return res.json({ success: false, message: 'Email required' });
    }
    db.getAddresses(email, (err, addresses) => {
        if (err) {
            return res.json({ success: false, message: 'Error fetching addresses' });
        }
        res.json({ success: true, addresses });
    });
});

// Add address
app.post('/api/addresses', (req, res) => {
    const { userEmail, address } = req.body;
    if (!userEmail || !address) {
        return res.json({ success: false, message: 'Email and address required' });
    }
    db.addAddress(userEmail, address, (err, result) => {
        if (err) {
            return res.json({ success: false, message: 'Error adding address' });
        }
        res.json({ success: true });
    });
});

// Delete address
app.delete('/api/addresses/:id', (req, res) => {
    const id = req.params.id;
    db.deleteAddress(id, (err, changes) => {
        if (err) {
            return res.json({ success: false, message: 'Error deleting address' });
        }
        res.json({ success: true });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
