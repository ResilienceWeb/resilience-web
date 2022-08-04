/* eslint-disable react-hooks/rules-of-hooks */
import { useMutation, useQueryClient } from '@tanstack/react-query'

async function updateTagRequest(tagData) {
    const response = await fetch('/api/tags', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(tagData),
    })

    const data = await response.json()
    const { tag } = data
    return tag
}

export default function useUpdateTag() {
    const queryClient = useQueryClient()

    return useMutation(updateTagRequest, {
        onMutate: async (newTag) => {
            await queryClient.cancelQueries(['tags'])
            const previousTags = queryClient.getQueryData(['tags'])
            queryClient.setQueryData(['tags'], (old) => [newTag])
            return { previousTags, newTag }
        },
        onError: (err, newCategory, context) => {
            queryClient.setQueryData(
                ['tags', context.newTag.id],
                context.previousTags,
            )
        },
        onSettled: () => {
            void queryClient.invalidateQueries(['tags'])
        },
    })
}

