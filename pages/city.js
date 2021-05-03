import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';
import { chakra, Box, Slide, ScaleFade } from '@chakra-ui/react';

import Drawer from '@components/drawer';
import SisterGraphLink from '@components/sister-graph-link';
import MobileWarningDialog from '@components/mobile-warning-dialog';
import ModeSwitch from '@components/mode-switch';
import MainList from '@components/main-list';
import Footer from '@components/footer';
import data from '../data/data.js';

const NoSSRNetwork = dynamic(() => import('../components/network'), {
	ssr: false,
});

export default function City() {
	const [selectedId, setSelectedId] = useState();
	const [network, setNetwork] = useState();
	const [isWebMode, setIsWebMode] = useState(false);

	const selectNode = useCallback(
		(id) => {
			if (!network) return;
			network.selectNodes([id]);
			setSelectedId(id);
		},
		[network],
	);

	const handleSwitchChange = useCallback((event) => {
		console.log(event);
		setIsWebMode(event.target.value);
	}, []);

	return (
		<>
			<div>
				<Slide direction="left" in={isWebMode} unmountOnExit>
					{isWebMode && (
						<Drawer items={data.nodes} selectNode={selectNode} />
					)}
				</Slide>
				<ModeSwitch
					checked={isWebMode}
					handleSwitchChange={handleSwitchChange}
				/>
				<ScaleFade initialScale={0.8} in={isWebMode} unmountOnExit>
					{isWebMode && (
						<>
							<SisterGraphLink />
							<Box
								height="100vh"
								ml="18.75rem"
								position="relative"
							>
								<NoSSRNetwork
									data={data}
									selectedId={selectedId}
									setNetwork={setNetwork}
									setSelectedId={setSelectedId}
								/>
								<Footer />
							</Box>
						</>
					)}
				</ScaleFade>

				{!isWebMode && <MainList items={data.nodes} />}
			</div>
		</>
	);
}
