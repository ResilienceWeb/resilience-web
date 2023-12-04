import { memo, useMemo, useCallback, useEffect } from 'react'
import Select from 'react-select'
import { Text } from '@chakra-ui/react'
import type { Options } from 'react-select'
import { useSession } from 'next-auth/react'

import { useAppContext } from '@store/hooks'
import { useWebs } from '@hooks/webs'
import { usePermissions } from '@hooks/permissions'
import { useMyOwnerships } from '@hooks/ownership'

type WebOption = {
  value: string
  label: string
}

const WebSelector = () => {
  const { data: session } = useSession()
  const { selectedWebSlug, setSelectedWebSlug } = useAppContext()
  const {
    isPending: isLoadingWebs,
    isFetching: isFetchingWebs,
    webs,
  } = useWebs()
  const {
    isPending: isLoadingPermissions,
    isFetching: isFetchingPermissions,
    permissions,
  } = usePermissions()
  const {
    isPending: isLoadingOwnerships,
    isFetching: isFetchingOwnerships,
    ownerships,
  } = useMyOwnerships()

  const allUniqueWebIds = useMemo(() => {
    if (!permissions && !ownerships) {
      return []
    }

    const allWebIds =
      permissions?.fullPermissionData?.listings.map((l) => l.webId) ?? []
    const ownedWebsIds = ownerships?.map((o) => o.id) ?? []

    return Array.from(new Set([...allWebIds, ...ownedWebsIds]))
  }, [ownerships, permissions])

  const webOptions: Options<WebOption> = useMemo(() => {
    if (!webs || !permissions) return []

    const allowedWebs = session?.user.admin
      ? webs
      : webs.filter(
          (s) =>
            permissions.webIds?.includes(s.id) ||
            allUniqueWebIds.includes(s.id),
        )

    return allowedWebs?.map((s) => ({
      value: s.slug,
      label: s.title,
    }))
  }, [allUniqueWebIds, permissions, session?.user.admin, webs])

  const selectedOption = useMemo(
    () => webOptions.find((s) => s.value === selectedWebSlug),
    [selectedWebSlug, webOptions],
  )

  const handleWebChange = useCallback(
    (webOption) => {
      console.log('setting to', webOption.value)
      setSelectedWebSlug(webOption.value)
    },
    [setSelectedWebSlug],
  )

  useEffect(() => {
    if (selectedWebSlug) {
      return
    }

    if (webOptions.length > 0) {
      setSelectedWebSlug(webOptions[0].value)
    } else if (
      isLoadingWebs === false &&
      isFetchingWebs === false &&
      isLoadingPermissions === false &&
      isFetchingPermissions === false &&
      isLoadingOwnerships === false &&
      isFetchingOwnerships === false &&
      webOptions.length === 0
    ) {
      setSelectedWebSlug(null)
    } else {
      setSelectedWebSlug(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    webOptions,
    setSelectedWebSlug,
    isLoadingWebs,
    isLoadingPermissions,
    isLoadingOwnerships,
    isFetchingWebs,
    isFetchingPermissions,
    isFetchingOwnerships,
  ])

  if (webOptions.length === 1) {
    return (
      <Text fontWeight={600} fontSize="lg" color="gray.700">
        {webOptions[0].label}
      </Text>
    )
  }

  if (webOptions.length === 0) {
    return null
  }

  return (
    <Select
      options={webOptions}
      value={selectedOption}
      onChange={handleWebChange}
      isSearchable={false}
      styles={{
        container: (baseStyles) => ({
          ...baseStyles,
          minWidth: '250px',
        }),
        menu: (baseStyles) => ({
          ...baseStyles,
          zIndex: 10,
        }),
      }}
    />
  )
}

export default memo(WebSelector)
