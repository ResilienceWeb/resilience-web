import groupBy from 'lodash/groupBy'

import { selectMoreAccessibleColor } from '@helpers/colors'
import prisma from '../../prisma/client'
import { startsWithCapitalLetter } from '@helpers/utils'
import Web, { CENTRAL_NODE_ID } from './Web'

export default async function WebPage({ params }) {
  const { subdomain: webSlug } = params
  const { transformedData, webData } = await getData({ webSlug })

  return (
    <Web
      data={transformedData}
      webName={webData.title}
      webDescription={webData.description}
      webIsPublished={webData.published}
    />
  )
}

export async function generateMetadata({ params }) {
  const { subdomain: webSlug } = params
  const webData = await prisma.web.findUnique({
    where: {
      slug: webSlug,
    },
  })

  return {
    title: `${webData.title} | Resilience Web`,
    openGraph: {
      title: `${webData.title} | Resilience Web`,
      images: [{ url: webData.image }],
    },
  }
}

export async function generateStaticParams() {
  const webs = await prisma.web.findMany()
  const paths = webs.map((w) => `/${w.slug}`)

  return paths.map((path) => ({
    subdomain: path,
  }))
}

async function getData({ webSlug }) {
  const webData = await prisma.web.findUnique({
    where: {
      slug: webSlug,
    },
  })

  const listings = await prisma.listing.findMany({
    where: {
      web: {
        slug: {
          contains: webSlug,
        },
      },
    },
    include: {
      location: {
        select: {
          latitude: true,
          longitude: true,
          description: true,
        },
      },
      category: {
        select: {
          id: true,
          color: true,
          label: true,
        },
      },
      web: true,
      tags: {
        select: {
          id: true,
          label: true,
        },
      },
      relations: {
        include: {
          category: {
            select: {
              id: true,
              color: true,
              label: true,
            },
          },
        },
      },
    },
    orderBy: [
      {
        id: 'asc',
      },
    ],
  })

  const transformedData = {
    nodes: [],
    edges: [],
  }

  listings
    ?.filter((l) => !l.pending && !l.inactive)
    ?.map(
      ({
        id,
        title,
        category,
        description,
        image,
        website,
        facebook,
        twitter,
        instagram,
        seekingVolunteers,
        featured,
        slug,
        tags,
        relations,
      }) => {
        const accessibleTextColor = selectMoreAccessibleColor(
          `#${category.color}`,
          '#3f3f40',
          '#fff',
        )
        transformedData.nodes.push({
          id,
          title,
          description,
          image: image ?? '',
          website,
          facebook,
          twitter,
          instagram,
          seekingVolunteers,
          featured,
          category: {
            color: `#${category.color}`,
            label: category.label,
          },
          slug,
          tags,
          // below are for vis-network node styling and data
          label: title,
          color: `#${category.color}`,
          font: {
            color: accessibleTextColor,
            size: 28,
          },
        })

        relations.map((relation) => {
          const newEdge = {
            from: id,
            to: relation.id,
            dashes: true,
            physics: false,
            smooth: {
              enabled: true,
              type: 'continuous',
              roundness: 0,
            },
          }
          if (
            !transformedData.edges.find(
              (e) => e.from === newEdge.to && e.to === newEdge.from,
            )
          ) {
            transformedData.edges.push(newEdge)
          }
        })
      },
    )

  let groupedByCategory = groupBy(
    transformedData.nodes,
    (n) => n.category.label,
  )

  groupedByCategory = Object.fromEntries(
    Object.entries(groupedByCategory).filter(([key]) => {
      return (
        key.length > 0 && key !== 'undefined' && startsWithCapitalLetter(key)
      )
    }),
  )

  // Main node
  transformedData.nodes.push({
    id: CENTRAL_NODE_ID,
    label: webData.title,
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
  for (const category in groupedByCategory) {
    const categoryId = categoryIndex * 1000
    transformedData.nodes.push({
      id: categoryId,
      label: category,
      color: '#c3c4c7',
      isDescriptive: true,
      shape: 'ellipse',
      mass: 3,
    })
    categoryIndex++

    // From main node to category node
    transformedData.edges.push({
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
    groupedByCategory[category].forEach((item) => {
      transformedData.edges.push({
        from: categoryId,
        to: item.id,
      })
    })
  }

  return {
    transformedData,
    webData,
  }
}

export const dynamicParams = true
export const revalidate = 60
