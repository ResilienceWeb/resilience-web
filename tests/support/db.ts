import { PrismaClient } from '@prisma-client'
import { PrismaPg } from '@prisma/adapter-pg'

/**
 * A Prisma client for the Playwright process.
 *
 * Built here rather than reusing the `@prisma-rw` singleton: that one is shaped
 * for the running server (pooled, cached across hot reloads), and the e2e suite
 * only needs a short-lived connection to seed a sign-in.
 */
export const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  }),
})
