import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../app/auth'
import { Prisma } from '@prisma/client'
import prisma from '../../../prisma/client'
import uploadImage from '@helpers/uploadImage'
import { stringToBoolean } from '@helpers/utils'
import ListingProposedEmail from '@components/emails/ListingProposedEmail'
import { PROTOCOL, REMOTE_HOSTNAME } from '@helpers/config'
import { sendEmail } from '@helpers/email'

type ResponseData = {
  error?: string
  listing?: Listing // TODO: change to 'data'
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) => {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user) {
      // TODO: Improve security
      console.log(req.body)
    }

    if (req.method !== 'POST') {
      res.status(500)
      res.json({
        error: `Method ${req.method} not supported at this endpoint`,
      })
    }

    const form = formidable({
      keepExtensions: true,
      allowEmptyFiles: false,
      maxFileSize: 5 * 1024 * 1024,
    })

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    void form.parse(req, async (_err, fields, files) => {
      // Prepare tags
      const tagsArray = fields.tags[0] !== '' ? fields.tags[0].split(',') : []
      const tagsToConnect = tagsArray.map((tagId) => ({
        id: Number(tagId),
      }))

      // Prepare relations
      const relationsArray =
        fields.relations[0] !== '' ? fields.relations[0].split(',') : []
      const relationsToConnect = relationsArray.map((relationId) => ({
        id: Number(relationId),
      }))

      const isProposedListing = stringToBoolean(fields.pending[0])
      const webId = parseInt(fields.webId[0])
      const newData: Prisma.ListingCreateInput = {
        title: fields.title[0],
        category: {
          connect: {
            id: parseInt(fields.category[0]),
          },
        },
        web: {
          connect: {
            id: parseInt(fields.webId[0]),
          },
        },
        website: fields.website[0],
        description: fields.description[0],
        email: fields.email[0],
        facebook: fields.facebook[0],
        instagram: fields.instagram[0],
        twitter: fields.twitter[0],
        pending: isProposedListing,
        seekingVolunteers: stringToBoolean(fields.seekingVolunteers[0]),
        featured: isProposedListing
          ? false
          : stringToBoolean(fields.featured[0]),
        slug: fields.slug[0],
        location: {
          ...(fields?.latitude &&
          fields.latitude[0] &&
          fields?.longitude &&
          fields.longitude[0]
            ? {
                create: {
                  latitude: parseFloat(fields.latitude[0]),
                  longitude: parseFloat(fields.longitude[0]),
                },
              }
            : {}),
        },
        tags: {
          connect: tagsToConnect,
        },
        relations: {
          connect: relationsToConnect,
        },
        relationOf: {
          connect: relationsToConnect,
        },
      }

      let imageUrl = null
      if (files.image) {
        imageUrl = await uploadImage(files.image[0])
        if (imageUrl) {
          newData.image = imageUrl
        }
      }

      const listing = await prisma.listing.create({
        data: newData,
      })

      if (isProposedListing) {
        const selectedWeb = await prisma.web.findUnique({
          where: {
            id: webId,
          },
          include: {
            ownerships: {
              select: {
                email: true,
              },
            },
          },
        })

        const webCreatedEmailComponent = ListingProposedEmail({
          proposedListingTitle: listing.title,
          webTitle: `${selectedWeb.title}`,
          url: `${PROTOCOL}://${REMOTE_HOSTNAME}/admin`,
        })

        const emails = selectedWeb.ownerships.map(
          (ownership) => ownership.email,
        )
        emails.forEach(async (email) => {
          await sendEmail({
            to: email,
            subject: `Someone proposed a new listing for the ${selectedWeb.title} Resilience Web 🎉`,
            email: webCreatedEmailComponent,
          })
        })
      }

      res.status(201).json({ listing })
    })
  } catch (e) {
    res.status(500).json({ error: `Unable to save listing to database - ${e}` })
    console.error(`[RW] Unable to save listing to database - ${e}`)
  }
}

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
}

export default handler
