import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.PRISMA_LOG_LEVEL ? ['info'] : [],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
