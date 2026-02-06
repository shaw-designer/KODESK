// KODESK Database Seeding Script
// This script populates the database with sample tasks, games, and learning content

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load .env from backend folder
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Debug: confirm env variables are loaded
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_NAME:', process.env.DB_NAME);

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432, // ensure port is numeric
  database: process.env.DB_NAME || 'kodesk_db',
  user: process.env.DB_USER || 'postgres',
  password: String(process.env.DB_PASSWORD || ''), // ensure password is string
});

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Read and execute SQL seed file
    const sqlFile = path.join(__dirname, 'seedTasks.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    await pool.query(sql);

    console.log('✅ Database seeded successfully!');
    console.log('📊 Sample data added:');
    console.log('   - Python tasks: 10 tasks');
    console.log('   - Java tasks: 10 tasks');
    console.log('   - C++ tasks: 10 tasks');
    console.log('   - Games: 33 games (30 mini + 3 curated)');

    // Verify data
    const taskCount = await pool.query('SELECT COUNT(*) FROM tasks');
    const gameCount = await pool.query('SELECT COUNT(*) FROM games');

    console.log(`\n📈 Current database stats:`);
    console.log(`   - Total tasks: ${taskCount.rows[0].count}`);
    console.log(`   - Total games: ${gameCount.rows[0].count}`);

    await pool.end(); // close the connection
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    await pool.end(); // close connection on error
    process.exit(1);
  }
}

seedDatabase();
