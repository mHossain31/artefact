// This file is for local development with Prisma + MongoDB
// In v0 environment, we use the in-memory database from lib/database.ts

// Uncommented for local development with proper DATABASE_URL:
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// For v0 demo, export a placeholder
// export const prisma = null