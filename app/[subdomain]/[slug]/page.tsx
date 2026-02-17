import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import truncate from 'lodash.truncate'
import prisma from '@prisma-rw-build'
import { initializeBuildCache } from '../../../lib/build-cache'
import Listing from './Listing'
import getListing from './getListing'

type PageProps = {
  params: Promise<{
    subdomain: string
    slug: string
  }>
}

export default async function ListingPage(props: PageProps) {
  const params = await props.params
  const listing = await getListing({
    webSlug: params.subdomain,
    listingSlug: params.slug,
  })

  if (!listing) {
    return notFound()
  }

  return <Listing listing={listing} />
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const listing = await getListing({
    webSlug: params.subdomain,
    listingSlug: params.slug,
  })

  if (!listing) {
    return null
  }

  const descriptionStrippedOfHtml = listing.description?.replace(
    /<[^>]*>?/gm,
    '',
  )
  const truncatedDescription = truncate(descriptionStrippedOfHtml, {
    length: 160,
    separator: /,.? +/,
  })

  return {
    title: `${listing.title} | Resilience Web`,
    description: truncatedDescription,
    openGraph: {
      title: `${listing.title} | Resilience Web`,
      description: truncatedDescription,
      images: [{ url: listing.image }],
    },
  }
}

export async function generateStaticParams() {
  // Support limiting the number of pages generated at build time
  const limit = process.env.NEXT_BUILD_STATIC_LIMIT
    ? parseInt(process.env.NEXT_BUILD_STATIC_LIMIT, 10)
    : undefined

  // Fetch all listings with complete data (matching getListing query structure)
  // This single query replaces thousands of individual queries during build
  const listings = await prisma.listing.findMany({
    where: {
      // Only generate pages for active listings
      inactive: false,
      web: {
        deletedAt: null,
      },
    },
    include: {
      socials: true,
      actions: true,
      location: {
        select: {
          latitude: true,
          longitude: true,
          description: true,
        },
      },
      category: {
        select: {
          id: true,
          color: true,
          label: true,
        },
      },
      tags: {
        select: {
          id: true,
          label: true,
        },
      },
      relations: {
        select: {
          id: true,
          slug: true,
          title: true,
          featured: true,
          image: true,
          category: {
            select: {
              id: true,
              color: true,
              label: true,
            },
          },
        },
      },
      edits: {
        select: {
          id: true,
        },
      },
      web: {
        select: {
          slug: true,
        },
      },
    },
    // Prioritize featured and recently updated listings
    orderBy: [{ featured: 'desc' }, { updatedAt: 'desc' }],
    // Apply limit if configured
    take: limit,
  })

  // Initialize build cache with fetched data
  // This allows getListing() to use cached data instead of making DB queries
  initializeBuildCache(listings as any)

  console.log(
    `[Build] Statically generating ${listings.length} listing pages${limit ? ` (limited by NEXT_BUILD_STATIC_LIMIT=${limit})` : ''}`,
  )

  return listings.map((l) => ({
    subdomain: l.web.slug,
    slug: l.slug,
  }))
}

export const dynamicParams = true
export const revalidate = false
