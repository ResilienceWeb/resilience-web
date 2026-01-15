'use client'

import Features from '@components/homepage/features'
import Hero from '@components/homepage/hero'
import JoinTheCommunity from '@components/homepage/join-the-community'
import WebCards from '@components/homepage/web-cards'
import WebsMap from '@components/homepage/webs-map'
import Layout from '@components/layout'

export default function Homepage({ webs }) {
  return (
    <Layout>
      <Hero />
      {/* <WebCards webs={webs} /> */}
      <WebsMap webs={webs} />
      <Features />
      <JoinTheCommunity />
    </Layout>
  )
}
