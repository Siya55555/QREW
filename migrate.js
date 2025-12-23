#!/usr/bin/env node
/**
 * SQLite migration script
 * Initializes the database schema and optionally migrates from JSON config
 */
require('dotenv').config();
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'qrew.db');
const CONFIG_PATH = path.join(__dirname, 'data', 'config.json');

console.log('Initializing SQLite database...');

// Create database
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY,
    exclusiveEnabled INTEGER DEFAULT 0,
    passwordHash TEXT NOT NULL,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    priceCents INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    productId TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    stripeSessionId TEXT,
    status TEXT DEFAULT 'pending',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(productId) REFERENCES products(id)
  );
`);

console.log('Database schema created.');

// Migrate from JSON if it exists and DB is empty
const settings = db.prepare('SELECT COUNT(*) as count FROM settings').get();
if (settings.count === 0 && fs.existsSync(CONFIG_PATH)) {
  console.log('Migrating from config.json...');
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  
  db.prepare('INSERT INTO settings (passwordHash, exclusiveEnabled) VALUES (?, ?)').run(
    config.passwordHash || '',
    config.exclusiveEnabled ? 1 : 0
  );
  
  if (config.exclusiveProducts && Array.isArray(config.exclusiveProducts)) {
    const insert = db.prepare('INSERT OR REPLACE INTO products (id, title, description, priceCents) VALUES (?, ?, ?, ?)');
    config.exclusiveProducts.forEach(p => {
      insert.run(p.id, p.title, p.desc || '', p.priceCents || 0);
    });
  }
  console.log('Migration complete.');
} else if (settings.count === 0) {
  console.log('No existing data found. Creating default settings...');
  const bcrypt = require('bcrypt');
  const hash = require('crypto').randomBytes(16).toString('hex');
  // Note: In production, you should set a proper password via admin UI
  db.prepare('INSERT INTO settings (passwordHash, exclusiveEnabled) VALUES (?, ?)').run(hash, 0);
}

console.log('✓ Database ready at:', DB_PATH);
db.close();
