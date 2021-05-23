import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';
import { Box, Slide, ScaleFade } from '@chakra-ui/react';
import { GraphQLClient } from 'graphql-request';

import Layout from '@components/layout';
import Drawer from '@components/drawer';
import ModeSwitch from '@components/mode-switch';
import MainList from '@components/main-list';
import Footer from '@components/footer';

const NoSSRNetwork = dynamic(() => import('../components/network'), {
	ssr: false,
});

const City = ({ data }) => {
	const [selectedId, setSelectedId] = useState();
	const [network, setNetwork] = useState();
	const isMobile = window.matchMedia('only screen and (max-width: 760px)')
		.matches;
	const [isWebMode, setIsWebMode] = useState(!isMobile);

	const selectNode = useCallback(
		(id) => {
			if (!network) return;
			network.selectNodes([id]);
			setSelectedId(id);
		},
		[network],
	);

	const handleSwitchChange = useCallback((event) => {
		setIsWebMode(event.target.value);
	}, []);

	return (
		<div>
			<Slide direction="left" in={isWebMode} unmountOnExit>
				{isWebMode && (
					<Drawer items={data.nodes} selectNode={selectNode} />
				)}
			</Slide>
			{!isMobile && (
				<ModeSwitch
					checked={isWebMode}
					handleSwitchChange={handleSwitchChange}
				/>
			)}
			<ScaleFade initialScale={0.8} in={isWebMode} unmountOnExit>
				{isWebMode && (
					<>
						<Box height="100vh" ml="18.75rem" position="relative">
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

			<Layout>{!isWebMode && <MainList items={data.nodes} />}</Layout>
		</div>
	);
};

export async function getStaticProps() {
	const graphcms = new GraphQLClient(process.env.GRAPHCMS_URL);

	const response = await graphcms.request(`
	{
		listingGroup(where: {identifier: "cambridge-city"}) {
			data
		}
	}
	`);

	return {
		props: {
			data: response.listingGroup.data,
		},
		revalidate: 60,
	};
}

export default City;
