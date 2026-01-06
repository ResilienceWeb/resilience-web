import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { readFileSync } from 'fs'
import { join } from 'path'
import sharp from 'sharp'
import prisma from '@prisma-rw'

// Use node.js runtime
export const runtime = 'nodejs'

// Load font file once at module initialization
const fontPath = join(
  process.cwd(),
  'node_modules/next/dist/compiled/@vercel/og/noto-sans-v27-latin-regular.ttf',
)
let fontBuffer: Buffer
try {
  fontBuffer = readFileSync(fontPath)
} catch (e) {
  console.error('Failed to load font for badge generation:', e)
}

async function generateBadgePNG({
  text,
  approved,
}: {
  text: string
  approved: boolean
}): Promise<Buffer> {
  const bgColor = approved ? '#16a34a' : '#9ca3af'
  const borderColor = approved ? '#15803d' : '#6b7280'

  // Calculate dimensions based on text length
  const charWidth = 8
  const padding = 24
  const width = Math.max(120, text.length * charWidth + padding * 2)
  const height = 32

  // Create SVG with embedded font data
  const fontBase64 = fontBuffer.toString('base64')
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <style>
      @font-face {
        font-family: 'NotoSans';
        src: url(data:font/truetype;charset=utf-8;base64,${fontBase64}) format('truetype');
      }
      .badge-text { 
        fill: white; 
        font-family: 'NotoSans', sans-serif;
        font-size: 14px; 
        font-weight: 400;
      }
    </style>
  </defs>
  <rect x="1" y="1" rx="6" ry="6" width="${width - 2}" height="${height - 2}" 
        fill="${bgColor}" stroke="${borderColor}" stroke-width="2"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" class="badge-text">
    ${text}
  </text>
</svg>`

  const pngBuffer = await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9, quality: 90 })
    .toBuffer()

  return pngBuffer
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
      const pngBuffer = await generateBadgePNG({ text, approved: false })
      return new Response(new Uint8Array(pngBuffer), {
        status: 404,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      })
    }

    const approved = !listing.pending
    const text = approved ? 'Approved' : 'Not approved yet'
    const pngBuffer = await generateBadgePNG({ text, approved })

    return new Response(new Uint8Array(pngBuffer), {
      headers: {
        'Content-Type': 'image/png',
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
