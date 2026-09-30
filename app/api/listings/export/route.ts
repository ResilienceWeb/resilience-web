import type { NextRequest } from 'next/server'
import { callerCanEditWeb, getCaller } from '@/lib/api-authorization'
import { listingsToCsv } from '@/lib/export/listingsCsv'
import * as Sentry from '@sentry/nextjs'
import Papa from 'papaparse'
import prisma from '@prisma-rw'
import { getWebBySlug } from '@db/webRepository'

export async function GET(request: NextRequest) {
  const webSlug = request.nextUrl.searchParams.get('web')
  if (!webSlug) {
    return Response.json({ error: 'web is required' }, { status: 400 })
  }

  const caller = await getCaller(request)
  if (!caller) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  try {
    const web = await getWebBySlug(webSlug)
    if (!web) {
      return Response.json({ error: 'Web not found' }, { status: 404 })
    }

    // The export carries contact emails and listings nobody has approved yet,
    // which the public web never shows.
    if (!(await callerCanEditWeb(caller, web.id))) {
      return Response.json(
        { error: "You don't have permission to export this web's listings" },
        { status: 403 },
      )
    }

    const placements = await prisma.listingPlacement.findMany({
      where: { webId: web.id },
      select: {
        category: { select: { label: true } },
        listing: {
          select: {
            title: true,
            description: true,
            email: true,
            website: true,
            pending: true,
            inactive: true,
            location: { select: { description: true } },
            socials: { select: { platform: true, url: true } },
          },
        },
      },
      orderBy: { listing: { title: 'asc' } },
    })

    const csv = listingsToCsv(
      placements.map(({ listing, category }) => ({ ...listing, category })),
    )
    const date = new Date().toISOString().slice(0, 10)

    // The byte order mark is what makes Excel read the file as UTF-8 rather
    // than mangling every accented character.
    return new Response(`${Papa.BYTE_ORDER_MARK}${csv}`, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${web.slug}-listings-${date}.csv"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('[RW] Unable to export listings', error)
    Sentry.captureException(error)
    return Response.json(
      { error: 'Unable to export listings' },
      { status: 500 },
    )
  }
}
