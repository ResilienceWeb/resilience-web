import type { NextApiRequest, NextApiResponse } from 'next'
import { withSentry } from '@sentry/nextjs'
import prisma from '../../../prisma/client'

const DEFAULT_LOCATION_SLUG = 'cambridge-city'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { site } = req.query
    try {
        const listings = await prisma.listing.findMany({
            where: {
                location: {
                    slug: {
                        contains: site ?? DEFAULT_LOCATION_SLUG,
                    },
                },
            },
            include: {
                category: true,
                location: true,
                tags: true,
            },
            orderBy: [
                {
                    id: 'asc',
                },
            ],
        })
        res.status(200)
        res.json({ listings })
    } catch (e) {
        res.status(500)
        res.json({
            error: `Unable to fetch listings from database - ${e}`,
        })
    }
}

export const config = {
    api: {
        externalResolver: true,
    },
}

export default withSentry(handler)
