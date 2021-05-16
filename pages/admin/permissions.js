import { useEffect, useCallback } from 'react';
import { Box, Heading, Flex } from '@chakra-ui/react';
import { signIn, useSession } from 'next-auth/client';
import { useQuery, useMutation } from 'react-query';
import LayoutContainer from '@components/admin/layout-container';
import PermissionsList from '@components/admin/permissions-list';
import LoadingSpinner from '@components/loading-spinner';

async function fetchEditPermissionsRequest() {
	const response = await fetch('/api/permissions/all');
	const data = await response.json();
	const { editPermissions } = data;
	return editPermissions;
}

export default function Permissions() {
	const [session, loadingSession] = useSession();
	const {
		data: permissions,
		isLoading,
		refetch: refetchEditPermissions,
	} = useQuery('listings', fetchEditPermissionsRequest);

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

	// TODO: also check if user has permissions to edit anything or is admin
	if (!session) return null;

	return (
		<LayoutContainer>
			<Heading>Permissions</Heading>
			<PermissionsList permissions={permissions} />
		</LayoutContainer>
	);
}
