import Layout from '@components/layout'
import Hero from '@components/homepage/hero'
import WebCards from '@components/homepage/web-cards'
import JoinTheCommunity from '@components/homepage/join-the-community'

import { fetchWebsRequest } from '@hooks/webs/useWebs'
import { dehydrate, QueryClient } from '@tanstack/react-query'

export const getServerSideProps = async () => {
  const queryClient = new QueryClient()

  // prefetch data on the server
  await queryClient.fetchQuery(['webs'], () => fetchWebsRequest(true))

  return {
    props: {
      // dehydrate query cache
      dehydratedState: dehydrate(queryClient),
    },
  }
}

export default function Homepage() {
  return (
    <Layout>
      <Hero />
      <WebCards />
      <JoinTheCommunity />
    </Layout>
  )
}
