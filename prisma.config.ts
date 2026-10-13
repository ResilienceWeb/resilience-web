import nextEnv from '@next/env'
import { defineConfig, env } from 'prisma/config'

// Load .env the way Next does: plain dotenv leaves ${VAR} references in
// DATABASE_URL unexpanded, which Prisma rejects as an invalid port.
nextEnv.loadEnvConfig(process.cwd())

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
  migrations: {
    path: 'prisma/migrations',
    seed: 'node prisma/seed.ts',
  },
})
