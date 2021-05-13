import { useCallback } from 'react';
import { motion, usePresence } from 'framer-motion';
import { chakra, Flex, Tag } from '@chakra-ui/react';

const transition = { type: 'spring', stiffness: 300, damping: 50, mass: 1 };

const Item = ({ dataItem, onOpenDialog }) => {
	const [isPresent, safeToRemove] = usePresence();

	const animations = {
		layout: true,
		initial: false,
		style: {
			position: isPresent ? 'static' : 'absolute',
		},
		animate: isPresent ? 'in' : 'out',
		variants: {
			in: { scaleY: 1, opacity: 1 },
			out: { scaleY: 0, opacity: 1, zIndex: -1 },
		},
		onAnimationComplete: () => !isPresent && safeToRemove(),
		transition,
	};

	const openDialog = useCallback(() => {
		onOpenDialog(dataItem);
	}, [dataItem, onOpenDialog]);

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
					onClick={openDialog}
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
		</>
	);
};

export default Item;
