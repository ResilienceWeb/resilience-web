import prisma from '../../../prisma/client';

export default async function (req, res) {
	try {
		const { listing: listingData } = req.body;
		const listing = await prisma.listing.create({
			data: {
				title: listingData.title,
				category: listingData.category,
				website: listingData.website,
				description: listingData.description,
				email: listingData.email,
				facebook: listingData.facebook,
				instagram: listingData.instagram,
				twitter: listingData.twitter,
				notes: listingData.notes,
				seekingVolunteers: listingData.seekingVolunteers,
				inactive: listingData.inactive,
			},
		});

		res.status(201);
		res.json({ listing });
	} catch (e) {
		res.status(500);
		res.json({
			error: `Unable to save listing to database - ${e}`,
		});
	}
}
