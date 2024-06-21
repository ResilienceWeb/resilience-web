import { createContext } from 'react'

export const AppContext = createContext({
  isAdminMode: false,
  selectedWebSlug: undefined,
  selectedWebId: undefined,
  setSelectedWebSlug: (_webSlug: string) => {},
})
