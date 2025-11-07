import { PrismaClient } from '@prisma-client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL_BUILD || process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

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

// Ensure cleanup: disconnect Prisma client on build completion
if (typeof process !== 'undefined') {
  const cleanup = async () => {
    try {
      if (process.env.DEBUG_BUILD === 'true') {
        console.log('🔌 Disconnecting Prisma build client...')
      }
      await buildPrisma.$disconnect()
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
  process.on('exit', () => {
    // Synchronous cleanup on exit
    buildPrisma.$disconnect()
  })
}

export default buildPrisma
