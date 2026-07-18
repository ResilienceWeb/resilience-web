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

  if (!listing || !listing.category) {
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
    alternates: {
      canonical: `https://${params.subdomain}.resilienceweb.org.uk/${params.slug}`,
    },
  }
}

export async function generateStaticParams() {
  const limit = process.env.NEXT_BUILD_STATIC_LIMIT
    ? parseInt(process.env.NEXT_BUILD_STATIC_LIMIT, 10)
    : undefined

  // One row per (listing, web). Each one becomes a /<webSlug>/<placementSlug> page.
  const placements = await prisma.listingPlacement.findMany({
    where: {
      categoryId: { not: null },
      web: { deletedAt: null },
      listing: { inactive: false },
    },
    include: {
      web: { select: { slug: true, title: true } },
      category: { select: { id: true, color: true, label: true, icon: true } },
      tags: { select: { id: true, label: true } },
      listing: {
        include: {
          socials: true,
          actions: true,
          location: {
            select: { latitude: true, longitude: true, description: true },
          },
          edits: { select: { id: true } },
        },
      },
    },
    orderBy: [{ featured: 'desc' }, { updatedAt: 'desc' }],
    take: limit,
  })

  // Pre-flatten into listing-shaped objects keyed by (webSlug, slug) so getListing()
  // can hit the cache during build.
  const flattenedForCache = placements.map((p) => ({
    ...p.listing,
    slug: p.slug,
    featured: p.featured,
    category: p.category,
    tags: p.tags,
    web: p.web,
  }))
  initializeBuildCache(flattenedForCache as any)

  console.log(
    `[Build] Statically generating ${placements.length} listing pages${limit ? ` (limited by NEXT_BUILD_STATIC_LIMIT=${limit})` : ''}`,
  )

  return placements.map((p) => ({
    subdomain: p.web.slug,
    slug: p.slug,
  }))
}

export const dynamicParams = true
export const revalidate = false
