import React from 'react';
import { motion, usePresence } from 'framer-motion';
import { chakra, Flex, Tag, useDisclosure } from '@chakra-ui/react';
import Dialog from '../dialog';

const transition = { type: 'spring', stiffness: 300, damping: 50, mass: 1 };

const Item = ({ dataItem }) => {
	const [isPresent, safeToRemove] = usePresence();
	const { isOpen, onOpen, onClose } = useDisclosure();

	const animations = {
		layout: true,
		initial: false,
		style: {
			position: isPresent ? 'static' : 'absolute',
		},
		animate: isPresent ? 'in' : 'out',
		variants: {
			in: { scaleY: 1, opacity: 1 },
			out: { scaleY: 0, opacity: 0, zIndex: -1 },
		},
		onAnimationComplete: () => !isPresent && safeToRemove(),
		transition,
	};

	return (
		<>
			<motion.div {...animations}>
				<chakra.div
					py={4}
					px={3}
					my={2}
					cursor="pointer"
					border="1px solid #c7c5c5"
					borderRadius="5px"
					backgroundColor="#ffffff"
					transition="transform 300ms ease-in-out, box-shadow 300ms ease-in-out"
					_hover={{ boxShadow: 'md' }}
					onClick={onOpen}
				>
					<Flex justifyContent="space-between">
						<chakra.h2
							fontSize={17}
							fontWeight={700}
							style={{ color: '#454545', marginBottom: 0 }}
						>
							{dataItem.label}
						</chakra.h2>
						<Tag backgroundColor={dataItem.color}>
							{dataItem.category}
						</Tag>
					</Flex>
				</chakra.div>
			</motion.div>
			<Dialog isOpen={isOpen} item={dataItem} onClose={onClose} />
		</>
	);
};

export default Item;
