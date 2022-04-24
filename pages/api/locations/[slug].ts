import type { NextApiRequest, NextApiResponse } from 'next';
import { withSentry } from '@sentry/nextjs';
import prisma from '../../../prisma/client';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { slug } = req.query;
        const location = await prisma.location.findFirst({
            where: {
                slug,
            },
        });
        res.status(200);
        res.json({ location });
    } catch (e) {
        res.status(500);
        res.json({
            error: `Unable to fetch location from database - ${e}`,
        });
    }
};

export default withSentry(handler);

