import { memo, useCallback, useMemo, useState } from 'react';
import Image from 'next/image';
import chroma from 'chroma-js';
import { motion, AnimatePresence } from 'framer-motion';
import {
	chakra,
	Box,
	Flex,
	useBreakpointValue,
	useDisclosure,
	Input,
} from '@chakra-ui/react';
import Select from 'react-select';
import Dialog from './dialog';
import { CATEGORY_MAPPING, COLOR_MAPPING } from '../../data/enums.js';
import Item from './item';
import styles from './MainList.module.scss';

const categories = Object.keys(CATEGORY_MAPPING).map((key) => ({
	value: key,
	label: CATEGORY_MAPPING[key],
	color: COLOR_MAPPING[key],
}));

const customMultiSelectStyles = {
	option: (provided, state) => {
		return {
			...provided,
			color: state.data.color,
		};
	},
	multiValue: (styles, { data }) => {
		const color = chroma(data.color);
		return {
			...styles,
			backgroundColor: color.alpha(0.5).css(),
		};
	},
	multiValueLabel: (styles) => ({
		...styles,
		color: '#000',
	}),
	multiValueRemove: (styles, { data }) => ({
		...styles,
		color: data.color,
		':hover': {
			backgroundColor: data.color,
			color: 'white',
		},
	}),
};

const MainList = ({ items }) => {
	const [selectedCategories, setSelectedCategories] = useState([]);
	const [selectedDataItem, setSelectedDataItem] = useState();
	const {
		isOpen: isDialogOpen,
		onOpen: onOpenDialog,
		onClose: onCloseDialog,
	} = useDisclosure();
	const [searchTerm, setSearchTem] = useState('');

	const handleCategorySelection = useCallback((value) => {
		setSelectedCategories(value);
	}, []);

	const handleSearchTermChange = useCallback((event) => {
		setSearchTem(event.target.value);
	}, []);

	const filteredItems = useMemo(() => {
		let results = items.filter((item) => !item.isDescriptive);

		if (selectedCategories.length > 0) {
			const categories = selectedCategories.map((c) => c.value);
			results = results.filter((item) =>
				categories.includes(item.category),
			);
		}

		if (searchTerm) {
			results = results.filter((item) =>
				item.label.toLowerCase().includes(searchTerm.toLowerCase()),
			);
		}

		return results;
	}, [items, searchTerm, selectedCategories]);

	const handleOpenDialog = useCallback(
		(item) => {
			setSelectedDataItem(item);
			onOpenDialog();
		},
		[onOpenDialog],
	);

	const handleCloseDialog = useCallback(() => {
		setSelectedDataItem(null);
		onCloseDialog();
	}, [onCloseDialog]);

	const isMobile = window.matchMedia(
		'only screen and (max-width: 760px)',
	).matches;

	return (
		<>
			<Flex
				justifyContent="center"
				alignItems="center"
				flexDirection="column"
			>
				{!isMobile && (
					<Box my={4}>
						<Image
							alt="Cambridge Resilience Web logo"
							src="/logo.png"
							width="276"
							height="104"
						/>
					</Box>
				)}
				<chakra.div
					paddingTop={4}
					width={useBreakpointValue({ base: '95%', md: '600px' })}
				>
					<Select
						isMulti
						isSearchable={false}
						onChange={handleCategorySelection}
						options={categories}
						placeholder="Filter by category"
						styles={customMultiSelectStyles}
					/>
					<Input
						className={styles.searchBox}
						placeholder="Search"
						onChange={handleSearchTermChange}
						style={{
							width: '100%',
							marginTop: '1rem',
							backgroundColor: '#ffffff',
						}}
						value={searchTerm}
					/>
				</chakra.div>
				<chakra.span fontSize="14px" marginTop={2}>
					{filteredItems.length} listings
				</chakra.span>
				<chakra.div
					marginTop={4}
					width={useBreakpointValue({ base: '95%', md: '600px' })}
				>
					<AnimatePresence>
						<motion.div layout>
							{filteredItems.map((item) => (
								<Item
									dataItem={item}
									key={item.id}
									onOpenDialog={handleOpenDialog}
								/>
							))}
						</motion.div>
					</AnimatePresence>
				</chakra.div>
			</Flex>
			{selectedDataItem && (
				<Dialog
					isOpen={isDialogOpen}
					item={selectedDataItem}
					onClose={handleCloseDialog}
				/>
			)}
		</>
	);
};

export default memo(MainList);
