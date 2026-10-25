/**
 * Folds web tags that duplicate a shared tag into it: for each web tag whose
 * label matches a shared tag's (ignoring case and surrounding space, nothing
 * fuzzier), its listings move to the shared tag and the web tag is deleted.
 *
 * Prints what it would change and stops, unless given --apply. Rerun it
 * whenever a migration adds a shared tag.
 *
 * Usage: node scripts/merge-web-tags-into-shared-tags.ts [--apply]
 */
import nextEnv from '@next/env'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  findWebTagsDuplicatingSharedTags,
  mergeWebTagsIntoSharedTags,
} from '../db/sharedTagCleanup.ts'
import { PrismaClient } from '../prisma/generated/client.ts'
import { sslFor } from '../prisma/ssl.ts'

nextEnv.loadEnvConfig(process.cwd())

const apply = process.argv.includes('--apply')

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    ssl: sslFor(process.env.DATABASE_URL),
  }),
})

try {
  const duplicates = await findWebTagsDuplicatingSharedTags(prisma)

  if (duplicates.length === 0) {
    console.log('No web tag shares a name with a shared tag.')
  } else {
    console.table(
      duplicates.map((d) => ({
        web: d.webSlug,
        tag: d.webTag.label,
        'shared tag': d.sharedTag.key,
        listings: d.placementIds.length,
        'pending edits': d.listingEditIds.length,
      })),
    )

    if (apply) {
      await mergeWebTagsIntoSharedTags(prisma, duplicates)
      console.log(`Merged ${duplicates.length} web tags into shared tags.`)
    } else {
      console.log('Dry run: nothing changed. Rerun with --apply to merge.')
    }
  }
} finally {
  await prisma.$disconnect()
}
