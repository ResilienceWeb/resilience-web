import { createContext } from 'react'

export const AppContext = createContext({
    isMobile: false,
    selectedSite: undefined,
    setSelectedSite: (siteSlug: string) => {
        /* */
    },
})

