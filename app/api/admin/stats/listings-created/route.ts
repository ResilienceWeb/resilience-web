import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { getSessionSafe } from '@auth'
import { getListingsCreatedByDay } from '@db/platformStatsRepository'

const VALID_PERIODS = [30, 90, 365]

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionSafe(request.headers)
    if (session?.user?.role !== 'admin') {
      return Response.json(
        { error: "You don't have enough permissions to perform this action." },
        { status: 403 },
      )
    }

    const { searchParams } = new URL(request.url)
    const period = Number(searchParams.get('period') ?? 90)

    if (!VALID_PERIODS.includes(period)) {
      return Response.json(
        { error: 'Invalid period. Must be 30, 90, or 365.' },
        { status: 400 },
      )
    }

    const listingsCreated = await getListingsCreatedByDay(period)

    return Response.json({ data: listingsCreated })
  } catch (e) {
    console.error(`[RW] Unable to fetch listings created - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to fetch listings created - ${e}`, {
      status: 500,
    })
  }
}
