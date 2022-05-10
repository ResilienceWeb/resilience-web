import { createContext } from 'react'

export const AppContext = createContext({
    isMobile: false,
    selectedSiteSlug: undefined,
    selectedLocationId: undefined,
    setSelectedSiteSlug: (siteSlug: string) => {
        /* */
    },
    sites: {},
})

