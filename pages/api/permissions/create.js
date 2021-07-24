import prisma from '../../../prisma/client';

export default async function (req, res) {
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
}
