import type { NextApiRequest, NextApiResponse } from 'next'
import { Location } from '@prisma/client'
import prisma from '../../../prisma/client'
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
      case 'PATCH':
        const updatedWeb: Data['web'] = await prisma.location.update({
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
