'use client'

import Features from '@components/homepage/features'
import Hero from '@components/homepage/hero'
import JoinTheCommunity from '@components/homepage/join-the-community'
import WebCards from '@components/homepage/web-cards'
import Layout from '@components/layout'

export default function Homepage({ webs }) {
  return (
    <Layout>
      <Hero />
      <WebCards webs={webs} />
      <Features />
      <JoinTheCommunity />
    </Layout>
  )
}
