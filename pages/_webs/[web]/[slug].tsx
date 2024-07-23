import { memo } from 'react'
import { GetStaticProps, GetStaticPaths } from 'next'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router'
import truncate from 'lodash/truncate'
import { Listing as ListingType } from '@prisma/client'
import Layout from '@components/layout'
import ListingDisplay from '@components/listing'
import prisma from '../../../prisma/client'

function Listing({ listing }: { listing: ListingType }) {
  const router = useRouter()
  if (router.isFallback || !listing) {
    return (
      <Layout>
        <h1>Please wait…</h1>
      </Layout>
    )
  }

  const descriptionStrippedOfHtml = listing.description?.replace(
    /<[^>]*>?/gm,
    '',
  )
  const truncatedDescription = truncate(descriptionStrippedOfHtml, {
    length: 160,
    separator: /,.? +/,
  })

  return (
    <>
      <NextSeo
        title={`${listing.title} | Resilience Web`}
        description={truncatedDescription}
        openGraph={{
          title: `${listing.title} | Resilience Web`,
          description: truncatedDescription,
          images: [{ url: listing.image }],
        }}
      />
      <Layout>
        <ListingDisplay listing={listing} />
      </Layout>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const listings = await prisma.listing.findMany({
    include: {
      web: {
        select: {
          slug: true,
        },
      },
    },
  })

  const paths = listings.map((l) => ({
    params: {
      slug: l.slug,
      web: l.web.slug,
    },
  }))

  return {
    paths,
    fallback: true,
  }
}

function exclude(data, keys) {
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => !keys.includes(key)),
  )
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const listingData = await prisma.listing.findFirst({
    where: {
      slug: params?.slug,
      ...(params?.web
        ? {
            web: {
              slug: {
                contains: params?.web,
              },
            },
          }
        : {}),
    },
    include: {
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
        include: {
          category: {
            select: {
              id: true,
              color: true,
              label: true,
            },
          },
        },
      },
    },
  })

  if (!listingData) {
    return {
      notFound: true,
      revalidate: 60,
    }
  }

  const listing = exclude(listingData, [
    'createdAt',
    'updatedAt',
    'notes',
    'inactive',
  ])

  return {
    props: {
      listing: {
        title: listing.title,
        image: listing.image,
        category: listing.category,
        website: listing.website,
        facebook: listing.facebook,
        twitter: listing.twitter,
        instagram: listing.instagram,
        description: listing.description,
        tags: listing.tags,
        relations: listing.relations,
        seekingVolunteers: listing.seekingVolunteers,
        featured: listing.featured,
      },
    },
    revalidate: 60,
  }
}

export default memo(Listing)
