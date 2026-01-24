'use client'

import dynamic from 'next/dynamic'
import Features from '@components/homepage/features'
import Hero from '@components/homepage/hero'
import JoinTheCommunity from '@components/homepage/join-the-community'
import WebCards from '@components/homepage/web-cards'
import Layout from '@components/layout'

const WebsMap = dynamic(() => import('@components/homepage/webs-map'), {
  ssr: false,
})

interface HomepageProps {
  webs: any[]
  showMap?: boolean
}

export default function Homepage({ webs, showMap = false }: HomepageProps) {
  return (
    <Layout webs={webs}>
      <Hero />
      {showMap ? <WebsMap webs={webs} /> : <WebCards webs={webs} />}
      <Features />
      <JoinTheCommunity />
    </Layout>
  )
}
