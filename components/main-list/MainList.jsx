import { memo, useCallback, useMemo, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
	chakra,
	Box,
	Flex,
	useBreakpointValue,
	useDisclosure,
} from '@chakra-ui/react';
import { MultiSelect } from '@progress/kendo-react-dropdowns';
import { Input } from '@progress/kendo-react-inputs';
import Dialog from './dialog';
import CATEGORY_MAPPING from '../../data/enums.js';
import Item from './item';
import styles from './MainList.module.scss';

const MainList = ({ items }) => {
	const [selectedCategories, setSelectedCategories] = useState([]);
	const [selectedDataItem, setSelectedDataItem] = useState();
	const {
		isOpen: isDialogOpen,
		onOpen: onOpenDialog,
		onClose: onCloseDialog,
	} = useDisclosure();
	const [searchTerm, setSearchTem] = useState('');
	const categories = Object.keys(CATEGORY_MAPPING).map((key) => key);

	const handleCategorySelection = useCallback((event) => {
		setSelectedCategories(event.target.value);
	}, []);

	const handleSearchTermChange = useCallback((event) => {
		setSearchTem(event.target.value);
	}, []);

	const filteredItems = useMemo(() => {
		let results = items.filter((item) => !item.isDescriptive);

		if (selectedCategories.length > 0) {
			results = results.filter((item) =>
				selectedCategories.includes(item.category),
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

	return (
		<>
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
					paddingTop={4}
					width={useBreakpointValue({ base: '95%', md: '600px' })}
				>
					<MultiSelect
						className={styles.categoryMultiSelect}
						data={categories}
						placeholder="Filter by category"
						onChange={handleCategorySelection}
						value={selectedCategories}
						style={{ width: '100%' }}
					/>
					<Input
						className={styles.searchBox}
						placeholder="Search"
						onChange={handleSearchTermChange}
						style={{ width: '100%', marginTop: '1rem' }}
						value={searchTerm}
					/>
				</chakra.div>
				<chakra.span fontSize="14px" marginTop={2}>
					{filteredItems.length} results
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
