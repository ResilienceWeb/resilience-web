import { useCallback, useEffect, useState } from 'react';
import { Button, Heading, Text } from '@chakra-ui/react';
import {
	TreeList,
	TreeListToolbar,
	mapTree,
	extendDataItem,
} from '@progress/kendo-react-treelist';
import CommandCell from './command-cell';
import ListingCreationDialog from '@components/admin/listing-creation-dialog';

const editField = 'inEdit';

const EditableList = ({
	createListing,
	deleteListing,
	isAdmin,
	items,
	updateListing,
}) => {
	const [data, setData] = useState(items);
	const [itemInEdit, setItemInEdit] = useState();
	const [isListingCreationOpen, setIsListingCreationOpen] = useState(false);

	useEffect(() => {
		setData(items);
	}, [items]);

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

	const handleRemove = useCallback(
		(data) => {
			deleteListing({ id: data.id });
		},
		[deleteListing],
	);

	const handleSubmit = useCallback(
		(data) => {
			console.log(data);
			if (data.id) {
				updateListing(data);
			} else {
				createListing(data);
			}
			closeListingCreationDialog();
		},
		[closeListingCreationDialog, createListing, updateListing],
	);

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
				style={{ overflow: 'auto', marginBottom: '2rem' }}
				data={mapTree(data, null, (item) => extendDataItem(item, null))}
				editField={editField}
				columns={[
					{
						field: 'title',
						title: 'Title',
						width: 280,
					},
					{
						field: 'category',
						title: 'Category',
						width: 160,
					},
					{
						field: 'website',
						title: 'Website',
						width: 210,
					},
					{
						field: 'email',
						title: 'Email',
						width: 100,
					},
					{
						field: 'description',
						title: 'Description',
						width: 400,
					},
					{
						field: 'facebook',
						title: 'Facebook',
						width: 100,
					},
					{
						field: 'instagram',
						title: 'Instagram',
						width: 100,
					},
					{
						field: 'twitter',
						title: 'Twitter',
						width: 100,
					},
					{
						cell: CommandCell({
							enterEdit: enterEdit,
							remove: handleRemove,
							editField,
						}),
						width: 150,
					},
				]}
				toolbar={
					isAdmin && (
						<TreeListToolbar>
							<Button
								bg="#57b894"
								colorScheme="#57b894"
								onClick={openListingCreationDialog}
								size="sm"
								_hover={{ bg: '#4a9e7f' }}
							>
								Add new
							</Button>
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

export default EditableList;
