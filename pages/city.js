/* eslint-disable no-mixed-spaces-and-tabs */
import dynamic from 'next/dynamic';
import { useCallback, useState, useMemo, memo } from 'react';
import { Box, Fade } from '@chakra-ui/react';
import { useDebounce } from 'use-debounce';
import groupBy from 'lodash/groupBy';

import Layout from '@components/layout';
import Drawer from '@components/drawer';
import ModeSwitch from '@components/mode-switch';
import MainList from '@components/main-list';
import Footer from '@components/footer';
import { REMOTE_URL } from '@helpers/config';

const Network = dynamic(() => import('../components/network'), {
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

	const isMobile = useMemo(
		() => window.matchMedia('only screen and (max-width: 760px)').matches,
		[],
	);
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
		setSelectedId(null);
		setIsWebMode(!(event.target.value == 'true'));
	}, []);

	return (
		<>
			{!isMobile && (
				<ModeSwitch
					checked={isWebMode}
					handleSwitchChange={handleSwitchChange}
				/>
			)}
			<Fade in={isWebMode} unmountOnExit>
				{isWebMode && (
					<>
						<Drawer
							handleSearchTermChange={handleSearchTermChange}
							items={filteredItems}
							searchTerm={searchTerm}
							selectNode={selectNode}
						/>
						<Box height="100vh" ml="18.75rem" position="relative">
							<Network
								data={filteredNetworkData}
								selectedId={selectedId}
								setNetwork={setNetwork}
								setSelectedId={setSelectedId}
							/>
							<Footer />
						</Box>
					</>
				)}
			</Fade>

			{!isWebMode && (
				<Layout>
					<MainList items={data.nodes} />
				</Layout>
			)}
		</>
	);
};

const startsWithCapitalLetter = (word) =>
	word.charCodeAt(0) >= 65 && word.charCodeAt(0) <= 90;

export async function getStaticProps() {
	const listingsInDb = await fetch(`${REMOTE_URL}/api/listings`);

	const data = await listingsInDb.json();
	const { listings } = data;

	const transformedData = {
		nodes: [],
		edges: [],
	};

	listings.map(
		({
			id,
			title,
			category,
			description,
			website,
			facebook,
			twitter,
			instagram,
			email,
			seekingVolunteers,
		}) => {
			transformedData.nodes.push({
				id,
				label: title,
				title,
				category: category.label,
				description,
				website,
				facebook,
				twitter,
				instagram,
				email,
				seekingVolunteers,
				color: `#${category.color}`,
			});
		},
	);

	let groupedByCategory = groupBy(transformedData.nodes, 'category');

	groupedByCategory = Object.fromEntries(
		Object.entries(groupedByCategory).filter(([key]) => {
			return (
				key.length > 0 &&
				key !== 'undefined' &&
				startsWithCapitalLetter(key)
			);
		}),
	);

	// Main node
	transformedData.nodes.push({
		id: 999,
		label: 'Cambridge Resilience Web',
		color: '#fcba03',
		isDescriptive: true,
		font: {
			size: 46,
		},
	});

	let categoryIndex = 1;
	for (const category in groupedByCategory) {
		const categoryId = categoryIndex * 1000;
		transformedData.nodes.push({
			id: categoryId,
			label: category,
			color: '#c3c4c7',
			isDescriptive: true,
		});
		categoryIndex++;

		// From main node to category node
		transformedData.edges.push({
			from: 999,
			to: categoryId,
			length: 2000,
		});

		// From category node to all subitems
		groupedByCategory[category].map((item) => {
			transformedData.edges.push({
				from: categoryId,
				to: item.id,
			});
		});
	}

	return {
		props: {
			data: transformedData,
		},
		revalidate: 60,
	};
}

export default memo(City);
