import { useMemo } from 'react'
import Image from 'next/legacy/image'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
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
  useColorModeValue,
  useDisclosure,
  Icon,
} from '@chakra-ui/react'
import { RxHamburgerMenu } from 'react-icons/rx'
import { HiChevronRight, HiOutlineX } from 'react-icons/hi'

import useWebs from '@hooks/webs/useWebs'
import { PROTOCOL, REMOTE_HOSTNAME, REMOTE_URL } from '@helpers/config'
import GetInTouchButton from '@components/feedback-dialog/GetInTouchButton'
import LogoImage from '../../public/logo.png'
import styles from './Nav.module.scss'

interface NavItem {
  label: string
  subLabel?: string
  children?: Array<NavItem>
  href?: string
}

export default function MainNav() {
  const { isOpen, onToggle } = useDisclosure()
  const pathname = usePathname()

  const { webs } = useWebs({ published: true })

  const navItems = useMemo(() => {
    return [
      {
        label: 'Webs',
        href: '/#web-cards',
        children: webs
          ?.filter(
            (web) =>
              web.published &&
              web.slug !== 'ctrlshift' &&
              web.slug !== 'transition',
          )
          .map((web) => ({
            label: web.title,
            href: `${PROTOCOL}://${web.slug}.${REMOTE_HOSTNAME}`,
          }))
          .concat({
            label: 'Create your own web',
            href: '/auth/signup',
          }),
      },
      {
        label: 'About',
        href: `${REMOTE_URL}/about`,
      },
      {
        label: 'News',
        href: `${REMOTE_URL}/news`,
      },
      {
        label: 'Knowledgebase',
        href: 'https://resilienceweb.gitbook.io',
        isExternal: true,
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
              icon={isOpen ? <HiOutlineX /> : <RxHamburgerMenu />}
              variant={'ghost'}
              aria-label={'Toggle Navigation'}
              fontSize="1.5rem"
            />
          </Flex>
          <Flex alignItems="center">
            <Flex>
              <Link as={NextLink} href="/">
                <button>
                  <Image
                    alt="Resilience Web CIC logo"
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
                ml="2.5rem"
                mr="0.5rem"
              >
                <DesktopNav currentPathname={pathname} navItems={navItems} />
              </Flex>
            </Flex>
          </Flex>
          <HStack>
            <GetInTouchButton />
            <Link as={NextLink} href={`${REMOTE_URL}/admin`}>
              <Button colorScheme="blue" variant="solid" size="md" mr={-2}>
                Admin login
              </Button>
            </Link>
          </HStack>
        </Flex>
      </Flex>
      <Collapse in={isOpen} animateOpacity>
        <MobileNav navItems={navItems} />
      </Collapse>
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
                  className={`${styles.navLink} ${
                    currentPathname === navItem.href ? styles.active : ''
                  }`}
                >
                  {navItem.label}
                </button>
              </NextLink>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow="2xl"
                bg="white"
                p={2}
                rounded="xl"
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNavItem key={child.label} {...child} />
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

const DesktopSubNavItem = ({ label, href }) => {
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
            fontWeight={600}
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
          <Icon color={'rw.700'} w={5} h={5} as={HiChevronRight} />
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
    <Stack data-testid="stack" spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as={children ? 'button' : Link}
        // @ts-ignore
        href={children ? null : href}
        justify="space-between"
        align="center"
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
            as={HiChevronRight}
            transition={'all .25s ease-in-out'}
            transform={isOpen ? 'rotate(270deg)' : 'rotate(90deg)'}
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
          borderStyle="solid"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align="start"
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
