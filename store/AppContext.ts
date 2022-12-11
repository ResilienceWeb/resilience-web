import { createContext } from 'react'

export const AppContext = createContext({
  isMobile: false,
  selectedWebSlug: undefined,
  selectedLocationId: undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setSelectedWebSlug: (webSlug: string) => {
    /* */
  },
  webs: {},
})
