/* eslint-disable no-mixed-spaces-and-tabs */
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState, useMemo, memo } from 'react';
import { Box } from '@chakra-ui/react';
import { useDebounce } from 'use-debounce';
import groupBy from 'lodash/groupBy';

import Drawer from '@components/drawer';
import MainList from '@components/main-list';
import Header from '@components/header';
import { REMOTE_URL } from '@helpers/config';
import { useLocalStorage } from '@hooks/application';
import { useCategories } from '@hooks/categories';

const Network = dynamic(() => import('../components/network'), {
	ssr: false,
});

const mobileMatchMedia = 'only screen and (max-width: 760px)';
const City = ({ data }) => {
	const [isMobile, setIsMobile] = useState(
		window.matchMedia(mobileMatchMedia).matches,
	);

	const handleResize = () => {
		setIsMobile(window.matchMedia(mobileMatchMedia).matches);
	};
	useEffect(() => {
		window.addEventListener('resize', handleResize, false);
	}, []);

	const [isWebMode, setIsWebMode] = useLocalStorage('isWebMode', !isMobile);
	const [isVolunteer, setIsVolunteer] = useState(false);

	const [searchTerm, setSearchTerm] = useState('');
	const [searchTermValue] = useDebounce(searchTerm, 500);
	const handleSearchTermChange = useCallback((event) => {
		setSearchTerm(event.target.value);
	}, []);
	const [selectedCategories, setSelectedCategories] = useState([]);
	const [categories, setCategories] = useState({});

	const [selectedId, setSelectedId] = useState();
	const [network, setNetwork] = useState();

	const { categories: fetchedCategories } = useCategories();

	useEffect(() => {
		if (!fetchedCategories) return;

		setCategories(
			fetchedCategories.map((c) => ({
				value: c.label,
				label: c.label,
				color: `#${c.color}`,
			})),
		);
	}, [fetchedCategories]);

	const handleCategorySelection = useCallback((value) => {
		setSelectedCategories(value);
	}, []);

	const filteredItems = useMemo(() => {
		let results = data.nodes.filter((item) => !item.isDescriptive);

		if (isVolunteer) {
			results = results.filter((item) => item.seekingVolunteers);
		}

		if (selectedCategories.length > 0) {
			const categories = selectedCategories.map((c) => c.label);
			results = results.filter((item) =>
				categories.includes(item.category),
			);
		}

		if (searchTermValue) {
			results = results.filter((item) =>
				item.title
					.toLowerCase()
					.includes(searchTermValue.toLowerCase()),
			);
		}

		return results;
	}, [data.nodes, isVolunteer, selectedCategories, searchTermValue]);

	const descriptiveNodes = useMemo(() => {
		return data.nodes.filter((item) => item.isDescriptive);
	}, [data.nodes]);

	const filteredNetworkData = useMemo(() => {
		return {
			edges: data.edges,
			nodes: [...filteredItems, ...descriptiveNodes],
		};
	}, [data.edges, filteredItems, descriptiveNodes]);

	const selectNode = useCallback(
		(id) => {
			if (!network) return;
			network.selectNodes([id]);
			setSelectedId(id);
		},
		[network],
	);

	const handleSwitchChange = useCallback(
		(event) => {
			setSelectedId(null);
			setIsWebMode(!(event.target.value == 'true'));
		},
		[setIsWebMode],
	);

	const handleVolunteerSwitchChange = useCallback(
		(event) => {
			setSelectedId(null);
			setIsVolunteer(!(event.target.value == 'true'));
		},
		[setIsVolunteer],
	);

	return (
		<>
			{isWebMode && (
				<Drawer items={filteredItems} selectNode={selectNode} />
			)}
			<Box
				height="100vh"
				ml={isWebMode ? '18.75rem' : '0'}
				position="relative"
			>
				<Header
					categories={categories}
					handleCategorySelection={handleCategorySelection}
					handleSearchTermChange={handleSearchTermChange}
					handleSwitchChange={handleSwitchChange}
					handleVolunteerSwitchChange={handleVolunteerSwitchChange}
					isMobile={isMobile}
					isWebMode={isWebMode}
					isVolunteer={isVolunteer}
					searchTerm={searchTerm}
				/>
				{isWebMode && (
					<Network
						data={filteredNetworkData}
						selectedId={selectedId}
						setNetwork={setNetwork}
						setSelectedId={setSelectedId}
					/>
				)}

				{!isWebMode && (
					<MainList
						filteredItems={filteredItems}
						isMobile={isMobile}
					/>
				)}
			</Box>
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
