import { createContext } from 'react'

export const AppContext = createContext({
  isMobile: false,
  selectedSiteSlug: undefined,
  selectedLocationId: undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setSelectedSiteSlug: (siteSlug: string) => {
    /* */
  },
  sites: {},
})
