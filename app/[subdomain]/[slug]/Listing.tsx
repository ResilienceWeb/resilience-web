'use client'
import Layout from '@components/layout'
import ListingDisplay from '@components/listing'

export default function Listing({ listing }) {
  return (
    <Layout>
      <ListingDisplay listing={listing} />
    </Layout>
  )
}
