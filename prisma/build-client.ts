import { PrismaClient } from '@prisma/client'

// Prisma client for build-time static generation
const buildPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_BUILD || process.env.DATABASE_URL,
    },
  },
})

export default buildPrisma
