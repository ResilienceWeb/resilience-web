import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { Prisma } from '@prisma/client'
import prisma from '../../../prisma/client'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user) {
      res.status(403)
      res.json({
        error: `You don't have enough permissions to perform this action.`,
      })
    }

    const { email: targetEmail, listings, webs } = req.body

    const email = targetEmail ?? session?.user.email
    const permission = await prisma.permission.findUnique({
      include: {
        listings: true,
        webs: true,
      },
      where: { email },
    })

    switch (req.method) {
      case 'GET':
        res.json({ permission })
        res.status(200)

        break
      case 'PUT':
        const allWebsToDisconnect = permission.webs.map((l) => ({
          id: l.id,
        }))
        const allListingsToDisconnect = permission.listings.map((l) => ({
          id: l.id,
        }))

        const updatedDataDisconnect: Prisma.PermissionUpdateArgs = {
          where: {
            email: targetEmail,
          },
          data: {
            webs: {
              disconnect: allWebsToDisconnect,
            },
            listings: {
              disconnect: allListingsToDisconnect,
            },
          },
        }
        await prisma.permission.update(updatedDataDisconnect)

        const websToConnect = webs.map((s) => ({ id: s.id }))
        const listingsToConnect = listings.map((l) => ({ id: l.id }))
        const updatedDataConnect: Prisma.PermissionUpdateArgs = {
          where: {
            email: targetEmail,
          },
          data: {
            webs: {
              connect: websToConnect,
            },
            listings: {
              connect: listingsToConnect,
            },
          },
        }
        const updatedPermission =
          await prisma.permission.update(updatedDataConnect)

        res.status(200)
        res.json({ permission: updatedPermission })
        break
    }
  } catch (e) {
    res.status(500)
    res.json({ error: `Unable to fetch permissions - ${e}` })
    console.error(`[RW] Unable to fetch permissions - ${e}`)
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
}

export default handler
