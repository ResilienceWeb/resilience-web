import { ReactElement, useMemo } from 'react'
import NextLink from 'next/link'
import Image from 'next/legacy/image'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Box,
  CloseButton,
  Flex,
  Icon,
  useColorModeValue,
  FlexProps,
  Button,
  Link,
  Stack,
  Heading,
  Text,
} from '@chakra-ui/react'
import { HiViewList, HiUserGroup, HiOutlineCog } from 'react-icons/hi'
import { BiCategory } from 'react-icons/bi'
import { GrOverview } from 'react-icons/gr'
import useHasPermissionForCurrentWeb from '@hooks/permissions/useHasPermissionForCurrentWeb'
import useIsOwnerOfCurrentWeb from '@hooks/ownership/useIsOwnerOfCurrentWeb'
import { useAppContext } from '@store/hooks'
import DonateButton from '@components/donate-button'
import LogoImage from '../../../public/logo.png'

export default function SidebarContent({ closeMenu, ...rest }) {
  const { data: session } = useSession()
  const hasPermissionForCurrentWeb = useHasPermissionForCurrentWeb()
  const isOwnerOfCurrentWeb = useIsOwnerOfCurrentWeb()
  const { selectedWebId } = useAppContext()

  const navLinks = useMemo(() => {
    const links: any[] = []
    if (selectedWebId) {
      links.push({
        label: 'Listings',
        href: '/admin',
        icon: <Icon as={HiViewList} fontSize="lg" />,
        tourId: 'nav-listings',
      })
    }

    if (hasPermissionForCurrentWeb || isOwnerOfCurrentWeb) {
      links.push({
        label: 'Categories & Tags',
        href: '/admin/categories',
        icon: <Icon as={BiCategory} fontSize="lg" />,
        tourId: 'nav-categories',
      })

      links.push({
        label: 'Team',
        href: '/admin/team',
        icon: <Icon as={HiUserGroup} fontSize="lg" />,
        tourId: 'nav-team',
      })
    }

    if (isOwnerOfCurrentWeb) {
      links.push({
        label: 'Web Settings',
        href: '/admin/web-settings',
        icon: <Icon as={HiOutlineCog} fontSize="xl" />,
        tourId: 'nav-websettings',
      })
    }

    return links
  }, [hasPermissionForCurrentWeb, isOwnerOfCurrentWeb, selectedWebId])

  const adminNavLinks = useMemo(() => {
    const links: any[] = []
    if (session?.user.admin) {
      links.push({
        label: 'Overview',
        href: '/admin/overview',
        icon: <Icon as={GrOverview} fontSize="lg" />,
      })
    }

    return links
  }, [session?.user.admin])

  return (
    <Box
      bg="#fafafa"
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      maxWidth={{ base: 'full', lg: '240px' }}
      pos="fixed"
      h="full"
      zIndex="100"
      {...rest}
    >
      <Flex flexDirection="column" justifyContent="space-between" height="100%">
        <Box>
          <Flex
            h="20"
            alignItems="center"
            ml="0.5rem"
            my="0.75rem"
            justifyContent="space-between"
          >
            <Link as={NextLink} href="/">
              <button>
                <Image
                  alt="Resilience Web CIC logo"
                  src={LogoImage}
                  width="222"
                  height="75"
                  unoptimized
                />
              </button>
            </Link>
            <CloseButton
              display={{ base: 'flex', lg: 'none' }}
              size="xl"
              mr="1rem"
              onClick={closeMenu}
            />
          </Flex>
          <Stack as="nav" gap="0.75rem">
            {navLinks.map((link) => (
              <NavItem
                key={link.label}
                label={link.label}
                href={link.href}
                tourId={link.tourId}
                icon={link.icon}
                closeMenu={closeMenu}
              />
            ))}

            {adminNavLinks.length > 0 && (
              <Text pl="1rem" mt="1rem" fontWeight="600" color="gray.600">
                ADMIN
              </Text>
            )}
            {adminNavLinks.map((link) => (
              <NavItem
                key={link.label}
                label={link.label}
                href={link.href}
                tourId={link.tourId}
                icon={link.icon}
                closeMenu={closeMenu}
              />
            ))}
          </Stack>
        </Box>
        <Box p="1rem">
          <Heading as="h2" fontSize="1.25rem">
            Like what you see?
          </Heading>
          <Text mb="0.75rem" fontSize="0.9375rem" color="gray.600">
            Consider making a donation to help us host and develop the
            Resilience Web platform 🙏🏼
          </Text>
          <DonateButton />
        </Box>
      </Flex>
    </Box>
  )
}

interface NavItemProps extends FlexProps {
  icon: ReactElement
  tourId: string
  label: string
  href: string
  closeMenu: () => void
}
const NavLink = ({ children, href }) => (
  <Link as={NextLink} px={2} py={1} rounded={'md'} href={href}>
    {children}
  </Link>
)
const NavItem = ({ label, icon, href, tourId, closeMenu }: NavItemProps) => {
  const pathname = usePathname()
  return (
    <NavLink key={label} href={href}>
      <Button
        aria-current={pathname === href ? 'page' : undefined}
        data-tourid={tourId}
        background="transparent"
        color="gray.600"
        fontWeight="600"
        leftIcon={icon}
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
        onClick={closeMenu}
      >
        {label}
      </Button>
    </NavLink>
  )
}
