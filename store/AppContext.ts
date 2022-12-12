import { createContext } from 'react'

export const AppContext = createContext({
  isMobile: false,
  selectedWebSlug: undefined,
  selectedWebId: undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setSelectedWebSlug: (webSlug: string) => {
    /* */
  },
  webs: {},
})
