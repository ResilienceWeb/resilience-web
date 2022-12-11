import { memo, useMemo, useCallback, useEffect } from 'react'
import Select from 'react-select'
import { Text } from '@chakra-ui/react'
import type { Options } from 'react-select'
import { useSession } from 'next-auth/react'

import { useAppContext } from '@store/hooks'
import { useSites } from '@hooks/sites'
import { usePermissions } from '@hooks/permissions'

type SiteOption = {
  value: string
  label: string
}

const SiteSelector = () => {
  const { data: session } = useSession()
  const { selectedSiteSlug, setSelectedSiteSlug } = useAppContext()
  const { sites } = useSites()
  const { permissions } = usePermissions()

  const allUniqueSiteIds = useMemo(() => {
    if (!permissions) {
      return []
    }

    const allSiteIds = permissions.fullPermissionData.listings.map(
      (listing) => listing.locationId,
    )
    return Array.from(new Set(allSiteIds))
  }, [permissions])

  const siteOptions: Options<SiteOption> = useMemo(() => {
    if (!sites || !permissions) return []

    const allowedSites = session?.user.admin
      ? sites
      : sites.filter(
          (s) =>
            permissions.siteIds?.includes(s.id) ||
            allUniqueSiteIds.includes(s.id),
        )

    return allowedSites.map((s) => ({
      value: s.slug,
      label: s.title,
    }))
  }, [allUniqueSiteIds, permissions, session?.user.admin, sites])

  const selectedOption = useMemo(
    () => siteOptions.find((s) => s.value === selectedSiteSlug),
    [selectedSiteSlug, siteOptions],
  )

  const handleSiteChange = useCallback(
    (siteOption) => {
      setSelectedSiteSlug(siteOption.value)
    },
    [setSelectedSiteSlug],
  )

  useEffect(() => {
    if (siteOptions.length === 1) {
      setSelectedSiteSlug(siteOptions[0].value)
    }
  }, [siteOptions, setSelectedSiteSlug])

  if (siteOptions.length === 1) {
    return (
      <Text fontWeight="bold" fontSize="lg" color="gray.700">
        {siteOptions[0].label}
      </Text>
    )
  }

  return (
    <Select
      options={siteOptions}
      value={selectedOption}
      onChange={handleSiteChange}
      styles={{
        menu: (baseStyles, state) => ({
          ...baseStyles,
          zIndex: 10,
        }),
      }}
    />
  )
}

export default memo(SiteSelector)
