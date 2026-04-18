import mysql from 'mysql2';

// Creating a connection pool
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: '40083161',
    port: 3306
});

// Verifying database connection
db.getConnection((err, connection) => {
    if (err) return console.error('Database connection failed:', err.message);
    console.log("Connected successfully");
    connection.release();
});

// Export the pool wrapped in promises
export default db.promise();