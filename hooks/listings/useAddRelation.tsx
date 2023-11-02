/* eslint-disable react-hooks/rules-of-hooks */
import { useMutation, useQueryClient } from '@tanstack/react-query'

async function addRelationRequest(relationData) {
  const response = await fetch('/api/relations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(relationData),
  })

  const data = await response.json()
  const { relation } = data
  return relation
}

export default function useAddRelation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addRelationRequest,
    onMutate: async (newRelation) => {
      await queryClient.cancelQueries({
        queryKey: ['relations'],
      })
      const previousRelations = queryClient.getQueryData(['relations'])
      queryClient.setQueryData(['relations', newRelation.id], newRelation)
      return { previousRelations, newRelation }
    },
    onError: (_err, _newListing, context) => {
      queryClient.setQueryData(['relations'], context.previousRelations)
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ['relations'],
      })
    },
  })
}
