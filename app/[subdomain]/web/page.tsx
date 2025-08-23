import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { Web, WebLocation } from '@prisma/client'
import truncate from 'lodash.truncate'
import prisma from '@prisma-rw'
import WebHome from './WebHome'

export default async function WebHomePage(props) {
  const params = await props.params
  const { subdomain: webSlug } = params
  const data = await getData({ webSlug })

  if (!data) {
    return notFound()
  }

  return <WebHome webData={data.webData} />
}

export async function generateMetadata(props): Promise<Metadata> {
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

  const descriptionStrippedOfHtml = webData.description?.replace(
    /<[^>]*>?/gm,
    '',
  )
  const truncatedDescription = truncate(descriptionStrippedOfHtml, {
    length: 160,
    separator: /,.? +/,
  })

  return {
    title: `${webData.title} Resilience Web`,
    description: truncatedDescription,
    openGraph: {
      title: `${webData.title} Resilience Web`,
      description: truncatedDescription,
      images: [{ url: webData.image }],
    },
  }
}

type Data = {
  webData: Web & {
    location?: WebLocation | null
  }
}

async function getData({ webSlug }): Promise<Data> {
  const webData = await prisma.web.findUnique({
    where: {
      slug: webSlug,
    },
    include: {
      relations: true,
      location: true,
    },
  })

  if (!webData) {
    console.log(`[RW] Web not found for webSlug ${webSlug}`)
    return null
  }

  return {
    webData,
  }
}
