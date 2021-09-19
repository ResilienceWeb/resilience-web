import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import prisma from '../../../prisma/client';
import doSpace from '../../../lib/digitalocean';
import doConfig from '@helpers/config';

String.prototype.toBoolean = function () {
	if (this === 'true') return true;

	if (this === 'false') return false;

	throw 'Invalid input. This function only takes "true" or "false" and converts them to primitive boolean.';
};

export default async function (req, res) {
	try {
		switch (req.method) {
			case 'POST': {
				const { id: listingId } = req.query;

				const form = new formidable.IncomingForm();
				form.keepExtensions = true;

				await form.parse(req, async (err, fields, files) => {
					const imageUrl = await uploadImage(files.image);

					const listing = await prisma.listing.update({
						where: { id: parseInt(listingId) },
						data: {
							title: fields.title,
							categoryId: parseInt(fields.category),
							website: fields.website,
							description: fields.description,
							email: fields.email,
							facebook: fields.facebook,
							instagram: fields.instagram,
							twitter: fields.twitter,
							notes: fields.notes,
							seekingVolunteers:
								fields.seekingVolunteers.toBoolean(),
							inactive: fields.inactive.toBoolean(),
							image: imageUrl,
						},
					});

					res.status(200);
					res.json({ listing });
				});

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

const uploadImage = (image) => {
	return new Promise((resolve, reject) => {
		if (image) {
			const params = {
				Bucket: `${doConfig.bucketName}`,
				Body: fs.createReadStream(image.path),
				Key: path.basename(image.path),
				ContentType: image.type,
				ACL: 'public-read',
			};

			let imageUrl;
			doSpace
				.upload(params, function (err, data) {
					if (err) {
						console.error(err);
						reject(err);
					}
				})
				.on('build', (request) => {
					request.httpRequest.headers.Host = `${doConfig.digitalOceanSpaces}`;
					request.httpRequest.headers['Content-Length'] = image.size;
					request.httpRequest.headers['Content-Type'] = image.type;
					request.httpRequest.headers['x-amz-acl'] = 'public-read';
				})
				.send((err) => {
					if (err) {
						console.error(err);
						reject(err);
					} else {
						imageUrl =
							`${doConfig.digitalOceanSpaces}` +
							image.path.split('/').pop();
						console.log('File uploaded successfully', imageUrl);
						resolve(imageUrl);
					}
				});
		} else {
			resolve(null);
		}
	});
};

export const config = {
	api: {
		bodyParser: false,
	},
};
