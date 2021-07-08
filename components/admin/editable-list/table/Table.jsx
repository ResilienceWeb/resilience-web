import { memo } from 'react';
import { Box } from '@chakra-ui/react';
import TableActions from './TableActions';
import TableContent from './TableContent';

const Table = ({
	enterEdit,
	filterValue,
	items,
	onFilterChange,
	openListingCreationDialog,
	openRemoteUpdateConfirmationDialog,
	removeItem,
}) => {
	return (
		<Box as="section" py={12} px={4}>
			<Box overflowX="auto">
				<TableActions
					filterValue={filterValue}
					onFilterChange={onFilterChange}
					openListingCreationDialog={openListingCreationDialog}
					openRemoteUpdateConfirmationDialog={
						openRemoteUpdateConfirmationDialog
					}
				/>
				<TableContent
					enterEdit={enterEdit}
					items={items}
					removeItem={removeItem}
				/>
			</Box>
		</Box>
	);
};

export default memo(Table);
