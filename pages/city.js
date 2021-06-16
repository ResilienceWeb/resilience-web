/* eslint-disable no-mixed-spaces-and-tabs */
import dynamic from 'next/dynamic';
import { useCallback, useState, useMemo } from 'react';
import { Box, Slide, ScaleFade } from '@chakra-ui/react';
import { GraphQLClient } from 'graphql-request';
import { useDebounce } from 'use-debounce';

import Layout from '@components/layout';
import Drawer from '@components/drawer';
import ModeSwitch from '@components/mode-switch';
import MainList from '@components/main-list';
import Footer from '@components/footer';

const NoSSRNetwork = dynamic(() => import('../components/network'), {
	ssr: false,
});

const filterFunction = (item, searchTerm) => {
	if (item.label.toLowerCase().includes(searchTerm.toLowerCase())) {
		return true;
	}

	if (item.isDescriptive) {
		return true;
	}

	return false;
};

const City = ({ data }) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [searchTermValue] = useDebounce(searchTerm, 500);
	const handleSearchTermChange = useCallback((event) => {
		setSearchTerm(event.target.value);
	}, []);

	const [selectedId, setSelectedId] = useState();
	const [network, setNetwork] = useState();

	const isMobile = window.matchMedia(
		'only screen and (max-width: 760px)',
	).matches;
	const [isWebMode, setIsWebMode] = useState(!isMobile);

	const filteredItems = useMemo(() => {
		return searchTermValue
			? data.nodes.filter((i) =>
					i.label
						.toLowerCase()
						.includes(searchTermValue.toLowerCase()),
			  )
			: data.nodes;
	}, [searchTermValue, data.nodes]);

	const filteredNetworkData = useMemo(() => {
		return {
			edges: data.edges,
			nodes: searchTermValue
				? data.nodes.filter((i) => filterFunction(i, searchTermValue))
				: data.nodes,
		};
	}, [data.edges, data.nodes, searchTermValue]);

	const selectNode = useCallback(
		(id) => {
			if (!network) return;
			network.selectNodes([id]);
			setSelectedId(id);
		},
		[network],
	);

	const handleSwitchChange = useCallback((event) => {
		setIsWebMode(!(event.target.value == 'true'));
	}, []);

	return (
		<>
			<Slide direction="left" in={isWebMode} unmountOnExit>
				{isWebMode && (
					<Drawer
						handleSearchTermChange={handleSearchTermChange}
						items={filteredItems}
						searchTerm={searchTerm}
						selectNode={selectNode}
					/>
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
								data={filteredNetworkData}
								selectedId={selectedId}
								setNetwork={setNetwork}
								setSelectedId={setSelectedId}
							/>
							<Footer />
						</Box>
					</>
				)}
			</ScaleFade>

			{!isWebMode && (
				<Layout>
					<MainList items={data.nodes} />
				</Layout>
			)}
		</>
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
