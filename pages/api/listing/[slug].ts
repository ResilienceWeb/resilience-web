import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		if (req.method !== 'GET') {
			res.status(500);
			res.json({
				error: `Method ${req.method} not supported at this endpoint`,
			});
		}

		const { slug } = req.query;
		const listing = await prisma.listing.findUnique({
			where: { slug },
			include: {
				category: true,
			},
		});

		res.status(200);
		res.json({ listing });
	} catch (e) {
		res.status(500);
		res.json({
			error: `Unable to fetch listing by slug - ${e}`,
		});
	}
}
