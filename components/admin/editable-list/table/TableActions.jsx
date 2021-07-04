import {
	Button,
	ButtonGroup,
	FormControl,
	FormLabel,
	HStack,
	Input,
	InputGroup,
	InputLeftElement,
	Stack,
} from '@chakra-ui/react';
import { memo } from 'react';
import { BsSearch } from 'react-icons/bs';
import { RiAddFill } from 'react-icons/ri';

const TableActions = ({
	filterValue,
	onFilterChange,
	openListingCreationDialog,
	openRemoteUpdateConfirmationDialog,
}) => {
	return (
		<Stack
			spacing="4"
			direction={{
				base: 'column',
				md: 'row',
			}}
			justify="space-between"
		>
			<HStack>
				<FormControl id="search">
					<InputGroup size="sm">
						<FormLabel srOnly>Filter by title</FormLabel>
						<InputLeftElement pointerEvents="none" color="gray.400">
							<BsSearch />
						</InputLeftElement>
						<Input
							// className={styles.searchBox}
							placeholder="Filter by title…"
							onChange={onFilterChange}
							style={{
								backgroundColor: '#ffffff',
							}}
							rounded="base"
							value={filterValue}
						/>
					</InputGroup>
				</FormControl>

				{/* TODO: Add filtering by categories (multiselect?) */}
				{/* <Select
					w={{
						base: '300px',
						md: 'unset',
					}}
					rounded="base"
					size="sm"
					placeholder="All roles"
				>
					<option>All roles</option>
					<option>UI Designers</option>
					<option>Marketing Directors</option>
				</Select> */}
			</HStack>
			<ButtonGroup size="sm" variant="outline">
				<Button
					colorScheme="green"
					iconSpacing="1"
					leftIcon={<RiAddFill fontSize="1.25em" />}
					onClick={openListingCreationDialog}
					variant="solid"
				>
					New listing
				</Button>
				<Button
					onClick={openRemoteUpdateConfirmationDialog}
					size="sm"
					title="Update the data used by the website for the listings"
				>
					Update data for listings
				</Button>
			</ButtonGroup>
		</Stack>
	);
};

export default memo(TableActions);
