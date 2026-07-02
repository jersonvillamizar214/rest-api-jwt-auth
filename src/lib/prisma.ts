import { PrismaClient } from "@prisma/client";

// Single shared instance to avoid exhausting the DB connection pool.
export const prisma = new PrismaClient();
