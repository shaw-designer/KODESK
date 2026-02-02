// KODESK Database Migration Script
// Runs initDatabase.sql to create/update the schema

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

async function migrate() {
  try {
    console.log('Running database migrations...');

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

    console.log('Database migrations completed successfully.');

    // Verify tables
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('\nCurrent tables:');
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
