import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import type { File } from 'formidable';
import { getSession } from 'next-auth/react';
import { withSentry } from '@sentry/nextjs';
import prisma from '../../../prisma/client';
import uploadImage from '@helpers/uploadImage';
import { stringToBoolean } from '@helpers/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		const session = await getSession({ req });
		if (!session?.user) {
			res.status(403);
			res.json({
				error: `You don't have enough permissions to access this data.`,
			});
		}

		switch (req.method) {
			case 'POST': {
				// TODO: Update http method to PATCH?
				const { id: listingId } = req.query;

				const form = formidable({
					keepExtensions: true,
				});

				// eslint-disable-next-line @typescript-eslint/no-misused-promises
				form.parse(req, async (_err, fields, files) => {
					const newData: Listing = {
						title: fields.title as string,
						categoryId: parseInt(fields.category as string),
						website: fields.website as string,
						description: fields.description as string,
						email: fields.email as string,
						facebook: fields.facebook as string,
						instagram: fields.instagram as string,
						twitter: fields.twitter as string,
						notes: fields.notes as string,
						seekingVolunteers: stringToBoolean(
							fields.seekingVolunteers as string,
						),
						inactive: stringToBoolean(fields.inactive as string),
						slug: fields.slug as string,
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
						imageUrl = await uploadImage(
							files.image as File,
							oldImageKey as string,
						);
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
					throw new Error('API throw error test');
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
};

export const config = {
	api: {
		bodyParser: false,
	},
};

export default withSentry(handler);
