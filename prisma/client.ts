import { PrismaClient } from '@prisma-client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient
  pool: Pool
}

// Every warm serverless instance holds its own pool, so `max` multiplies by
// however many are running. 3 is the widest `Promise.all` fan-out a single
// request makes, so nothing serialises that used to run in parallel.
const POOL_MAX = Number(
  process.env.DATABASE_POOL_MAX ??
    (process.env.NODE_ENV === 'production' ? 3 : 5),
)

// Reuse pool across hot reloads in development
const pool =
  globalForPrisma.pool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: POOL_MAX,
    // Hand connections back rather than pinning them for the life of an
    // instance that has stopped receiving requests.
    idleTimeoutMillis: 10_000,
    // Wait for a free connection rather than hanging indefinitely.
    connectionTimeoutMillis: 15_000,
    ssl: {
      rejectUnauthorized: false,
    },
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.pool = pool
}

const adapter = new PrismaPg(pool)
const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
