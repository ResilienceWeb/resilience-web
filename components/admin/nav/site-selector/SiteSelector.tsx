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

        return sites.map((s) => ({
            value: s.slug,
            label: s.title,
        }))
    }, [sites])

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
        <div>
            <Select
                options={siteOptions}
                value={selectedOption}
                onChange={handleSiteChange}
            />
        </div>
    )
}

export default memo(SiteSelector)

