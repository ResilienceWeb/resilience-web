import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['info'],
  })

if (process.env.NODE_ENV === 'development') {
  globalForPrisma.prisma = prisma
}

export default prisma
