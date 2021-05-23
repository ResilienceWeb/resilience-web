/* eslint-disable no-mixed-spaces-and-tabs */
import { useCallback, useMemo, useState, memo } from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';
import { Box, Divider, Flex, Input, Link } from '@chakra-ui/react';
import styles from './Drawer.module.scss';

const compareFunc = (a, b) => {
	const labelA = a.label?.toLowerCase();
	const labelB = b.label?.toLowerCase();

	if (labelA < labelB) {
		return -1;
	}
	if (labelA > labelB) {
		return 1;
	}

	return 0;
};

const Drawer = ({ items, selectNode }) => {
	const [searchTerm, setSearchTerm] = useState('');
	const handleSearchTermChange = useCallback((event) => {
		setSearchTerm(event.target.value);
	}, []);

	const sortedItems = useMemo(
		() => items.filter((i) => !i.isDescriptive).sort(compareFunc),
		[items],
	);

	const filteredItems = useMemo(() => {
		return searchTerm
			? sortedItems.filter((i) =>
					i.label.toLowerCase().includes(searchTerm.toLowerCase()),
			  )
			: sortedItems;
	}, [searchTerm, sortedItems]);

	const handleClick = useCallback(
		(id) => {
			selectNode(id);
		},
		[selectNode],
	);

	return (
		<div className={styles.drawer}>
			<Link href="/">
				<Flex justifyContent="center" my={2}>
					<Image
						alt="Cambridge Resilience Web logo"
						src="/logo.png"
						width="276"
						height="104"
					/>
				</Flex>
				{/* <h1 className={styles.title}>Cambridge Resilience Web</h1> */}
			</Link>
			<Box mx={2} mb={4}>
				<Input
					id="search"
					onChange={handleSearchTermChange}
					placeholder="Search"
					value={searchTerm}
				/>
			</Box>
			{filteredItems.map((item) => (
				<div key={item.id}>
					<div
						className={styles.item}
						onClick={() => handleClick(item.id)}
					>
						{item.label}
					</div>
					<Divider />
				</div>
			))}
		</div>
	);
};

Drawer.propTypes = {
	items: PropTypes.array.isRequired,
	selectNode: PropTypes.func.isRequired,
};

export default memo(Drawer);
