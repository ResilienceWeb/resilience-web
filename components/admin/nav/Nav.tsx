import { useCallback, useMemo } from 'react'
import Image from 'next/legacy/image'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useSession, signOut } from 'next-auth/react'
import {
  Box,
  Flex,
  HStack,
  Link,
  Icon,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Text,
  Stack,
} from '@chakra-ui/react'
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons'
import { HiViewList, HiUsers, HiOutlineLockOpen } from 'react-icons/hi'
import { FiSettings } from 'react-icons/fi'
import { BsPersonCircle } from 'react-icons/bs'
import { BiCategory } from 'react-icons/bi'

import WebSelector from './web-selector'
import LogoImage from '../../../public/logo.png'
import { useHasPermissionForCurrentWeb } from '@hooks/permissions'
import { useIsOwnerOfCurrentWeb } from '@hooks/ownership'
import { useAppContext } from '@store/hooks'

const NavLink = ({ children, href }) => (
  <Link as={NextLink} px={2} py={1} rounded={'md'} href={href}>
    {children}
  </Link>
)

const Nav = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const hasPermissionForCurrentWeb = useHasPermissionForCurrentWeb()
  const isOwnerOfCurrentWeb = useIsOwnerOfCurrentWeb()
  const { selectedWebId } = useAppContext()

  const navLinks = useMemo(() => {
    const links = []
    if (selectedWebId) {
      links.push({
        label: 'Listings',
        href: '/admin',
        icon: <Icon as={HiViewList} fontSize="lg" />,
      })
    }

    if (hasPermissionForCurrentWeb || isOwnerOfCurrentWeb) {
      links.push({
        label: 'Categories & Tags',
        href: '/admin/categories',
        icon: <Icon as={BiCategory} fontSize="lg" />,
      })

      links.push({
        label: 'Team',
        href: '/admin/team',
        icon: <Icon as={HiUsers} fontSize="lg" />,
      })
    }

    if (isOwnerOfCurrentWeb) {
      links.push({
        label: 'Web Settings',
        href: '/admin/web-settings',
        icon: <Icon as={FiSettings} fontSize="lg" />,
      })
    }

    if (session?.user.admin) {
      links.push({
        label: 'Permissions',
        href: '/admin/permissions',
        icon: <Icon as={HiOutlineLockOpen} fontSize="lg" />,
      })
    }

    return links
  }, [
    hasPermissionForCurrentWeb,
    isOwnerOfCurrentWeb,
    selectedWebId,
    session?.user.admin,
  ])

  const handleSignOut = useCallback(() => {
    signOut()
  }, [])

  return (
    <Box
      bg="#fafafa"
      px={4}
      borderBottom={1}
      borderStyle="solid"
      borderColor={useColorModeValue('gray.200', 'gray.900')}
    >
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <IconButton
          size={'md'}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label={'Open Menu'}
          display={{ lg: !isOpen ? 'none' : 'inherit' }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack spacing={8} alignItems={'center'}>
          <Box display={{ base: 'none', xl: 'inherit' }}>
            <Link as={NextLink} href="/">
              <button>
                <Image
                  alt="Resilience Web logo"
                  src={LogoImage}
                  width="148"
                  height="50"
                  unoptimized
                />
              </button>
            </Link>
          </Box>
          <HStack as="nav" spacing={8} display={{ base: 'none', lg: 'flex' }}>
            {navLinks.map((link) => (
              <NavLink key={link.label} href={link.href}>
                <Button
                  aria-current={
                    router.pathname === link.href ? 'page' : undefined
                  }
                  background="transparent"
                  color="gray.600"
                  fontWeight="600"
                  leftIcon={link.icon}
                  px="3"
                  py="2"
                  rounded="md"
                  transition="all 0.2s"
                  _hover={{
                    bg: 'blackAlpha.100',
                  }}
                  _activeLink={{
                    bg: 'blackAlpha.100',
                  }}
                >
                  {link.label}
                </Button>
              </NavLink>
            ))}
          </HStack>
        </HStack>
        <Flex alignItems="center">
          <Box mr="1rem">
            <WebSelector />
          </Box>
          <Menu>
            <MenuButton
              as={Button}
              rounded="full"
              variant="link"
              cursor="pointer"
            >
              <BsPersonCircle size="32" />
            </MenuButton>
            <MenuList zIndex={5}>
              {session?.user.email && (
                <>
                  <MenuItem isDisabled color="gray.600">
                    <Text fontSize="14px">
                      Signed in as {session?.user.email}
                    </Text>
                  </MenuItem>
                  <MenuDivider />
                </>
              )}
              <MenuItem onClick={handleSignOut} fontSize={'15px'}>
                Sign out
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>

      {isOpen ? (
        <Box pb={4}>
          <Stack as={'nav'} spacing={4}>
            {navLinks.map((link) => (
              <NavLink key={link.label} href={link.href}>
                {link.label}
              </NavLink>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Box>
  )
}

export default Nav
