import fs from 'fs';
import path from 'path';
import doSpace from '../lib/digitalocean';
import doConfig from './config';

const uploadImage = (image, oldImageKey) => {
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

						if (oldImageKey) {
							// Delete previous image
							const deleteParams = {
								Bucket: `${doConfig.bucketName}`,
								Key: path.basename(oldImageKey),
							};
							doSpace.deleteObject(
								deleteParams,
								function (err, data) {
									console.log(err, data);
								},
							);
						}
					}
				});
		} else {
			resolve(null);
		}
	});
};

export default uploadImage;
