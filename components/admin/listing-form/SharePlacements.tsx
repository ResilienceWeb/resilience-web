'use client'

import { useEffect, useMemo, useState } from 'react'
import { HiTrash } from 'react-icons/hi'
import { useSession } from '@auth-client'
import { generateSlug } from '@helpers/utils'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import useWebs from '@hooks/webs/useWebs'

type Placement = {
  webId: number
  slug: string
  web: { id: number; slug: string; title: string }
}

type Props = {
  listingId: number
  listingTitle: string
  currentWebId: number
  currentWebTitle: string
  currentSlug: string
  sharedWith: Placement[]
}

export default function SharePlacements({
  listingId,
  listingTitle,
  currentWebId,
  currentWebTitle,
  currentSlug,
  sharedWith,
}: Props) {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'admin'

  const { webs } = useWebs()
  const [targetWebId, setTargetWebId] = useState<string>('')
  const [slug, setSlug] = useState<string>(generateSlug(listingTitle))
  const [categoryId, setCategoryId] = useState<string>('')
  const [categories, setCategories] = useState<
    Array<{ id: number; label: string }>
  >([])
  const [isWorking, setIsWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const placedWebIds = useMemo(() => {
    return new Set([currentWebId, ...sharedWith.map((p) => p.webId)])
  }, [currentWebId, sharedWith])

  const eligibleWebs = useMemo(() => {
    if (!webs) return []
    return webs.filter((w: any) => !placedWebIds.has(w.id))
  }, [webs, placedWebIds])

  useEffect(() => {
    if (!targetWebId) {
      setCategories([])
      setCategoryId('')
      return
    }
    const web = (webs ?? []).find((w: any) => String(w.id) === targetWebId)
    if (!web) return
    let cancelled = false
    fetch(`/api/categories?web=${web.slug}`)
      .then((r) => r.json())
      .then((d) => (cancelled ? null : setCategories(d?.data ?? [])))
      .catch(() => (cancelled ? null : setCategories([])))
    return () => {
      cancelled = true
    }
  }, [targetWebId, webs])

  if (!isAdmin) return null

  const handleShare = async () => {
    setError(null)
    if (!targetWebId || !slug.trim()) {
      setError('Please pick a web and enter a slug first.')
      return
    }
    setIsWorking(true)
    try {
      const response = await fetch(`/api/listing/${listingId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webId: Number(targetWebId),
          slug: slug.trim(),
          ...(categoryId ? { categoryId: Number(categoryId) } : {}),
        }),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        setError(
          body.error ?? "We couldn't share this listing. Please try again.",
        )
        return
      }
      // Refresh page so the new placement appears in the form's sharedWith list.
      window.location.reload()
    } finally {
      setIsWorking(false)
    }
  }

  const handleDetach = async (webId: number, webTitle: string) => {
    if (
      !window.confirm(
        `Remove this listing from ${webTitle}? The listing stays alive in other webs.`,
      )
    ) {
      return
    }
    setIsWorking(true)
    try {
      const response = await fetch(
        `/api/listing/${listingId}/share?webId=${webId}`,
        { method: 'DELETE' },
      )
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        setError(
          body.error ??
            "We couldn't remove this listing from that web. Please try again.",
        )
        return
      }
      window.location.reload()
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <div className="mt-8 rounded-md border border-gray-200 bg-gray-50 p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-semibold text-gray-900">Webs (admin only)</h3>
        <span className="text-xs text-gray-500">
          Share this listing across multiple webs.
        </span>
      </div>

      {sharedWith.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-sm bg-white px-3 py-2 text-sm">
            <span>
              <span className="font-medium">{currentWebTitle}</span> · /
              {currentSlug}
            </span>
          </div>
          {sharedWith.map((p) => (
            <div
              key={p.webId}
              className="flex items-center justify-between rounded-sm bg-white px-3 py-2 text-sm"
            >
              <span>
                <span className="font-medium">{p.web.title}</span> · /{p.slug}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isWorking}
                onClick={() => handleDetach(p.webId, p.web.title)}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <HiTrash className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {eligibleWebs.length > 0 && (
        <div
          className={
            sharedWith.length > 0
              ? 'mt-4 space-y-2 border-t border-gray-200 pt-4'
              : 'space-y-2'
          }
        >
          <p className="text-sm font-medium text-gray-700">
            Add to another web
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            <Select value={targetWebId} onValueChange={setTargetWebId}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Pick a web" />
              </SelectTrigger>
              <SelectContent className="z-1001">
                {eligibleWebs.map((w: any) => (
                  <SelectItem key={w.id} value={String(w.id)}>
                    {w.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="slug-in-this-web"
            />
            <Select
              value={categoryId}
              onValueChange={setCategoryId}
              disabled={!targetWebId || categories.length === 0}
            >
              <SelectTrigger className="bg-white">
                <SelectValue
                  placeholder={
                    !targetWebId
                      ? 'Pick a web first'
                      : categories.length === 0
                        ? 'No categories'
                        : 'Pick a category'
                  }
                />
              </SelectTrigger>
              <SelectContent className="z-1001">
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="mt-3">
            <Button
              type="button"
              onClick={handleShare}
              disabled={isWorking || !targetWebId || !slug.trim()}
            >
              Share
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
