import Layout from '@components/layout'
import Hero from '@components/homepage/hero'
import WebCards from '@components/homepage/web-cards'
import JoinTheCommunity from '@components/homepage/join-the-community'

import { fetchWebsHydrate } from '@hooks/webs/useWebs'
import { dehydrate, QueryClient } from '@tanstack/react-query'

export default function Homepage() {
  return (
    <Layout>
      <Hero />
      <WebCards />
      <JoinTheCommunity />
    </Layout>
  )
}

export const getStaticProps = async () => {
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({
    queryKey: ['webs'],
    queryFn: fetchWebsHydrate,
  })

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 60,
  }
}
