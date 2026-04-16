import { v7 as uuidv7 } from 'uuid';
import { getDatabase } from '../database.js';

export async function createProfile(profileData) {
  const db = await getDatabase();
  const id = uuidv7();
  const now = new Date().toISOString();
  
  await db.run(
    `INSERT INTO profiles (id, name, gender, gender_probability, sample_size, 
     age, age_group, country_id, country_probability, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, profileData.name, profileData.gender, profileData.gender_probability,
      profileData.sample_size, profileData.age, profileData.age_group,
      profileData.country_id, profileData.country_probability, now
    ]
  );
  
  return { id, ...profileData, created_at: now };
}

export async function findProfileByName(name) {
  const db = await getDatabase();
  return db.get('SELECT * FROM profiles WHERE name = ? COLLATE NOCASE', [name]);
}

export async function findProfileById(id) {
  const db = await getDatabase();
  return db.get('SELECT * FROM profiles WHERE id = ?', [id]);
}

export async function getAllProfiles(filters = {}) {
  const db = await getDatabase();
  let query = 'SELECT id, name, gender, age, age_group, country_id FROM profiles WHERE 1=1';
  const params = [];
  
  if (filters.gender) {
    query += ' AND gender = ? COLLATE NOCASE';
    params.push(filters.gender);
  }
  
  if (filters.country_id) {
    query += ' AND country_id = ? COLLATE NOCASE';
    params.push(filters.country_id);
  }
  
  if (filters.age_group) {
    query += ' AND age_group = ? COLLATE NOCASE';
    params.push(filters.age_group);
  }
  
  return db.all(query, params);
}

export async function deleteProfile(id) {
  const db = await getDatabase();
  const result = await db.run('DELETE FROM profiles WHERE id = ?', [id]);
  return result.changes > 0;
}
