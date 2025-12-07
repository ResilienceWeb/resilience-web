import { PrismaClient } from '@prisma-client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_BUILD || process.env.DATABASE_URL,
  max: 3, // Limit connections during build
  ssl: {
    rejectUnauthorized: false,
  },
})

const adapter = new PrismaPg(pool)
const buildPrisma = new PrismaClient({ adapter })

buildPrisma.$connect().catch((error) => {
  console.error('❌ Failed to connect to database during build:')
  console.error(`   Error: ${error.message}`)
  console.error('\nTroubleshooting:')
  console.error('  1. Verify your database is running and accessible')
  console.error(
    '  2. Check DATABASE_URL or DATABASE_URL_BUILD environment variable',
  )
  console.error('  3. Ensure network connectivity to the database')
  console.error('  4. Verify database credentials are correct')
  process.exit(1)
})

// Ensure cleanup: disconnect Prisma client and pool on build completion
if (typeof process !== 'undefined') {
  let isCleanedUp = false

  const cleanup = async () => {
    if (isCleanedUp) return
    isCleanedUp = true

    try {
      if (process.env.DEBUG_BUILD === 'true') {
        console.log('🔌 Disconnecting Prisma build client...')
      }
      await buildPrisma.$disconnect()
      await pool.end()
      if (process.env.DEBUG_BUILD === 'true') {
        console.log('✅ Prisma build client disconnected successfully')
      }
    } catch (error) {
      console.error('⚠️  Error disconnecting Prisma build client:', error)
    }
  }

  // Handle various process termination events
  process.on('beforeExit', cleanup)
  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
}

export default buildPrisma
