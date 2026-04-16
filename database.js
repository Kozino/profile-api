import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let dbInstance = null;

export async function getDatabase() {
  if (!dbInstance) {
    dbInstance = await open({
      filename: join(__dirname, 'profiles.db'),
      driver: sqlite3.Database
    });
    
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        gender TEXT,
        gender_probability REAL,
        sample_size INTEGER,
        age INTEGER,
        age_group TEXT,
        country_id TEXT,
        country_probability REAL,
        created_at TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_name ON profiles(name);
      CREATE INDEX IF NOT EXISTS idx_gender ON profiles(gender);
      CREATE INDEX IF NOT EXISTS idx_country_id ON profiles(country_id);
      CREATE INDEX IF NOT EXISTS idx_age_group ON profiles(age_group);
    `);
  }
  
  return dbInstance;
}
