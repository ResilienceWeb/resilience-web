import { Box, Heading, Stack, StackDivider } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import LayoutContainer from '@components/admin/layout-container';
import LoadingSpinner from '@components/loading-spinner';
import PermissionsList from '@components/admin/permissions-list';
import { useAllPermissions } from '@hooks/permissions';

export default function Permissions() {
	const { data: session, status: sessionStatus } = useSession();
	const { permissions, isLoading: isLoadingPermissions } =
		useAllPermissions();

	if (sessionStatus === 'loading' || isLoadingPermissions) {
		return (
			<LayoutContainer>
				<LoadingSpinner />
			</LayoutContainer>
		);
	}

	if (!session || !session.user.admin || !permissions) return null;

	return (
		<LayoutContainer>
			<Box
				px={{
					base: '4',
					md: '10',
				}}
				py={4}
				maxWidth="5xl"
				mx="auto"
			>
				<Stack spacing="4" divider={<StackDivider />}>
					<Heading>Permissions</Heading>
					<PermissionsList permissions={permissions} />
				</Stack>
			</Box>
		</LayoutContainer>
	);
}
