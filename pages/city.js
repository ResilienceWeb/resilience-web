/* eslint-disable no-mixed-spaces-and-tabs */
import dynamic from 'next/dynamic';
import { useCallback, useState, useMemo, memo } from 'react';
import {
	Box,
	Fade,
	InputGroup,
	InputLeftElement,
	Flex,
	Input,
} from '@chakra-ui/react';
import { useDebounce } from 'use-debounce';
import groupBy from 'lodash/groupBy';
import { FiSearch } from 'react-icons/fi';

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

	return !!item.isDescriptive;
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
						<Drawer items={filteredItems} selectNode={selectNode} />
						<Box height="100vh" ml="18.75rem" position="relative">
							<Box transition=".3s ease">
								<Flex
									as="header"
									align="center"
									justify="space-between"
									w="full"
									px="4"
									bg={'white'}
									borderBottomWidth="1px"
									borderColor={'inherit'}
									h="14"
								>
									<InputGroup
										w="96"
										display={{ base: 'none', md: 'flex' }}
									>
										<InputLeftElement color="gray.500">
											<FiSearch />
										</InputLeftElement>
										<Input
											onChange={handleSearchTermChange}
											placeholder="Search"
											value={searchTerm}
										/>
									</InputGroup>
								</Flex>
							</Box>
							<Network
								data={filteredNetworkData}
								selectedId={selectedId}
								setNetwork={setNetwork}
								setSelectedId={setSelectedId}
							/>
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

	listings?.map(
		({
			id,
			title,
			category,
			description,
			image,
			website,
			facebook,
			twitter,
			instagram,
			email,
			seekingVolunteers,
			inactive,
		}) => {
			transformedData.nodes.push({
				id,
				label: title,
				title,
				category: category.label,
				description,
				image: image ?? '',
				website,
				facebook,
				twitter,
				instagram,
				email,
				seekingVolunteers,
				inactive,
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
