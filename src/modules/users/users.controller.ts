import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { notFound } from "../../utils/errors";

// GET /api/users/me — returns the authenticated user's profile.
export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    if (!user) throw notFound("User not found");
    res.json(user);
  } catch (err) {
    next(err);
  }
}

// GET /api/users — ADMIN only. Lists all users (no password hashes).
export async function listUsers(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
}
