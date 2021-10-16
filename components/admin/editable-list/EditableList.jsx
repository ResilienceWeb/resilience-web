import { useRouter } from 'next/router';
import { useCallback, useEffect, useState, memo } from 'react';
import { Heading, Text, Box, Stack } from '@chakra-ui/react';
import ListingCreationDialog from '@components/admin/listing-creation-dialog';
import Table from './table/Table.jsx';
import TableActions from './table/TableActions';

const EditableList = ({
	createListing,
	deleteListing,
	isAdmin,
	items,
	updateListing,
}) => {
	const router = useRouter();
	const [data, setData] = useState(items);
	const [filter, setFilter] = useState('');
	const [itemInEdit, setItemInEdit] = useState();
	const [isListingCreationOpen, setIsListingCreationOpen] = useState(false);

	useEffect(() => {
		const filtered = items.filter((item) =>
			item.title?.toLowerCase().includes(filter.toLowerCase()),
		);
		setData(filtered);
	}, [filter, items]);

	const enterEdit = useCallback(
		(dataItem) => {
			router.push(`/admin/${dataItem.slug}`);
		},
		[router],
	);

	const openListingCreationDialog = useCallback(() => {
		setItemInEdit(null);
		setIsListingCreationOpen(true);
	}, [setItemInEdit]);

	const closeListingCreationDialog = useCallback(() => {
		setIsListingCreationOpen(false);
		setItemInEdit(null);
	}, []);

	const handleRemove = useCallback(
		(id) => deleteListing({ id }),
		[deleteListing],
	);

	const handleSubmit = useCallback(
		(data) => {
			if (data.id) {
				updateListing(data);
			} else {
				createListing(data);
			}
			closeListingCreationDialog();
		},
		[closeListingCreationDialog, createListing, updateListing],
	);

	const handleFilterChange = useCallback((event) => {
		setFilter(event.target.value);
	}, []);

	if (!data) return null;

	return (
		<>
			<Stack
				spacing="5"
				direction={{
					base: 'column',
					md: 'row',
				}}
				justify="space-between"
				align={{
					base: 'flex-start',
					md: 'center',
				}}
			>
				<Box px={4}>
					<Heading>Listings</Heading>
					{isAdmin ? (
						<Text color={'gray.600'} fontSize="sm">
							There are {data.length} listings
						</Text>
					) : (
						<Text color={'gray.600'} fontSize="sm">
							The list below only includes groups that you have
							edit access to. If you think you should be able to
							edit a group not included below, please get in touch
							at cambridgeresilienceweb@gmail.com
						</Text>
					)}
				</Box>
				<TableActions
					filterValue={filter}
					onFilterChange={handleFilterChange}
					openListingCreationDialog={openListingCreationDialog}
				/>
			</Stack>
			<Table
				enterEdit={enterEdit}
				removeItem={handleRemove}
				items={data}
			/>
			{(isListingCreationOpen || itemInEdit) && (
				<ListingCreationDialog
					itemInEdit={itemInEdit}
					onClose={closeListingCreationDialog}
					onSubmit={handleSubmit}
				/>
			)}
		</>
	);
};

export default memo(EditableList);
