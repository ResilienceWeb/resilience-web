import type { NextApiRequest, NextApiResponse } from 'next'
import { Location } from '@prisma/client'
import prisma from '../../../prisma/client'

type ResponseData = {
  error?: string
  web?: Location
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) => {
  try {
    const { slug } = req.query
    switch (req.method) {
      case 'GET':
        const web = await prisma.location.findFirst({
          where: {
            slug,
          },
        })
        res.status(200).send({ web })
        break
      case 'PATCH':
        const updatedWeb = await prisma.location.update({
          where: {
            slug,
          },
          data: req.body,
        })
        res.status(200)
        res.json({ web: updatedWeb })
        break
    }
  } catch (e) {
    res.status(500).send({
      error: `Unable to fetch web from database - ${e}`,
    })
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
}

export default handler
