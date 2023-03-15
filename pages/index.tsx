import Layout from '@components/layout'
import Hero from '@components/homepage/hero'
import JoinTheCommunity from '@components/homepage/join-the-community'

import { fetchWebDetailsRequest } from 'hooks/webs/useWebDetails'
import { dehydrate, QueryClient } from '@tanstack/react-query'

export const getServerSideProps = async () => {
  const queryClient = new QueryClient()

  // prefetch data on the server
  await queryClient.fetchQuery(['webDetails'], () =>
    fetchWebDetailsRequest(true),
  )

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
      <JoinTheCommunity />
    </Layout>
  )
}
