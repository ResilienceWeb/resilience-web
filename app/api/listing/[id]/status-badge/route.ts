import * as Sentry from '@sentry/nextjs'
import sharp from 'sharp'
import prisma from '@prisma-rw'

// Sharp requires the Node.js runtime
export const runtime = 'nodejs'

function generateStatusSVG({
  text,
  approved,
  width = 100,
  height = 30,
}: {
  text: string
  approved: boolean
  width?: number
  height?: number
}) {
  const bg = approved ? '#16a34a' : '#9ca3af' // green-600 or gray-400
  const textColor = '#ffffff'
  const border = approved ? '#15803d' : '#6b7280' // darker border

  // Dynamic sizing and optional wrapping
  const paddingX = 16
  const paddingY = 16
  let lines: string[] = [text]

  // Decide if a single line would be too constrained by width; if so, try to split into two lines
  if (text.includes(' ')) {
    const mid = Math.floor(text.length / 2)
    let splitIdx = text.lastIndexOf(' ', mid)
    if (splitIdx === -1) splitIdx = text.indexOf(' ', mid)
    if (splitIdx !== -1 && splitIdx > 0 && splitIdx < text.length - 1) {
      const l1 = text.slice(0, splitIdx)
      const l2 = text.slice(splitIdx + 1)
      // Only accept split if it makes lines more balanced
      const balanced =
        Math.abs(l1.length - l2.length) <= Math.ceil(text.length * 0.5)
      // Estimate single-line max font size by width for the full text
      const singleLineMaxByWidth = Math.floor(
        (width - paddingX * 2) / (0.62 * Math.max(1, text.length)),
      )
      const widthTarget = Math.round(width * 0.16)
      if (balanced || singleLineMaxByWidth < widthTarget) {
        lines = [l1.trim(), l2.trim()]
      }
    }
  }

  const longest = lines.reduce((a, b) => (a.length > b.length ? a : b), '')
  // Approximate average glyph width ~ 0.62em, and vertical line-height ~ 1.2em
  const maxByWidth = Math.floor(
    (width - paddingX * 2) / (0.62 * Math.max(1, longest.length)),
  )
  const maxByHeight = Math.floor((height - paddingY * 2) / (1.2 * lines.length))

  let fontSize = Math.min(
    56,
    Math.round(width * 0.16),
    Math.round(height * 0.6),
  )
  fontSize = Math.min(fontSize, maxByWidth, maxByHeight)
  fontSize = Math.max(fontSize, 12) // keep readable minimum

  const textNode =
    lines.length === 1
      ? `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="${textColor}" font-size="${fontSize}" font-weight="700">${text}</text>`
      : `<text x="50%" y="50%" text-anchor="middle" fill="${textColor}" font-size="${fontSize}" font-weight="700">
           <tspan x="50%" dy="-0.6em">${lines[0]}</tspan>
           <tspan x="50%" dy="1.2em">${lines[1]}</tspan>
         </text>`

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.2"/>
    </filter>
  </defs>
  <rect x="4" y="4" rx="16" ry="16" width="${width - 8}" height="${height - 8}" fill="${bg}" stroke="${border}" stroke-width="2" filter="url(#shadow)"/>
  <g font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, 'Helvetica Neue', 'Noto Sans', 'Liberation Sans', sans-serif">
    ${textNode}
  </g>
</svg>`
}

async function svgToPng(svg: string): Promise<ArrayBuffer> {
  const buffer = Buffer.from(svg)
  const pngBuffer = await sharp(buffer)
    .png({ compressionLevel: 9, quality: 90 })
    .toBuffer()
  // Copy into a fresh ArrayBuffer to avoid SharedArrayBuffer typing issues
  const ab = new ArrayBuffer(pngBuffer.length)
  new Uint8Array(ab).set(pngBuffer)
  return ab
}

export async function GET(_request, props) {
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
      const svg = generateStatusSVG({
        text: 'Listing not found',
        approved: false,
      })
      if (format === 'png') {
        const png = await svgToPng(svg)
        return new Response(png, {
          status: 404,
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        })
      } else {
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
    const svg = generateStatusSVG({ text, approved })
    if (format === 'png') {
      const png = await svgToPng(svg)
      return new Response(png, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control':
            'public, max-age=0, s-maxage=600, stale-while-revalidate=300',
        },
      })
    } else {
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
