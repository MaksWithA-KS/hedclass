import mysql from 'mysql2';

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: '40083161',
    port: 3306
});

db.getConnection((err, connection) => {
    if (err) return console.log(err.message);
    console.log("Connected successfully");
    connection.release();
});

export default db.promise();