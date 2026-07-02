// Injected before any module loads (jest setupFiles), so env validation
// in src/config/env.ts passes without a real .env during tests.
process.env.NODE_ENV = "test";
process.env.DATABASE_URL =
  "postgresql://postgres:postgres@localhost:5432/authdb?schema=public";
process.env.JWT_ACCESS_SECRET = "test_access_secret_at_least_16_chars";
process.env.JWT_REFRESH_SECRET = "test_refresh_secret_at_least_16_chars";
process.env.JWT_ACCESS_EXPIRES_IN = "15m";
process.env.JWT_REFRESH_EXPIRES_IN = "7d";
