import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'

// Use node.js runtime
export const runtime = 'nodejs'

function generateStatusSVG({
  text,
  approved,
}: {
  text: string
  approved: boolean
}) {
  const bg = approved ? '#16a34a' : '#9ca3af'
  const border = approved ? '#15803d' : '#6b7280'

  // Calculate dimensions based on text length
  const charWidth = 8
  const padding = 24
  const width = Math.max(120, text.length * charWidth + padding * 2)
  const height = 32

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <style>
      .badge-text { 
        fill: white; 
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        font-size: 14px; 
        font-weight: 600;
      }
    </style>
  </defs>
  <rect x="1" y="1" rx="6" ry="6" width="${width - 2}" height="${height - 2}" 
        fill="${bg}" stroke="${border}" stroke-width="2"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" class="badge-text">
    ${text}
  </text>
</svg>`
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
      const text = 'Listing not found'
      const svg = generateStatusSVG({ text, approved: false })
      return new Response(svg, {
        status: 404,
        headers: {
          'Content-Type': 'image/svg+xml; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      })
    }

    const approved = !listing.pending
    const text = approved ? 'Approved' : 'Not approved yet'
    const svg = generateStatusSVG({ text, approved })

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
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
