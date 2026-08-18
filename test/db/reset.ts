import prisma from '@prisma-rw'

let cachedTables: string[] | null = null

async function tableNames(): Promise<string[]> {
  if (cachedTables) return cachedTables

  const rows = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'
  `

  cachedTables = rows.map((row) => row.tablename)
  return cachedTables
}

/**
 * Empties every application table. Cheaper and more reliable than re-running
 * migrations between tests, and `CASCADE` means we don't have to care about
 * foreign-key ordering.
 */
export async function resetDatabase(): Promise<void> {
  const tables = await tableNames()
  if (tables.length === 0) return

  const quoted = tables.map((t) => `"public"."${t}"`).join(', ')
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE`,
  )
}
