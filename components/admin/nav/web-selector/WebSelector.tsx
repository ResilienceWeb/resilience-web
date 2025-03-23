import { memo, useMemo, useCallback, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Select from 'react-select'
import type { Options } from 'react-select'

import { useAppContext } from '@store/hooks'
import useAllowedWebs from '@hooks/webs/useAllowedWebs'
import usePermissions from '@hooks/permissions/usePermissions'

type WebOption = {
  value: string
  label: string
}

const WebSelector = () => {
  const pathname = usePathname()
  const { selectedWebSlug, setSelectedWebSlug } = useAppContext()
  const { permissions } = usePermissions()
  const { allowedWebs, isLoading: isLoadingAllowedWebs } = useAllowedWebs()

  const webOptions: Options<WebOption> = useMemo(() => {
    if (!permissions || !allowedWebs) return []

    return allowedWebs?.map((s) => ({
      value: s.slug,
      label: s.title,
    }))
  }, [allowedWebs, permissions])

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
    const allowedWebSlugs = allowedWebs?.map((w) => w.slug)
    if (!isLoadingAllowedWebs && !allowedWebSlugs.includes(selectedWebSlug)) {
      if (webOptions.length > 0) {
        setSelectedWebSlug(webOptions[0].value)
      }
    }
  }, [
    allowedWebs,
    isLoadingAllowedWebs,
    selectedWebSlug,
    setSelectedWebSlug,
    webOptions,
  ])

  useEffect(() => {
    if (selectedWebSlug) {
      return
    }

    if (isLoadingAllowedWebs) {
      return
    }

    if (selectedWebSlug === undefined && webOptions.length > 0) {
      setSelectedWebSlug(webOptions[0].value)
    }
  }, [webOptions, setSelectedWebSlug, isLoadingAllowedWebs, selectedWebSlug])

  const hideWebSelector = useMemo(
    () =>
      pathname?.includes('/admin/overview') ||
      pathname?.includes('/admin/user-settings'),
    [pathname],
  )

  if (webOptions.length === 1) {
    return (
      <p className="text-lg font-bold text-gray-700">{webOptions[0].label}</p>
    )
  }

  if (webOptions.length === 0 || !selectedOption || hideWebSelector) {
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
