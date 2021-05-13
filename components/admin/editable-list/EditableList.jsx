import { useCallback, useEffect, useState } from 'react';
import {
	TreeList,
	TreeListToolbar,
	mapTree,
	extendDataItem,
	TreeListTextEditor,
	TreeListNumericEditor,
	TreeListDateEditor,
	TreeListBooleanEditor,
} from '@progress/kendo-react-treelist';
import CommandCell from './command-cell';
import ListingCreationDialog from '@components/admin/listing-creation-dialog';

const editField = 'inEdit';

const EditableList = ({ items, createListing, updateListing }) => {
	const [data, setData] = useState(items);
	const [inEdit, setInEdit] = useState([]);
	const [isListingCreationOpen, setIsListingCreationOpen] = useState(false);

	useEffect(() => {
		setData(items);
	}, [items]);

	const enterEdit = useCallback((dataItem) => {
		setInEdit((inEdit) => [...inEdit, extendDataItem(dataItem)]);
	}, []);

	const cancelEdit = useCallback((dataItem) => {
		setInEdit((inEdit) => inEdit.filter((i) => i.id !== dataItem.id));
	}, []);

	const handleItemChange = useCallback((event) => {
		setData((data) => {
			return mapTree(data, null, (item) =>
				item.id === event.dataItem.id
					? extendDataItem(item, null, { [event.field]: event.value })
					: item,
			);
		});
	}, []);

	const openListingCreationDialog = useCallback(() => {
		setIsListingCreationOpen(true);
	}, []);

	const closeListingCreationDialog = useCallback(() => {
		setIsListingCreationOpen(false);
	}, []);

	const handleSave = useCallback(
		(data) => {
			updateListing(data);
			cancelEdit(data);
		},
		[cancelEdit, updateListing],
	);

	const handleAddListing = useCallback(
		(data) => {
			createListing(data);
			closeListingCreationDialog();
		},
		[createListing, closeListingCreationDialog],
	);

	if (!data) return null;

	return (
		<>
			<TreeList
				style={{ overflow: 'auto' }}
				data={mapTree(data, null, (item) =>
					extendDataItem(item, null, {
						[editField]: Boolean(
							inEdit.find((i) => i.id === item.id),
						),
					}),
				)}
				editField={editField}
				onItemChange={handleItemChange}
				columns={[
					{
						field: 'title',
						title: 'Title',
						width: 280,
						editCell: TreeListTextEditor,
					},
					{
						field: 'category',
						title: 'Category',
						width: 160,
						editCell: TreeListTextEditor,
					},
					{
						field: 'website',
						title: 'Website',
						width: 210,
						editCell: TreeListTextEditor,
					},
					{
						field: 'email',
						title: 'Email',
						width: 100,
						editCell: TreeListTextEditor,
					},
					{
						field: 'description',
						title: 'Description',
						width: 400,
						editCell: TreeListTextEditor,
					},
					{
						field: 'facebook',
						title: 'Facebook',
						width: 100,
						editCell: TreeListTextEditor,
					},
					{
						field: 'instagram',
						title: 'Instagram',
						width: 100,
						editCell: TreeListTextEditor,
					},
					{
						field: 'twitter',
						title: 'Twitter',
						width: 100,
						editCell: TreeListTextEditor,
					},
					{
						cell: CommandCell({
							cancel: cancelEdit,
							enterEdit: enterEdit,
							save: handleSave,
							editField,
						}),
						width: 150,
					},
				]}
				toolbar={
					<TreeListToolbar>
						<div onClick={cancelEdit}>
							<button
								title="Add new"
								className="k-button k-primary"
								onClick={openListingCreationDialog}
							>
								Add new
							</button>
						</div>
					</TreeListToolbar>
				}
			/>
			{isListingCreationOpen && (
				<ListingCreationDialog
					onClose={closeListingCreationDialog}
					onSubmit={handleAddListing}
				/>
			)}
		</>
	);
};

export default EditableList;
