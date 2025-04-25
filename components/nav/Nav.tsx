'use client'

import { useMemo, memo, useState } from 'react'
import Image from 'next/legacy/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { RxHamburgerMenu } from 'react-icons/rx'
import { HiChevronRight, HiOutlineX } from 'react-icons/hi'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@components/ui/navigation-menu'
import { Button } from '@components/ui/button'
import useWebsPublic from '@hooks/webs/useWebsPublic'
import { PROTOCOL, REMOTE_HOSTNAME, REMOTE_URL } from '@helpers/config'
import GetInTouchButton from '@components/feedback-dialog/GetInTouchButton'
import LogoImage from '../../public/logo.png'

interface NavItem {
  label: string
  subLabel?: string
  children?: Array<NavItem>
  href?: string
  isExternal?: boolean
}

export default function MainNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { webs } = useWebsPublic()

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
      <div className="flex justify-center bg-white text-gray-600">
        <div className="flex min-h-[60px] w-full max-w-7xl flex-1 items-center justify-between px-4 py-2">
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-2xl hover:bg-gray-100"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <HiOutlineX /> : <RxHamburgerMenu />}
            </button>
          </div>

          <div className="flex items-center">
            <div className="flex">
              <Link href="/">
                <Image
                  alt="Resilience Web CIC logo"
                  src={LogoImage}
                  width="145"
                  height="50"
                  unoptimized
                />
              </Link>

              <div className="mr-2 ml-10 hidden items-center md:flex">
                <DesktopNav currentPathname={pathname} navItems={navItems} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <GetInTouchButton />
            <Link href={`${REMOTE_URL}/admin`}>
              <Button variant="default" size="default">
                Admin login
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`${
          isMobileMenuOpen ? 'block' : 'hidden'
        } border-b border-gray-200 bg-white md:hidden`}
      >
        <MobileNav navItems={navItems} />
      </div>
    </>
  )
}

interface DesktopNavProps {
  currentPathname: string
  navItems: Array<NavItem>
}

const DesktopNav = memo(({ currentPathname, navItems }: DesktopNavProps) => {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {navItems.map((navItem) => (
          <NavigationMenuItem key={navItem.label}>
            {navItem.children ? (
              <>
                <NavigationMenuTrigger>{navItem.label}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                    {navItem.children.map((child) => (
                      <ListItem
                        key={child.label}
                        title={child.label}
                        href={child.href}
                      />
                    ))}
                  </ul>
                </NavigationMenuContent>
              </>
            ) : (
              <NavigationMenuLink
                className={`${navigationMenuTriggerStyle()} ${
                  currentPathname !== '/' &&
                  navItem.href.includes(currentPathname)
                    ? 'text-green-700'
                    : ''
                }`}
                target={navItem.isExternal ? '_blank' : undefined}
                rel={navItem.isExternal ? 'noopener noreferrer' : undefined}
                href={navItem.href}
              >
                {navItem.label}
              </NavigationMenuLink>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
})

DesktopNav.displayName = 'DesktopNav'

interface ListItemProps {
  title: string
  href?: string
}

const ListItem = ({ title, href }: ListItemProps) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline outline-hidden transition-colors select-none"
        >
          <div className="text-md leading-none font-semibold">{title}</div>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}

const MobileNav = ({ navItems }: { navItems: NavItem[] }) => {
  const pathname = usePathname()

  return (
    <div className="p-4">
      {navItems.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} pathname={pathname} />
      ))}
    </div>
  )
}

const MobileNavItem = ({
  label,
  children,
  href,
  isExternal,
  pathname,
}: NavItem & { pathname: string }) => {
  const [isOpen, setIsOpen] = useState(false)

  if (children) {
    return (
      <div className="space-y-4">
        <button
          className="flex w-full items-center justify-between py-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{label}</span>
          <HiChevronRight
            className={`h-6 w-6 transform transition-transform duration-200 ${
              isOpen ? 'rotate-90' : ''
            }`}
          />
        </button>

        <div
          className={`${
            isOpen ? 'block' : 'hidden'
          } border-l border-gray-200 pl-4`}
        >
          {children.map((child) => (
            <Link
              key={child.label}
              href={child.href}
              className="block py-2"
              target={child.isExternal ? '_blank' : undefined}
              rel={child.isExternal ? 'noopener noreferrer' : undefined}
            >
              {child.label}
            </Link>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Link
      href={href}
      className={`block py-2 ${pathname !== '/' && href.includes(pathname) ? 'text-green-700' : ''}`}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
    >
      {label}
    </Link>
  )
}
