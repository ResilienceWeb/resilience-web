import { signIn, useSession } from 'next-auth/client';
import { useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';

import LayoutContainer from '@components/admin/layout-container';
import EditableList from '@components/admin/editable-list';
import LoadingSpinner from '@components/loading-spinner';

async function fetchPermissionsRequest() {
	const response = await fetch('/api/permissions');
	const data = await response.json();
	const { editPermissions } = data;
	return editPermissions;
}

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

function useCreateListing() {
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

export default function Admin() {
	const [session, loadingSession] = useSession();
	const {
		data: listings,
		isLoading: isLoadingListings,
		isError: isListingsError,
	} = useQuery('listings', fetchListingsRequest);
	const { data: permissions, isLoading: isLoadingPermissions } = useQuery(
		'permissions',
		fetchPermissionsRequest,
	);

	const { mutate: updateListing } = useUpdateListing();
	const { mutate: createListing } = useCreateListing();

	useEffect(() => {
		if (!session && !loadingSession) {
			signIn();
		}
	}, [session, loadingSession]);

	const allowedListings = useMemo(() => {
		if (!session) return null;
		if (session.user.admin) return listings;

		return listings.filter((listing) => permissions.includes(listing.id));
	}, [listings, permissions, session]);

	if (loadingSession || isLoadingListings || isLoadingPermissions) {
		return (
			<LayoutContainer>
				<LoadingSpinner />
			</LayoutContainer>
		);
	}

	if (isListingsError) {
		// eslint-disable-next-line no-console
		console.error('Error fetching listings');
	}

	if (!session) return null;

	return (
		<LayoutContainer>
			<EditableList
				createListing={createListing}
				isAdmin={session.user.admin}
				items={allowedListings}
				updateListing={updateListing}
			/>
		</LayoutContainer>
	);
}
