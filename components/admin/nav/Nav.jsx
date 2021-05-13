import Image from 'next/image';
import NextLink from 'next/link';
import { useSession, signOut } from 'next-auth/client';
import {
	Box,
	Flex,
	HStack,
	Link,
	IconButton,
	Button,
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	useDisclosure,
	useColorModeValue,
	Text,
	Stack,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, SettingsIcon } from '@chakra-ui/icons';
import { useCallback } from 'react';

const Links = [
	{
		label: 'Listings',
		href: '/admin',
	},
	{ label: 'Permissions', href: '/admin/permissions' },
];

const NavLink = ({ children, href }) => (
	<Link
		as={NextLink}
		px={2}
		py={1}
		rounded={'md'}
		_hover={{
			textDecoration: 'none',
			bg: useColorModeValue('gray.200', 'gray.700'),
		}}
		href={href}
	>
		{children}
	</Link>
);

const Nav = () => {
	const [session] = useSession();
	const { isOpen, onOpen, onClose } = useDisclosure();

	const handleSignOut = useCallback(() => signOut(), []);

	return (
		<Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
			<Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
				<IconButton
					size={'md'}
					icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
					aria-label={'Open Menu'}
					display={{ md: !isOpen ? 'none' : 'inherit' }}
					onClick={isOpen ? onClose : onOpen}
				/>
				<HStack spacing={8} alignItems={'center'}>
					<Box>
						<Link as={NextLink} href="/">
							<a>
								<Image
									alt="Cambridge Resilience Web logo"
									src="/logo.png"
									width="130"
									height="50"
								/>
							</a>
						</Link>
					</Box>
					<HStack
						as={'nav'}
						spacing={4}
						display={{ base: 'none', md: 'flex' }}
					>
						{Links.map((link) => (
							<NavLink key={link.label} href={link.href}>
								{link.label}
							</NavLink>
						))}
					</HStack>
				</HStack>
				<Flex alignItems={'center'}>
					<Text fontSize="14px" color="gray.600">
						Signed in as {session?.user.email}
					</Text>
					<Menu>
						<MenuButton
							as={Button}
							rounded={'full'}
							variant={'link'}
							cursor={'pointer'}
						>
							<SettingsIcon />
						</MenuButton>
						<MenuList zIndex={5}>
							<MenuItem onClick={handleSignOut}>
								Sign out
							</MenuItem>
						</MenuList>
					</Menu>
				</Flex>
			</Flex>

			{isOpen ? (
				<Box pb={4}>
					<Stack as={'nav'} spacing={4}>
						{Links.map((link) => (
							<NavLink key={link}>{link}</NavLink>
						))}
					</Stack>
				</Box>
			) : null}
		</Box>
	);
};

export default Nav;
