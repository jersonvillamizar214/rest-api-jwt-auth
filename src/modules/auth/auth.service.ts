import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";
import { conflict, unauthorized } from "../../utils/errors";
import { LoginInput, RegisterInput } from "./auth.schema";

const SALT_ROUNDS = 10;

// Shape returned to clients — never includes the password hash.
const toPublicUser = (user: {
  id: string;
  email: string;
  name: string;
  role: string;
}) => ({ id: user.id, email: user.email, name: user.name, role: user.role });

function issueTokens(user: { id: string; email: string; role: string }) {
  const payload = { sub: user.id, email: user.email, role: user.role };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

async function persistRefreshToken(userId: string, token: string) {
  // Mirror the JWT's 7-day lifetime for the DB record.
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await prisma.refreshToken.create({ data: { token, userId, expiresAt } });
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing) throw conflict("Email is already registered");

  const hash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, password: hash },
  });

  const tokens = issueTokens(user);
  await persistRefreshToken(user.id, tokens.refreshToken);
  return { user: toPublicUser(user), ...tokens };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });
  // Same error for unknown email and wrong password — avoids user enumeration.
  if (!user) throw unauthorized("Invalid credentials");

  const valid = await bcrypt.compare(input.password, user.password);
  if (!valid) throw unauthorized("Invalid credentials");

  const tokens = issueTokens(user);
  await persistRefreshToken(user.id, tokens.refreshToken);
  return { user: toPublicUser(user), ...tokens };
}

// Rotates the refresh token: the old one is revoked and a fresh pair issued.
export async function refresh(oldToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(oldToken);
  } catch {
    throw unauthorized("Invalid or expired refresh token");
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { token: oldToken },
  });
  if (!stored) throw unauthorized("Refresh token has been revoked");

  await prisma.refreshToken.delete({ where: { token: oldToken } });

  const tokens = issueTokens({
    id: payload.sub,
    email: payload.email,
    role: payload.role,
  });
  await persistRefreshToken(payload.sub, tokens.refreshToken);
  return tokens;
}

export async function logout(refreshToken: string) {
  // Idempotent: deleteMany won't throw if the token is already gone.
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
}
