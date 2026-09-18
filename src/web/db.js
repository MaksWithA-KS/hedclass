import 'dotenv/config';
import mysql from 'mysql2';

// Connection settings come from the .env file (see .env.example).
// The fallbacks below only cover a default local MySQL install.
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hedclass',
    port: Number(process.env.DB_PORT) || 3306
});

// Verifying database connection
db.getConnection((err, connection) => {
    if (err) return console.error('Database connection failed:', err.message);
    console.log("Connected successfully");
    connection.release();
});

// Export the pool wrapped in promises
export default db.promise();
