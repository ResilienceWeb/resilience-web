import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from '@tanstack/react-query'

import Web from '../[subdomain]/Web'

export default async function TransitionPage() {
  const queryClient = new QueryClient()
  const data = await getData()

  await queryClient.prefetchQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['categories', { webSlug: 'transition' }],
    queryFn: () => {
      return data.categories.map((category) => ({
        label: category,
        color: '#d0d07b', // TODO: replace with actual color
      }))
    },
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Web
        data={data}
        webName="Transition UK"
        webDescription="Transition Initiatives"
        webIsPublished={true}
      />
    </HydrationBoundary>
  )
}

async function getData() {
  const response = await fetch(
    'https://transitiongroups.org/wp-json/cds/v1/initiatives?country=GB&per_page=10000',
  )
  const { body: data } = await response.json()

  const cleanedData = data.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    website: item.url,
    image: item.logo,
    category: {
      color: '#d0d07b', // TODO: replace with actual color
      label: item.hubs.replace(/&amp;/g, '&'),
    },
    color: '#d0d07b', // TODO: replace with actual color
  }))

  const categories = [
    ...new Set(cleanedData.map((item) => item.category.label)),
  ]

  const structuredData = {
    nodes: cleanedData,
    categories,
  }

  return structuredData
}
