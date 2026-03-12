const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database
const dbPath = path.join(__dirname, 'monisa.db');
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
        if (row.count === 0) {
            insertSampleProducts();
        }
    });
    
    console.log('Database tables initialized');
}

// Insert sample products
function insertSampleProducts() {
    const sampleProducts = [
        { name: 'Belgian Chocolate Cake', price: 1500, category: 'Cakes', image: 'belgian1.jpg', stock: 10, description: 'Rich Belgian chocolate cake' },
        { name: 'French Mousse', price: 800, category: 'Desserts', image: 'frenchmousse1.jpg', stock: 15, description: 'Light and fluffy French mousse' },
        { name: 'Habeebah Dress', price: 2500, category: 'Dresses', image: 'habeebahdress.jpg', stock: 5, description: 'Elegant traditional dress' },
        { name: 'Hafsah Dress', price: 2200, category: 'Dresses', image: 'hafsahdress.jpg', stock: 5, description: 'Beautiful traditional dress' },
        { name: 'Hayat Dress', price: 2800, category: 'Dresses', image: 'hayatdress.jpg', stock: 3, description: 'Premium traditional dress' },
        { name: 'Hiyad Dress', price: 2100, category: 'Dresses', image: 'hilyadress.jpg', stock: 4, description: 'Classic traditional dress' },
        { name: 'Muneerah Dress', price: 3000, category: 'Dresses', image: 'muneerahdress.jpg', stock: 2, description: 'Luxury traditional dress' },
        { name: 'Niqab', price: 500, category: 'Accessories', image: 'niqab1.jpg', stock: 20, description: 'Traditional niqab' },
        { name: 'Nylah Dress', price: 2400, category: 'Dresses', image: 'nylahdress.jpg', stock: 4, description: 'Elegant dress' },
        { name: 'Rashid Dress', price: 2600, category: 'Dresses', image: 'rashidaddress.jpg', stock: 3, description: 'Traditional dress' }
    ];

    const stmt = db.prepare("INSERT INTO products (name, price, category, image, stock, description) VALUES (?, ?, ?, ?, ?, ?)");
    sampleProducts.forEach(product => {
        stmt.run(product.name, product.price, product.category, product.image, product.stock, product.description);
    });
    stmt.finalize();
    console.log('Sample products inserted');
}

// User functions
function createUser(name, email, password, callback) {
    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.run(sql, [name, email, password], function(err) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, { id: this.lastID, name, email });
        }
    });
}

function getUserByEmail(email, callback) {
    const sql = "SELECT * FROM users WHERE email = ?";
    db.get(sql, [email], (err, row) => {
        callback(err, row);
    });
}

function getAllUsers(callback) {
    const sql = "SELECT * FROM users";
    db.all(sql, [], (err, rows) => {
        callback(err, rows);
    });
}

function deleteUserById(id, callback) {
    const sql = "DELETE FROM users WHERE id = ?";
    db.run(sql, [id], function(err) {
        callback(err, this.changes);
    });
}

// Product functions
function getAllProducts(callback) {
    const sql = "SELECT * FROM products";
    db.all(sql, [], (err, rows) => {
        callback(err, rows);
    });
}

function getProductById(id, callback) {
    const sql = "SELECT * FROM products WHERE id = ?";
    db.get(sql, [id], (err, row) => {
        callback(err, row);
    });
}

function createProduct(name, price, category, image, stock, description, callback) {
    const sql = "INSERT INTO products (name, price, category, image, stock, description) VALUES (?, ?, ?, ?, ?, ?)";
    db.run(sql, [name, price, category, image, stock, description], function(err) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, { id: this.lastID, name, price, category, image, stock, description });
        }
    });
}

function updateProduct(id, name, price, category, image, stock, description, callback) {
    const sql = "UPDATE products SET name = ?, price = ?, category = ?, image = ?, stock = ?, description = ? WHERE id = ?";
    db.run(sql, [name, price, category, image, stock, description, id], function(err) {
        callback(err, this.changes);
    });
}

function deleteProductById(id, callback) {
    const sql = "DELETE FROM products WHERE id = ?";
    db.run(sql, [id], function(err) {
        callback(err, this.changes);
    });
}

// Cart functions
function getCartItems(userEmail, callback) {
    const sql = `SELECT c.id as cart_id, c.quantity, c.selected, p.id, p.name, p.price, p.image 
                FROM cart_items c 
                JOIN products p ON c.product_id = p.id 
                WHERE c.user_email = ?`;
    db.all(sql, [userEmail], (err, rows) => {
        callback(err, rows);
    });
}

function addToCart(userEmail, productId, quantity, callback) {
    // Check if item already in cart
    const checkSql = "SELECT * FROM cart_items WHERE user_email = ? AND product_id = ?";
    db.get(checkSql, [userEmail, productId], (err, row) => {
        if (row) {
            // Update quantity
            const updateSql = "UPDATE cart_items SET quantity = quantity + ? WHERE user_email = ? AND product_id = ?";
            db.run(updateSql, [quantity, userEmail, productId], function(err) {
                callback(err, this.changes);
            });
        } else {
            // Insert new item
            const insertSql = "INSERT INTO cart_items (user_email, product_id, quantity) VALUES (?, ?, ?)";
            db.run(insertSql, [userEmail, productId, quantity], function(err) {
                callback(err, this.lastID);
            });
        }
    });
}

function updateCartQuantity(cartId, quantity, callback) {
    if (quantity <= 0) {
        const sql = "DELETE FROM cart_items WHERE id = ?";
        db.run(sql, [cartId], function(err) {
            callback(err, this.changes);
        });
    } else {
        const sql = "UPDATE cart_items SET quantity = ? WHERE id = ?";
        db.run(sql, [quantity, cartId], function(err) {
            callback(err, this.changes);
        });
    }
}

function updateCartSelection(cartId, selected, callback) {
    const sql = "UPDATE cart_items SET selected = ? WHERE id = ?";
    db.run(sql, [selected ? 1 : 0, cartId], function(err) {
        callback(err, this.changes);
    });
}

function removeFromCart(cartId, callback) {
    const sql = "DELETE FROM cart_items WHERE id = ?";
    db.run(sql, [cartId], function(err) {
        callback(err, this.changes);
    });
}

function clearCart(userEmail, callback) {
    const sql = "DELETE FROM cart_items WHERE user_email = ?";
    db.run(sql, [userEmail], function(err) {
        callback(err, this.changes);
    });
}

// Order functions
function createOrder(userEmail, customerName, items, total, shippingAddress, callback) {
    const sql = "INSERT INTO orders (user_email, customer_name, items, total, shipping_address) VALUES (?, ?, ?, ?, ?)";
    db.run(sql, [userEmail, customerName, JSON.stringify(items), total, JSON.stringify(shippingAddress)], function(err) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, { id: this.lastID });
        }
    });
}

function getAllOrders(callback) {
    const sql = "SELECT * FROM orders ORDER BY date DESC";
    db.all(sql, [], (err, rows) => {
        callback(err, rows);
    });
}

function getOrdersByEmail(userEmail, callback) {
    const sql = "SELECT * FROM orders WHERE user_email = ? ORDER BY date DESC";
    db.all(sql, [userEmail], (err, rows) => {
        callback(err, rows);
    });
}

function updateOrderStatus(orderId, status, callback) {
    const sql = "UPDATE orders SET status = ? WHERE id = ?";
    db.run(sql, [status, orderId], function(err) {
        callback(err, this.changes);
    });
}

// Address functions
function getAddresses(userEmail, callback) {
    const sql = "SELECT * FROM addresses WHERE user_email = ?";
    db.all(sql, [userEmail], (err, rows) => {
        callback(err, rows);
    });
}

function addAddress(userEmail, address, callback) {
    // Check if this is the first address (make it default)
    db.get("SELECT COUNT(*) as count FROM addresses WHERE user_email = ?", [userEmail], (err, row) => {
        const isDefault = row.count === 0 ? 1 : 0;
        const sql = "INSERT INTO addresses (user_email, name, phone, street, barangay, city, province, postal, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        db.run(sql, [userEmail, address.name, address.phone, address.street, address.barangay, address.city, address.province, address.postal, isDefault], function(err) {
            callback(err, { id: this.lastID });
        });
    });
}

function deleteAddress(addressId, callback) {
    const sql = "DELETE FROM addresses WHERE id = ?";
    db.run(sql, [addressId], function(err) {
        callback(err, this.changes);
    });
}

function setDefaultAddress(userEmail, addressId, callback) {
    // First, unset all defaults for this user
    db.run("UPDATE addresses SET is_default = 0 WHERE user_email = ?", [userEmail], (err) => {
        if (err) {
            callback(err);
            return;
        }
        // Then set the new default
        db.run("UPDATE addresses SET is_default = 1 WHERE id = ?", [addressId], function(err) {
            callback(err, this.changes);
        });
    });
}

module.exports = {
    db,
    // User functions
    createUser,
    getUserByEmail,
    getAllUsers,
    deleteUserById,
    // Product functions
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProductById,
    // Cart functions
    getCartItems,
    addToCart,
    updateCartQuantity,
    updateCartSelection,
    removeFromCart,
    clearCart,
    // Order functions
    createOrder,
    getAllOrders,
    getOrdersByEmail,
    updateOrderStatus,
    // Address functions
    getAddresses,
    addAddress,
    deleteAddress,
    setDefaultAddress
};
