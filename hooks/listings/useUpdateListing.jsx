import { useMutation, useQueryClient } from 'react-query';
// import { PutObjectCommand } from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import doConfig from '../../helpers/config';
import s3 from '../../lib/digitalocean';

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

const uploadFile = async (file) => {
	const url = s3.getSignedUrl('putObject', {
		Bucket: doConfig.bucketName,
		Key: 'file-name.ext',
		ContentType: 'text',
		Expires: 60 * 5,
	});

	const response = await fetch(url, {
		method: 'PUT',
		headers: {
			'Content-Type': 'text',
		},
	});

	console.log(response);
};

async function updateListingRequest(listingData) {
	const formData = new FormData();
	Object.keys(listingData).map((key) => {
		if (key === 'image') {
			formData.append(key, listingData[key]);
		} else {
			// All fields except image need to be JSON stringified to maintain the type
			formData.append(key, JSON.stringify(listingData[key]));
		}
	});

	await uploadFile(listingData.image);

	// const response = await fetch(`/api/listings/${listingData.id}`, {
	// 	method: 'POST',
	// 	body: formData,
	// });

	// const data = await response.json();
	// const { listing } = data;
	return { test: 'test' };
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
