import truncate from 'lodash/truncate'
import prisma from '@prisma-rw'
import getListing from './getListing'
import Listing from './Listing'

export default async function ListingPage(props) {
  const params = await props.params
  const listing = await getListing({
    webSlug: params.subdomain,
    listingSlug: params.slug,
  })

  if (!listing) {
    console.log(
      `[RW] Listing not found for slugs ${params.subdomain}, ${params.slug}`,
    )
    return null
  }

  return <Listing listing={listing} />
}

export async function generateMetadata(props) {
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
export const revalidate = 300
