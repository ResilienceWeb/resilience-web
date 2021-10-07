import { memo, useCallback, useState } from 'react';
import { motion, AnimatePresence, AnimateSharedLayout } from 'framer-motion';
import {
	chakra,
	Flex,
	Grid,
	GridItem,
	useBreakpointValue,
	useDisclosure,
} from '@chakra-ui/react';
import Dialog from './dialog';
import Item from './item';
import Footer from '@components/footer';

const MainList = ({ filteredItems, isMobile }) => {
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
				alignItems="center"
				flexDirection="column"
				minHeight="calc(100vh - 112px)"
				py={8}
			>
				<chakra.span fontSize="14px" marginTop={2}>
					{filteredItems.length} listings
				</chakra.span>
				<chakra.div
					marginTop={4}
					width={useBreakpointValue({
						base: '95%',
						md: '85%',
						lg: '70%',
					})}
				>
					<AnimateSharedLayout>
						<AnimatePresence>
							<motion.div layout>
								<Grid
									templateColumns={{
										base: '1fr',
										md: 'repeat(3, 1fr)',
									}}
									gap={6}
								>
									{filteredItems.map((item) => (
										<GridItem key={item.id}>
											<Item
												dataItem={item}
												onOpenDialog={handleOpenDialog}
											/>
										</GridItem>
									))}
								</Grid>
							</motion.div>
						</AnimatePresence>
					</AnimateSharedLayout>
				</chakra.div>
			</Flex>
			<Footer />
			{selectedDataItem && (
				<Dialog
					isOpen={isDialogOpen}
					isMobile={isMobile}
					item={selectedDataItem}
					onClose={handleCloseDialog}
				/>
			)}
		</>
	);
};

export default memo(MainList);
