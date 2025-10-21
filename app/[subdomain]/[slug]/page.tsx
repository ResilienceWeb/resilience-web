import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import truncate from 'lodash.truncate'
import prisma from '@prisma-rw'
import Listing from './Listing'
import getListing from './getListing'

export default async function ListingPage(props) {
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

export async function generateMetadata(props): Promise<Metadata> {
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
  const listings = await prisma.listing.findMany({
    include: {
      web: {
        select: {
          slug: true,
        },
      },
    },
  })

  return listings.map((l) => ({
    subdomain: l.web.slug,
    slug: l.slug,
  }))
}

export const dynamicParams = true
export const revalidate = false
