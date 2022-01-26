import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import prisma from '../../../prisma/client';
import uploadImage from '@helpers/uploadImage';
import { stringToBoolean } from '@helpers/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		switch (req.method) {
			case 'POST': { // TODO: Update http method to PATCH?
				const { id: listingId } = req.query;

				const form = new formidable.IncomingForm();
				form.keepExtensions = true;

				await form.parse(req, async (err, fields, files) => {
					const newData: Listing = {
						title: fields.title,
						categoryId: parseInt(fields.category),
						website: fields.website,
						description: fields.description,
						email: fields.email,
						facebook: fields.facebook,
						instagram: fields.instagram,
						twitter: fields.twitter,
						notes: fields.notes,
						seekingVolunteers: stringToBoolean(
							fields.seekingVolunteers,
						),
						inactive: stringToBoolean(fields.inactive),
						slug: fields.slug,
					};

					let imageUrl = null;
					if (files.image) {
						const { image: oldImageKey } =
							await prisma.listing.findUnique({
								where: { id: parseInt(listingId as string) },
								select: {
									image: true,
								},
							});
						imageUrl = await uploadImage(files.image, oldImageKey);
					}
					if (imageUrl) {
						newData.image = imageUrl;
					}

					const listing = await prisma.listing.update({
						where: { id: parseInt(listingId as string) },
						data: newData,
					});

					res.status(200);
					res.json({ listing });
				});

				break;
			}
			case 'DELETE': {
				const { id: listingId } = req.query;
				const listing = await prisma.listing.delete({
					where: { id: parseInt(listingId as string) },
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

export const config = {
	api: {
		bodyParser: false,
	},
};
