import { useCallback, useMemo } from 'react';
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
import LogoImage from '../../../public/logo.png';

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

	const Links = useMemo(() => {
		const links = [
			{
				label: 'Listings',
				href: '/admin',
			},
		];

		if (session?.user.admin) {
			links.push({ label: 'Permissions', href: '/admin/permissions' });
		}

		return links;
	}, [session?.user.admin]);

	const handleSignOut = useCallback(() => signOut(), []);

	return (
		<Box bg="#fafafa" px={4}>
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
							<button>
								<Image
									alt="Cambridge Resilience Web logo"
									src={LogoImage}
									width="130"
									height="50"
								/>
							</button>
						</Link>
					</Box>
					<HStack
						as={'nav'}
						spacing={8}
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
					{session?.user.email && (
						<Text fontSize="14px" color="gray.600">
							Signed in as {session?.user.email}
						</Text>
					)}
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
							<NavLink key={link.label} href={link.href}>
								{link.label}
							</NavLink>
						))}
					</Stack>
				</Box>
			) : null}
		</Box>
	);
};

export default Nav;
