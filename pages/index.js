import dynamic from 'next/dynamic';
import { useCallback, useRef, useState } from 'react';
import { useDimensions } from '../hooks/useDimensions';
import Drawer from '../components/drawer';
import ContactInfo from '../components/contact-info';
import SisterGraphLink from '../components/sister-graph-link';
import MobileWarningDialog from '../components/mobile-warning-dialog';
import data from '../data/data.js';

const NoSSRNetwork = dynamic(() => import('../components/network'), {
	ssr: false,
});

export default function Home() {
	const containerRef = useRef(null);
	const [selectedId, setSelectedId] = useState();
	const [network, setNetwork] = useState();
	const { width } = useDimensions(containerRef);

	const selectNode = useCallback(
		(id) => {
			if (!network) return;
			network.selectNodes([id]);
			setSelectedId(id);
		},
		[network],
	);

	if (width < 768) {
		return <MobileWarningDialog />;
	}

	return (
		<div ref={containerRef}>
			<Drawer items={data.nodes} selectNode={selectNode} />
			<ContactInfo />
			<SisterGraphLink />
			<NoSSRNetwork
				data={data}
				selectedId={selectedId}
				setNetwork={setNetwork}
				setSelectedId={setSelectedId}
			/>
		</div>
	);
}
