const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Build a path relative to your project folder
const dbPath = path.join(__dirname, 'database', 'monisaadb');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the monisaadb database at', dbPath);
    }
});