import { revalidatePath } from 'next/cache'
import type { NextRequest } from 'next/server'
import { generateSlug as generateBaseSlug } from '@/helpers/utils'
import { geocodeAddress } from '@/lib/import/geocoder'
import { mapRows } from '@/lib/import/mapper'
import {
  createBatches,
  createNameSet,
  filterDuplicates,
  processBatchResults,
  createImportSummary,
  createRowResult,
  DEFAULT_BATCH_SIZE,
} from '@/lib/import/processor'
import type {
  ImportRequest,
  ImportSummary,
  ImportRowResult,
} from '@/lib/import/types'
import { validateRows } from '@/lib/import/validator'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'
import { getSessionSafe } from '@auth'
import {
  getAllListingNamesInWeb,
  createListingWithRelations,
} from '@db/listingRepository'
import { canUserEditWeb } from '@db/webAccessRepository'
import { getWebBySlug } from '@db/webRepository'

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionSafe(request.headers)

    if (!session?.user?.email) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 },
      )
    }

    const body: ImportRequest = await request.json()
    const { webId, columnMapping, rows } = body

    if (!webId || !columnMapping || !rows || rows.length === 0) {
      return Response.json(
        { error: 'Missing required fields: webId, columnMapping, rows' },
        { status: 400 },
      )
    }

    const searchParams = request.nextUrl.searchParams
    const webSlug = searchParams.get('web')

    if (!webSlug) {
      return Response.json(
        { error: 'Missing required parameter: web' },
        { status: 400 },
      )
    }

    const web = await getWebBySlug(webSlug)
    if (!web || web.id !== webId) {
      return Response.json({ error: 'Web not found' }, { status: 404 })
    }

    const canEdit = await canUserEditWeb(session.user.email, webId)
    if (!canEdit) {
      return Response.json(
        { error: "You don't have permission to import listings to this web" },
        { status: 403 },
      )
    }

    const mappedRows = mapRows(rows, columnMapping)

    const validationResult = validateRows(mappedRows)
    if (!validationResult.valid) {
      return Response.json(
        {
          error: 'Validation failed',
          invalidRows: validationResult.invalidRows,
          totalErrors: validationResult.totalErrors,
        },
        { status: 400 },
      )
    }

    const existingNames = await getAllListingNamesInWeb(webId)
    const existingNamesSet = createNameSet(existingNames)

    const { unique: uniqueRows, duplicates: duplicateRows } = filterDuplicates(
      validationResult.validRows,
      existingNamesSet,
    )

    const batches = createBatches(uniqueRows, DEFAULT_BATCH_SIZE)
    const batchResults = []

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]
      const results: ImportRowResult[] = []

      for (const row of batch) {
        try {
          // Geocode address if provided
          let location:
            | { latitude: number; longitude: number; description: string }
            | undefined

          if (row.address) {
            const geocodingResult = await geocodeAddress(row.address)
            if (geocodingResult.success) {
              location = {
                latitude: geocodingResult.latitude,
                longitude: geocodingResult.longitude,
                description: geocodingResult.description,
              }
            }
          }

          // Look up or create category if provided
          let categoryId: number | undefined
          if (row.category) {
            const existingCategory = await prisma.category.findUnique({
              where: {
                categoryIdentifier: {
                  webId,
                  label: row.category,
                },
              },
              select: { id: true },
            })

            if (existingCategory) {
              categoryId = existingCategory.id
            } else {
              const newCategory = await prisma.category.create({
                data: {
                  label: row.category,
                  webId,
                },
                select: { id: true },
              })
              categoryId = newCategory.id
            }
          }

          const slug = await generateUniqueSlug(row.name, webId)

          const listingId = await createListingWithRelations({
            listing: {
              title: row.name,
              description: row.description,
              email: row.email,
              website: row.website,
              pending: false,
            },
            webId,
            slug,
            categoryId,
            location,
            socialMedia: row.socialMedia,
          })

          results.push(
            createRowResult(row.rowNumber, {
              success: true,
              listingId,
            }),
          )
        } catch (error) {
          results.push(
            createRowResult(row.rowNumber, {
              success: false,
              error: error instanceof Error ? error.message : 'Import failed',
            }),
          )
        }
      }

      batchResults.push(processBatchResults(results, i + 1))
    }

    const duplicateResults = duplicateRows.map((row) =>
      createRowResult(row.rowNumber, {
        success: false,
        skipped: true,
        skipReason: 'duplicate' as const,
      }),
    )

    if (duplicateResults.length > 0) {
      batchResults.push(
        processBatchResults(duplicateResults, batches.length + 1),
      )
    }

    const summary: ImportSummary = createImportSummary(batchResults)

    if (summary.successCount > 0) {
      revalidatePath(`/${web.slug}`)
    }

    return Response.json({
      success: true,
      summary,
    })
  } catch (error) {
    console.error('[RW] Import failed:', error)
    Sentry.captureException(error)
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Import failed',
      },
      { status: 500 },
    )
  }
}

async function generateUniqueSlug(
  name: string,
  webId: number,
): Promise<string> {
  const baseSlug = generateBaseSlug(name)

  const existingWithBase = await prisma.listingPlacement.findUnique({
    where: { webSlug: { webId, slug: baseSlug } },
    select: { slug: true },
  })

  if (!existingWithBase) {
    return baseSlug
  }

  let counter = 2
  while (counter < 100) {
    const candidateSlug = `${baseSlug}-${counter}`

    const existing = await prisma.listingPlacement.findUnique({
      where: { webSlug: { webId, slug: candidateSlug } },
      select: { slug: true },
    })

    if (!existing) {
      return candidateSlug
    }

    counter++
  }

  return `${baseSlug}-${Date.now()}`
}
