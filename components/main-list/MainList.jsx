import { memo, useCallback, useState } from 'react';
import { motion, AnimatePresence, AnimateSharedLayout } from 'framer-motion';
import {
	chakra,
	Flex,
	useBreakpointValue,
	useDisclosure,
} from '@chakra-ui/react';
import Dialog from './dialog';
import Item from './item';

const MainList = ({ filteredItems }) => {
	const [selectedDataItem, setSelectedDataItem] = useState();
	const {
		isOpen: isDialogOpen,
		onOpen: onOpenDialog,
		onClose: onCloseDialog,
	} = useDisclosure();

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
				mt={8}
			>
				<chakra.span fontSize="14px" marginTop={2}>
					{filteredItems.length} listings
				</chakra.span>
				<chakra.div
					marginTop={4}
					width={useBreakpointValue({ base: '95%', md: '600px' })}
				>
					<AnimateSharedLayout>
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
					</AnimateSharedLayout>
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
