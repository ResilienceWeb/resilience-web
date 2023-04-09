import { useMemo } from 'react'
import Image from 'next/legacy/image'
import NextLink from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import classnames from 'classnames'
import {
  Box,
  Flex,
  Text,
  Stack,
  HStack,
  Collapse,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  IconButton,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  Icon,
} from '@chakra-ui/react'
import {
  HamburgerIcon,
  CloseIcon,
  ChatIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from '@chakra-ui/icons'

import { useAppContext } from '@store/hooks'
import { useWebs } from '@hooks/webs'
import { PROTOCOL, REMOTE_HOSTNAME } from '@helpers/config'
import FeedbackDialog from '../feedback-dialog'
import LogoImage from '../../public/logo.png'
import styles from './Nav.module.scss'

interface NavItem {
  label: string
  subLabel?: string
  children?: Array<NavItem>
  href?: string
}

export default function MainNav() {
  const { data: session } = useSession()
  const { isOpen, onToggle } = useDisclosure()
  const router = useRouter()
  const { isMobile } = useAppContext()

  const { webs } = useWebs()

  const {
    isOpen: isFeedbackDialogOpen,
    onOpen: onOpenFeedbackDialog,
    onClose: onCloseFeedbackDialog,
  } = useDisclosure()

  const navItems = useMemo(() => {
    return [
      {
        label: 'Webs',
        href: '#',
        children: webs
          ?.filter((web) => web.published)
          .map((web) => ({
            label: web.title,
            href: `${PROTOCOL}://${web.slug}.${REMOTE_HOSTNAME}`,
          })),
      },
      {
        label: 'About',
        href: '/about',
      },
      {
        label: 'How it works',
        href: '/how-it-works',
      },
      {
        label: 'Donate',
        href: 'https://opencollective.com/resilience-web',
        isExternal: true,
      },
    ]
  }, [webs])

  return (
    <>
      <Flex
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        display="flex"
        justifyContent="center"
        borderBottom={1}
        borderStyle="solid"
        borderColor={useColorModeValue('gray.200', 'gray.900')}
      >
        <Flex
          minH={'60px'}
          py={{ base: 2 }}
          px={{ base: 4 }}
          alignItems="center"
          justifyContent="space-between"
          flex={{ base: 1 }}
          maxW="7xl"
        >
          <Flex ml={{ base: -2 }} display={{ base: 'flex', md: 'none' }}>
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
          <Flex alignItems="center">
            <Flex>
              <Link as={NextLink} href="/">
                <button>
                  <Image
                    alt="Resilience Web logo"
                    src={LogoImage}
                    width="145"
                    height="50"
                    unoptimized
                  />
                </button>
              </Link>

              <Flex
                display={{ base: 'none', md: 'flex' }}
                alignItems="center"
                ml={10}
              >
                <DesktopNav
                  currentPathname={router.pathname}
                  navItems={navItems}
                />
              </Flex>
            </Flex>
          </Flex>
          <HStack>
            <Tooltip label="Any suggestions, ideas or bug reports are welcome.">
              {isMobile ? (
                <IconButton
                  aria-label="Send feedback"
                  icon={<ChatIcon />}
                  onClick={onOpenFeedbackDialog}
                  size="md"
                  colorScheme="rw.900"
                  variant="outline"
                />
              ) : (
                <Button
                  onClick={onOpenFeedbackDialog}
                  size="md"
                  colorScheme="rw.900"
                  variant="outline"
                >
                  Get in touch
                </Button>
              )}
            </Tooltip>
            {session && (
              <Link as={NextLink} href="/admin">
                <Button colorScheme="blue" variant="solid" size="md" mr={-4}>
                  Dashboard
                </Button>
              </Link>
            )}
          </HStack>
        </Flex>
      </Flex>
      <Collapse in={isOpen} animateOpacity>
        <MobileNav navItems={navItems} />
      </Collapse>

      <FeedbackDialog
        isOpen={isFeedbackDialogOpen}
        onClose={onCloseFeedbackDialog}
      />
    </>
  )
}

const DesktopNav = ({ currentPathname, navItems }) => {
  return (
    <Stack direction={'row'} spacing={8}>
      {navItems.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={'hover'} placement={'bottom-start'}>
            <PopoverTrigger>
              <NextLink href={navItem.href} passHref>
                <button
                  className={classnames(
                    styles.navLink,
                    currentPathname === navItem.href && styles.active,
                  )}
                >
                  {navItem.label}
                </button>
              </NextLink>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={'xl'}
                bg="white"
                p={2}
                rounded={'xl'}
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  )
}

const DesktopSubNav = ({ label, href }) => {
  return (
    <Link
      href={href}
      role={'group'}
      display={'block'}
      p={2}
      rounded={'md'}
      _hover={{ bg: useColorModeValue('green.50', 'gray.900') }}
    >
      <Stack direction={'row'} align={'center'}>
        <Box>
          <Text
            transition={'all .3s ease'}
            _groupHover={{ color: 'rw.700' }}
            fontWeight={500}
          >
            {label}
          </Text>
        </Box>
        <Flex
          transition={'all .3s ease'}
          transform={'translateX(-10px)'}
          opacity={0}
          _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
          justify={'flex-end'}
          align={'center'}
          flex={1}
        >
          <Icon color={'rw.700'} w={5} h={5} as={ChevronRightIcon} />
        </Flex>
      </Stack>
    </Link>
  )
}

const MobileNav = ({ navItems }) => {
  return (
    <Stack
      bg={useColorModeValue('white', 'gray.800')}
      p={4}
      display={{ md: 'none' }}
    >
      {navItems.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  )
}

const MobileNavItem = ({ label, children, href }: NavItem) => {
  const { isOpen, onToggle } = useDisclosure()

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as={Link}
        href={href}
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
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={'all .25s ease-in-out'}
            transform={isOpen ? 'rotate(180deg)' : ''}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align={'start'}
        >
          {children &&
            children.map((child) => (
              <Link key={child.label} py={2} href={child.href}>
                {child.label}
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  )
}
