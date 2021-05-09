import { signIn, signOut, useSession } from 'next-auth/client';
import { useEffect, useState } from 'react';
import { Button } from '@chakra-ui/react';
import { useQuery, useMutation } from 'react-query';

import LayoutContainer from '@components/admin/layout-container';
import EditableList from '@components/admin/editable-list';

async function fetchOrganizationsRequest() {
	const response = await fetch('/api/organizations');
	const data = await response.json();
	const { organizations } = data;
	return organizations;
}

async function updateOrganizationRequest(organizationData) {
	const response = await fetch('/api/organizations/edit', {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			organization: organizationData,
		}),
	});

	const data = await response.json();
	const { organization } = data;
	return organization;
}

function useUpdateOrganization() {
	return useMutation(updateOrganizationRequest);
}

export default function Admin() {
	const [session, loading] = useSession();
	const { data: organizations, isLoading } = useQuery(
		'organizations',
		fetchOrganizationsRequest,
	);
	const { mutate: updateOrganization } = useUpdateOrganization();

	useEffect(() => {
		if (!session && !loading) {
			signIn();
		}
	}, [session, loading]);

	return (
		<LayoutContainer>
			<EditableList
				items={organizations}
				updateOrganization={updateOrganization}
			/>
		</LayoutContainer>
	);
}
