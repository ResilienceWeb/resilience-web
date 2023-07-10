import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import type { File } from 'formidable'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { Prisma } from '@prisma/client'
import prisma from '../../../prisma/client'
import uploadImage from '@helpers/uploadImage'
import { stringToBoolean } from '@helpers/utils'

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
      const newData: Prisma.ListingUncheckedCreateInput = {
        title: fields.title as string,
        categoryId: parseInt(fields.category as string),
        webId: parseInt(fields.webId as string),
        website: fields.website as string,
        description: fields.description as string,
        email: fields.email as string,
        facebook: fields.facebook as string,
        instagram: fields.instagram as string,
        twitter: fields.twitter as string,
        notes: fields.notes as string,
        pending: stringToBoolean(fields.pending as string),
        seekingVolunteers: stringToBoolean(fields.seekingVolunteers as string),
        slug: fields.slug as string,
      }

      let imageUrl = null
      if (files.image) {
        imageUrl = await uploadImage(files.image as File)
      }
      if (imageUrl) {
        newData.image = imageUrl
      }

      const listing = await prisma.listing.create({
        data: newData,
      })

      res.status(201)
      res.json({ listing })
    })
  } catch (e) {
    res.status(500)
    res.json({
      error: `Unable to save listing to database - ${e}`,
    })
  }
}

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
}

export default handler
