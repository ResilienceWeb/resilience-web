import { useContext } from 'react';
import Image from 'next/image';
import NextLink from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import classnames from 'classnames';
import {
	Box,
	Flex,
	Text,
	Stack,
	HStack,
	Collapse,
	Link,
	Popover,
	Button,
	IconButton,
	Tooltip,
	useColorModeValue,
	useDisclosure,
} from '@chakra-ui/react';
import {
	HamburgerIcon,
	CloseIcon,
	ChatIcon,
} from '@chakra-ui/icons';
import { AppContext } from '@store/AppContext';
import FeedbackDialog from '../feedback-dialog';
import LogoImage from '../../public/logo.png';
import styles from './Nav.module.scss';

export default function MainNav() {
	const { data: session } = useSession();
	const { isOpen, onToggle } = useDisclosure();
	const router = useRouter();
	const { isMobile } = useContext(AppContext);

	const {
		isOpen: isFeedbackDialogOpen,
		onOpen: onOpenFeedbackDialog,
		onClose: onCloseFeedbackDialog,
	} = useDisclosure();

	return (
		<>
			<Box>
				<Flex
					bg={useColorModeValue('white', 'gray.800')}
					color={useColorModeValue('gray.600', 'white')}
					minH={'60px'}
					py={{ base: 2 }}
					px={{ base: 4 }}
					borderBottom={1}
					borderStyle={'solid'}
					borderColor={useColorModeValue('gray.200', 'gray.900')}
					align="center"
					justifyContent="center"
				>
					<Flex
						ml={{ base: -2 }}
						display={{ base: 'flex', md: 'none' }}
					>
						<IconButton
							onClick={onToggle}
							icon={
								isOpen ? (
									<CloseIcon w={3} h={3} />
								) : (
									<HamburgerIcon w={5} h={5} />
								)
							}
							variant={'ghost'}
							aria-label={'Toggle Navigation'}
						/>
					</Flex>
					<Flex
						flex={{ base: 1 }}
						justify={{ base: 'space-around', md: 'space-between' }}
						alignItems="center"
						maxW="7xl"
					>
						<Flex>
							<Link as={NextLink} href="/">
								<button>
									<Image
										alt="Cambridge Resilience Web logo"
										src={LogoImage}
										width="145"
										height="50"
									/>
								</button>
							</Link>

							<Flex
								display={{ base: 'none', md: 'flex' }}
								alignItems="center"
								ml={10}
							>
								<DesktopNav currentPathname={router.pathname} />
							</Flex>
						</Flex>

						<HStack>
							<Tooltip label="We appreciate any kind of feedback, positive or negative.">
								{isMobile ? (
									<IconButton
										aria-label="Send feedback"
										icon={<ChatIcon />}
										onClick={onOpenFeedbackDialog}
										size="md"
										colorScheme="green"
										variant="solid"
									/>
								) : (
									<Button
										onClick={onOpenFeedbackDialog}
										size="md"
										bg="rw.700"
										colorScheme="rw.700"
										variant="solid"
										_hover={{ bg: 'rw.900' }}
									>
										Get in touch
									</Button>
								)}
							</Tooltip>
							{session && (
								<Link as={NextLink} href="/admin">
									<Button
										colorScheme="blue"
										variant="solid"
										size="md"
										mr={-4}
									>
										Dashboard
									</Button>
								</Link>
							)}
						</HStack>
					</Flex>
				</Flex>

				<Collapse in={isOpen} animateOpacity>
					<MobileNav />
				</Collapse>
			</Box>

			<FeedbackDialog
				isOpen={isFeedbackDialogOpen}
				onClose={onCloseFeedbackDialog}
			/>
		</>
	);
}

const DesktopNav = ({ currentPathname }) => {
	return (
		<Stack direction={'row'} spacing={8}>
			{NAV_ITEMS.map((navItem) => (
				<Box key={navItem.label}>
					<Popover trigger={'hover'} placement={'bottom-start'}>
						<NextLink href={navItem.href} passHref>
							<Link isExternal={navItem.isExternal}>
								<button
									className={classnames(
										styles.navLink,
										currentPathname === navItem.href &&
											styles.active,
									)}
								>
									{navItem.label}
								</button>
							</Link>
						</NextLink>
					</Popover>
				</Box>
			))}
		</Stack>
	);
};

const MobileNav = () => {
	return (
		<Stack
			bg={useColorModeValue('white', 'gray.800')}
			p={4}
			display={{ md: 'none' }}
		>
			{NAV_ITEMS.map((navItem) => (
				<MobileNavItem key={navItem.label} {...navItem} />
			))}
		</Stack>
	);
};

const MobileNavItem = ({ label, href }: { label: string, href: string }) => {
	return (
		<Stack spacing={4}>
			<Flex
				py={2}
				as={Link}
				href={href ?? '#'}
				justify={'space-between'}
				align={'center'}
				_hover={{
					textDecoration: 'none',
				}}
			>
				<Text
					fontWeight={600}
					color={useColorModeValue('gray.600', 'gray.200')}
				>
					{label}
				</Text>
			</Flex>
		</Stack>
	);
};

const NAV_ITEMS = [
	{
		label: 'About',
		href: '/about',
	},
	{
		label: 'How it works',
		href: '/how-it-works',
	},
	{
		label: 'City',
		href: '/city',
	},
	{
		label: 'University',
		href: '/university',
		isExternal: true,
	},
	{
		label: 'Donate',
		href: 'https://opencollective.com/resilience-web',
		isExternal: true,
	},
];
