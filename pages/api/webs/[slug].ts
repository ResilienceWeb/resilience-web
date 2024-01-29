import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import { Web, Prisma } from '@prisma/client'
import prisma from '../../../prisma/client'
import uploadImage from '@helpers/uploadImage'
import { stringToBoolean } from '@helpers/utils'
import type { Result } from '../type.d'

type Data = {
  web: Web
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<Result<Data>>,
) => {
  try {
    const { slug } = req.query
    switch (req.method) {
      case 'GET':
        const withListings = req.query.withListings
          ? stringToBoolean(req.query.withListings as string)
          : false

        const withAdminInfo = req.query.withAdminInfo
          ? stringToBoolean(req.query.withAdminInfo as string)
          : false

        const include = Prisma.validator<Prisma.WebInclude>()({
          listings: {},
          permissions: {},
          ownerships: {},
        })

        if (withListings) {
          include.listings = {
            select: {
              id: true,
              webId: true,
            },
          }
        }

        if (withAdminInfo) {
          include.permissions = {
            include: {
              user: true,
            },
          }
          include.ownerships = {
            include: {
              user: true,
            },
          }
        }

        const web: Data['web'] = await prisma.web.findFirst({
          where: {
            slug,
          },
          include,
        })
        res.status(200).send({ web })
        break
      case 'POST':
        const form = formidable({
          keepExtensions: true,
        })

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        form.parse(req, async (_err, fields, files) => {
          const newData: Prisma.WebUncheckedUpdateInput = {
            published: stringToBoolean(fields.published[0]),
          }

          let imageUrl = null
          if (files.image) {
            const { image: oldImageKey } = await prisma.web.findUnique({
              where: { slug },
            })
            imageUrl = await uploadImage(files.image[0], oldImageKey as string)
          }
          if (imageUrl) {
            newData.image = imageUrl
          }

          const updatedWeb: Data['web'] = await prisma.web.update({
            where: {
              slug,
            },
            data: newData,
          })
          res.status(200)
          res.json({ web: updatedWeb })
        })

        break
    }
  } catch (e) {
    res.status(500).send({ error: `Unable to fetch web - ${e}` })
    console.error(`[RW] Unable to fetch web - ${e}`)
  }
}

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
}

export default handler
