import type { NextApiRequest, NextApiResponse } from 'next'
import { Ownership } from '@prisma/client'
import prisma from '../../../prisma/client'
import type { Result } from '../type.d'

type Data = {
  ownerships: null | [Ownership]
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<Result<Data>>,
) => {
  try {
    const { slug } = req.query

    switch (req.method) {
      case 'GET':
        const ownerships: Data['ownerships'] = await prisma.ownership.findMany({
          where: {
            web: {
              slug: {
                contains: slug,
              },
            },
          },
        })
        res.status(200).send({ ownerships })
        break
    }
  } catch (e) {
    res.status(500).send({
      error: `Unable to fetch ownerships - ${e}`,
    })
    console.error(`[RW] Unable to fetch ownerships - ${e}`)
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
}

export default handler
