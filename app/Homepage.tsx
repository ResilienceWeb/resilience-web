'use client'

import Features from '@components/homepage/features'
import Hero from '@components/homepage/hero'
import JoinTheCommunity from '@components/homepage/join-the-community'
import { isWebDisplayedOnHomepage } from '@components/homepage/webs'
import WebsExplorer from '@components/homepage/webs-explorer'
import Layout from '@components/layout'

export default function Homepage({ webs }: { webs: any[] }) {
  const displayedWebs = webs.filter(isWebDisplayedOnHomepage)
  const listingCount = displayedWebs.reduce(
    (total, web) => total + (web._count?.listings ?? 0),
    0,
  )

  return (
    <Layout webs={webs}>
      <Hero webCount={displayedWebs.length} listingCount={listingCount} />
      <WebsExplorer webs={webs} />
      <Features />
      <JoinTheCommunity />
    </Layout>
  )
}
