import { memo } from 'react';
import NextLink from 'next/link';
import Select from 'react-select';
import chroma from 'chroma-js';
import Image from 'next/image';
import {
	Box,
	InputGroup,
	InputLeftElement,
	Flex,
	Input,
	Button,
	VStack,
	HStack,
	Link,
	chakra,
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import { AiFillHome } from 'react-icons/ai';
import ModeSwitch from '@components/mode-switch';
import VolunteerSwitch from '@components/volunteer-switch';

const customMultiSelectStyles = {
	container: () => ({
		width: '100%',
	}),
	control: (provided) => {
		return {
			...provided,
			borderColor: '#E2E8F0',
		};
	},
	placeholder: (provided) => {
		return {
			...provided,
			// color: '' // TODO: find correct colour
		};
	},
	option: (provided, state) => {
		return {
			...provided,
			color: state.data.color,
		};
	},
	multiValue: (styles, { data }) => {
		const color = chroma(data.color);
		return {
			...styles,
			backgroundColor: color.alpha(0.5).css(),
		};
	},
	multiValueLabel: (styles) => ({
		...styles,
		color: '#000',
	}),
	multiValueRemove: (styles, { data }) => ({
		...styles,
		color: data.color,
		':hover': {
			backgroundColor: data.color,
			color: 'white',
		},
	}),
};

const Header = ({
	categories,
	handleCategorySelection,
	handleSearchTermChange,
	handleSwitchChange,
	handleVolunteerSwitchChange,
	isMobile,
	isWebMode,
	isVolunteer,
	searchTerm,
}) => {
	const content = (
		<>
			<InputGroup
				maxW={isWebMode ? '250px' : isMobile ? '100%' : '300px'}
			>
				<InputLeftElement color="gray.500">
					<FiSearch />
				</InputLeftElement>
				<Input
					onChange={handleSearchTermChange}
					placeholder="Search"
					value={searchTerm}
					style={{
						backgroundColor: '#ffffff',
						width: '100%',
					}}
				/>
			</InputGroup>
			<InputGroup maxW="250px">
				<Select
					isMulti
					isSearchable={false}
					onChange={handleCategorySelection}
					options={categories}
					placeholder="Filter by category"
					styles={customMultiSelectStyles}
				/>
			</InputGroup>
			<VolunteerSwitch
				checked={isVolunteer}
				handleSwitchChange={handleVolunteerSwitchChange}
			/>
		</>
	);

	if (isMobile) {
		return (
			<>
				<Link as={NextLink} href="/">
					<Button
						leftIcon={<AiFillHome />}
						colorScheme="blue"
						variant="solid"
						size="sm"
						mt={2}
						ml={2}
					>
						Homepage
					</Button>
				</Link>
				<Flex
					justifyContent="center"
					alignItems="center"
					flexDirection="column"
				>
					<Box my={4}>
						<Image
							alt="Cambridge Resilience Web logo"
							src="/logo.png"
							width="276"
							height="104"
						/>
					</Box>
					<chakra.div paddingTop={4} width={'95%'}>
						<VStack spacing={2}>{content}</VStack>
					</chakra.div>
				</Flex>
			</>
		);
	}

	return (
		<Box transition=".3s ease">
			<Flex
				as="header"
				align="center"
				w="full"
				px="4"
				bg={'white'}
				borderBottomWidth="1px"
				borderColor={'inherit'}
				h="14"
			>
				<HStack spacing={2} width="100%">
					{content}
				</HStack>
				<ModeSwitch
					checked={isWebMode}
					handleSwitchChange={handleSwitchChange}
				/>
				<Link as={NextLink} href="/">
					<Button
						leftIcon={<AiFillHome />}
						colorScheme="blue"
						size="sm"
						px={8}
					>
						Homepage
					</Button>
				</Link>
			</Flex>
		</Box>
	);
};

export default memo(Header);
