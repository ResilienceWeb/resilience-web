import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import type { File } from 'formidable'
import { Location, Prisma } from '@prisma/client'
import prisma from '../../../prisma/client'
import uploadImage from '@helpers/uploadImage'
import { stringToBoolean } from '@helpers/utils'
import type { Result } from '../type.d'

type Data = {
  web: null | Location
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<Result<Data>>,
) => {
  try {
    const { slug } = req.query
    switch (req.method) {
      case 'GET':
        const web: Data['web'] = await prisma.location.findFirst({
          where: {
            slug,
          },
        })
        res.status(200).send({ web })
        break
      case 'POST':
        const form = formidable({
          keepExtensions: true,
        })

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        form.parse(req, async (_err, fields, files) => {
          const newData: Prisma.LocationUncheckedUpdateInput = {
            published: stringToBoolean(fields.published as string),
          }

          let imageUrl = null
          if (files.image) {
            const { image: oldImageKey } = await prisma.location.findUnique({
              where: { slug },
            })
            imageUrl = await uploadImage(
              files.image as File,
              oldImageKey as string,
            )
          }
          if (imageUrl) {
            newData.image = imageUrl
          }

          const updatedWeb: Data['web'] = await prisma.location.update({
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
