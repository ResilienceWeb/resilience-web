'use client'
import { useMemo } from 'react'
import type { ReactElement } from 'react'
import Link from 'next/link'
import Image from 'next/legacy/image'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  HiViewList,
  HiUserGroup,
  HiOutlineCog,
  HiExternalLink,
  HiX,
  HiBookOpen,
} from 'react-icons/hi'
import { GrAnnounce } from 'react-icons/gr'
import { BiCategory } from 'react-icons/bi'
import { GrOverview } from 'react-icons/gr'
import { LuBook } from 'react-icons/lu'
import useHasPermissionForCurrentWeb from '@hooks/permissions/useHasPermissionForCurrentWeb'
import useIsOwnerOfCurrentWeb from '@hooks/ownership/useIsOwnerOfCurrentWeb'
import { useAppContext } from '@store/hooks'
import DonateButton from '@components/donate-button'
import LogoImage from '../../../public/logo.png'

interface NavItemProps {
  icon: ReactElement
  tourId?: string
  label: string | ReactElement
  href: string
  closeMenu: () => void
}

const NavLink = ({ children, href }) => (
  <Link href={href} className="rounded-md px-2 py-1">
    {children}
  </Link>
)

const NavItem = ({ label, icon, href, tourId, closeMenu }: NavItemProps) => {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <NavLink href={href}>
      <button
        aria-current={isActive ? 'page' : undefined}
        data-tourid={tourId}
        onClick={closeMenu}
        className={`flex w-full items-center gap-2 rounded-md px-3 py-2 font-semibold text-gray-600 transition-all duration-200 hover:bg-black/5 ${isActive ? 'bg-black/5' : ''} `}
      >
        <span className="text-lg">{icon}</span>
        <span>{label}</span>
      </button>
    </NavLink>
  )
}

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
        icon: <HiViewList />,
        tourId: 'nav-listings',
      })
    }

    if (hasPermissionForCurrentWeb || isOwnerOfCurrentWeb) {
      links.push({
        label: 'Categories & Tags',
        href: '/admin/categories',
        icon: <BiCategory />,
        tourId: 'nav-categories',
      })

      links.push({
        label: 'Team',
        href: '/admin/team',
        icon: <HiUserGroup />,
        tourId: 'nav-team',
      })
    }

    if (isOwnerOfCurrentWeb) {
      links.push({
        label: 'Web Settings',
        href: '/admin/web-settings',
        icon: <HiOutlineCog className="text-xl" />,
        tourId: 'nav-websettings',
      })
    }

    links.push({
      label: 'Resources',
      href: '/admin/resources',
      icon: <GrAnnounce />,
      tourId: 'nav-resources',
    })

    links.push({
      label: (
        <span className="flex items-center gap-1">
          Knowledgebase <HiExternalLink className="text-sm" />
        </span>
      ),
      href: 'https://resilienceweb.gitbook.io/knowledgebase',
      icon: <LuBook />,
    })

    return links
  }, [hasPermissionForCurrentWeb, isOwnerOfCurrentWeb, selectedWebId])

  const adminNavLinks = useMemo(() => {
    const links: any[] = []
    if (session?.user.admin) {
      links.push({
        label: 'Overview',
        href: '/admin/overview',
        icon: <GrOverview />,
      })
    }

    return links
  }, [session?.user.admin])

  return (
    <div
      className="fixed z-[100] h-full w-full max-w-full border-r border-r-gray-200 bg-[#fafafa] lg:max-w-[240px]"
      {...rest}
    >
      <div className="flex h-full flex-col justify-between">
        <div>
          <div className="my-3 ml-2 flex h-20 items-center justify-between">
            <Image
              alt="Resilience Web CIC logo"
              src={LogoImage}
              width="222"
              height="75"
              unoptimized
            />
            <button
              className="mr-4 flex lg:hidden"
              onClick={closeMenu}
              aria-label="Close menu"
            >
              <HiX className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-col gap-3">
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
              <span className="mt-4 pl-4 font-semibold text-gray-600">
                ADMIN
              </span>
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
          </nav>
        </div>
        <div className="p-4">
          <h2 className="text-xl">Like what you see?</h2>
          <p className="mb-3 text-[0.9375rem] text-gray-600">
            Consider making a donation to help us host and develop the
            Resilience Web platform 🙏🏼
          </p>
          <DonateButton />
        </div>
      </div>
    </div>
  )
}
