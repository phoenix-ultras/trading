const db = require('../config/db');

async function findByEmail(email) {
  const result = await db.query(
    `SELECT id, username, email, password_hash, created_at
     FROM users
     WHERE email = $1`,
    [email]
  );

  return result.rows[0] || null;
}

async function findByUsername(username) {
  const result = await db.query(
    `SELECT id, username, email, password_hash, created_at
     FROM users
     WHERE username = $1`,
    [username]
  );

  return result.rows[0] || null;
}

async function findById(id) {
  const result = await db.query(
    `SELECT id, username, email, created_at
     FROM users
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

async function createUser(client, { username, email, passwordHash }) {
  const result = await client.query(
    `INSERT INTO users (username, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, username, email, created_at`,
    [username, email, passwordHash]
  );

  return result.rows[0];
}

module.exports = {
  findByEmail,
  findByUsername,
  findById,
  createUser
};
