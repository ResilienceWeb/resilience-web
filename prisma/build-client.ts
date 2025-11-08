import { PrismaClient } from '@prisma-client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL_BUILD || process.env.DATABASE_URL,
})

const buildPrisma = new PrismaClient({ adapter })

export default buildPrisma
