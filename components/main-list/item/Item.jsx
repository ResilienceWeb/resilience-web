import { useCallback, useMemo } from 'react';
import { motion, usePresence } from 'framer-motion';
import { chakra, Flex, Tag, Text, Icon, Tooltip } from '@chakra-ui/react';
import { HiUserGroup } from 'react-icons/hi';
import chroma from 'chroma-js';

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

	const tagBackgroundColor = useMemo(
		() => chroma(dataItem.color).alpha(0.5).css(),
		[dataItem.color],
	);

	return (
		<>
			<motion.div {...animations}>
				<chakra.div
					py={4}
					px={3}
					my={4}
					cursor="pointer"
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
						<Tag backgroundColor={tagBackgroundColor}>
							{dataItem.category}
						</Tag>
					</Flex>
					{dataItem.seekingVolunteers && (
						<Flex>
							<Tooltip label="This group is seeking volunteers or members. Get in touch with them if you'd like to help.">
								<Text color="seagreen">
									Seeking volunteers <Icon as={HiUserGroup} />
								</Text>
							</Tooltip>
						</Flex>
					)}
				</chakra.div>
			</motion.div>
		</>
	);
};

export default Item;
