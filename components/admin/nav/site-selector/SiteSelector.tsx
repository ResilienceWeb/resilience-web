import { memo, useMemo, useCallback } from 'react'
import Select from 'react-select'
import { Text } from '@chakra-ui/react'
import type { Options } from 'react-select'

import { useAppContext } from '@store/hooks'
import { useSites } from '@hooks/sites'
import { usePermissions } from '@hooks/permissions'
import { useSession } from 'next-auth/react'

type SiteOption = {
  value: string
  label: string
}

const SiteSelector = () => {
  const { data: session } = useSession()
  const { selectedSiteSlug, setSelectedSiteSlug } = useAppContext()
  const { sites } = useSites()
  const { permissions } = usePermissions()

  const siteOptions: Options<SiteOption> = useMemo(() => {
    if (!sites || !permissions) return []

    if (sites.length && !selectedSiteSlug) {
      setSelectedSiteSlug(sites[0].slug)
    }

    const allowedSites = session.user.admin
      ? sites
      : sites.filter((s) => permissions.siteIds?.includes(s.id))
    return allowedSites.map((s) => ({
      value: s.slug,
      label: s.title,
    }))
  }, [
    permissions,
    selectedSiteSlug,
    session?.user.admin,
    setSelectedSiteSlug,
    sites,
  ])

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
    />
  )
}

export default memo(SiteSelector)
