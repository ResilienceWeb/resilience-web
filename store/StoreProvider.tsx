import { useState } from 'react'
import { useMediaQuerySSR } from '@hooks/application'
import { AppContext } from '@store/AppContext'

const DEFAULT_SELECTED_SITE = 'cambridge-city'

const StoreProvider = ({ children }) => {
    const isMobile = useMediaQuerySSR('(max-width: 760px)')
    const [selectedSite, setSelectedSite] = useState(DEFAULT_SELECTED_SITE)

    return (
        <AppContext.Provider
            value={{ isMobile, selectedSite, setSelectedSite }}
        >
            {children}
        </AppContext.Provider>
    )
}

export default StoreProvider

