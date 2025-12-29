import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'
import { auth } from '@auth'

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

    let subscribedToMailingList = false
    const response = await fetch(
      `https://connect.mailerlite.com/api/subscribers/${session?.user.email}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MAILERLITE_API_KEY}`,
        },
      },
    )
    const responseJson = await response.json()

    if (responseJson.data?.status === 'active') {
      subscribedToMailingList = true
    }

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
      const response = await fetch(
        'https://connect.mailerlite.com/api/subscribers',
        {
          method: 'POST',
          body: JSON.stringify({
            email: session.user.email,
          }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.MAILERLITE_API_KEY}`,
          },
        },
      )
      const data = await response.json()
      if (data.error) {
        return Response.json({ error: data.error }, { status: 400 })
      }

      return Response.json({
        data: {
          ...updatedUser,
          subscribed: true,
        },
      })
    } else {
      const response = await fetch(
        `https://connect.mailerlite.com/api/subscribers/${session?.user.email}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.MAILERLITE_API_KEY}`,
          },
        },
      )
      const responseJson = await response.json()
      const subscriberId = responseJson.data.id
      if (responseJson.error) {
        return Response.json({ error: responseJson.error }, { status: 400 })
      }

      const unsubscribeResponse = await fetch(
        `https://connect.mailerlite.com/api/subscribers/${subscriberId}/forget`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.MAILERLITE_API_KEY}`,
          },
        },
      )
      const unsubscribeResponseJson = await unsubscribeResponse.json()

      if (unsubscribeResponseJson.error) {
        return Response.json(
          { error: unsubscribeResponseJson.error },
          { status: 400 },
        )
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
