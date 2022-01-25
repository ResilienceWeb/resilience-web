import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '../../../prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		const session = await getSession({ req });

		let email = session?.user.email;
		if (req.query?.email) {
			email = req.query.email;
		}

		const editPermissions = await prisma.editPermission.findMany({
			include: {
				listing: true,
			},
			where: { email: email },
		});

		if (req.query?.email) {
			res.json({ editPermissions });
		} else {
			const editPermissionsArray = editPermissions.map(
				(ep) => ep.listing.id,
			);
			res.json({ editPermissions: editPermissionsArray });
		}
		res.status(200);
	} catch (e) {
		res.status(500);
		res.json({
			error: `Unable to fetch edit permissions from database - ${e}`,
		});
	}
}
