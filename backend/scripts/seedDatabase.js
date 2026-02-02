// KODESK Database Seeding Script
// This script populates the database with sample tasks, games, and learning content

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'kodesk_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Read and execute SQL seed file
    const sqlFile = path.join(__dirname, 'seedTasks.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Execute SQL
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
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

