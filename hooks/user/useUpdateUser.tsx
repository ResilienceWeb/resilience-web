import { useMutation, useQueryClient } from '@tanstack/react-query'

async function updateUserRequest(userData) {
  const response = await fetch('/api/users', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(userData),
  })

  const responseJson = await response.json()
  const { data: user } = responseJson
  return user
}

export default function useUpdateUser() {
  const queryClient = useQueryClient()

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: updateUserRequest,
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data)
    },
  })

  return {
    updateUser: mutate,
    isPending,
    isSuccess,
  }
}
