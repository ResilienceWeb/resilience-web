import { memo } from 'react'
import { GetStaticProps, GetStaticPaths } from 'next'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router'
import truncate from 'lodash/truncate'
import { Listing as ListingType } from '@prisma/client'
import { REMOTE_URL } from '@helpers/config'
import Layout from '@components/layout'
import ListingDisplay from '@components/listing'

function Listing({ listing }: { listing: ListingType }) {
  const router = useRouter()
  if (router.isFallback || !listing) {
    return (
      <Layout>
        <h1>Please wait…</h1>
      </Layout>
    )
  }

  const descriptionStrippedOfHtml = listing.description.replace(
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
  const BASE_URL =
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
      ? 'https://resilienceweb.org.uk'
      : REMOTE_URL

  const data = await fetch(`${BASE_URL}/api/listings`)
    .then((res) => res.json())
    .catch((e) =>
      console.error('Failed to fetch data from', `${BASE_URL}/api/listings`, e),
    )

  const { listings } = data
  const paths = listings.map((l) => ({
    params: {
      slug: l.slug,
      web: l.web.slug,
    },
  }))

  return {
    paths,
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const BASE_URL =
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
      ? 'https://resilienceweb.org.uk'
      : REMOTE_URL

  // TODO: make this more secure
  const data = await fetch(
    `${BASE_URL}/api/listing/${params.slug}?web=${params.web}`,
  )
    .then((res) => res.json())
    .catch((e) =>
      console.error(
        'Failed to fetch data from',
        `${BASE_URL}/api/listing/${params.slug}`,
        e,
      ),
    )

  const { listing } = data

  if (!listing) {
    return {
      notFound: true,
      revalidate: 30,
    }
  }

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
