import { memo, useMemo, useCallback } from 'react'
import Select from 'react-select'
import type { Options } from 'react-select'

import { useAppContext } from '@store/hooks'
import { useSites } from '@hooks/sites'

type SiteOption = {
  value: string
  label: string
}

const SiteSelector = () => {
  const { selectedSiteSlug, setSelectedSiteSlug } = useAppContext()
  const { sites } = useSites()

  const siteOptions: Options<SiteOption> = useMemo(() => {
    if (!sites) return []

    if (sites?.length && !selectedSiteSlug) {
      setSelectedSiteSlug(sites[0].slug)
    }
    return sites.map((s) => ({
      value: s.slug,
      label: s.title,
    }))
  }, [selectedSiteSlug, setSelectedSiteSlug, sites])

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

  return (
    <Select
      options={siteOptions}
      value={selectedOption}
      onChange={handleSiteChange}
    />
  )
}

export default memo(SiteSelector)
