import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { auth } from '@auth'
import {
  getDailyAnalyticsForWeb,
  getListingAnalyticsForWeb,
  getWebAnalytics,
} from '@db/analyticsRepository'
import { canUserEditWeb } from '@db/webAccessRepository'
import { getWebBySlug } from '@db/webRepository'

const VALID_PERIODS = [7, 30, 90]

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })
    if (!session?.user) {
      return Response.json(
        { error: "You don't have enough permissions to perform this action." },
        { status: 403 },
      )
    }

    const { searchParams } = new URL(request.url)
    const webSlug = searchParams.get('webSlug')
    const period = Number(searchParams.get('period') ?? 30)

    if (!webSlug) {
      return Response.json({ error: 'webSlug is required' }, { status: 400 })
    }

    if (!VALID_PERIODS.includes(period)) {
      return Response.json(
        { error: 'Invalid period. Must be 7, 30, or 90.' },
        { status: 400 },
      )
    }

    const web = await getWebBySlug(webSlug)
    if (!web) {
      return Response.json({ error: 'Web not found' }, { status: 404 })
    }

    const isAdmin = session.user.role === 'admin'
    const hasAccess = await canUserEditWeb(session.user.email, web.id)
    if (!isAdmin && !hasAccess) {
      return Response.json(
        { error: "You don't have enough permissions to perform this action." },
        { status: 403 },
      )
    }

    const [listings, webAnalytics, daily] = await Promise.all([
      getListingAnalyticsForWeb(web.id, period),
      getWebAnalytics(web.id, period),
      getDailyAnalyticsForWeb(web.id, period),
    ])

    return Response.json({
      data: {
        listings,
        web: webAnalytics,
        daily,
      },
    })
  } catch (e) {
    console.error(`[RW] Unable to fetch analytics - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to fetch analytics - ${e}`, {
      status: 500,
    })
  }
}
