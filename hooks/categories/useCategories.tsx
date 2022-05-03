import { useQuery } from 'react-query'
import { useContext } from 'react'
import { AppContext } from '@store/AppContext'
import { Category } from '@prisma/client'

async function fetchCategoriesRequest({ queryKey }) {
    const [_key, { siteSlug }] = queryKey
    const response = await fetch(`/api/categories?site=${siteSlug}`)
    const data = await response.json()
    const { categories } = data
    return categories
}

export default function useCategories(): {
    categories: Category[]
    isLoading: boolean
    isError: boolean
} {
    const { selectedSite: siteSlug } = useContext(AppContext)
    const {
        data: categories,
        isLoading,
        isError,
    } = useQuery(['categories', { siteSlug }], fetchCategoriesRequest, {
        refetchOnWindowFocus: false,
    })

    return {
        categories,
        isLoading,
        isError,
    }
}
