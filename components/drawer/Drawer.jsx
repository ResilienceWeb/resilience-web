import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import {
	Divider,
	Drawer,
	DrawerBody,
	DrawerFooter,
	DrawerHeader,
	DrawerOverlay,
	DrawerContent,
	DrawerCloseButton,
	Button,
	useDisclosure,
} from '@chakra-ui/react';
import styles from './Drawer.module.scss';

const ConnectionsDrawer = ({ items }) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	// console.log({
	// 	items,
	// });

	const handleClick = useCallback(() => {});

	return (
		<div className={styles.drawer}>
			<h1 className={styles.title}>Web of Connections</h1>
			{items.map((item) => (
				<div key={item.id}>
					<div className={styles.item} onClick={handleClick}>
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
};

export default ConnectionsDrawer;

{
	/* <Button
				className={styles.button}
				colorScheme="blue"
				onClick={onOpen}
				pos="absolute"
				p={5}
				m={2}
			>
				List of groups
			</Button> */
}
{
	/* <Drawer
				className={styles.drawer}
				placement="left"
				isOpen
				trapFocus={false}
				useInert={false}
			>
				<DrawerContent>
					<DrawerHeader borderBottomWidth="1px">
						Web of Connections
					</DrawerHeader>
					<DrawerBody>
						{items.map((item) => (
							<div key={item.id}>
								<div
									className={styles.item}
									onClick={handleClick}
								>
									{item.label}
								</div>
								<Divider />
							</div>
						))}
					</DrawerBody>
				</DrawerContent>
			</Drawer> */
}
