/**
 * Repository for listing data access operations
 */
import type { MappedRow } from '@/lib/import/types'
import type { Prisma } from '@prisma-client'
import prisma from '@prisma-rw'

/**
 * Find duplicate listings by name within a web
 * Returns an array of normalized names that already exist
 */
export async function findDuplicateListings(
  webId: number,
  names: string[],
): Promise<string[]> {
  if (names.length === 0) return []

  const existingListings = await prisma.listing.findMany({
    where: {
      webId,
      title: {
        in: names, // Prisma will handle case-insensitive matching with mode: 'insensitive'
      },
    },
    select: {
      title: true,
    },
  })

  // Return normalized existing names
  return existingListings.map((listing) => listing.title.trim().toLowerCase())
}

/**
 * Find all listing names in a web for duplicate detection
 */
export async function getAllListingNamesInWeb(
  webId: number,
): Promise<string[]> {
  const listings = await prisma.listing.findMany({
    where: {
      webId,
    },
    select: {
      title: true,
    },
  })

  return listings.map((listing) => listing.title)
}

/**
 * Bulk create listings with transaction support
 * Returns array of created listing IDs
 */
export async function bulkCreateListings(
  listings: Prisma.ListingCreateManyInput[],
): Promise<number[]> {
  if (listings.length === 0) return []

  // Use a transaction to ensure all listings are created or none
  const result = await prisma.$transaction(async (tx) => {
    const createdIds: number[] = []

    for (const listing of listings) {
      const created = await tx.listing.create({
        data: listing,
        select: { id: true },
      })
      createdIds.push(created.id)
    }

    return createdIds
  })

  return result
}

/**
 * Bulk create listing locations
 * Returns array of created location IDs
 */
export async function bulkCreateListingLocations(
  locations: Prisma.ListingLocationCreateManyInput[],
): Promise<number[]> {
  if (locations.length === 0) return []

  const result = await prisma.$transaction(async (tx) => {
    const createdIds: number[] = []

    for (const location of locations) {
      const created = await tx.listingLocation.create({
        data: location,
        select: { id: true },
      })
      createdIds.push(created.id)
    }

    return createdIds
  })

  return result
}

/**
 * Bulk create listing social media links
 * Returns count of created records
 */
export async function bulkCreateListingSocialMedia(
  socialMedia: Prisma.ListingSocialMediaCreateManyInput[],
): Promise<number> {
  if (socialMedia.length === 0) return 0

  const result = await prisma.listingSocialMedia.createMany({
    data: socialMedia,
  })

  return result.count
}

/**
 * Create a single listing with related data (location, social media) in a transaction
 */
export async function createListingWithRelations(data: {
  listing: Omit<Prisma.ListingCreateInput, 'web' | 'location'>
  webId: number
  location?: {
    latitude: number
    longitude: number
    description: string
  }
  socialMedia?: Array<{
    platform: string
    url: string
  }>
}): Promise<number> {
  const result = await prisma.$transaction(async (tx) => {
    // Create location first if provided
    let locationId: number | undefined
    if (data.location) {
      const location = await tx.listingLocation.create({
        data: {
          latitude: data.location.latitude,
          longitude: data.location.longitude,
          description: data.location.description,
        },
        select: { id: true },
      })
      locationId = location.id
    }

    // Create the listing
    const listing = await tx.listing.create({
      data: {
        ...data.listing,
        web: {
          connect: { id: data.webId },
        },
        ...(locationId && {
          location: {
            connect: { id: locationId },
          },
        }),
      },
      select: { id: true },
    })

    // Create social media links if provided
    if (data.socialMedia && data.socialMedia.length > 0) {
      await tx.listingSocialMedia.createMany({
        data: data.socialMedia.map((social) => ({
          listingId: listing.id,
          platform: social.platform,
          url: social.url,
        })),
      })
    }

    return listing.id
  })

  return result
}

/**
 * Bulk create listings with all related data in batches
 * Returns array of created listing IDs
 */
export async function bulkCreateListingsWithRelations(
  webId: number,
  rows: MappedRow[],
  locations: Map<
    number,
    { latitude: number; longitude: number; description: string }
  >,
): Promise<number[]> {
  if (rows.length === 0) return []

  const createdIds: number[] = []

  // Process in a transaction
  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      // Create location if available
      let locationId: number | undefined
      const locationData = locations.get(row.rowNumber)
      if (locationData) {
        const location = await tx.listingLocation.create({
          data: locationData,
          select: { id: true },
        })
        locationId = location.id
      }

      // Create the listing
      const listing = await tx.listing.create({
        data: {
          title: row.name,
          description: row.description,
          email: row.email,
          website: row.website,
          slug: generateSlug(row.name),
          pending: false,
          webId,
          ...(locationId && { locationId }),
        },
        select: { id: true },
      })

      createdIds.push(listing.id)

      // Create social media links
      if (row.socialMedia && row.socialMedia.length > 0) {
        await tx.listingSocialMedia.createMany({
          data: row.socialMedia.map((social) => ({
            listingId: listing.id,
            platform: social.platform,
            url: social.url,
          })),
        })
      }
    }
  })

  return createdIds
}

/**
 * Generate a URL-safe slug from a listing name
 * TODO: Implement proper slug generation with uniqueness check
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
