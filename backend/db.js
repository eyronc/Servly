import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  database: process.env.DB_NAME || 'servly',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Validate connection asynchronously
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('🚀 Connected to MySQL database "servly" successfully.');
    connection.release();
  } catch (err) {
    console.error('❌ Database connection failed. Verify XAMPP MySQL status and credentials.');
    console.error(`Error Details: ${err.message}`);
  }
})();

export default pool;
