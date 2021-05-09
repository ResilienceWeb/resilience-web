import prisma from '../../../prisma/client';

export default async function (req, res) {
	try {
		const { organization: organizationData } = req.body;
		const organization = await prisma.organization.create({
			data: {
				title: organizationData.title,
				category: organizationData.category,
				website: organizationData.website,
				description: organizationData.description,
				email: organizationData.email,
				facebook: organizationData.facebook,
				instagram: organizationData.instagram,
				twitter: organizationData.twitter,
				notes: organizationData.notes,
			},
		});

		res.status(201);
		res.json({ organization });
	} catch (e) {
		res.status(500);
		res.json({
			error: `Unable to save organization to database - ${e}`,
		});
	}
}
