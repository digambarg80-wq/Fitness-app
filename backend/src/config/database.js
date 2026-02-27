const { Pool } = require('pg');
require('dotenv').config();

// Create connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully!');
    console.log(`📊 Connected to database: ${process.env.DB_NAME}`);
    console.log(`📋 Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    client.release();
  } catch (err) {
    console.error('❌ Database connection failed!');
    console.error('Error details:', err.message);
    
    // Common error solutions
    if (err.code === 'ECONNREFUSED') {
      console.error('👉 PostgreSQL server is not running!');
      console.error('✅ Solution: Start PostgreSQL service');
      console.error('   • Open Services (services.msc)');
      console.error('   • Find "postgresql-x64-18" and click Start');
    } else if (err.code === '28P01') {
      console.error('👉 Password is incorrect!');
      console.error('✅ Solution: Update password in .env file');
    } else if (err.code === '3D000') {
      console.error(`👉 Database "${process.env.DB_NAME}" does not exist!`);
      console.error('✅ Solution: Create database in pgAdmin');
    } else if (err.code === '42P01') {
      console.error('👉 Table does not exist!');
      console.error('✅ Solution: Create tables first');
    }
    
    process.exit(1); // Exit if database connection fails
  }
};

// Run the test
testConnection();

// Export query function
module.exports = {
  query: (text, params) => pool.query(text, params),
};