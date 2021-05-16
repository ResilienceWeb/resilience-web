import prisma from '../../../prisma/client';

export default async function (req, res) {
	try {
		const { listing: listingData } = req.body;
		const listing = await prisma.listing.delete({
			where: { id: listingData.id },
		});
		res.status(200);
		res.json({ listing });
	} catch (e) {
		res.status(500);
		res.json({
			error: `Unable to delete listing - ${e}`,
		});
	}
}
