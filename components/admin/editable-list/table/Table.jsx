import { Box, Heading } from '@chakra-ui/react';
import * as React from 'react';
import { TableActions } from './TableActions';
import { TableContent } from './TableContent';
import { TablePagination } from './TablePagination';

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
		<Box as="section" py="12">
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
				{/* <TablePagination /> */}
			</Box>
		</Box>
	);
};

export default Table;
