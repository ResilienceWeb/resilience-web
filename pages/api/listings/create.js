import formidable from 'formidable';
import prisma from '../../../prisma/client';
import uploadImage from '@helpers/uploadImage';

const generateSlug = (title) => title.toLowerCase().replace(/ /g, '-');

export default async function (req, res) {
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
			const newData = {
				title: fields.title,
				categoryId: parseInt(fields.category),
				website: fields.website,
				description: fields.description,
				email: fields.email,
				facebook: fields.facebook,
				instagram: fields.instagram,
				twitter: fields.twitter,
				notes: fields.notes,
				seekingVolunteers: fields.seekingVolunteers.toBoolean(),
				inactive: fields.inactive.toBoolean(),
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
