import { useQuery } from 'react-query';

async function fetchListingsRequest() {
	const response = await fetch('/api/listings');
	const data = await response.json();
	const { listings } = data;
	return listings;
}

export default function useListings() {
	const {
		data: listings,
		isLoading,
		isError,
	} = useQuery('listings', fetchListingsRequest);

	return {
		listings,
		isLoading,
		isError,
	};
}
