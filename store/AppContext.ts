import { createContext } from 'react'

export const AppContext = createContext({
  selectedWebSlug: undefined,
  selectedWebId: undefined,
  setSelectedWebSlug: (_webSlug: string) => {},
})
