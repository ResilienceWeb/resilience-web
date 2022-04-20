import { Category } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { withSentry } from '@sentry/nextjs';
import prisma from '../../../prisma/client';

type ResponseData = {
    error?: string;
    categories?: Category[];
};

const handler = async (
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>,
) => {
    try {
        const categories: Category[] = await prisma.category.findMany({
            orderBy: [
                {
                    id: 'asc',
                },
            ],
        });
        res.status(200);
        res.json({ categories });
    } catch (e) {
        res.status(500);
        res.json({
            error: `Unable to fetch categories from database - ${e}`,
        });
    }
};

export default withSentry(handler);

