import dynamic from 'next/dynamic';
import { useCallback } from 'react';
import Drawer from '../components/drawer';
import data from '../data/data.js';
const NoSSRNetwork = dynamic(() => import('../components/network'), {
	ssr: false,
});

export default function Home() {
	return (
		<div>
			<Drawer items={data.nodes} />
			<NoSSRNetwork data={data} />
		</div>
	);
}
