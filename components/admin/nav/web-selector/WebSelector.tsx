import { memo, useMemo, useCallback, useEffect } from 'react'
import Select from 'react-select'
import { Text } from '@chakra-ui/react'
import type { Options } from 'react-select'
import { useSession } from 'next-auth/react'

import { useAppContext } from '@store/hooks'
import { useWebs } from '@hooks/webs'
import { usePermissions } from '@hooks/permissions'

type WebOption = {
  value: string
  label: string
}

const WebSelector = () => {
  const { data: session } = useSession()
  const { selectedWebSlug, setSelectedWebSlug } = useAppContext()
  const { webs } = useWebs({ withListings: true })
  const { permissions } = usePermissions()

  const allUniqueWebIds = useMemo(() => {
    if (!permissions) {
      return []
    }

    const allWebIds = permissions.fullPermissionData?.listings.map(
      (listing) => listing.webId,
    )
    return Array.from(new Set(allWebIds))
  }, [permissions])

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
      setSelectedWebSlug(webOption.value)
    },
    [setSelectedWebSlug],
  )

  useEffect(() => {
    if (webOptions.length === 1) {
      setSelectedWebSlug(webOptions[0].value)
    }
  }, [webOptions, setSelectedWebSlug])

  if (webOptions.length === 1) {
    return (
      <Text fontWeight="bold" fontSize="lg" color="gray.700">
        {webOptions[0].label}
      </Text>
    )
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
