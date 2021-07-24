import { useQuery } from 'react-query';

async function fetchPermissionsRequest(key, email) {
	const response = await fetch(`/api/permissions?email=${email}`);
	const data = await response.json();
	const { editPermissions } = data;
	return editPermissions;
}

export default function useLastPermissionForUser({ email }) {
	const {
		data: permissions,
		isLoading,
		isError,
	} = useQuery(['permissions', email], fetchPermissionsRequest);

	const permission = permissions.reduce((a, b) => a.createdAt >= b.createdAt);

	return {
		permission,
		isLoading,
		isError,
	};
}
