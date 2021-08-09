import { useMutation, useQueryClient } from 'react-query';

async function updateListingRequest(listingData) {
	const response = await fetch(`/api/listings/${listingData.id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			listing: listingData,
		}),
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
