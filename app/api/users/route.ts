import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'
import { auth } from '@auth'
import {
  getSubscriber,
  upsertSubscriber,
  forgetSubscriber,
} from '@helpers/mailerlite'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })
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

    const subscriber = await getSubscriber(session.user.email)
    const subscribedToMailingList = subscriber?.status === 'active'

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
    const session = await auth.api.getSession({
      headers: request.headers,
    })

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
      await upsertSubscriber({
        email: session.user.email,
        fields: updatedUser.name ? { name: updatedUser.name } : undefined,
      })

      return Response.json({
        data: {
          ...updatedUser,
          subscribed: true,
        },
      })
    } else {
      const subscriber = await getSubscriber(session.user.email)
      if (subscriber) {
        await forgetSubscriber(subscriber.id)
      }

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
