import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';
import Drawer from '../components/drawer';
import data from '../data/data.js';
const NoSSRNetwork = dynamic(() => import('../components/network'), {
	ssr: false,
});

export default function Home() {
	const [selectedId, setSelectedId] = useState();
	const [network, setNetwork] = useState();

	const selectNode = useCallback(
		(id) => {
			if (!network) return;
			network.selectNodes([id]);
			setSelectedId(id);
		},
		[network],
	);

	return (
		<div>
			<Drawer items={data.nodes} selectNode={selectNode} />
			<NoSSRNetwork
				data={data}
				selectedId={selectedId}
				setNetwork={setNetwork}
				setSelectedId={setSelectedId}
			/>
		</div>
	);
}
