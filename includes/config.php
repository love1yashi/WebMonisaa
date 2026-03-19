<?php
// Database configuration
define('DB_PATH', __DIR__ . '/../monisa.db');

// PDO connection with error handling
function getDB() {
    try {
        $db = new PDO('sqlite:' . DB_PATH);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $db->exec('PRAGMA foreign_keys = ON;');
        return $db;
    } catch (PDOException $e) {
        die('Connection failed: ' . $e->getMessage());
    }
}

// Initialize tables if they don't exist
function initDB() {
    $db = getDB();
    $tables = [
        'users' => 'CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )',
        'products' => 'CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            category TEXT,
            image TEXT,
            stock INTEGER DEFAULT 0,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )',
        'cart_items' => 'CREATE TABLE IF NOT EXISTS cart_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER DEFAULT 1,
            selected BOOLEAN DEFAULT 1,
            FOREIGN KEY (product_id) REFERENCES products(id)
        )',
        'orders' => 'CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            customer_name TEXT NOT NULL,
            customer_email TEXT,
            items TEXT NOT NULL,
            total REAL NOT NULL,
            shipping_address TEXT,
            status TEXT DEFAULT \"pending\",
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )',
        'addresses' => 'CREATE TABLE IF NOT EXISTS addresses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            street TEXT NOT NULL,
            barangay TEXT NOT NULL,
            city TEXT NOT NULL,
            province TEXT NOT NULL,
            postal TEXT,
            is_default BOOLEAN DEFAULT 0
        )'
    ];

    foreach ($tables as $table) {
        $db->exec($table);
    }

    // Insert sample products if empty
    $stmt = $db->query('SELECT COUNT(*) FROM products');
    if ($stmt->fetchColumn() == 0) {
        $samples = [
            ['HAYAT DRESS', 89, 'Dresses', 'images/hayatdress.jpg', 10, 'Elegant traditional dress'],
            ['MUNEERAH DRESS', 89, 'Dresses', 'images/muneerahdress.jpg', 5, 'Luxury traditional dress'],
            ['NYLA DRESS', 89, 'Dresses', 'images/nylahdress.jpg', 4, 'Elegant dress'],
            ['HAFSA DRESS', 89, 'Dresses', 'images/hafsahdress.jpg', 5, 'Beautiful traditional dress'],
            ['RASHIDA DRESS', 89, 'Dresses', 'images/rashidadress.jpg', 3, 'Traditional dress'],
            ['HILYAH LOOSE TYPE DRESS', 89, 'Dresses', 'images/hilyadress.jpg', 4, 'Classic traditional dress'],
            ['HABEEBAH DRESS', 89, 'Dresses', 'images/habeebahdress.jpg', 5, 'Elegant traditional dress'],
            ['FRENCH MOUSSE', 39, 'Scarves', 'images/frenchmousse1.jpg', 15, 'Light French hijab'],
            ['BELGIAN HIJAB', 59, 'Scarves', 'images/belgian1.jpg', 12, 'Premium Belgian hijab'],
            ['SINGLE CURVE NIQAB', 59, 'Niqab', 'images/niqab1.jpg', 20, 'Traditional niqab']
        ];
        
        $insert = $db->prepare('INSERT INTO products (name, price, category, image, stock, description) VALUES (?, ?, ?, ?, ?, ?)');
        foreach ($samples as $product) {
            $insert->execute($product);
        }
    }
}

// Initialize on first load
if (!file_exists(DB_PATH)) {
    initDB();
}
session_start();
?>

