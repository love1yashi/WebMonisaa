const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 8080;

// Middleware
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to SQLite database
const dbPath = path.join(__dirname, 'admin', 'monisa.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database:', dbPath);
        initializeTables();
    }
});

// Initialize database tables
function initializeTables() {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Products table
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        category TEXT,
        image TEXT,
        stock INTEGER DEFAULT 0,
        description TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Cart items table
    db.run(`CREATE TABLE IF NOT EXISTS cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER DEFAULT 1,
        selected INTEGER DEFAULT 1,
        FOREIGN KEY (product_id) REFERENCES products(id)
    )`);

    // Orders table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        items TEXT NOT NULL,
        total REAL NOT NULL,
        shipping_address TEXT,
        status TEXT DEFAULT 'pending',
        date DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Addresses table
    db.run(`CREATE TABLE IF NOT EXISTS addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        street TEXT NOT NULL,
        barangay TEXT NOT NULL,
        city TEXT NOT NULL,
        province TEXT NOT NULL,
        postal TEXT NOT NULL,
        is_default INTEGER DEFAULT 0
    )`);

    // Insert sample products if none exist
    db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
        if (!err && row && row.count === 0) {
            insertSampleProducts();
        }
    });
    
    console.log('Database tables initialized');
}

// Insert sample products
function insertSampleProducts() {
    const sampleProducts = [
        { name: 'HAYAT DRESS', price: 89, category: 'Dresses', image: 'images/hayatdress.jpg', stock: 10, description: 'Elegant traditional dress' },
        { name: 'MUNEERAH DRESS', price: 89, category: 'Dresses', image: 'images/muneerahdress.jpg', stock: 5, description: 'Luxury traditional dress' },
        { name: 'NYLA DRESS', price: 89, category: 'Dresses', image: 'images/nylahdress.jpg', stock: 4, description: 'Elegant dress' },
        { name: 'HAFSA DRESS', price: 89, category: 'Dresses', image: 'images/hafsahdress.jpg', stock: 5, description: 'Beautiful traditional dress' },
        { name: 'RASHIDA DRESS', price: 89, category: 'Dresses', image: 'images/rashidadress.jpg', stock: 3, description: 'Traditional dress' },
        { name: 'HILYAH LOOSE TYPE DRESS', price: 89, category: 'Dresses', image: 'images/hilyadress.jpg', stock: 4, description: 'Classic traditional dress' },
        { name: 'HABEEBAH DRESS', price: 89, category: 'Dresses', image: 'images/habeebahdress.jpg', stock: 5, description: 'Elegant traditional dress' },
        { name: 'FRENCH MOUSSE', price: 39, category: 'Scarves', image: 'images/frenchmousse1.jpg', stock: 15, description: 'Light and fluffy French hijab' },
        { name: 'BELGIAN HIJAB', price: 59, category: 'Scarves', image: 'images/belgian1.jpg', stock: 12, description: 'Premium Belgian hijab' },
        { name: 'SINGLE CURVE NIQAB', price: 59, category: 'Niqab', image: 'images/niqab1.jpg', stock: 20, description: 'Traditional niqab' }
    ];

    const stmt = db.prepare("INSERT INTO products (name, price, category, image, stock, description) VALUES (?, ?, ?, ?, ?, ?)");
    sampleProducts.forEach(product => {
        stmt.run(product.name, product.price, product.category, product.image, product.stock, product.description);
    });
    stmt.finalize();
    console.log('Sample products inserted');
}

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
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
        if (user) {
            return res.json({ success: false, message: 'Email already registered' });
        }
        db.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, password], function(err) {
            if (err) {
                return res.json({ success: false, message: 'Error creating user' });
            }
            res.json({ success: true, user: { id: this.lastID, name, email } });
        });
    });
});

// Login user
app.post('/api/users/login', (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, user) => {
        if (!user) {
            return res.json({ success: false, message: 'Invalid email or password' });
        }
        res.json({ success: true, user });
    });
});

// Get all users (for admin)
app.get('/api/users', (req, res) => {
    db.all("SELECT * FROM users", [], (err, users) => {
        if (err) {
            return res.json({ success: false, message: 'Error fetching users' });
        }
        res.json({ success: true, users });
    });
});

// Delete user
app.delete('/api/users/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM users WHERE id = ?", [id], function(err) {
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
    db.all("SELECT * FROM products", [], (err, products) => {
        if (err) {
            return res.json({ success: false, message: 'Error fetching products' });
        }
        res.json({ success: true, products });
    });
});

// Get single product
app.get('/api/products/:id', (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM products WHERE id = ?", [id], (err, product) => {
        if (err) {
            return res.json({ success: false, message: 'Error fetching product' });
        }
        res.json({ success: true, product });
    });
});

// Create product (admin)
app.post('/api/products', (req, res) => {
    const { name, price, category, image, stock, description } = req.body;
    db.run("INSERT INTO products (name, price, category, image, stock, description) VALUES (?, ?, ?, ?, ?, ?)", 
        [name, price, category, image, stock, description], function(err) {
        if (err) {
            return res.json({ success: false, message: 'Error creating product' });
        }
        res.json({ success: true, product: { id: this.lastID, name, price, category, image, stock, description } });
    });
});

// Update product (admin)
app.put('/api/products/:id', (req, res) => {
    const id = req.params.id;
    const { name, price, category, image, stock, description } = req.body;
    db.run("UPDATE products SET name = ?, price = ?, category = ?, image = ?, stock = ?, description = ? WHERE id = ?", 
        [name, price, category, image, stock, description, id], function(err) {
        if (err) {
            return res.json({ success: false, message: 'Error updating product' });
        }
        res.json({ success: true });
    });
});

// Delete product (admin)
app.delete('/api/products/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM products WHERE id = ?", [id], function(err) {
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
    const sql = `SELECT c.id as cart_id, c.quantity, c.selected, p.id, p.name, p.price, p.image 
                FROM cart_items c 
                JOIN products p ON c.product_id = p.id 
                WHERE c.user_email = ?`;
    db.all(sql, [email], (err, items) => {
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
    
    // Check if item already in cart
    db.get("SELECT * FROM cart_items WHERE user_email = ? AND product_id = ?", [userEmail, productId], (err, row) => {
        if (row) {
            // Update quantity
            db.run("UPDATE cart_items SET quantity = quantity + ? WHERE user_email = ? AND product_id = ?", 
                [quantity || 1, userEmail, productId], function(err) {
                if (err) {
                    return res.json({ success: false, message: 'Error adding to cart' });
                }
                res.json({ success: true });
            });
        } else {
            // Insert new item
            db.run("INSERT INTO cart_items (user_email, product_id, quantity) VALUES (?, ?, ?)", 
                [userEmail, productId, quantity || 1], function(err) {
                if (err) {
                    return res.json({ success: false, message: 'Error adding to cart' });
                }
                res.json({ success: true });
            });
        }
    });
});

// Update cart quantity
app.put('/api/cart/:id', (req, res) => {
    const id = req.params.id;
    const { quantity } = req.body;
    if (quantity <= 0) {
        db.run("DELETE FROM cart_items WHERE id = ?", [id], function(err) {
            if (err) {
                return res.json({ success: false, message: 'Error updating cart' });
            }
            res.json({ success: true });
        });
    } else {
        db.run("UPDATE cart_items SET quantity = ? WHERE id = ?", [quantity, id], function(err) {
            if (err) {
                return res.json({ success: false, message: 'Error updating cart' });
            }
            res.json({ success: true });
        });
    }
});

// Remove from cart
app.delete('/api/cart/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM cart_items WHERE id = ?", [id], function(err) {
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
    db.run("DELETE FROM cart_items WHERE user_email = ?", [email], function(err) {
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
    db.run("INSERT INTO orders (user_email, customer_name, items, total, shipping_address) VALUES (?, ?, ?, ?, ?)", 
        [userEmail, customerName, JSON.stringify(items), total, JSON.stringify(shippingAddress)], function(err) {
        if (err) {
            return res.json({ success: false, message: 'Error creating order' });
        }
        // Clear cart after order
        db.run("DELETE FROM cart_items WHERE user_email = ?", [userEmail], () => {});
        res.json({ success: true, orderId: this.lastID });
    });
});

// Get all orders (admin)
app.get('/api/orders', (req, res) => {
    db.all("SELECT * FROM orders ORDER BY date DESC", [], (err, orders) => {
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
    db.all("SELECT * FROM orders WHERE user_email = ? ORDER BY date DESC", [email], (err, orders) => {
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
    db.run("UPDATE orders SET status = ? WHERE id = ?", [status, id], function(err) {
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
    db.all("SELECT * FROM addresses WHERE user_email = ?", [email], (err, addresses) => {
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
    
    // Check if this is the first address (make it default)
    db.get("SELECT COUNT(*) as count FROM addresses WHERE user_email = ?", [userEmail], (err, row) => {
        const isDefault = row.count === 0 ? 1 : 0;
        db.run("INSERT INTO addresses (user_email, name, phone, street, barangay, city, province, postal, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", 
            [userEmail, address.name, address.phone, address.street, address.barangay, address.city, address.province, address.postal, isDefault], 
            function(err) {
            if (err) {
                return res.json({ success: false, message: 'Error adding address' });
            }
            res.json({ success: true });
        });
    });
});

// Delete address
app.delete('/api/addresses/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM addresses WHERE id = ?", [id], function(err) {
        if (err) {
            return res.json({ success: false, message: 'Error deleting address' });
        }
        res.json({ success: true });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser to view the website`);
});
