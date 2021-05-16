import { getSession } from 'next-auth/client';
import prisma from '../../../prisma/client';

export default async function (req, res) {
	try {
		const session = await getSession({ req });
		const userId = session.user.id;

		const editPermissions = await prisma.editPermission.findMany({
			where: { userId: userId },
			select: {
				listingId: true,
			},
		});
		const editPermissionsArray = editPermissions.map((ep) => ep.listingId);
		res.status(200);
		res.json({ editPermissions: editPermissionsArray });
	} catch (e) {
		res.status(500);
		res.json({
			error: `Unable to fetch edit permissions from database - ${e}`,
		});
	}
}
