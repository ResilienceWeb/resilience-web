import type { NextApiRequest, NextApiResponse } from 'next';
import { withSentry } from '@sentry/nextjs';
import prisma from '../../../prisma/client';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { email, listingId } = req.body;

        const editPermission = await prisma.editPermission.create({
            data: {
                email: email,
                listingId: listingId,
            },
        });

        res.status(201);
        res.json({ editPermission });
    } catch (e) {
        res.status(500);
        res.json({
            error: `Unable to create edit permission - ${e}`,
        });
    }
};

export default withSentry(handler);

