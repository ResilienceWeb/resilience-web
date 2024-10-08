import groupBy from 'lodash/groupBy'
import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from '@tanstack/react-query'
import { generateSlug } from '@helpers/utils'
import Web, { CENTRAL_NODE_ID } from '../[subdomain]/Web'
import { CATEGORY_COLOR_MAPPING, TAG_COLOR_MAPPING } from './utils'

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

  await queryClient.prefetchQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['tags', { webSlug: 'transition', all: false }],
    queryFn: () => {
      return data.tags
    },
    staleTime: Infinity,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Web
        data={data}
        webName="Transition UK"
        webIsPublished
        isTransitionMode
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
  const tags = []

  data.forEach((item) => {
    const categoryLabel = item.countries
      .replace(/&amp;/g, '&')
      .replace(' | United Kingdom', '')
      .replace('United Kingdom | ', '')
    if (!categories.some((c) => c.label === categoryLabel)) {
      categories.push({
        label: categoryLabel,
        color: CATEGORY_COLOR_MAPPING[categoryLabel].substring(1),
      })
    }

    const itemTags = []
    item.tags?.forEach((tagLabel) => {
      const tagId = tags.length + 1
      if (!tags.some((t) => t.label === tagLabel)) {
        tags.push({
          id: tagId,
          label: tagLabel,
          color: TAG_COLOR_MAPPING[tagLabel],
          itemIds: [],
        })
      }
      // Add item ID to tag
      // tags.find((t) => t.label === tagLabel).itemIds.push(item.id)

      const newTag = tags.find((t) => t.label === tagLabel)
      itemTags.push(newTag)
    })

    nodes.push({
      id: item.id,
      slug: generateSlug(item.title),
      description: item.description,
      website: item.url, // or item.contact.website?
      image: item.logo,
      facebook: item.contact.facebook,
      instagram: item.contact.instagram,
      twitter: item.contact.twitter,
      category: {
        color: CATEGORY_COLOR_MAPPING[categoryLabel],
        label: categoryLabel,
      },
      tags: itemTags,
      label: item.title.replace(/&amp;/g, '&'),
      color: CATEGORY_COLOR_MAPPING[categoryLabel],
    })
  })

  const nodesGroupedByCategory = groupBy(nodes, (node) => node.category.label)

  // Central node
  nodes.push({
    id: CENTRAL_NODE_ID,
    label: 'Transition UK',
    color: '#fcba03',
    group: 'central-node',
    font: {
      size: 56,
    },
    fixed: {
      x: true,
      y: true,
    },
    shape: 'box',
    shapeProperties: {
      borderRadius: 3,
    },
    margin: 10,
    borderWidthSelected: 2,
    widthConstraint: false,
  })

  // Mapping based on tags
  // tags.forEach((tag) => {
  //   nodes.push({
  //     id: tag.id,
  //     label: tag.label,
  //     color: '#c3c4c7',
  //     group: 'category',
  //   })

  //   edges.push({
  //     from: CENTRAL_NODE_ID,
  //     to: tag.id,
  //     width: 2,
  //     selectedWidth: 3,
  //     length: 600,
  //     smooth: {
  //       enabled: true,
  //       type: 'continuous',
  //       roundness: 0,
  //     },
  //   })

  //   tag.itemIds.forEach((itemId) => {
  //     edges.push({
  //       from: tag.id,
  //       to: itemId,
  //     })
  //   })
  // })

  // Mapping based on categories
  let categoryIndex = 1
  for (const category in nodesGroupedByCategory) {
    const categoryId = categoryIndex * 10000
    nodes.push({
      id: categoryId,
      label: category,
      color: '#c3c4c7',
      group: 'category',
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
    tags,
  }

  return structuredData
}
