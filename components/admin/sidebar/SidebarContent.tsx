'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import type { ReactElement } from 'react'
import { BiCategory } from 'react-icons/bi'
import { GrAnnounce, GrOverview } from 'react-icons/gr'
import {
  HiViewList,
  HiUserGroup,
  HiOutlineCog,
  HiExternalLink,
  HiX,
  HiUpload,
  HiChartBar,
  HiChartPie,
  HiBell,
} from 'react-icons/hi'
import { LuBook, LuUserRoundSearch } from 'react-icons/lu'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from '@auth-client'
import { isFeatureEnabled, FEATURES } from '@helpers/features'
import DonateButton from '@components/donate-button'
import useCanEditWeb from '@hooks/web-access/useCanEditWeb'
import useIsOwnerOfWeb from '@hooks/web-access/useIsOwnerOfWeb'
import useWeb from '@hooks/webs/useWeb'
import { useAppContext } from '@store/hooks'
import LogoImage from '../../../public/logo.png'

interface NavLinkItem {
  icon: ReactElement
  iconColor: string
  tourId?: string
  label: string | ReactElement
  href: string
  external?: boolean
}

interface NavGroup {
  label: string
  collapsible?: boolean
  items: NavLinkItem[]
}

interface NavItemProps extends NavLinkItem {
  closeMenu: () => void
}

const ADVANCED_COLLAPSED_KEY = 'sidebar-advanced-collapsed'

const NavItem = ({
  label,
  icon,
  iconColor,
  href,
  tourId,
  external,
  closeMenu,
}: NavItemProps) => {
  const pathname = usePathname()
  let isActive = pathname === href
  if (href === '/admin' && pathname.includes('/admin/listings/')) {
    isActive = true
  }

  return (
    <Link
      href={href}
      className="block px-2"
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <button
        aria-current={isActive ? 'page' : undefined}
        data-tourid={tourId}
        onClick={closeMenu}
        className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-[0.9375rem] font-medium transition-all duration-150 ${
          isActive
            ? 'bg-gray-200/70 text-gray-900'
            : 'text-gray-600 hover:bg-gray-200/50 hover:text-gray-900'
        }`}
      >
        <span className={`text-lg ${iconColor}`}>{icon}</span>
        <span>{label}</span>
      </button>
    </Link>
  )
}

const SectionLabel = ({
  children,
  collapsible,
  collapsed,
  onClick,
}: {
  children: React.ReactNode
  collapsible?: boolean
  collapsed?: boolean
  onClick?: () => void
}) => {
  const content = (
    <>
      {children}
      {collapsible && (
        <span
          className={`text-[0.5rem] transition-transform duration-150 ${collapsed ? '-rotate-90' : ''}`}
        >
          ▼
        </span>
      )}
    </>
  )

  if (collapsible) {
    return (
      <button
        onClick={onClick}
        className="mt-5 mb-1 flex w-full cursor-pointer items-center gap-1.5 px-5 text-xs font-semibold tracking-wider text-gray-400 uppercase transition-colors hover:text-gray-500"
      >
        {content}
      </button>
    )
  }

  return (
    <span className="mt-5 mb-1 flex items-center gap-1.5 px-5 text-xs font-semibold tracking-wider text-gray-400 uppercase">
      {content}
    </span>
  )
}

export default function SidebarContent({ closeMenu, ...rest }) {
  const { data: session } = useSession()
  const canEditWeb = useCanEditWeb()
  const { isOwner } = useIsOwnerOfWeb()
  const { selectedWebId, selectedWebSlug } = useAppContext()
  const { web } = useWeb({ webSlug: selectedWebSlug, withAdminInfo: true })
  const isAnalyticsEnabled = isFeatureEnabled(
    FEATURES.showAnalytics,
    web?.features ?? [],
  )

  const [advancedCollapsed, setAdvancedCollapsed] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(ADVANCED_COLLAPSED_KEY)
    if (stored !== null) {
      setAdvancedCollapsed(stored === 'true')
    }
  }, [])

  const toggleAdvanced = useCallback(() => {
    setAdvancedCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(ADVANCED_COLLAPSED_KEY, String(next))
      return next
    })
  }, [])

  const navGroups = useMemo(() => {
    const groups: NavGroup[] = []

    // Content
    const contentItems: NavLinkItem[] = []
    if (selectedWebId) {
      contentItems.push({
        label: 'Listings',
        href: '/admin',
        icon: <HiViewList />,
        iconColor: 'text-blue-500',
        tourId: 'nav-listings',
      })
    }
    if (selectedWebId && canEditWeb) {
      contentItems.push({
        label: 'Categories & Tags',
        href: '/admin/categories',
        icon: <BiCategory />,
        iconColor: 'text-violet-500',
        tourId: 'nav-categories',
      })
    }
    if (contentItems.length > 0) {
      groups.push({ label: 'Content', items: contentItems })
    }

    // Web Management
    const managementItems: NavLinkItem[] = []
    if (selectedWebId && canEditWeb) {
      managementItems.push({
        label: 'Team',
        href: '/admin/team',
        icon: <HiUserGroup />,
        iconColor: 'text-amber-500',
        tourId: 'nav-team',
      })
      if (isAnalyticsEnabled) {
        managementItems.push({
          label: 'Analytics',
          href: '/admin/analytics',
          icon: <HiChartBar />,
          iconColor: 'text-emerald-500',
          tourId: 'nav-analytics',
        })
      }
    }
    if (isOwner || session?.user.role === 'admin') {
      managementItems.push({
        label: 'Web Settings',
        href: '/admin/web-settings',
        icon: <HiOutlineCog className="text-xl" />,
        iconColor: 'text-gray-500',
        tourId: 'nav-websettings',
      })
    }
    if (managementItems.length > 0) {
      groups.push({ label: 'Web Management', items: managementItems })
    }

    // Help & Resources
    const helpItems: NavLinkItem[] = []
    if (selectedWebId) {
      helpItems.push({
        label: 'Resources',
        href: '/admin/resources',
        icon: <GrAnnounce />,
        iconColor: 'text-rose-500',
        tourId: 'nav-resources',
      })
    }
    helpItems.push({
      label: (
        <span className="flex items-center gap-1">
          Knowledgebase <HiExternalLink className="text-sm text-gray-400" />
        </span>
      ),
      href: 'https://knowledgebase.resilienceweb.org.uk',
      icon: <LuBook />,
      iconColor: 'text-teal-500',
      external: true,
    })
    groups.push({ label: 'Help & Resources', items: helpItems })

    // Advanced (collapsible)
    const advancedItems: NavLinkItem[] = []
    if (selectedWebId && canEditWeb) {
      advancedItems.push({
        label: 'Import from CSV',
        href: '/admin/import',
        icon: <HiUpload />,
        iconColor: 'text-sky-500',
        tourId: 'nav-import',
      })
    }
    if (advancedItems.length > 0) {
      groups.push({
        label: 'Advanced',
        collapsible: true,
        items: advancedItems,
      })
    }

    return groups
  }, [
    canEditWeb,
    isAnalyticsEnabled,
    isOwner,
    selectedWebId,
    session?.user.role,
  ])

  const adminNavLinks = useMemo(() => {
    if (session?.user.role !== 'admin') return []
    return [
      {
        label: 'Manage webs',
        href: '/admin/manage-webs',
        icon: <GrOverview />,
        iconColor: 'text-indigo-500',
      },
      {
        label: 'Manage users',
        href: '/admin/users',
        icon: <LuUserRoundSearch />,
        iconColor: 'text-orange-500',
      },
      {
        label: 'Platform stats',
        href: '/admin/stats',
        icon: <HiChartPie />,
        iconColor: 'text-cyan-500',
      },
      {
        label: 'Notifications',
        href: '/admin/notifications',
        icon: <HiBell />,
        iconColor: 'text-rose-500',
      },
    ]
  }, [session?.user.role])

  return (
    <div
      className="fixed z-100 h-full w-full max-w-full border-r border-r-gray-200 bg-[#fafafa] lg:max-w-[240px]"
      {...rest}
    >
      <div className="flex h-full flex-col justify-between">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="my-3 ml-2 flex h-20 items-center justify-between">
            <Image
              alt="Resilience Web CIC logo"
              src={LogoImage}
              width="222"
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
          <nav className="flex flex-col">
            {navGroups.map((group) => (
              <div key={group.label}>
                <SectionLabel
                  collapsible={group.collapsible}
                  collapsed={group.collapsible ? advancedCollapsed : undefined}
                  onClick={group.collapsible ? toggleAdvanced : undefined}
                >
                  {group.label}
                </SectionLabel>
                {(!group.collapsible || !advancedCollapsed) &&
                  group.items.map((link) => (
                    <NavItem
                      key={
                        typeof link.label === 'string' ? link.label : link.href
                      }
                      label={link.label}
                      href={link.href}
                      tourId={link.tourId}
                      icon={link.icon}
                      iconColor={link.iconColor}
                      external={link.external}
                      closeMenu={closeMenu}
                    />
                  ))}
              </div>
            ))}

            {adminNavLinks.length > 0 && (
              <div>
                <SectionLabel>Admin</SectionLabel>
                {adminNavLinks.map((link) => (
                  <NavItem
                    key={link.label}
                    label={link.label}
                    href={link.href}
                    icon={link.icon}
                    iconColor={link.iconColor}
                    closeMenu={closeMenu}
                  />
                ))}
              </div>
            )}
          </nav>
          <div className="mt-6 p-4">
            <h2 className="text-xl">Like what you see?</h2>
            <p className="mb-3 text-sm text-gray-600">
              Consider making a donation to help us host and develop the
              Resilience Web platform 🙏🏼
            </p>
            <DonateButton />
          </div>
        </div>
      </div>
    </div>
  )
}
