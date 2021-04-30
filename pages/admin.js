import { signIn, signOut, useSession } from 'next-auth/client';
import { useEffect } from 'react';

export default function Admin() {
	const [session, loading] = useSession();

	useEffect(() => {
		if (!session && !loading) {
			signIn();
		}
	}, [session, loading]);

	return (
		<>
			<div>Admin page</div>
			{session && <button onClick={() => signOut()}>Sign out</button>}
		</>
	);
}
