CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallets (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    balance NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
    locked_balance NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (locked_balance >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (balance >= locked_balance)
);

CREATE TABLE IF NOT EXISTS markets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    outcome_type VARCHAR(20) NOT NULL DEFAULT 'YES_NO',
    yes_pool NUMERIC(18, 2) NOT NULL DEFAULT 0,
    no_pool NUMERIC(18, 2) NOT NULL DEFAULT 0,
    created_by TEXT,
    close_time TIMESTAMPTZ NOT NULL,
    settlement_rule TEXT,
    status VARCHAR(50) NOT NULL,
    result VARCHAR(10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_wallets_created_at ON wallets(created_at);
CREATE INDEX IF NOT EXISTS idx_markets_created_at ON markets(created_at);
