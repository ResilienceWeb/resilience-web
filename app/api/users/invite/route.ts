import { Prisma } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'
import { auth } from '@auth'
import { REMOTE_URL } from '@helpers/config'
import { sendEmail } from '@helpers/email'
import InviteEmail from '@components/emails/InviteEmail'

export async function POST(request) {
  try {
    const session = await auth()

    if (!session) {
      return Response.json(
        {
          error: `You don't have enough permissions to access this data.`,
        },
        { status: 403 },
      )
    }

    const { email: emailAddress, web: webId, asOwner } = await request.json()
    const email = emailAddress.trim()

    if (!email) {
      return Response.json(
        {
          error: `Email not provided. Please make sure it's included in the request body.`,
        },
        { status: 400 },
      )
    }

    if (!webId) {
      return Response.json(
        {
          error: `Web not provided. Please make sure it's included in the request body.`,
        },
        { status: 400 },
      )
    }

    const newUserData: Prisma.UserUpsertArgs = {
      where: { email },
      create: { email },
      update: { email },
    }
    const user = await prisma.user.upsert(newUserData)
    const webIdToConnect = webId ? { id: webId } : []

    if (asOwner) {
      const newData: Prisma.OwnershipUpsertArgs = {
        where: {
          email,
        },
        create: {
          user: {
            connect: {
              id: user.id,
            },
          },
          webs: {
            connect: webIdToConnect,
          },
        },
        update: {
          user: {
            connect: {
              id: user.id,
            },
          },
          webs: {
            connect: webIdToConnect,
          },
        },
      }

      await prisma.ownership.upsert(newData)
    } else {
      const newData: Prisma.PermissionUpsertArgs = {
        where: {
          email,
        },
        create: {
          user: {
            connect: {
              id: user.id,
            },
          },
          webs: {
            connect: webIdToConnect,
          },
        },
        update: {
          user: {
            connect: {
              id: user.id,
            },
          },
          webs: {
            connect: webIdToConnect,
          },
        },
      }

      await prisma.permission.upsert(newData)
    }

    const emailEncoded = encodeURIComponent(email)
    const callToActionButtonUrl = `${REMOTE_URL}/activate?email=${emailEncoded}`

    const selectedWeb = await prisma.web.findUnique({
      where: {
        id: webId,
      },
    })

    const inviteEmailComponent = InviteEmail({
      webTitle: `${selectedWeb.title}`,
      email: email,
      url: callToActionButtonUrl,
    })

    await sendEmail({
      to: email,
      subject: `Your invite to ${selectedWeb.title} Resilience Web`,
      email: inviteEmailComponent,
    })

    return Response.json({
      message: 'Invite sent successfully',
    })
  } catch (e) {
    console.error(`[RW] Unable to invite user - ${e}`)
    Sentry.captureException(e)
    return Response.json(
      {
        error: `Unable to invite user - ${e}`,
      },
      { status: 500 },
    )
  }
}
