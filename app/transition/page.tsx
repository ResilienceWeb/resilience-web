import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from '@tanstack/react-query'
import { generateSlug } from '@helpers/utils'
import Web from '../[subdomain]/Web'
import { COLOR_MAPPING } from './utils'

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
    { cache: 'force-cache' },
  )
  const { body: data } = await response.json()

  const cleanedData = data.map((item) => {
    const categoryLabel = item.hubs.replace(/&amp;/g, '&')

    return {
      id: item.id,
      title: item.title,
      slug: generateSlug(item.title),
      description: item.description,
      website: item.url, // or item.contact.website?
      image: item.logo,
      facebook: item.contact.facebook,
      instagram: item.contact.instagram,
      twitter: item.contact.twitter,
      category: {
        color: COLOR_MAPPING[categoryLabel],
        label: categoryLabel,
      },
      label: item.title,
      color: COLOR_MAPPING[categoryLabel],
    }
  })

  const categories = [
    ...new Set(cleanedData.map((item) => item.category.label)),
  ]

  const structuredData = {
    nodes: cleanedData,
    categories,
  }

  return structuredData
}
