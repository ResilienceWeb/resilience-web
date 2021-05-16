import prisma from '../../../prisma/client';

export default async function (req, res) {
	try {
		const { listing: listingData } = req.body;
		const listing = await prisma.listing.update({
			where: { id: listingData.id },
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
			},
		});
		res.status(200);
		res.json({ listing });
	} catch (e) {
		res.status(500);
		res.json({
			error: `Unable to update listing - ${e}`,
		});
	}
}
