import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import sharp from 'sharp'
import prisma from '@prisma-rw'

// Sharp requires the Node.js runtime
export const runtime = 'nodejs'

async function generateBadgePNG({
  text,
  approved,
}: {
  text: string
  approved: boolean
}): Promise<Buffer> {
  const bgColor = approved
    ? { r: 22, g: 163, b: 74 }
    : { r: 156, g: 163, b: 175 }
  const borderColor = approved
    ? { r: 21, g: 128, b: 61 }
    : { r: 107, g: 114, b: 128 }

  // Calculate dimensions based on text length
  const charWidth = 8
  const padding = 24
  const width = Math.max(120, text.length * charWidth + padding * 2)
  const height = 32
  const borderRadius = 6

  // Create the main badge background with rounded corners
  const badge = sharp({
    create: {
      width,
      height,
      channels: 4,
      background: bgColor,
    },
  }).png()

  // Create border overlay
  const borderSvg = `
    <svg width="${width}" height="${height}">
      <rect x="1" y="1" width="${width - 2}" height="${height - 2}" 
            rx="${borderRadius}" ry="${borderRadius}" 
            fill="none" stroke="rgb(${borderColor.r},${borderColor.g},${borderColor.b})" 
            stroke-width="2"/>
    </svg>
  `

  // Create text overlay using SVG (Sharp can render SVG text with embedded fonts)
  const textSvg = `
    <svg width="${width}" height="${height}">
      <style>
        .badge-text { 
          fill: white; 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: 14px; 
          font-weight: 600;
        }
      </style>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" class="badge-text">
        ${text}
      </text>
    </svg>
  `

  // Composite everything together
  const result = await badge
    .composite([
      {
        input: Buffer.from(borderSvg),
        top: 0,
        left: 0,
      },
      {
        input: Buffer.from(textSvg),
        top: 0,
        left: 0,
      },
    ])
    .png({ compressionLevel: 9, quality: 90 })
    .toBuffer()

  return result
}

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
  const url = new URL(_request.url)
  const format = (url.searchParams.get('format') || 'svg').toLowerCase()
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
      if (format === 'png') {
        const pngBuffer = await generateBadgePNG({ text, approved: false })
        return new Response(new Uint8Array(pngBuffer), {
          status: 404,
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        })
      } else {
        const svg = generateStatusSVG({ text, approved: false })
        return new Response(svg, {
          status: 404,
          headers: {
            'Content-Type': 'image/svg+xml; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        })
      }
    }

    const approved = !listing.pending
    const text = approved ? 'Approved' : 'Not approved yet'

    if (format === 'png') {
      const pngBuffer = await generateBadgePNG({ text, approved })
      return new Response(new Uint8Array(pngBuffer), {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control':
            'public, max-age=0, s-maxage=600, stale-while-revalidate=300',
        },
      })
    } else {
      const svg = generateStatusSVG({ text, approved })
      return new Response(svg, {
        headers: {
          'Content-Type': 'image/svg+xml; charset=utf-8',
          'Cache-Control':
            'public, max-age=0, s-maxage=600, stale-while-revalidate=300',
        },
      })
    }
  } catch (e) {
    console.error(`[RW] Unable to generate listing status badge - ${e}`)
    Sentry.captureException(e)
    return new Response('Unable to generate listing status badge', {
      status: 500,
    })
  }
}
