import prisma from '../../../prisma/client';

export default async function (req, res) {
	try {
		const organizations = await prisma.organization.findMany();
		res.status(200);
		res.json({ organizations });
	} catch (e) {
		res.status(500);
		res.json({
			error: `Unable to fetch organizations from database - ${e}`,
		});
	}
}
