import { memo, useMemo, useCallback, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import useAllowedWebs from '@hooks/webs/useAllowedWebs'
import { useAppContext } from '@store/hooks'

type WebOption = {
  value: string
  label: string
}

// Sentinel value for the "Browse all webs" action so it can live inside the
// Radix Select (which requires every item to carry a value).
const BROWSE_ALL_VALUE = '__browse_all_webs__'

const WebSelector = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { selectedWebSlug, setSelectedWebSlug } = useAppContext()
  const {
    myWebs,
    allowedWebs,
    isAdmin,
    isLoading: isLoadingAllowedWebs,
  } = useAllowedWebs()

  const webOptions: WebOption[] = useMemo(() => {
    if (!myWebs) return []

    return myWebs
      .slice()
      .sort((a, b) => a.title.localeCompare(b.title))
      .map((s) => ({
        value: s.slug,
        label: s.title,
      }))
  }, [myWebs])

  // When an admin is viewing a web they don't have explicit access to, surface
  // it as an extra option at the top so the trigger renders and it's clear
  // they're outside their own webs.
  const impersonatedOption: WebOption | null = useMemo(() => {
    if (!selectedWebSlug || !allowedWebs) return null
    if (webOptions.some((o) => o.value === selectedWebSlug)) return null

    const web = allowedWebs.find((w) => w.slug === selectedWebSlug)
    if (!web) return null

    return { value: web.slug, label: `${web.title} (viewing as admin)` }
  }, [selectedWebSlug, allowedWebs, webOptions])

  const handleWebChange = useCallback(
    (value: string) => {
      if (value === BROWSE_ALL_VALUE) {
        router.push('/admin/manage-webs')
        return
      }
      setSelectedWebSlug(value)
    },
    [router, setSelectedWebSlug],
  )

  // Default selection + reconcile invalid selections. Admins may keep any slug
  // (they can view any web); non-admins are reset to their first web if the
  // current selection isn't one they have access to.
  useEffect(() => {
    if (isLoadingAllowedWebs || webOptions.length === 0) {
      return
    }

    if (!selectedWebSlug) {
      setSelectedWebSlug(webOptions[0].value)
      return
    }

    if (isAdmin) {
      return
    }

    const isSelectionValid = webOptions.some((o) => o.value === selectedWebSlug)
    if (!isSelectionValid) {
      setSelectedWebSlug(webOptions[0].value)
    }
  }, [
    webOptions,
    selectedWebSlug,
    setSelectedWebSlug,
    isLoadingAllowedWebs,
    isAdmin,
  ])

  const hideWebSelector = useMemo(
    () =>
      pathname?.includes('/admin/manage-webs') ||
      pathname?.includes('/admin/users') ||
      pathname?.includes('/admin/stats') ||
      pathname?.includes('/admin/user-settings'),
    [pathname],
  )

  // A single web and no admin powers: nothing to switch between.
  if (webOptions.length === 1 && !impersonatedOption && !isAdmin) {
    return (
      <p className="text-lg font-bold text-gray-700">{webOptions[0].label}</p>
    )
  }

  if (
    (webOptions.length === 0 && !impersonatedOption) ||
    !selectedWebSlug ||
    hideWebSelector
  ) {
    return null
  }

  return (
    <Select value={selectedWebSlug} onValueChange={handleWebChange}>
      <SelectTrigger className="min-w-45 rounded-[10px] bg-white">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {impersonatedOption && (
          <SelectItem
            key={impersonatedOption.value}
            value={impersonatedOption.value}
          >
            {impersonatedOption.label}
          </SelectItem>
        )}
        {webOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
        {isAdmin && (
          <>
            <SelectSeparator />
            <SelectItem value={BROWSE_ALL_VALUE}>Browse all webs…</SelectItem>
          </>
        )}
      </SelectContent>
    </Select>
  )
}

export default memo(WebSelector)
