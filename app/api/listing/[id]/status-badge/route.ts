import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'

// Use shields.io badge service for reliable email-compatible badges
export const runtime = 'nodejs'

function generateBadgeUrl(text: string, approved: boolean): string {
  const color = approved ? 'green' : 'gray'
  const encodedText = encodeURIComponent(text)
  return `https://img.shields.io/badge/${encodedText}-${color}?style=flat&labelColor=${color}`
}

export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params
  try {
    const listingId = Number(params.id)
    if (Number.isNaN(listingId)) {
      return new Response('Invalid listing id', { status: 400 })
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { pending: true },
    })

    if (!listing) {
      const badgeUrl = generateBadgeUrl('Not_Found', false)
      // Fetch the image from shields.io and return it
      const response = await fetch(badgeUrl)
      const imageBuffer = await response.arrayBuffer()
      return new Response(imageBuffer, {
        status: 404,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      })
    }

    const approved = !listing.pending
    const text = approved ? 'Approved' : 'Not_Approved'
    const badgeUrl = generateBadgeUrl(text, approved)

    // Fetch the image from shields.io and return it
    const response = await fetch(badgeUrl)
    const imageBuffer = await response.arrayBuffer()

    return new Response(imageBuffer, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control':
          'public, max-age=0, s-maxage=600, stale-while-revalidate=300',
      },
    })
  } catch (e) {
    console.error(`[RW] Unable to generate listing status badge - ${e}`)
    Sentry.captureException(e)
    return new Response('Unable to generate listing status badge', {
      status: 500,
    })
  }
}
