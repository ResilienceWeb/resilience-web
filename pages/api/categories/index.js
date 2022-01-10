import prisma from '../../../prisma/client';

export default async function handler(req, res) {
	try {
		const categories = await prisma.category.findMany({
			orderBy: [
				{
					id: 'asc',
				},
			],
		});
		res.status(200);
		res.json({ categories });
	} catch (e) {
		res.status(500);
		res.json({
			error: `Unable to fetch categories from database - ${e}`,
		});
	}
}
