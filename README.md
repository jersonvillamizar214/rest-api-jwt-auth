# REST API with JWT Authentication

[![CI](https://github.com/jersonvillamizar214/rest-api-jwt-auth/actions/workflows/ci.yml/badge.svg)](https://github.com/jersonvillamizar214/rest-api-jwt-auth/actions/workflows/ci.yml)

A production-ready REST API demonstrating secure authentication with JSON Web Tokens, built with a clean, layered architecture.

> Part of my developer portfolio — showcasing backend fundamentals: authentication, validation, error handling, testing, and containerization.

## Tech Stack

| Layer            | Technology                          |
| ---------------- | ----------------------------------- |
| Language         | TypeScript                          |
| Runtime          | Node.js 20                          |
| Framework        | Express                             |
| ORM              | Prisma                              |
| Database         | PostgreSQL                          |
| Auth             | JWT (access + refresh) + bcrypt     |
| Validation       | Zod                                 |
| Security headers | Helmet                              |
| Testing          | Jest + Supertest                    |
| CI               | GitHub Actions                      |
| Containerization | Docker + Docker Compose             |

## Features

- **Register / Login** with bcrypt-hashed passwords (plaintext is never stored).
- **JWT access & refresh tokens** — short-lived access token, long-lived refresh token.
- **Refresh token rotation** — refresh tokens are persisted and revoked on use, enabling real logout.
- **Role-based authorization** (`USER` / `ADMIN`) via middleware.
- **Request validation** with Zod and a centralized error handler.
- **Secure defaults** — Helmet, CORS, environment validation at startup.
- **Graceful shutdown** and a `/health` liveness probe.

## Architecture

```
src/
├── config/        # env validation (fail-fast at startup)
├── lib/           # Prisma client singleton
├── utils/         # errors, JWT helpers
├── middlewares/   # auth, validation, error handling
├── modules/
│   ├── auth/      # schema · service · controller · routes
│   └── users/     # protected user routes
├── app.ts         # Express app factory
└── server.ts      # bootstrap + graceful shutdown
```

Each module follows **routes → controller → service**: controllers stay thin, business logic lives in services, and all errors bubble up to one handler.

## Getting Started

### Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env        # then edit secrets as needed

# 3. Start PostgreSQL
docker compose up -d

# 4. Apply the database schema
npm run prisma:migrate

# 5. Run in development (hot reload)
npm run dev
```

The API is now on `http://localhost:3000`.

## API Reference

Base URL: `/api`

| Method | Endpoint         | Auth        | Description                          |
| ------ | ---------------- | ----------- | ------------------------------------ |
| POST   | `/auth/register` | —           | Create an account, returns tokens    |
| POST   | `/auth/login`    | —           | Log in, returns tokens               |
| POST   | `/auth/refresh`  | —           | Rotate tokens using a refresh token  |
| POST   | `/auth/logout`   | —           | Revoke a refresh token               |
| GET    | `/users/me`      | Bearer      | Current user's profile               |
| GET    | `/users`         | Bearer ADMIN| List all users                       |
| GET    | `/health`        | —           | Liveness probe                       |

### Example

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada Lovelace","email":"ada@example.com","password":"supersecret"}'

# Access a protected route
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer <accessToken>"
```

## Scripts

| Script                   | Description                     |
| ------------------------ | ------------------------------- |
| `npm run dev`            | Dev server with hot reload      |
| `npm run build`          | Compile TypeScript to `dist/`   |
| `npm start`              | Run the compiled build          |
| `npm test`               | Run the test suite              |
| `npm run lint`           | Lint the codebase               |
| `npm run prisma:migrate` | Create/apply a dev migration    |

## Testing

```bash
npm test
```

Tests cover JWT signing/verification and the routing/validation/auth layers via Supertest — no live database required, so they run cleanly in CI.

## Security Notes

- Passwords are hashed with **bcrypt** (10 salt rounds).
- Login returns the same error for unknown email and wrong password to prevent **user enumeration**.
- Refresh tokens are **persisted and rotated**, allowing server-side revocation.
- Environment variables are **validated at startup** — the app refuses to boot with a missing/invalid config.

## License

MIT
