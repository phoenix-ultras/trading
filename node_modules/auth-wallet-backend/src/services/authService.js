const bcrypt = require('bcrypt');
const db = require('../config/db');
const env = require('../config/env');
const userModel = require('../models/userModel');
const walletModel = require('../models/walletModel');
const ApiError = require('../utils/ApiError');
const { normalizeEmail, normalizeUsername } = require('../utils/sanitize');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/token');

async function signup({ username, email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedUsername = normalizeUsername(username);
  const client = await db.getClient();

  try {
    await client.query('BEGIN');
    console.log('Signup transaction started', {
      username: normalizedUsername,
      email: normalizedEmail
    });

    const duplicateUserCheck = await client.query(
      `SELECT id
       FROM users
       WHERE email = $1 OR username = $2
       LIMIT 1`,
      [normalizedEmail, normalizedUsername]
    );

    if (duplicateUserCheck.rowCount > 0) {
      throw new ApiError(409, 'Email or username already exists');
    }

    const passwordHash = await bcrypt.hash(password, env.bcryptSaltRounds);
    console.log('Creating user record', {
      username: normalizedUsername,
      email: normalizedEmail
    });
    const user = await userModel.createUser(client, {
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash
    });
    console.log('User inserted successfully', {
      userId: user.id,
      username: user.username
    });

    console.log('Creating starter wallet', {
      userId: user.id,
      starterBalance: env.starterBalance
    });
    await walletModel.createWallet(client, {
      userId: user.id,
      balance: env.starterBalance
    });
    console.log('Wallet inserted successfully', {
      userId: user.id
    });

    await client.query('COMMIT');
    console.log('Signup transaction committed', {
      userId: user.id
    });

    return user;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Signup transaction rolled back', {
      username: normalizedUsername,
      email: normalizedEmail,
      error: error.message
    });
    throw error;
  } finally {
    client.release();
  }
}

async function login({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const user = await userModel.findByEmail(normalizedEmail);

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.created_at
    },
    accessToken: signAccessToken({ sub: user.id, username: user.username }),
    refreshToken: signRefreshToken({ sub: user.id })
  };
}

async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token is required');
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await userModel.findById(payload.sub);

  if (!user) {
    throw new ApiError(401, 'User no longer exists');
  }

  return {
    accessToken: signAccessToken({ sub: user.id, username: user.username })
  };
}

module.exports = {
  signup,
  login,
  refreshAccessToken
};
