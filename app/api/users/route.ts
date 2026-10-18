import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'
import { getSessionSafe } from '@auth'
import { isSubscribed, subscribe, unsubscribe } from '@helpers/mailingList'

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionSafe(request.headers)
    if (!session?.user) {
      return Response.json(
        {
          error: `You don't have permission to perform this action.`,
        },
        {
          status: 403,
        },
      )
    }

    const subscribedToMailingList = await isSubscribed(session.user.email)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    return Response.json({
      data: { ...user, subscribed: subscribedToMailingList },
    })
  } catch (e) {
    console.error(`[RW] Unable to get user - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to get user - ${e}`, {
      status: 500,
    })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSessionSafe(request.headers)

    if (!session?.user) {
      return Response.json(
        {
          error: `You don't have permission to perform this action.`,
        },
        {
          status: 403,
        },
      )
    }

    const requestBody = await request.json()
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: requestBody.name,
      },
    })

    if (requestBody.subscribed) {
      await subscribe(session.user.email, updatedUser.name)

      return Response.json({
        data: {
          ...updatedUser,
          subscribed: true,
        },
      })
    } else {
      await unsubscribe(session.user.email)

      return Response.json({
        data: {
          ...updatedUser,
          subscribed: false,
        },
      })
    }
  } catch (e) {
    console.error(`[RW] Unable to update user - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to update user - ${e}`, {
      status: 500,
    })
  }
}
