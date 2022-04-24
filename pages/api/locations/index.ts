import type { NextApiRequest, NextApiResponse } from 'next';
import { withSentry } from '@sentry/nextjs';
import prisma from '../../../prisma/client';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const locations = await prisma.location.findMany();
        res.status(200);
        res.json({ locations });
    } catch (e) {
        res.status(500);
        res.json({
            error: `Unable to fetch locations from database - ${e}`,
        });
    }
};

export default withSentry(handler);

