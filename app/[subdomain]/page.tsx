import prisma from '@prisma-rw'
import Web, { CENTRAL_NODE_ID } from './Web'
import { notFound } from 'next/navigation'
import { getIconUnicode } from '@helpers/icons'

export default async function WebPage(props) {
  const params = await props.params
  const { subdomain: webSlug } = params
  const data = await getData({ webSlug })

  if (!data) {
    return notFound()
  }

  const { transformedData, webData } = data

  return (
    <Web
      data={transformedData}
      features={webData.features}
      webName={webData.title}
      webDescription={webData.description}
      webIsPublished={webData.published}
    />
  )
}

export async function generateMetadata(props) {
  const params = await props.params
  const { subdomain: webSlug } = params
  const webData = await prisma.web.findUnique({
    where: {
      slug: webSlug,
    },
  })

  if (!webData) {
    return null
  }

  return {
    title: `${webData.title} | Resilience Web`,
    openGraph: {
      title: `${webData.title} | Resilience Web`,
      images: [{ url: webData.image }],
    },
    alternates: {
      canonical: `https://${webData.slug}.resilienceweb.org.uk`,
    },
  }
}

export async function generateStaticParams() {
  const webs = await prisma.web.findMany()
  const paths = webs.map((w) => `${w.slug}`)
  const subdomains = paths.map((path) => ({
    subdomain: path,
  }))

  return subdomains
}

type DataType = {
  transformedData: {
    nodes: ListingNodeType[]
    edges: any[]
  }
  webData: {
    title: string
    description: string
    published: boolean
    image: string
    slug: string
    features: Record<string, any>
  }
}

async function getData({ webSlug }): Promise<DataType> {
  const webData = await prisma.web.findUnique({
    where: {
      slug: webSlug,
    },
  })

  if (
    webData.slug === 'ely' ||
    process.env.NEXT_PUBLIC_VERCEL_ENV !== 'production'
  ) {
    // @ts-ignore
    webData.features = {
      geoMapping: {
        enabled: true,
      },
    }
  } else {
    // @ts-ignore
    webData.features = {}
  }

  const categories = await prisma.category.findMany({
    where: {
      web: {
        slug: webSlug,
      },
    },
    include: {
      listings: {
        where: {
          inactive: false,
          pending: false,
        },
        orderBy: [
          {
            id: 'asc',
          },
        ],
        include: {
          socials: true,
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
              icon: true,
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
      },
    },
  })

  if (!webData || !categories) {
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

  categories.map((category) => {
    category.listings.map(
      ({
        id: listingId,
        title,
        description,
        image,
        website,
        socials,
        seekingVolunteers,
        location,
        featured,
        slug,
        tags,
        relations,
      }) => {
        transformedData.nodes.push({
          id: listingId,
          title,
          description,
          image: image ?? '',
          website,
          location,
          socials,
          seekingVolunteers,
          featured,
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
          icon: {
            face: '"Font Awesome 5 Free"',
            code:
              category.icon !== 'default'
                ? getIconUnicode(category.icon)
                : undefined,
            color: 'white',
            weight: 700,
          },
        })

        relations.map((relation) => {
          const newEdge = {
            from: listingId,
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

        transformedData.edges.push({
          from: category.id * 1000,
          to: listingId,
          length: category.listings.length * 15,
          smooth: {
            enabled: true,
            type: 'continuous',
            roundness: 0,
          },
        })
      },
    )
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
      color: '#c3c4c7',
      group: 'category',
      icon: category.icon,
      mass: 1,
    })

    // From main node to category node
    transformedData.edges.push({
      from: CENTRAL_NODE_ID,
      to: categoryId,
      width: 2,
      selectedWidth: 3,
      // length: categoriesCount * 75,
      smooth: {
        enabled: true,
        type: 'continuous',
        roundness: 0,
      },
    })
  }

  return {
    transformedData,
    // @ts-ignore
    webData,
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
export const revalidate = 300
