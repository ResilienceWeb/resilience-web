import type { Metadata } from 'next'
import prisma from '@prisma-rw'
import Homepage from '../Homepage'

export const metadata: Metadata = {
  title: 'Resilience Web Map',
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    title: 'Resilience Web Map',
    images: [{ url: 'static/preview-image.png' }],
    description:
      'Explore the Resilience Web map to find local groups working to co-create a more socially and environmentally just city.',
  },
  twitter: {
    site: '@ResilienceWeb',
  },
}

export default async function MapPage() {
  const { webs } = await getData()

  return <Homepage webs={webs} showMap={true} />
}

async function getData(): Promise<any> {
  const webs = await prisma.web.findMany({
    where: {
      published: true,
      deletedAt: null,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      image: true,
      createdAt: true,
      location: {
        select: {
          latitude: true,
          longitude: true,
          description: true,
        },
      },
    },
  })

  return {
    webs,
  }
}
