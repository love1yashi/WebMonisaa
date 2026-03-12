const sqlite3 = require('sqlite3').verbose();

// Connect to your database file
const db = new sqlite3.Database('C:/Users/DELL/Desktop/database/monisaadb', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the monisaadb database.');
  }
});

console.log("Current working directory:", process.cwd());

