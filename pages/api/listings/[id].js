import prisma from '../../../prisma/client';

export default async function (req, res) {
	try {
		switch (req.method) {
			case 'PUT': {
				const { id: listingId } = req.query;
				const { listing: listingData } = req.body;
				const listing = await prisma.listing.update({
					where: { id: parseInt(listingId) },
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
				break;
			}
			case 'DELETE': {
				const { id: listingId } = req.query;
				const listing = await prisma.listing.delete({
					where: { id: parseInt(listingId) },
				});
				res.status(200);
				res.json({ listing });
				break;
			}
			default: {
				res.status(500);
				res.json({
					error: `Method ${req.method} not supported at this endpoint`,
				});
				break;
			}
		}
	} catch (e) {
		res.status(500);
		res.json({
			error: `Unable to update/delete listing - ${e}`,
		});
	}
}
