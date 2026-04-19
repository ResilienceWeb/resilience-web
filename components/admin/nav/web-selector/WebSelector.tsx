import { memo, useMemo, useCallback, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import useAllowedWebs from '@hooks/webs/useAllowedWebs'
import { useAppContext } from '@store/hooks'

type WebOption = {
  value: string
  label: string
}

const WebSelector = () => {
  const pathname = usePathname()
  const { selectedWebSlug, setSelectedWebSlug } = useAppContext()
  const { allowedWebs, isLoading: isLoadingAllowedWebs } = useAllowedWebs()

  const webOptions: WebOption[] = useMemo(() => {
    if (!allowedWebs) return []

    return allowedWebs
      ?.sort((a, b) => a.title.localeCompare(b.title))
      .map((s) => ({
        value: s.slug,
        label: s.title,
      }))
  }, [allowedWebs])

  const handleWebChange = useCallback(
    (value: string) => {
      setSelectedWebSlug(value)
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
      pathname?.includes('/admin/dashboard') ||
      pathname?.includes('/admin/user-settings'),
    [pathname],
  )

  if (webOptions.length === 1) {
    return (
      <p className="text-lg font-bold text-gray-700">{webOptions[0].label}</p>
    )
  }

  if (webOptions.length === 0 || !selectedWebSlug || hideWebSelector) {
    return null
  }

  return (
    <Select value={selectedWebSlug} onValueChange={handleWebChange}>
      <SelectTrigger className="min-w-45 rounded-[10px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {webOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default memo(WebSelector)
