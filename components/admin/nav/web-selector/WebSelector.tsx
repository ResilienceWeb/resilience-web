import { memo, useMemo, useCallback, useEffect } from 'react'
import { useRouter } from 'next/router'
import Select from 'react-select'
import { Text } from '@chakra-ui/react'
import type { Options } from 'react-select'

import { useAppContext } from '@store/hooks'
import { useAllowedWebs, useWebs } from '@hooks/webs'
import { usePermissions } from '@hooks/permissions'

type WebOption = {
  value: string
  label: string
}

const WebSelector = () => {
  const router = useRouter()
  const { selectedWebSlug, setSelectedWebSlug } = useAppContext()
  const {
    isPending: isLoadingWebs,
    isFetching: isFetchingWebs,
    webs,
  } = useWebs()
  const { permissions } = usePermissions()
  const { allowedWebs, isLoading: isLoadingAllowedWebs } = useAllowedWebs()

  const webOptions: Options<WebOption> = useMemo(() => {
    if (!webs || !permissions) return []

    return allowedWebs?.map((s) => ({
      value: s.slug,
      label: s.title,
    }))
  }, [allowedWebs, permissions, webs])

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
    if (selectedWebSlug) {
      return
    }

    if (webOptions.length > 0) {
      setSelectedWebSlug(webOptions[0].value)
    } else if (
      isLoadingWebs === false &&
      isFetchingWebs === false &&
      isLoadingAllowedWebs === false &&
      webOptions.length === 0
    ) {
      setSelectedWebSlug(null)
    } else {
      setSelectedWebSlug(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webOptions, setSelectedWebSlug, isLoadingWebs, isFetchingWebs])

  const hideWebSelector = useMemo(
    () =>
      router.pathname.includes('/admin/overview') ||
      router.pathname === '/admin/[slug]',
    [router.pathname],
  )

  if (webOptions.length === 1) {
    return (
      <Text fontWeight={600} fontSize="lg" color="gray.700">
        {webOptions[0].label}
      </Text>
    )
  }

  if (webOptions.length === 0 || hideWebSelector) {
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
        control: (provided) => ({
          ...provided,
          borderRadius: '10px',
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
