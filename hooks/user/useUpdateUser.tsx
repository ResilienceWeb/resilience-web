import { useMutation, useQueryClient } from '@tanstack/react-query'

async function updateUserRequest(userData) {
  const response = await fetch('/api/users', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(userData),
  })

  const data = await response.json()
  const { user } = data
  return user
}

export default function useUpdateUser() {
  // const queryClient = useQueryClient()

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: updateUserRequest,
    // onMutate: (newCategory) => {
    //   const previousCategories = queryClient.getQueryData(['categories'])
    //   queryClient.setQueryData(['categories'], newCategory)
    //   return { previousCategories, newCategory }
    // },
    // onSettled: () => {
    //   void queryClient.invalidateQueries({
    //     queryKey: ['categories'],
    //   })
    // },
  })

  return {
    updateUser: mutate,
    isPending,
    isSuccess,
  }
}
