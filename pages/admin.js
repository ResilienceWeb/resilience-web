import { signIn, useSession } from 'next-auth/client';
import { useEffect } from 'react';
import { useQuery, useMutation } from 'react-query';

import LayoutContainer from '@components/admin/layout-container';
import EditableList from '@components/admin/editable-list';
import LoadingSpinner from '@components/loading-spinner';

async function fetchListingsRequest() {
	const response = await fetch('/api/listings');
	const data = await response.json();
	const { listings } = data;
	return listings;
}

async function updateListingRequest(listingData) {
	const response = await fetch('/api/listings/edit', {
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

function useUpdateListing() {
	return useMutation(updateListingRequest);
}

export default function Admin() {
	const [session, loadingSession] = useSession();
	const { data: listings, isLoading } = useQuery(
		'listings',
		fetchListingsRequest,
	);
	const { mutate: updateListing } = useUpdateListing();

	useEffect(() => {
		if (!session && !loadingSession) {
			signIn();
		}
	}, [session, loadingSession]);

	if (loadingSession || isLoading) {
		return (
			<LayoutContainer>
				<LoadingSpinner />
			</LayoutContainer>
		);
	}

	if (!session) return null;

	return (
		<LayoutContainer>
			<EditableList items={listings} updateListing={updateListing} />
		</LayoutContainer>
	);
}
