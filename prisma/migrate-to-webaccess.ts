import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateToWebAccess() {
  console.log('🚀 Starting migration to WebAccess...')

  try {
    // Get counts for reporting
    const ownershipCount = await prisma.ownership.count()
    const permissionCount = await prisma.permission.count()
    console.log(
      `📊 Found ${ownershipCount} ownership records and ${permissionCount} permission records`,
    )

    let migratedOwners = 0
    let migratedEditors = 0

    // Step 1: Migrate Ownership records to WebAccess with OWNER role
    console.log('👑 Migrating ownership records to OWNER role...')
    const ownerships = await prisma.ownership.findMany({
      include: { webs: true },
    })

    for (const ownership of ownerships) {
      for (const web of ownership.webs) {
        try {
          await prisma.webAccess.upsert({
            where: {
              user_web_access: {
                email: ownership.email,
                webId: web.id,
              },
            },
            update: {
              role: 'OWNER', // Upgrade to owner if already exists
            },
            create: {
              email: ownership.email,
              webId: web.id,
              role: 'OWNER',
            },
          })
          migratedOwners++
          console.log(
            `  ✅ Added OWNER access for ${ownership.email} to web ${web.slug}`,
          )
        } catch (error) {
          console.error(
            `  ❌ Failed to migrate owner ${ownership.email} for web ${web.slug}:`,
            error,
          )
        }
      }
    }

    // Step 2: Migrate Permission records to WebAccess with EDITOR role
    console.log('✏️  Migrating permission records to EDITOR role...')
    const permissions = await prisma.permission.findMany({
      include: { webs: true },
    })

    for (const permission of permissions) {
      for (const web of permission.webs) {
        try {
          await prisma.webAccess.upsert({
            where: {
              user_web_access: {
                email: permission.email,
                webId: web.id,
              },
            },
            update: {
              // Don't downgrade existing owners to editors
              // Only update if current role is EDITOR
              ...((
                await prisma.webAccess.findUnique({
                  where: {
                    user_web_access: {
                      email: permission.email,
                      webId: web.id,
                    },
                  },
                })
              )?.role === 'EDITOR' && { role: 'EDITOR' }),
            },
            create: {
              email: permission.email,
              webId: web.id,
              role: 'EDITOR',
            },
          })
          migratedEditors++
          console.log(
            `  ✅ Added EDITOR access for ${permission.email} to web ${web.slug}`,
          )
        } catch (error) {
          console.error(
            `  ❌ Failed to migrate editor ${permission.email} for web ${web.slug}:`,
            error,
          )
        }
      }
    }

    // Step 3: Verify migration
    console.log('🔍 Verifying migration...')
    const webAccessCount = await prisma.webAccess.count()
    const ownerCount = await prisma.webAccess.count({
      where: { role: 'OWNER' },
    })
    const editorCount = await prisma.webAccess.count({
      where: { role: 'EDITOR' },
    })

    console.log(`📈 Migration Summary:`)
    console.log(`  - Total WebAccess records created: ${webAccessCount}`)
    console.log(`  - OWNER records: ${ownerCount}`)
    console.log(`  - EDITOR records: ${editorCount}`)
    console.log(`  - Owner migrations: ${migratedOwners}`)
    console.log(`  - Editor migrations: ${migratedEditors}`)

    // Step 4: Check for any users who might have been missed
    const usersWithoutAccess = await prisma.user.findMany({
      where: {
        AND: [
          { email: { not: null } },
          { webAccess: { none: {} } },
          {
            OR: [{ permission: { some: {} } }, { ownerships: { some: {} } }],
          },
        ],
      },
      include: {
        permission: { include: { webs: true } },
        ownerships: { include: { webs: true } },
      },
    })

    if (usersWithoutAccess.length > 0) {
      console.log(
        `⚠️  Found ${usersWithoutAccess.length} users with old permissions but no WebAccess:`,
      )
      usersWithoutAccess.forEach((user) => {
        console.log(
          `  - ${user.email}: ${user.permission.length} permissions, ${user.ownerships.length} ownerships`,
        )
      })
    }

    console.log('✅ Migration to WebAccess completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
migrateToWebAccess()
  .then(() => {
    console.log('🎉 Migration script completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Migration script failed:', error)
    process.exit(1)
  })

export default migrateToWebAccess
