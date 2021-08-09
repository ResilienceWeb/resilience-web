import { useMutation, useQueryClient } from 'react-query';

async function createListingRequest(listingData) {
	const response = await fetch('/api/listings/create', {
		method: 'POST',
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

export default function useCreateListing() {
	const queryClient = useQueryClient();

	return useMutation(createListingRequest, {
		onMutate: async (newListing) => {
			await queryClient.cancelQueries('listings');
			const previousListings = queryClient.getQueryData('listings');
			queryClient.setQueryData('listings', (old) => [...old, newListing]);
			return { previousListings };
		},
		onError: (err, newListing, context) => {
			queryClient.setQueryData('listings', context.previousListings);
		},
		onSettled: () => {
			queryClient.invalidateQueries('listings');
		},
	});
}
