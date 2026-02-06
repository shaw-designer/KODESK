// KODESK Database Migration Script
// Runs initDatabase.sql to create/update the schema

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
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'kodesk_db',
  user: process.env.DB_USER || 'postgres',
  password: String(process.env.DB_PASSWORD || ''), // ensure password is string
});

async function migrate() {
  try {
    console.log('\nRunning database migrations...');

    const sqlFile = path.join(__dirname, 'initDatabase.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    await pool.query(sql);

    // Create arcade scores table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_arcade_scores (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        game_id VARCHAR(50) NOT NULL,
        score INTEGER NOT NULL DEFAULT 0,
        played_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('Database migrations completed successfully.\n');

    // Verify tables
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('Current tables:');
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    await pool.end(); // cleanly close connection
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await pool.end(); // close connection on error too
    process.exit(1);
  }
}

migrate();
