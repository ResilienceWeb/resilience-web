import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import prisma from '../../../prisma/client';
import uploadImage from '@helpers/uploadImage';
import { stringToBoolean } from '@helpers/utils';

const generateSlug = (title) => title.toLowerCase().replace(/ /g, '-');

type ResponseData = {
	error?: string;
	listing?: Listing; // TODO: change to 'data'
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
	try {
		const form = new formidable.IncomingForm();
		form.keepExtensions = true;

		if (req.method !== 'POST') {
			res.status(500);
			res.json({
				error: `Method ${req.method} not supported at this endpoint`,
			});
		}

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
				seekingVolunteers: stringToBoolean(fields.seekingVolunteers),
				inactive: stringToBoolean(fields.inactive),
				slug: generateSlug(fields.title),
			};

			let imageUrl = null;
			if (files.image) {
				imageUrl = await uploadImage(files.image);
			}
			if (imageUrl) {
				newData.image = imageUrl;
			}

			const listing = await prisma.listing.create({
				data: newData,
			});

			res.status(201);
			res.json({ listing });
		});
	} catch (e) {
		res.status(500);
		res.json({
			error: `Unable to save listing to database - ${e}`,
		});
	}
}

export const config = {
	api: {
		bodyParser: false,
	},
};
