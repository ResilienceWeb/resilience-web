import { useQuery } from 'react-query'
import { useAppContext } from '@store/hooks'
import { Tag } from '@prisma/client'

async function fetchTagsRequest({ queryKey }) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_key, { siteSlug }] = queryKey
    const response = await fetch(`/api/tags?site=${siteSlug}`)
    const { data: tags } = await response.json()
    return tags
}

export default function useTags(): {
    tags: Tag[]
    isLoading: boolean
    isError: boolean
} {
    const { selectedSiteSlug: siteSlug } = useAppContext()
    const {
        data: tags,
        isLoading,
        isError,
    } = useQuery(['tags', { siteSlug }], fetchTagsRequest, {
        refetchOnWindowFocus: false,
    })

    return {
        tags,
        isLoading,
        isError,
    }
}
