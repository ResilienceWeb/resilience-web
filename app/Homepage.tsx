'use client'
import Layout from '@components/layout'
import Hero from '@components/homepage/hero'
import WebCards from '@components/homepage/web-cards'
import JoinTheCommunity from '@components/homepage/join-the-community'

export default function Homepage({ webs }) {
  return (
    <Layout>
      <Hero />
      <WebCards webs={webs} />
      <JoinTheCommunity />
    </Layout>
  )
}
