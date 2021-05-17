import prisma from '../../../prisma/client';

export default async function (req, res) {
	try {
		const listings = await prisma.listing.findMany({
			orderBy: [
				{
					id: 'asc',
				},
			],
		});
		res.status(200);
		res.json({ listings });
	} catch (e) {
		res.status(500);
		res.json({
			error: `Unable to fetch listings from database - ${e}`,
		});
	}
}
