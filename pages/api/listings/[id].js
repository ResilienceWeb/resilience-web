import formidable from 'formidable';
import multer from 'multer';
import multerS3 from 'multer-s3';
import fs from 'fs';
import path from 'path';
import prisma from '../../../prisma/client';
import doSpace from '../../../lib/digitalocean';
import doConfig from '../../../helpers/config';

export default async function (req, res) {
	try {
		switch (req.method) {
			case 'POST': {
				const { id: listingId } = req.query;
				// const { listing: listingData } = req.body;

				// const form = new formidable.IncomingForm();
				// // form.uploadDir = './';
				// form.keepExtensions = true;

				// form.parse(req, async (err, fields, files) => {
				// 	console.log(fields);
				// if (files.image) {
				// 	const image = files.image;
				// 	const params = {
				// 		Bucket: `${doConfig.bucketName}`,
				// 		Body: fs.createReadStream(image.path),
				// 		Key: path.basename(image.path),
				// 		ContentType: image.type,
				// 		ACL: 'public-read',
				// 	};

				// let imageUrl;
				// doSpace
				// 	.upload(params, function (err, data) {
				// 		console.error(err);
				// 	})
				// 	.on('build', (request) => {
				// 		request.httpRequest.headers.Host = `${doConfig.digitalOceanSpaces}`;
				// 		request.httpRequest.headers['Content-Length'] =
				// 			image.size;
				// 		request.httpRequest.headers['Content-Type'] =
				// 			image.type;
				// 		request.httpRequest.headers['x-amz-acl'] =
				// 			'public-read';
				// 	})
				// 	.send((err) => {
				// 		if (err) {
				// 			console.error(err);
				// 		} else {
				// 			imageUrl =
				// 				`${doConfig.digitalOceanSpaces}` +
				// 				image.path.split('/').pop();
				// 			console.log(
				// 				'File uploaded successfully',
				// 				imageUrl,
				// 			);
				// 		}
				// 	});
				// }

				// const listing = await prisma.listing.update({
				// 	where: { id: parseInt(listingId) },
				// 	data: {
				// 		title: fields.title,
				// 		categoryId: parseInt(fields.category),
				// 		website: fields.website,
				// 		description: fields.description,
				// 		email: fields.email,
				// 		facebook: fields.facebook,
				// 		instagram: fields.instagram,
				// 		twitter: fields.twitter,
				// 		notes: fields.notes,
				// 		seekingVolunteers: fields.seekingVolunteers,
				// 		inactive: fields.inactive,
				// 	},
				// });
				// });

				res.status(200);
				res.json({ listing: 'test' });
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

export const config = {
	api: {
		bodyParser: false,
	},
};
