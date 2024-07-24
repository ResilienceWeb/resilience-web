import client from '@sendgrid/client'
import { auth } from '@auth'
import prisma from '../../../prisma/client'

client.setApiKey(process.env.SENDGRID_API_KEY)

export async function GET() {
  try {
    const session = await auth()
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
    try {
      const request = {
        url: `/v3/marketing/contacts/search/emails`,
        method: 'POST',
        body: {
          emails: [session?.user.email],
        },
      }
      // @ts-ignore
      const response = await client.request(request)
      if (response[0].statusCode === 200) {
        subscribedToMailingList = true
      }
    } catch (e) {
      // User is not currently subscribed. It shouldn't be an error, but for some reason the Sendgrid API throws an error.
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { ownerships: true },
    })

    return Response.json({
      data: { ...user, subscribed: subscribedToMailingList },
    })
  } catch (e) {
    console.error(`[RW] Unable to get user - ${e}`)
    return new Response(`Unable to get user - ${e}`, {
      status: 500,
    })
  }
}

export async function PATCH(request) {
  try {
    const session = await auth()

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
      const request = {
        url: `/v3/marketing/contacts`,
        method: 'PUT',
        body: {
          contacts: [
            {
              email: session.user.email,
            },
          ],
        },
      }
      // @ts-ignore
      await client.request(request)
    } else {
      try {
        const request = {
          url: `/v3/marketing/contacts/search/emails`,
          method: 'POST',
          body: {
            emails: [session?.user.email],
          },
        }
        // @ts-ignore
        const response = await client.request(request)
        const contactId = // @ts-ignore
          response[0].body.result[session?.user.email].contact.id

        const deleteRequest = {
          url: `/v3/marketing/contacts`,
          method: 'DELETE',
          qs: {
            ids: `${contactId}`,
          },
        }
        // @ts-ignore
        await client.request(deleteRequest)
      } catch (e) {
        // User is not currently subscribed. It shouldn't be an error, but for some reason the Sendgrid API throws an error.
      }
    }

    return Response.json({
      data: updatedUser,
    })
  } catch (e) {
    console.error(`[RW] Unable to update user - ${e}`)
    return new Response(`Unable to update user - ${e}`, {
      status: 500,
    })
  }
}
