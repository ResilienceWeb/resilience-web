import React, { useCallback, useMemo, useState } from 'react';
import Image from 'next/image';
import { chakra, Box, Flex, useBreakpointValue } from '@chakra-ui/react';
import { MultiSelect } from '@progress/kendo-react-dropdowns';
import { CATEGORY_MAPPING } from '../../data/enums.js';
import Item from './item';

const MainList = ({ items }) => {
	const [selectedCategories, setSelectedCategories] = useState([]);
	const categories = Object.keys(CATEGORY_MAPPING).map((key) => key);

	const handleCategorySelection = useCallback((event) => {
		setSelectedCategories(event.target.value);
	}, []);

	const filteredItems = useMemo(
		() =>
			items.filter((item) =>
				!item.isDescriptive && selectedCategories.length > 0
					? selectedCategories.includes(item.category)
					: true,
			),
		[items, selectedCategories],
	);

	return (
		<Flex
			justifyContent="center"
			alignItems="center"
			flexDirection="column"
		>
			<Box my={4}>
				<Image
					alt="Cambridge Resilience Web logo"
					src="/logo.png"
					width="276"
					height="104"
				/>
			</Box>
			<chakra.div
				width={useBreakpointValue({ base: '95%', md: '600px' })}
			>
				<MultiSelect
					data={categories}
					label="Filter by category"
					onChange={handleCategorySelection}
					value={selectedCategories}
					style={{ width: '100%' }}
				/>
			</chakra.div>
			{filteredItems.length} results
			<chakra.div
				width={useBreakpointValue({ base: '95%', md: '600px' })}
			>
				{filteredItems.map((item) => (
					<Item dataItem={item} key={item.id} />
				))}
			</chakra.div>
		</Flex>
	);
};

export default MainList;
