import { useMutation, useQueryClient } from 'react-query'

async function deleteListingRequest({ id }) {
    const response = await fetch(`/api/listings/${id}`, {
        method: 'DELETE',
    })
    const data = await response.json()
    const { listing } = data
    return listing
}

export default function useDeleteListing() {
    const queryClient = useQueryClient()

    return useMutation(deleteListingRequest, {
        onSuccess: (data) => {
            queryClient.setQueryData(['listings', { id: data.id }], data)
        },
        onMutate: async (deletedListing) => {
            await queryClient.cancelQueries('listings')
            const previousListings = queryClient.getQueryData('listings')
            queryClient.setQueryData('listings', (old) =>
                old.filter((l) => l.id !== deletedListing.id),
            )
            return { previousListings }
        },
        onError: (err, newListing, context) => {
            queryClient.setQueryData(
                ['listings', context.newListing.id],
                context.previousListing,
            )
        },
        onSettled: () => {
            queryClient.invalidateQueries('listings')
        },
    })
}
