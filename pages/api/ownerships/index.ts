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
        error: `You don't have permission to perform this action.`,
      })
    }

    const { web } = req.query

    let ownerships
    if (web !== undefined) {
      ownerships = await prisma.ownership.findMany({
        where: {
          webs: {
            some: {
              slug: {
                equals: web,
              },
            },
          },
        },
        include: {
          user: true,
        },
      })
    } else {
      const ownership = await prisma.ownership.findFirst({
        where: {
          user: {
            id: {
              equals: session.user.id,
            },
          },
        },
        include: {
          user: true,
          webs: true,
        },
      })

      ownerships = ownership?.webs ?? []
    }

    // eslint-disable-next-line sonarjs/no-small-switch
    switch (req.method) {
      case 'GET':
        res.json({ ownerships })
        res.status(200)

        break
      // case 'PUT':
      //   const allOwnershipsToDisconnect = ownership.webs.map((l) => ({
      //     id: l.id,
      //   }))

      //   const updatedDataDisconnect: Prisma.OwnershipUpdateArgs = {
      //     where: {
      //       email: targetEmail,
      //     },
      //     data: {
      //       webs: {
      //         disconnect: allOwnershipsToDisconnect,
      //       },
      //     },
      //   }
      //   await prisma.ownership.update(updatedDataDisconnect)

      //   const websToConnect = webs.map((s) => ({ id: s.id }))
      //   const updatedDataConnect: Prisma.OwnershipUpdateArgs = {
      //     where: {
      //       email: targetEmail,
      //     },
      //     data: {
      //       webs: {
      //         connect: websToConnect,
      //       },
      //     },
      //   }
      //   const updatedOwnership = await prisma.ownership.update(
      //     updatedDataConnect,
      //   )

      //   res.status(200)
      //   res.json({ ownership: updatedOwnership })
      //   break
    }
  } catch (e) {
    res.status(500)
    res.json({
      error: `Unable to fetch ownerships from database - ${e}`,
    })
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
}

export default handler

