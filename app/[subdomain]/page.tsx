import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { GraphQLClient } from 'graphql-request'
import prisma from '@prisma-rw'
import { compressJson } from '@helpers/compression'
import { getIconUnicode } from '@helpers/icons'
import { getAllWebs, getWebBySlug } from '@db/webRepository'
import Web from './Web'

const CENTRAL_NODE_ID = 999
const PLACECAL_NEIGHBORHOOD_ID = {
  norwich: 14629,
}

export default async function WebPage(props) {
  const params = await props.params
  const { subdomain: webSlug } = params
  const rawData = await getData({ webSlug })

  let events = []
  if (PLACECAL_NEIGHBORHOOD_ID[webSlug]) {
    events = await getEvents(PLACECAL_NEIGHBORHOOD_ID[webSlug])
  }

  if (!rawData) {
    return notFound()
  }

  const { data, webData } = rawData

  return (
    <Web
      data={data}
      events={events}
      features={webData.features}
      webId={webData.id}
      webName={webData.title}
      webDescription={webData.description}
      webIsPublished={webData.published}
      webContactEmail={webData.contactEmail}
      webSlug={webSlug}
      relatedWebs={webData.relations?.filter((w) => w.published && w.location)}
    />
  )
}

export async function generateMetadata(props): Promise<Metadata> {
  const params = await props.params
  const { subdomain: webSlug } = params
  const webData = await getWebBySlug(webSlug)

  if (!webData) {
    return null
  }

  return {
    title: `${webData.title} | Resilience Web`,
    openGraph: {
      title: `${webData.title} | Resilience Web`,
      images: [{ url: webData.image }],
      description:
        webData.description ??
        'A web of connections, showing local groups working to co-create a more socially and environmentally just city.',
    },
    alternates: {
      canonical: `https://${webData.slug}.resilienceweb.org.uk`,
    },
  }
}

export async function generateStaticParams() {
  const webs = await getAllWebs()
  const paths = webs.map((w) => `${w.slug}`)
  const subdomains = paths.map((path) => ({
    subdomain: path,
  }))

  return subdomains
}

type DataType = {
  // gzip+base64 compressed network visualization data ({ nodes, edges }).
  // Kept compressed across the wire and decompressed on the client in Web.tsx.
  data: string
  webData: {
    id: number
    title: string
    description: string
    published: boolean
    image: string
    slug: string
    features: Record<string, any>
    contactEmail: string
    relations?: Array<{
      slug: string
      title: string
      published: boolean
      location: { latitude: number; longitude: number } | null
    }>
  }
}

async function getData({ webSlug }): Promise<DataType> {
  const webData = await prisma.web.findFirst({
    where: {
      slug: webSlug,
      deletedAt: null,
    },
    include: {
      features: {
        select: {
          feature: true,
          enabled: true,
        },
      },
      relations: {
        select: {
          slug: true,
          title: true,
          published: true,
          location: {
            select: { latitude: true, longitude: true },
          },
        },
      },
    },
  })

  if (!webData) {
    console.log(`[RW] Web not found for webSlug ${webSlug}`)
    return null
  }

  const categories = await prisma.category.findMany({
    where: {
      web: {
        slug: webSlug,
        deletedAt: null,
      },
    },
    select: {
      id: true,
      label: true,
      color: true,
      icon: true,
      listings: {
        where: {
          listing: {
            inactive: false,
            pending: false,
          },
        },
        orderBy: { id: 'asc' },
        select: {
          slug: true,
          featured: true,
          tags: {
            select: { id: true, label: true },
          },
          listing: {
            select: {
              id: true,
              title: true,
              description: true,
              image: true,
              seekingVolunteers: true,
              website: true,
              createdAt: true,
              socials: {
                select: { platform: true, url: true },
              },
              actions: {
                select: { type: true, url: true },
              },
              location: {
                select: {
                  latitude: true,
                  longitude: true,
                  description: true,
                },
              },
              relations: {
                select: {
                  id: true,
                  placements: {
                    where: { web: { slug: webSlug } },
                    select: {
                      category: {
                        select: { id: true, color: true, label: true },
                      },
                    },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!categories) {
    console.log(`[RW] Web or listings not found for webSlug ${webSlug}`)
    return null
  }

  const categoriesCount = categories.length
  const categoryNodePositions = drawCirclePoints(
    categoriesCount,
    categoriesCount * 150,
    {
      x: 0,
      y: 0,
    },
  )
  const categoryPositions = {}
  categories.forEach((category, index) => {
    categoryPositions[category.id] = categoryNodePositions[index]
  })

  const transformedData = {
    nodes: [],
    edges: [],
  }

  // Calculate if web is older than 2 months
  const twoMonthsAgo = new Date()
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)
  const webIsOlderThanTwoMonths = webData.createdAt < twoMonthsAgo

  // Calculate date for 1 month ago
  const twoWeeksAgo = new Date()
  twoWeeksAgo.setMonth(twoWeeksAgo.getMonth() - 1)

  categories.map((category) => {
    category.listings.map((placement) => {
      const {
        id: listingId,
        title,
        description,
        image,
        socials,
        actions,
        seekingVolunteers,
        location,
        relations,
        website,
        createdAt,
      } = placement.listing
      const { slug, featured, tags } = placement

      const isNew = webIsOlderThanTwoMonths && createdAt > twoWeeksAgo

      const transformedNode: any = {
        id: `listing-${listingId}`,
        title,
        description,
        image: image ?? '',
        location,
        socials,
        actions,
        category: {
          color: `#${category.color}`,
          label: category.label,
          icon: category.icon,
        },
        slug,
        tags,
        // below are for vis-network node styling and data
        label: title,
        color: `#${category.color}`,
        icon: undefined,
        website,
      }

      if (isNew) {
        transformedNode.new = isNew
      }

      if (category.icon !== 'default') {
        transformedNode.icon = {
          face: '"Font Awesome 5 Free"',
          code: getIconUnicode(category.icon),
          color: 'white',
          weight: 700,
        }
      }
      if (seekingVolunteers) {
        transformedNode.seekingVolunteers = true
      }
      if (featured && new Date(featured) > new Date()) {
        transformedNode.featured = featured
      }
      transformedData.nodes.push(transformedNode)

      relations.map((relation) => {
        // Only link to related listings that are part of this web
        if (relation.placements.length === 0) {
          return
        }
        const newEdge = {
          from: `listing-${listingId}`,
          to: `listing-${relation.id}`,
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

      transformedData.edges.push({
        from: category.id * 1000,
        to: `listing-${listingId}`,
        length: category.listings.length * 15,
        smooth: {
          enabled: true,
          type: 'continuous',
          roundness: 0,
        },
      })
    })
  })

  // Main node
  transformedData.nodes.push({
    id: CENTRAL_NODE_ID,
    label: webData.title,
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

  for (const category of categories) {
    const categoryId = category.id * 1000

    transformedData.nodes.push({
      id: categoryId,
      label: category.label,
      group: 'category',
      icon: category.icon,
    })

    // From main node to category node
    transformedData.edges.push({
      from: CENTRAL_NODE_ID,
      to: categoryId,
      width: 2,
      selectedWidth: 3,
      smooth: {
        enabled: true,
        type: 'continuous',
        roundness: 0,
      },
    })
  }

  const relatedWebs = webData.relations
  for (const relatedWeb of relatedWebs) {
    const relatedWebId = `related-web-${relatedWeb.slug}`
    transformedData.nodes.push({
      id: relatedWebId,
      label: relatedWeb.title,
      group: 'related-web',
    })

    transformedData.edges.push({
      from: CENTRAL_NODE_ID,
      to: relatedWebId,
      width: 2,
      selectedWidth: 3,
      length: 200,
      smooth: {
        enabled: true,
        type: 'continuous',
        roundness: 0,
      },
    })
  }

  return {
    // Compress only the network visualization data — it's the large payload.
    // webData is small and is consumed directly for props/metadata.
    data: compressJson(transformedData),
    // @ts-ignore
    webData,
  }
}

interface EventAddress {
  streetAddress: string
  postalCode: string
  geo: {
    latitude: number
    longitude: number
  }
}

interface EventOrganizer {
  id: string
  name: string
}

interface Event {
  id: string
  name: string
  summary: string
  description: string
  startDate: string
  endDate: string
  publisherUrl: string
  address: EventAddress
  organizer: EventOrganizer
}

interface EventsResponse {
  eventsByFilter: Event[]
}

async function getEvents(neighbourhoodId: number): Promise<Event[]> {
  const today = new Date()
  const twoWeeksFromNow = new Date()
  twoWeeksFromNow.setDate(today.getDate() + 14)

  // Format dates as required by the API (YYYY-MM-DD HH:mm)
  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day} 00:00`
  }

  const fromDate = formatDate(today)
  const toDate = formatDate(twoWeeksFromNow)

  const eventsClient = new GraphQLClient(process.env.PLACECAL_GRAPHQL_URL || '')

  const query = `
    query GetEventsByFilter($neighbourhoodId: Int!, $fromDate: String!, $toDate: String!) {
      eventsByFilter(
        neighbourhoodId: $neighbourhoodId
        fromDate: $fromDate
        toDate: $toDate
      ) {
        id
        name
        summary
        description
        startDate
        endDate
        publisherUrl
        address {
          streetAddress
          postalCode
          geo {
            latitude
            longitude
          }
        }
        organizer {
          id
          name
        }
      }
    }
  `

  try {
    const response = await eventsClient.request<EventsResponse>(query, {
      neighbourhoodId,
      fromDate,
      toDate,
    })

    return response.eventsByFilter
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

function drawCirclePoints(points, radius, center) {
  const positions = []
  const slice = (2 * Math.PI) / points
  for (let i = 0; i < points; i++) {
    const angle = slice * i

    const radiusToUse = i % 2 === 1 ? radius / 2 : radius
    const newX = Math.round(center.x + radiusToUse * Math.cos(angle))
    const newY = Math.round(center.y + radiusToUse * Math.sin(angle))
    const p = { x: newX, y: newY }

    positions.push(p)
  }

  return positions
}

export const dynamicParams = true
export const revalidate = false
