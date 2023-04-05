import { createContext } from 'react'

export const AppContext = createContext({
  isMobile: false,
  selectedWebSlug: undefined,
  selectedWebId: undefined,
  setSelectedWebSlug: (_webSlug: string) => {
    /* */
  },
  webs: {},
})
