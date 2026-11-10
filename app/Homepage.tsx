'use client'

import dynamic from 'next/dynamic'
import Features from '@components/homepage/features'
import Hero from '@components/homepage/hero'
import JoinTheCommunity from '@components/homepage/join-the-community'
import WebCards, {
  isWebDisplayedOnHomepage,
} from '@components/homepage/web-cards'
import Layout from '@components/layout'

const WebsMap = dynamic(() => import('@components/homepage/webs-map'), {
  ssr: false,
})

interface HomepageProps {
  webs: any[]
  showMap?: boolean
}

export default function Homepage({ webs, showMap = false }: HomepageProps) {
  const displayedWebs = webs.filter(isWebDisplayedOnHomepage)
  const listingCount = displayedWebs.reduce(
    (total, web) => total + (web._count?.listings ?? 0),
    0,
  )

  return (
    <Layout webs={webs}>
      <Hero webCount={displayedWebs.length} listingCount={listingCount} />
      {showMap ? <WebsMap webs={webs} /> : <WebCards webs={webs} />}
      <Features />
      <JoinTheCommunity />
    </Layout>
  )
}
