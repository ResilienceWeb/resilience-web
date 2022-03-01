import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { withSentry } from '@sentry/nextjs';
import prisma from '../../../prisma/client';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		const session = await getSession({ req });
		if (!session?.user.admin) {
			res.status(403);
			res.json({
				error: `You don't have enough permissions to access this data.`,
			});
		}

		const editPermissions = await prisma.editPermission.findMany({
			include: {
				listing: true,
			},
		});
		res.status(200);
		res.json({ editPermissions });
	} catch (e) {
		res.status(500);
		res.json({
			error: `Unable to fetch edit permissions from database - ${e}`,
		});
	}
};

export default withSentry(handler);
