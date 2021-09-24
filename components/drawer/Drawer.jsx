import { useCallback, useMemo, memo } from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';
import { Flex, Link } from '@chakra-ui/react';
import { sortStringsFunc } from '@helpers/utils';
import styles from './Drawer.module.scss';
import LogoImage from '../../public/logo.png';

const Drawer = ({ items, selectNode }) => {
	const sortedItems = useMemo(
		() => items.filter((i) => !i.isDescriptive).sort(sortStringsFunc),
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
					{/* <Divider /> */}
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
