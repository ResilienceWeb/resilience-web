import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Divider } from '@chakra-ui/react';
import styles from './Drawer.module.scss';

const ConnectionsDrawer = ({ items, selectNode }) => {
	// console.log({
	// 	items,
	// });

	const handleClick = useCallback(
		(id) => {
			selectNode(id);
		},
		[selectNode],
	);

	return (
		<div className={styles.drawer}>
			<h1 className={styles.title}>Web of Connections</h1>
			{items.map((item) => (
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

ConnectionsDrawer.propTypes = {
	items: PropTypes.array.isRequired,
	selectNode: PropTypes.func.isRequired,
};

export default ConnectionsDrawer;
