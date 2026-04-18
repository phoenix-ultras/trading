# Auth + Wallet System

Production-oriented authentication and wallet starter built with:

- Backend: Node.js + Express
- Database: PostgreSQL
- Frontend: React + Vite
- Auth: JWT access tokens + refresh cookie
- Password hashing: bcrypt

## Project Structure

```text
backend/
  sql/schema.sql
  src/
frontend/
  src/
```

## Backend Features

- Signup and login with bcrypt hashing (`12` salt rounds by default)
- Input validation with `express-validator`
- JWT access token + httpOnly refresh token flow
- Wallet created automatically on signup with `1000` starter coins
- Protected wallet route
- Rate limiting, CORS, Helmet, cookie parsing, central error handling
- Transaction-safe wallet update service ready for future trade locking logic

## API Endpoints

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/wallet`
- `GET /api/health`

## Setup Instructions

### 1. Create the PostgreSQL database

```sql
CREATE DATABASE auth_wallet;
```

### 2. Apply the schema

Run the SQL in `backend/sql/schema.sql`.

### 3. Configure backend environment

Copy `backend/.env.example` to `backend/.env` and set:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `CLIENT_ORIGIN`

### 4. Install backend dependencies and run

```bash
cd backend
npm install
npm run dev
```

### 5. Configure frontend environment

Copy `frontend/.env.example` to `frontend/.env`.

### 6. Install frontend dependencies and run

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the backend at `http://localhost:5000/api` and Vite runs on `http://localhost:5173`.

### Optional: run both apps from the project root

```bash
cd D:\\projects
npm install
npm run dev
```

If you are using PowerShell on Windows and `npm` is blocked by execution policy, use `npm.cmd` instead:

```bash
npm.cmd install
npm.cmd run dev
```

The root dev script starts both the backend and frontend together without any global tools.

## Auth Flow Notes

- Login returns an access token in JSON.
- The refresh token is stored in an `httpOnly` cookie.
- The frontend stores the short-lived access token in `localStorage` and refreshes it when needed.
- For a stricter production deployment, move the access token to in-memory storage and add refresh-token rotation persistence.

## Wallet Notes

- `balance` tracks total wallet funds.
- `locked_balance` tracks reserved funds for future trade or order placement.
- Updates should go through the wallet service transaction flow to preserve invariants.
