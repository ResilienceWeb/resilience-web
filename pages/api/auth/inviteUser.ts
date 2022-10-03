import type { NextApiRequest, NextApiResponse } from 'next'
import sgMail from '@sendgrid/mail'
import { getSession } from 'next-auth/react'
import { Prisma } from '@prisma/client'
import prisma from '../../../prisma/client'
import { REMOTE_URL } from '@helpers/config'
import { htmlTemplate, textTemplate } from '@helpers/emailTemplates'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getSession({ req })
    if (!session?.user.admin) {
      res.status(403)
      res.json({
        error: `You don't have enough permissions to access this data.`,
      })
    }

    const { email, listings } = req.body

    if (!email) {
      res.status(400)
      res.json({
        error: `Email not provided. Please make sure it's included in the request body.`,
      })
    }

    if (!listings) {
      res.status(400)
      res.json({
        error: `Listing not provided. Please make sure it's included in the request body.`,
      })
    }

    const isUserExisting = await prisma.user.findUnique({ where: { email } })
    if (isUserExisting) {
      res.status(409)
      res.json({
        error:
          'User already invited. Please use Permissions page to edit their permissions.',
      })
      res.end()
    }

    const newUserData: Prisma.UserUpsertArgs = {
      where: { email },
      create: { email },
      update: { email },
    }
    const user = await prisma.user.upsert(newUserData)

    const listingsToConnect = listings.map((listing) => ({ id: listing.id }))
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
        listings: {
          connect: listingsToConnect,
        },
      },
      update: {
        user: {
          connect: {
            id: user.id,
          },
        },
        listings: {
          connect: listingsToConnect,
        },
      },
    }
    const permission = await prisma.permission.upsert(newData)

    const emailEncoded = encodeURIComponent(email)
    const callToActionButtonUrl = `${REMOTE_URL}/admin?activate=${emailEncoded}`

    const listingTitles = listings.map((l) => l.title)
    const listingTitlesConcatenated = listingTitles.join(', ')

    if (permission) {
      const msg = {
        to: email,
        from: `Resilience Web <info@resilienceweb.org.uk>`,
        subject: `Your invite to Cambridge Resilience Web`,
        text: textTemplate({ url: callToActionButtonUrl }),
        html: htmlTemplate({
          url: callToActionButtonUrl,
          email,
          buttonText: 'Activate account',
          mainText: `<p>You have been invited to manage the groups <b>${listingTitlesConcatenated}</b> on Cambridge Resilience Web, a digital mapping of organisations in Cambridge that are working to create a more resilient, more equitable and greener future for Cambridge and its residents.</p>`,
          secondaryText: `<p>There is lots of great work being done in Cambridge by the multitude of Cambridge-based groups working to make a positive difference in the areas of the environment and civil society. However, there wasn't a single place to go that showed all the organisations and how they are connected. These webs, in the first instance, are therefore a tool to help potential volunteers to discover organisations such as yours. Additionally, we want to facilitate collaboration and cross pollination across organisations where desired, and are looking into running events in the future that would enable this.</p>
					<p>We hope you are excited to be a part of the Resilience Web, and that you will share it with members of your organisation!  If you have any questions about the web, or if you would rather not be included on it, please let me know by replying to this email.</p>
					<p>Please give this a go, and we would love to hear any feedback you have about the web itself, how it is to use, and how it could be most useful to your organization.</p>
					<p>The Cambridge Resilience Web is a collaboration between volunteers at Transition Cambridge, Cambridge Doughnut, and the Interdisciplinary Research Hub in Sustainability & Conservation at Wolfson College, Cambridge.</p>
					<p>If that sounds good, click the button below to activate your account. If it doesn’t, we would appreciate it if you could reply to this email and let us know why.</p>`,
          footerText: `<p>If you're not sure why you received this invite or if you have any questions, please reply to this email.</p>
					<p>The Resilience Web Team x</p>`,
        }),
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
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
}

export default handler
