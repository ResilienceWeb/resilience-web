import { useQuery } from 'react-query';
import { useSession } from 'next-auth/react';

async function fetchPermissionsRequest() {
	const response = await fetch('/api/permissions');
	const data = await response.json();
	const { editPermissions } = data;
	return editPermissions;
}

export default function usePermissions() {
	const { data: session } = useSession();

	const {
		data: permissions,
		isLoading,
		isError,
	} = useQuery('permissions', fetchPermissionsRequest, {
		enabled: Boolean(session),
	});

	return {
		permissions,
		isLoading,
		isError,
	};
}
