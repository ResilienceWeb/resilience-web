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
	removeItem,
}) => {
	return (
		<Box as="section" py={12}>
			<Box overflowX="auto">
				<TableActions
					filterValue={filterValue}
					onFilterChange={onFilterChange}
					openListingCreationDialog={openListingCreationDialog}
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
