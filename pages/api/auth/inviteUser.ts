import type { NextApiRequest, NextApiResponse } from 'next'
import sgMail from '@sendgrid/mail'
import { getServerSession } from 'next-auth/next'
import { render } from '@react-email/render'
import { Prisma } from '@prisma/client'
import { authOptions } from '../../../app/auth'
import prisma from '../../../prisma/client'
import { REMOTE_URL } from '@helpers/config'
import InviteEmail from '@components/emails/InviteEmail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string)

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      res.status(403)
      return res.json({
        error: `You don't have enough permissions to access this data.`,
      })
    }

    const email = req.body.email.trim()
    const { web: webId } = req.body

    if (!email) {
      res.status(400)
      return res.json({
        error: `Email not provided. Please make sure it's included in the request body.`,
      })
    }

    if (!webId) {
      res.status(400)
      return res.json({
        error: `Web not provided. Please make sure it's included in the request body.`,
      })
    }

    const newUserData: Prisma.UserUpsertArgs = {
      where: { email },
      create: { email },
      update: { email },
    }
    const user = await prisma.user.upsert(newUserData)
    const webIdToConnect = webId ? { id: webId } : []

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
    const permission = await prisma.permission.upsert(newData)

    const emailEncoded = encodeURIComponent(email)
    const callToActionButtonUrl = `${REMOTE_URL}/admin?activate=${emailEncoded}`

    const selectedWeb = await prisma.web.findUnique({
      where: {
        id: webId,
      },
    })

    if (permission) {
      const inviteEmailComponent = InviteEmail({
        webTitle: `${selectedWeb.title}`,
        email: email,
        url: callToActionButtonUrl,
      })
      const inviteEmailHtml = render(inviteEmailComponent)
      const inviteEmailText = render(inviteEmailComponent, { plainText: true })

      const msg = {
        from: `Resilience Web <info@resilienceweb.org.uk>`,
        to: email,
        subject: `Your invite to the ${selectedWeb.title} Resilience Web`,
        text: inviteEmailText,
        html: inviteEmailHtml,
      }

      void (async () => {
        try {
          await sgMail.send(msg)

          res.status(200)
          res.json({
            res: 'Invite sent successfully',
          })
        } catch (error) {
          console.error(error)

          if (error.response) {
            console.error(error.response.body)
          }
        }
      })()
    } else {
      res.status(400)
      res.json({
        error: 'There was an unspecified error',
      })
    }
  } catch (e) {
    res.status(500)
    res.json({
      error: `Unable to invite user - ${e}`,
    })
    console.error(`[RW] Unable to invite user - ${e}`)
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
}

export default handler
