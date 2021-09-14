import { useMutation, useQueryClient } from 'react-query';

// const putObject = async (file) => {
// 	console.log(file);
// 	const fileAsUInt8Array = new Uint8Array(file);
// 	const Key = `${Date.now()}-placeholder1`;
// 	const command = new PutObjectCommand({
// 		Bucket: doConfig.bucketName,
// 		Key: Key,
// 		Body: fileAsUInt8Array,
// 	});

// 	const signedUrl = await getSignedUrl(s3Client, command, {
// 		expiresIn: 3600,
// 	});
// 	console.log('Signed url', signedUrl);

// 	const response = await fetch(signedUrl);
// 	console.log('Response', response);
// };

// const uploadFile = async (file) => {
// 	const url = s3.getSignedUrl('putObject', {
// 		Bucket: doConfig.bucketName,
// 		Key: `${Date.now()}-${file.name}`,
// 		ContentType: 'image/jpeg',
// 		Expires: 60 * 5,
// 		ACL: 'public-read',
// 	});
// 	console.log('url to fetch', url);

// 	const response = await fetch(url, {
// 		method: 'POST',
// 		headers: {
// 			'Content-Type': 'image/jpeg',
// 		},
// 		body: file,
// 	});

// 	console.log(response);

// const params = {
// 	Bucket: `${doConfig.bucketName}`,
// 	Body: file,
// 	Key: file.name,
// 	ContentType: file.type,
// 	ACL: 'public-read',
// };

// s3.upload(params, function (err, data) {
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
// };

async function updateListingRequest(listingData) {
	const formData = new FormData();
	Object.keys(listingData).map((key) =>
		formData.append(key, listingData[key]),
	);

	const response = await fetch(`/api/listings/${listingData.id}`, {
		method: 'POST',
		body: formData,
	});

	const data = await response.json();
	const { listing } = data;
	return listing;
}

export default function useUpdateListing() {
	const queryClient = useQueryClient();

	return useMutation(updateListingRequest, {
		onSuccess: (data) => {
			queryClient.setQueryData(['listings', { id: data.id }], data);
		},
		onMutate: async (newListing) => {
			await queryClient.cancelQueries(['listings', newListing.id]);
			const previousListing = queryClient.getQueryData([
				'listings',
				newListing.id,
			]);
			queryClient.setQueryData(['listings', newListing.id], newListing);
			return { previousListing, newListing };
		},
		onError: (err, newListing, context) => {
			queryClient.setQueryData(
				['listings', context.newListing.id],
				context.previousListing,
			);
		},
		onSettled: () => {
			queryClient.invalidateQueries('listings');
		},
	});
}
