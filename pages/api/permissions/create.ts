import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		const { email, listingId } = req.body;

		const editPermission = await prisma.editPermission.create({
			data: {
				email: email,
				listingId: listingId,
				asd: 'new'
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
}
