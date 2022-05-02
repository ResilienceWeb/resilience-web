import { useQuery } from 'react-query'
import { useContext } from 'react'
import { AppContext } from '@store/AppContext'

async function fetchListingsRequest({ queryKey }) {
    const [_key, { siteSlug }] = queryKey
    const response = await fetch(`/api/listings?site=${siteSlug}`)
    const data = await response.json()
    const { listings } = data
    return listings
}

export default function useListings() {
    const { selectedSite: siteSlug } = useContext(AppContext)
    const {
        data: listings,
        isLoading,
        isError,
    } = useQuery(['listings', { siteSlug }], fetchListingsRequest)

    return {
        listings,
        isLoading,
        isError,
    }
}
