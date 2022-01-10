import prisma from '../../../prisma/client';

export default async function handler(req, res) {
	try {
		const listings = await prisma.listing.findMany({
			include: {
				category: true,
			},
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
