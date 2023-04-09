import { memo } from 'react'
import { GetStaticProps, GetStaticPaths } from 'next'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router'
import truncate from 'lodash/truncate'
import { Listing as ListingType } from '@prisma/client'
import { REMOTE_URL } from '@helpers/config'
import Layout from '@components/layout'
import ListingDisplay from '@components/listing'

function Listing({ listing }: { listing: ListingType | any }) {
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
  const response = await fetch(`${REMOTE_URL}/api/listings`)
  const data = await response.json()
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
  const response = await fetch(`${REMOTE_URL}/api/listing/${params.slug}`)
  const data = await response.json()
  // TODO: map data to only return what is needed
  const { listing } = data

  return {
    props: {
      listing,
    },
    revalidate: 5,
  }
}

export default memo(Listing)
