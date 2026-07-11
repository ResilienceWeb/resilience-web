import { useSession } from '@auth-client'
import useMyWebAccess from '@hooks/web-access/useMyWebAccess'
import useWebs from '@hooks/webs/useWebs'

const useAllowedWebs = () => {
  const { data: session } = useSession()
  const {
    webs,
    isPending: isLoadingWebs,
    isFetching: isFetchingWebs,
  } = useWebs()
  const {
    accessibleWebs,
    isPending: isLoadingWebAccess,
    isFetching: isFetchingWebAccess,
  } = useMyWebAccess()

  const isAdmin = session?.user.role === 'admin'

  const allowedWebIds = accessibleWebs?.map((web) => web.id) ?? []

  // Webs the user has explicit WebAccess to. Drives the web selector dropdown
  // for everyone, including admins.
  const myWebs = (() => {
    if (!webs) {
      return null
    }

    return webs.filter((web) => allowedWebIds.includes(web.id))
  })()

  // Webs the user is permitted to select/view. Admins can access any web; this
  // is used for permission/validation rather than what's shown in the dropdown.
  const allAllowedWebs = (() => {
    if (!webs) {
      return null
    }

    // Admin users can access all webs
    if (isAdmin) {
      return webs
    }

    return myWebs
  })()

  return {
    allowedWebs: allAllowedWebs,
    myWebs,
    isAdmin,
    isLoadingWebs: isLoadingWebs || isFetchingWebs,
    isLoading: isLoadingWebAccess || isFetchingWebs || isFetchingWebAccess,
  }
}

export default useAllowedWebs
