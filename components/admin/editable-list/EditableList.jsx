import { useCallback, useEffect, useState, memo } from 'react';
import { Button, Heading, Text, Flex } from '@chakra-ui/react';
import {
	TreeList,
	TreeListToolbar,
	orderBy,
	extendDataItem,
} from '@progress/kendo-react-treelist';
import CommandCell from './command-cell';
import ListingCreationDialog from '@components/admin/listing-creation-dialog';
import styles from './EditableList.module.scss';

const editField = 'inEdit';

const EditableList = ({
	createListing,
	deleteListing,
	isAdmin,
	items,
	updateListing,
}) => {
	const [data, setData] = useState(items);
	const [sort, setSort] = useState([{ field: 'title', dir: 'asc' }]);
	const [itemInEdit, setItemInEdit] = useState();
	const [isListingCreationOpen, setIsListingCreationOpen] = useState(false);

	useEffect(() => {
		setData(items);
	}, [items]);

	useEffect(() => {
		setData(orderBy(data, sort));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sort]);

	const enterEdit = useCallback((dataItem) => {
		setItemInEdit(extendDataItem(dataItem));
	}, []);

	const openListingCreationDialog = useCallback(() => {
		setItemInEdit(null);
		setIsListingCreationOpen(true);
	}, [setItemInEdit]);

	const closeListingCreationDialog = useCallback(() => {
		setIsListingCreationOpen(false);
		setItemInEdit(null);
	}, []);

	const updateRemoteListingData = useCallback(async () => {
		await fetch('/api/listings/updateRemote');
	}, []);

	const handleRemove = useCallback(
		(data) => {
			deleteListing({ id: data.id });
		},
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

	const handleSortChange = useCallback((event) => {
		setSort(event.sort);
	}, []);

	if (!data) return null;

	return (
		<>
			<Heading>Listings</Heading>
			{isAdmin ? (
				<Text mb={4} color="gray.600">
					You are an admin, so you can edit all the listings. With
					great power comes great responsibility.
				</Text>
			) : (
				<Text mb={4} color="gray.600">
					The list below only includes groups that you have edit
					access to. If you think you should be able to edit a group
					not included below, please get in touch at
					cambridgeresilienceweb@gmail.com
				</Text>
			)}
			<TreeList
				className={styles.treelist}
				style={{
					overflow: 'auto',
					marginBottom: '2rem',
					width: '100%',
				}}
				data={data}
				editField={editField}
				sort={sort}
				sortable={{ allowUnsort: false, mode: 'single' }}
				onSortChange={handleSortChange}
				columns={[
					{
						field: 'title',
						title: 'Title',
						width: '10%',
					},
					{
						field: 'category',
						title: 'Category',
						width: '10%',
					},
					{
						field: 'website',
						title: 'Website',
						width: '10%',
						sortable: false,
					},
					{
						field: 'email',
						title: 'Email',
						width: '10%',
						sortable: false,
					},
					{
						field: 'description',
						title: 'Description',
						width: '20%',
						sortable: false,
					},
					{
						field: 'facebook',
						title: 'Facebook',
						width: '10%',
						sortable: false,
					},
					{
						field: 'instagram',
						title: 'Instagram',
						width: '10%',
						sortable: false,
					},
					{
						field: 'twitter',
						title: 'Twitter',
						width: '10%',
						sortable: false,
					},
					{
						cell: CommandCell({
							enterEdit: enterEdit,
							remove: handleRemove,
							editField,
						}),
						width: '10%',
					},
				]}
				toolbar={
					isAdmin && (
						<TreeListToolbar>
							<Flex justifyContent="space-between" width="100%">
								<Button
									bg="#57b894"
									colorScheme="#57b894"
									onClick={openListingCreationDialog}
									size="sm"
									_hover={{ bg: '#4a9e7f' }}
								>
									Add new
								</Button>
								<Button
									onClick={updateRemoteListingData}
									size="sm"
									title="Update the data used by the website for the listings"
								>
									Update data for listings
								</Button>
							</Flex>
						</TreeListToolbar>
					)
				}
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
