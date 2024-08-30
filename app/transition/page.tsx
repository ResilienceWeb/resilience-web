import groupBy from 'lodash/groupBy'
import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from '@tanstack/react-query'
import { generateSlug } from '@helpers/utils'
import Web, { CENTRAL_NODE_ID } from '../[subdomain]/Web'
import { COLOR_MAPPING } from './utils'

export const metadata = {
  title: 'Transition UK',
  description:
    'A movement of communities coming together to reimagine and rebuild our world.',
  openGraph: {
    title: 'Transition UK',
  },
}

export default async function TransitionPage() {
  const queryClient = new QueryClient()
  const data = await getData()

  await queryClient.prefetchQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['categories', { webSlug: 'transition' }],
    queryFn: () => {
      return data.categories
    },
    staleTime: Infinity,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Web
        data={data}
        webName="Transition UK"
        webDescription="Transition Initiatives"
        webIsPublished={true}
        hideProposeListing={true}
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

  const nodes = []
  const edges = []
  const categories = []

  data.forEach((item) => {
    const categoryLabel = item.hubs.replace(/&amp;/g, '&')
    if (!categories.some((c) => c.label === categoryLabel)) {
      categories.push({
        label: categoryLabel,
        color: COLOR_MAPPING[categoryLabel].substring(1),
      })
    }

    nodes.push({
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
    })
  })

  const nodesGroupedByCategory = groupBy(nodes, (node) => node.category.label)

  // Central node
  nodes.push({
    id: CENTRAL_NODE_ID,
    label: 'Transition UK',
    color: '#fcba03',
    isDescriptive: true,
    font: {
      size: 56,
    },
    fixed: {
      x: true,
      y: true,
    },
  })

  let categoryIndex = 1
  for (const category in nodesGroupedByCategory) {
    const categoryId = categoryIndex * 10000
    nodes.push({
      id: categoryId,
      label: category,
      color: '#c3c4c7',
      isDescriptive: true,
      shape: 'ellipse',
    })
    categoryIndex++

    // From central node to category node
    edges.push({
      from: CENTRAL_NODE_ID,
      to: categoryId,
      width: 2,
      selectedWidth: 3,
      length: 600,
      smooth: {
        enabled: true,
        type: 'continuous',
        roundness: 0,
      },
    })

    // From category node to all subitems
    nodesGroupedByCategory[category].forEach((item) => {
      edges.push({
        from: categoryId,
        to: item.id,
      })
    })
  }

  const structuredData = {
    nodes,
    edges,
    categories,
  }

  return structuredData
}
