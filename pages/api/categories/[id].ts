import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import prisma from '../../../prisma/client'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user) {
      res.status(403)
      res.json({
        error: `You don't have enough permissions to access this data.`,
      })
    }

    switch (req.method) {
      case 'DELETE': {
        const { id: categoryId } = req.query
        const category = await prisma.category.delete({
          where: {
            id: Number(categoryId),
          },
        })

        res.status(200)
        res.json({ data: category })
      }
      default: {
        res.status(500)
        res.json({
          error: `Method ${req.method} not supported at this endpoint`,
        })
        break
      }
    }
  } catch (e) {
    res.status(500)
    res.json({
      error: `Unable to update/delete category - ${e}`,
    })
    console.error(`[RW] Unable to update/delete category - ${e}`)
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
}

export default handler
