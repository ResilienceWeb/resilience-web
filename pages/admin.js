import { signIn, useSession } from 'next-auth/client';
import { memo, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Flex } from '@chakra-ui/react';

import LayoutContainer from '@components/admin/layout-container';
import EditableList from '@components/admin/editable-list';
import LoadingSpinner from '@components/loading-spinner';
import { useListings } from '../hooks/listings';

async function fetchPermissionsRequest() {
	const response = await fetch('/api/permissions');
	const data = await response.json();
	const { editPermissions } = data;
	return editPermissions;
}

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

async function deleteListingRequest({ id }) {
	const response = await fetch(`/api/listings/${id}`, {
		method: 'DELETE',
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

function useDeleteListing() {
	const queryClient = useQueryClient();

	return useMutation(deleteListingRequest, {
		onSuccess: (data) => {
			queryClient.setQueryData(['listings', { id: data.id }], data);
		},
		onMutate: async (deletedListing) => {
			await queryClient.cancelQueries('listings');
			const previousListings = queryClient.getQueryData('listings');
			queryClient.setQueryData('listings', (old) =>
				old.filter((l) => l.id !== deletedListing.id),
			);
			return { previousListings };
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

const Admin = () => {
	const [session, loadingSession] = useSession();
	const {
		listings,
		isLoading: isLoadingListings,
		isError: isListingsError,
	} = useListings();
	const { data: permissions, isLoading: isLoadingPermissions } = useQuery(
		'permissions',
		fetchPermissionsRequest,
	);

	const { mutate: updateListing } = useUpdateListing();
	const { mutate: createListing } = useCreateListing();
	const { mutate: deleteListing } = useDeleteListing();

	useEffect(() => {
		if (!session && !loadingSession) {
			signIn();
		}
	}, [session, loadingSession]);

	const allowedListings = useMemo(() => {
		if (!session || isLoadingPermissions) return null;
		if (session.user.admin) return listings;

		return listings?.filter((listing) => permissions.includes(listing.id));
	}, [listings, permissions, session, isLoadingPermissions]);

	if (loadingSession) {
		return (
			<Flex height="100vh" justifyContent="center" alignItems="center">
				<LoadingSpinner />
			</Flex>
		);
	}

	if (isLoadingListings || isLoadingPermissions) {
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
				deleteListing={deleteListing}
				isAdmin={session.user.admin}
				items={allowedListings}
				updateListing={updateListing}
			/>
		</LayoutContainer>
	);
};

export default memo(Admin);
