import { signIn, useSession } from 'next-auth/client';
import { memo, useEffect, useMemo } from 'react';
import { Flex } from '@chakra-ui/react';
import { useRouter } from 'next/router';

import LayoutContainer from '@components/admin/layout-container';
import EditableList from '@components/admin/editable-list';
import LoadingSpinner from '@components/loading-spinner';
import {
	useListings,
	useCreateListing,
	useUpdateListing,
	useDeleteListing,
} from '@hooks/listings';
import { usePermissions } from '@hooks/permissions';

const Admin = () => {
	const { query } = useRouter();
	const [session, loadingSession] = useSession();
	const {
		listings,
		isLoading: isLoadingListings,
		isError: isListingsError,
	} = useListings();
	const { permissions, isLoading: isLoadingPermissions } = usePermissions();

	const { mutate: updateListing } = useUpdateListing();
	const { mutate: createListing } = useCreateListing();
	const { mutate: deleteListing } = useDeleteListing();

	useEffect(() => {
		if (!session && !loadingSession) {
			if (query.activate) {
				signIn('email', { email: query.activate });
			} else {
				signIn();
			}
		}
	}, [session, loadingSession, query.activate]);

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
