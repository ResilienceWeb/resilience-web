import { useCallback, useMemo } from 'react'
import Image from 'next/image'
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
import { BsPersonCircle } from 'react-icons/bs'
import { BiCategory } from 'react-icons/bi'

import SiteSelector from './site-selector'
import LogoImage from '../../../public/logo.png'
import { usePermissions } from '@hooks/permissions'
import { useAppContext } from '@store/hooks'

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
)

const Nav = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { permissions } = usePermissions()
  const { selectedLocationId } = useAppContext()
  const isAdminOfSelectedSite = useMemo(() => {
    return permissions?.siteIds.includes(selectedLocationId)
  }, [permissions?.siteIds, selectedLocationId])

  const Links = useMemo(() => {
    const links = [
      {
        label: 'Listings',
        href: '/admin',
        icon: <Icon as={HiViewList} fontSize="lg" />,
      },
    ]

    if (session?.user.admin || isAdminOfSelectedSite) {
      links.push({
        label: 'Categories & Tags',
        href: '/admin/categories',
        icon: <Icon as={BiCategory} fontSize="lg" />,
      })

      links.push({
        label: 'Invite',
        href: '/admin/invite',
        icon: <Icon as={HiUsers} fontSize="lg" />,
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
  }, [isAdminOfSelectedSite, session?.user.admin])

  const handleSignOut = useCallback(() => void signOut(), [])

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
          display={{ md: !isOpen ? 'none' : 'inherit' }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack spacing={8} alignItems={'center'}>
          <Box>
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
          <HStack as={'nav'} spacing={8} display={{ base: 'none', md: 'flex' }}>
            {Links.map((link) => (
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
                    bg: '#e2e8f0',
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
        <Flex alignItems={'center'}>
          <Box mr="1rem">
            <SiteSelector />
          </Box>
          <Menu>
            <MenuButton
              as={Button}
              rounded={'full'}
              variant={'link'}
              cursor={'pointer'}
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
            {Links.map((link) => (
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
