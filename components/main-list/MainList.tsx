import { memo, useCallback, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
	chakra,
	Flex,
	Grid,
	useBreakpointValue,
	useDisclosure,
} from '@chakra-ui/react';

import Footer from '@components/footer';
import Dialog from './dialog';
import Item from './item';

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
				py={10}
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
					<Grid
						templateColumns={{
							base: '1fr',
							md: 'repeat(3, 1fr)',
						}}
						gap={6}
					>
						<AnimatePresence>
							{filteredItems.map((item) => (
								<Item
									dataItem={item}
									onOpenDialog={handleOpenDialog}
									key={item.id}
								/>
							))}
						</AnimatePresence>
					</Grid>
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

