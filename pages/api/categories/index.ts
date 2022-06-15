import { Category } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { withSentry } from '@sentry/nextjs'
import prisma from '../../../prisma/client'

type ResponseData = {
    error?: string
    data?: Category | Category[]
}

const handler = async (
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>,
) => {
    try {
        const { site } = req.query

        switch (req.method) {
            case 'GET': {
                const categories: Category[] = await prisma.category.findMany({
                    where: {
                        location: {
                            slug: {
                                contains: site || 'cambridge-city',
                            },
                        },
                    },
                    orderBy: [
                        {
                            id: 'asc',
                        },
                    ],
                })
                res.status(200)
                res.json({ data: categories })

                break
            }
            case 'POST': {
                const category = await prisma.category.create({
                    data: req.body,
                })
                res.status(201)
                res.json({ data: category })

                break
            }
            case 'PUT': {
                const category = await prisma.category.update({
                    where: {
                        location: {
                            slug: {
                                contains: site,
                            },
                        },
                    },
                })

                res.status(200)
                res.json({ data: category })

                break
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
            error: `Unable to ${req.method} process database operation - ${e}`,
        })
    }
}

export const config = {
    api: {
        externalResolver: true,
    },
}

export default withSentry(handler)
