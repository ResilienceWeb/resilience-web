import prisma from '../../../prisma/client';

export default async function (req, res) {
	try {
		const { editPermission: editPermissionData } = req.body;
		const editPermission = await prisma.edit_permission.create({
			data: {
				title: editPermissionData.title,
				category: editPermissionData.category,
				website: editPermissionData.website,
				description: editPermissionData.description,
				email: editPermissionData.email,
				facebook: editPermissionData.facebook,
				instagram: editPermissionData.instagram,
				twitter: editPermissionData.twitter,
				notes: editPermissionData.notes,
			},
		});

		res.status(201);
		res.json({ editPermission });
	} catch (e) {
		res.status(500);
		res.json({
			error: `Unable to save edit permission to database - ${e}`,
		});
	}
}
