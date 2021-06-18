import { useCallback, useEffect, useState, memo } from 'react';
import {
	Heading,
	Text,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
	Button,
	Stack,
} from '@chakra-ui/react';
import ListingCreationDialog from '@components/admin/listing-creation-dialog';
import Table from './table/Table.jsx';

const EditableList = ({
	createListing,
	deleteListing,
	isAdmin,
	items,
	updateListing,
}) => {
	const [data, setData] = useState(items);
	const [filter, setFilter] = useState('');
	const [itemInEdit, setItemInEdit] = useState();
	const [isListingCreationOpen, setIsListingCreationOpen] = useState(false);
	const [isRemoteUpdateConfirmationOpen, setIsRemoteUpdateConfirmationOpen] =
		useState(false);

	useEffect(() => {
		setData(items);
	}, [items]);

	useEffect(() => {
		const filtered = items.filter((item) =>
			item.title.toLowerCase().includes(filter.toLowerCase()),
		);
		setData(filtered);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filter]);

	const enterEdit = useCallback((dataItem) => {
		setItemInEdit(dataItem);
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
		if (process.env.NODE_ENV === 'development') {
			// eslint-disable-next-line no-console
			console.error(
				'Oops, you tried to update the remote data during development - please only do that with production data',
			);
		} else {
			await fetch('/api/listings/updateRemote');
			closeRemoteUpdateConfirmationDialog();
		}
	}, [closeRemoteUpdateConfirmationDialog]);

	const openRemoteUpdateConfirmationDialog = useCallback(() => {
		setIsRemoteUpdateConfirmationOpen(true);
	}, []);
	const closeRemoteUpdateConfirmationDialog = useCallback(() => {
		setIsRemoteUpdateConfirmationOpen(false);
	}, []);

	const handleRemove = useCallback(
		(id) => {
			deleteListing({ id });
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

	const handleFilterChange = useCallback((event) => {
		setFilter(event.target.value);
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
			<Table
				enterEdit={enterEdit}
				removeItem={handleRemove}
				filterValue={filter}
				items={data}
				onFilterChange={handleFilterChange}
				openListingCreationDialog={openListingCreationDialog}
				openRemoteUpdateConfirmationDialog={
					openRemoteUpdateConfirmationDialog
				}
			/>
			{(isListingCreationOpen || itemInEdit) && (
				<ListingCreationDialog
					itemInEdit={itemInEdit}
					onClose={closeListingCreationDialog}
					onSubmit={handleSubmit}
				/>
			)}
			{isRemoteUpdateConfirmationOpen && (
				<Modal
					isCentered
					onClose={closeRemoteUpdateConfirmationDialog}
					isOpen
					size="md"
				>
					<ModalOverlay />
					<ModalContent>
						<ModalHeader>
							{itemInEdit ? 'Edit listing' : 'Create new listing'}
						</ModalHeader>
						<ModalCloseButton />
						<ModalBody>
							<p
								style={{
									margin: '25px',
									textAlign: 'center',
								}}
							>
								This will update the data used by the website to
								display the listings, so that the changes you
								just made will be reflected in the app. If you
								did not make any changes, you can just close the
								dialog or click Cancel.
							</p>
							<Stack direction="row">
								<Button
									onClick={
										closeRemoteUpdateConfirmationDialog
									}
								>
									Cancel
								</Button>
								<Button onClick={updateRemoteListingData}>
									Yes, do it
								</Button>
							</Stack>
						</ModalBody>
					</ModalContent>
				</Modal>
			)}
		</>
	);
};

export default memo(EditableList);
