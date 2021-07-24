import { getSession } from 'next-auth/client';
import prisma from '../../../prisma/client';

export default async function (req, res) {
	try {
		const session = await getSession({ req });

		let email = session?.user.email;
		if (req.query?.email) {
			email = req.query.email;
		}

		const editPermissions = await prisma.editPermission.findMany({
			where: { email: email },
			select: {
				listingId: true,
				createdAt: true,
			},
		});

		if (req.query?.email) {
			res.json({ editPermissions });
		} else {
			const editPermissionsArray = editPermissions.map(
				(ep) => ep.listingId,
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
