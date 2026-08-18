import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../prisma/generated/client.ts'

/**
 * A Prisma client for the Playwright process. Deliberately built here rather
 * than imported from `@prisma-rw`, so the e2e suite doesn't depend on the
 * app's path aliases resolving inside Playwright's transpiler.
 */
export const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  }),
})
