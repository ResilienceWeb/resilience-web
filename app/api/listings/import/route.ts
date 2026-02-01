/**
 * CSV Import API endpoint for bulk listing imports
 */
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
import { auth } from '@auth'
import {
  getAllListingNamesInWeb,
  createListingWithRelations,
} from '@db/listingRepository'
import { canUserEditWeb } from '@db/webAccessRepository'
import { getWebBySlug } from '@db/webRepository'

/**
 * POST /api/listings/import
 * Import listings from CSV data
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication check
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user?.email) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 },
      )
    }

    // 2. Parse request body
    const body: ImportRequest = await request.json()
    const { webId, columnMapping, rows } = body

    if (!webId || !columnMapping || !rows || rows.length === 0) {
      return Response.json(
        { error: 'Missing required fields: webId, columnMapping, rows' },
        { status: 400 },
      )
    }

    // 3. Get web and verify authorization
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

    // Check if user can edit this web (OWNER or EDITOR)
    const canEdit = await canUserEditWeb(session.user.email, webId)
    if (!canEdit) {
      return Response.json(
        { error: "You don't have permission to import listings to this web" },
        { status: 403 },
      )
    }

    // 4. Map CSV rows to listing data
    const mappedRows = mapRows(rows, columnMapping)

    // 5. Validate mapped data
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

    // 6. Get existing listing names for duplicate detection
    const existingNames = await getAllListingNamesInWeb(webId)
    const existingNamesSet = createNameSet(existingNames)

    // 7. Filter out duplicates
    const { unique: uniqueRows, duplicates: duplicateRows } = filterDuplicates(
      validationResult.validRows,
      existingNamesSet,
    )

    // 8. Process imports in batches
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

          // Generate unique slug for this listing
          const slug = await generateUniqueSlug(row.name, webId)

          // Create listing with all relations
          const listingId = await createListingWithRelations({
            listing: {
              title: row.name,
              description: row.description,
              email: row.email,
              website: row.website,
              slug,
              pending: false,
            },
            webId,
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

    // 9. Add skipped duplicates to results
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

    // 10. Create summary
    const summary: ImportSummary = createImportSummary(batchResults)

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

/**
 * Generate a unique URL-safe slug for a listing within a web
 * Checks database for existing slugs and appends numeric suffix if needed
 */
async function generateUniqueSlug(
  name: string,
  webId: number,
): Promise<string> {
  const baseSlug = generateBaseSlug(name)

  // Check if base slug is available
  const existingWithBase = await prisma.listing.findFirst({
    where: {
      webId,
      slug: baseSlug,
    },
    select: { slug: true },
  })

  if (!existingWithBase) {
    return baseSlug
  }

  // Base slug exists, find the next available number
  let counter = 2
  while (counter < 100) {
    // Reasonable limit to prevent infinite loops
    const candidateSlug = `${baseSlug}-${counter}`

    const existing = await prisma.listing.findFirst({
      where: {
        webId,
        slug: candidateSlug,
      },
      select: { slug: true },
    })

    if (!existing) {
      return candidateSlug
    }

    counter++
  }

  // Fallback to timestamp if we can't find a unique slug with numbers
  return `${baseSlug}-${Date.now()}`
}
