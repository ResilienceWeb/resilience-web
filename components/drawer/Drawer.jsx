import { useCallback, useMemo, memo } from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';
import { Box, Divider, Flex, Input, Link } from '@chakra-ui/react';
import styles from './Drawer.module.scss';
import LogoImage from '../../public/logo.png';

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

const Drawer = ({ handleSearchTermChange, items, searchTerm, selectNode }) => {
	const sortedItems = useMemo(
		() => items.filter((i) => !i.isDescriptive).sort(compareFunc),
		[items],
	);

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
						src={LogoImage}
						width="276"
						height="104"
					/>
				</Flex>
			</Link>
			<Box mx={2} mb={4}>
				<Input
					id="search"
					onChange={handleSearchTermChange}
					placeholder="Search"
					value={searchTerm}
				/>
			</Box>
			{sortedItems.map((item, index) => (
				<div key={item.id}>
					<div
						className={styles.item}
						onClick={() => handleClick(item.id)}
						onKeyUp={() => handleClick(item.id)}
						role="button"
						tabIndex={index}
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
