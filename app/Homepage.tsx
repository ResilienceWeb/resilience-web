'use client'

import { useSearchParams } from 'next/navigation'
import Features from '@components/homepage/features'
import Hero from '@components/homepage/hero'
import JoinTheCommunity from '@components/homepage/join-the-community'
import WebCards from '@components/homepage/web-cards'
import WebsMap from '@components/homepage/webs-map'
import Layout from '@components/layout'

export default function Homepage({ webs }) {
  const searchParams = useSearchParams()
  const showMap = searchParams.get('map')
  return (
    <Layout>
      <Hero />
      {showMap ? <WebsMap webs={webs} /> : <WebCards webs={webs} />}
      <Features />
      <JoinTheCommunity />
    </Layout>
  )
}
