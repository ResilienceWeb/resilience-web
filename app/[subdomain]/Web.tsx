'use client'

import { useEffect, memo, useMemo, useState } from 'react'
import { HiOutlineShare } from 'react-icons/hi'
import dynamic from 'next/dynamic'
import NextLink from 'next/link'
import '@styles/font-awesome.css'
import { useQueryState, parseAsArrayOf, parseAsString } from 'nuqs'
import { useDebounceValue, useLocalStorage } from 'usehooks-ts'
import { trackWebEvent } from '@helpers/analytics'
import { decompressJson } from '@helpers/compression'
import { REMOTE_URL } from '@helpers/config'
import { isFeatureEnabled, FEATURES } from '@helpers/features'
import { icons } from '@helpers/icons'
import {
  removeNonAlphaNumeric,
  sortStringsFunc,
  intersection,
  htmlTitle,
} from '@helpers/utils'
import AlertBanner from '@components/alert-banner'
import Events from '@components/events'
import Header from '@components/header'
import { License, LicenseTransition } from '@components/license'
import MainList from '@components/main-list'
import { Button } from '@components/ui/button'
import { Spinner } from '@components/ui/spinner'
import useIsMobile from '@hooks/application/useIsMobile'
import useCategoriesPublic from '@hooks/categories/useCategoriesPublic'
import useTagsPublic from '@hooks/tags/useTagsPublic'

const NetworkComponent = dynamic(() => import('@components/network'), {
  ssr: false,
  loading: () => <Spinner />,
})
const Drawer = dynamic(() => import('@components/drawer'), {
  ssr: false,
})
const ListingsMap = dynamic(() => import('@components/listings-map'), {
  ssr: false,
})

export const CENTRAL_NODE_ID = 999

type NetworkData = {
  nodes: ListingNodeType[]
  edges: any[]
}

export type RelatedWeb = {
  slug: string
  title: string
  location: {
    latitude: number
    longitude: number
  }
}

type Props = {
  // gzip+base64 compressed NetworkData, decompressed on the client below.
  data: string
  events?: any[]
  features: any
  webId: number
  webName: string
  webDescription?: string
  webIsPublished: boolean
  webContactEmail?: string
  isTransitionMode?: boolean
  webSlug: string
  relatedWebs?: RelatedWeb[]
}

const Web = ({
  data: compressedData,
  events,
  features,
  webId,
  webName,
  webDescription = null,
  webIsPublished,
  isTransitionMode = false,
  webContactEmail,
  webSlug,
  relatedWebs = [],
}: Props) => {
  // Deliberately a manual useMemo: without it the React Compiler merges this
  // value and the filter pipeline below into a single memo scope, which then
  // spans the hook calls in between and gets discarded entirely — so `data`
  // (and filteredNetworkData) would be rebuilt on every render, remounting the
  // network graph whenever unrelated state changes (e.g. the listing dialog).
  const data: NetworkData | null = useMemo(
    () => (compressedData ? decompressJson<NetworkData>(compressedData) : null),
    [compressedData],
  )

  const isMobile = useIsMobile()
  const [isVolunteer, setIsVolunteer] = useState(false)
  const defaultTab = isMobile ? 'list' : 'web'

  const isGeoMappingEnabled = isFeatureEnabled(FEATURES.showMap, features)

  useEffect(() => {
    trackWebEvent(webId, 'view')
  }, [webId])

  const [categoriesParam, setCategoriesParam] = useQueryState(
    'categories',
    parseAsArrayOf(parseAsString).withDefault([]),
  )
  const [tagsParam, setTagsParam] = useQueryState(
    'tags',
    parseAsArrayOf(parseAsString).withDefault([]),
  )
  const [storedTab, setStoredTab] = useLocalStorage<string | undefined>(
    'activeTab',
    undefined,
    { initializeWithValue: false },
  )
  const [viewParam, setViewParam] = useQueryState('view', parseAsString)

  // An explicit ?view= in the URL wins (so links can open a specific tab),
  // then the tab remembered in localStorage, then the device default.
  // Map and events tabs only exist for some webs, so fall back to the
  // default if the requested tab isn't available here
  const requestedTab = viewParam ?? storedTab ?? defaultTab
  const tabs = ['web', 'list']
  if (isGeoMappingEnabled) tabs.push('map')
  if (events?.length > 0) tabs.push('events')
  const availableTabs = tabs
  const activeTab = availableTabs.includes(requestedTab)
    ? requestedTab
    : defaultTab

  const [searchTerm, setSearchTerm] = useState('')
  const [searchTermValue] = useDebounceValue(searchTerm, 500)
  const handleSearchTermChange = (event) => setSearchTerm(event.target.value)
  const handleClearSearchTermValue = () => setSearchTerm('')

  const { categories: fetchedCategories } = useCategoriesPublic({ webSlug })
  const { tags: fetchedTags } = useTagsPublic({ webSlug })

  const categories = (() => {
    if (!fetchedCategories) return []
    return fetchedCategories.map((c) => {
      const color = `#${c.color}`
      const IconComponent =
        c.icon && c.icon !== 'default'
          ? icons.find((i) => i.name === c.icon)?.icon
          : undefined

      return {
        value: c.label,
        label: c.label,
        color,
        icon: IconComponent ? <IconComponent style={{ color }} /> : undefined,
      }
    })
  })()

  const tags = (() => {
    if (!fetchedTags) return []
    return fetchedTags.map((t) => ({
      value: t.label,
      label: t.label,
    }))
  })()

  const selectedCategories = categoriesParam.map((categoryLabel) => {
    const category = categories.find((c) => c.label === categoryLabel)
    return {
      value: categoryLabel,
      label: categoryLabel,
      color: category?.color,
      icon: category?.icon,
    }
  })

  const selectedTags = tagsParam.map((tagLabel) => ({
    value: tagLabel,
    label: tagLabel,
  }))

  const [selectedId, setSelectedId] = useState()

  const handleCategorySelection = (value) => {
    const categoryLabels = value.map((c) => c.label)
    setCategoriesParam(categoryLabels)
  }

  const handleTagSelection = (value) => {
    const tagsLabels = value.map((t) => t.value)
    setTagsParam(tagsLabels)
  }

  const handleVolunteerSwitchChange = (value) => {
    setSelectedId(null)
    setIsVolunteer(value)
  }

  const handleTabChange = (value: string) => {
    setStoredTab(value)
    setViewParam(value)
  }

  const descriptiveNodes = data
    ? data.nodes
        .filter(
          (item) =>
            item.group === 'category' ||
            item.group === 'related-web' ||
            item.group === 'central-node',
        )
        .filter(
          (item) =>
            item.id === CENTRAL_NODE_ID ||
            categoriesParam.length === 0 ||
            categoriesParam.some((l) => l === item.label),
        )
    : []

  const [filteredItems, filteredDescriptiveNodes] = (() => {
    if (!data) return []
    let results: any[] = data?.nodes
      .filter(
        (item) =>
          item.group !== 'category' &&
          item.group !== 'central-node' &&
          item.group !== 'related-web',
      )
      .sort(sortStringsFunc)
      .sort((a, b) => {
        // Sort by featured first (if date is in the future), then new, then regular
        const aFeatured = a.featured && new Date(a.featured) > new Date()
        const bFeatured = b.featured && new Date(b.featured) > new Date()
        if (aFeatured && !bFeatured) return -1
        if (!aFeatured && bFeatured) return 1
        if (a.new && !b.new) return -1
        if (!a.new && b.new) return 1
        return 0
      })

    if (isVolunteer) {
      results = results.filter((item) => item.seekingVolunteers)
    }

    if (categoriesParam.length > 0) {
      results = results.filter((item) =>
        categoriesParam.includes(item.category.label),
      )
    }

    if (tagsParam.length > 0) {
      results = results.filter((item) => {
        const itemTags = item.tags.map((c) => c.label)
        return intersection([tagsParam, itemTags]).length > 0
      })
    }

    if (searchTermValue) {
      results = results.filter(
        (item) =>
          removeNonAlphaNumeric(item.label)
            .toLowerCase()
            .includes(searchTermValue.toLowerCase()) ||
          (item.description &&
            removeNonAlphaNumeric(item.description)
              .toLowerCase()
              .includes(searchTermValue.toLowerCase())),
      )
    }

    results = results.map((item) => {
      let tagsHTML = ''
      item.tags?.forEach((tag) => {
        tagsHTML += `<span class="vis-network-title-tag" style="background-color: ${tag.color ?? '#b4fdbd'}">${tag.label}</span>`
      })
      return {
        ...item,
        title: htmlTitle(
          `<span class="vis-network-title-label">${item.label}</span><br><div class="vis-network-title-tag-list">${tagsHTML}</div>`,
        ),
      }
    })

    const filteredDescriptiveNodes = descriptiveNodes.filter(
      (descriptiveNode) =>
        results.some(
          (item) =>
            item.category.label === descriptiveNode.label ||
            descriptiveNode.group === 'central-node' ||
            descriptiveNode.group === 'related-web',
        ),
    )

    return [results, filteredDescriptiveNodes]
  })()

  const filteredNetworkData = {
    edges: data?.edges,
    nodes: [...filteredItems, ...filteredDescriptiveNodes],
  }

  const totalListingsCount =
    data?.nodes.filter(
      (item) =>
        item.group !== 'category' &&
        item.group !== 'central-node' &&
        item.group !== 'related-web',
    ).length ?? 0

  const isWebEmpty = filteredItems.length === 0

  return (
    <>
      <div className="hidden md:block">
        <Drawer
          categories={categories}
          selectedCategories={selectedCategories}
          tags={tags}
          selectedTags={selectedTags}
          handleCategorySelection={handleCategorySelection}
          handleTagSelection={handleTagSelection}
          handleClearSearchTermValue={handleClearSearchTermValue}
          handleSearchTermChange={handleSearchTermChange}
          handleVolunteerSwitchChange={handleVolunteerSwitchChange}
          isVolunteer={isVolunteer}
          searchTerm={searchTerm}
          webDescription={webDescription}
          webContactEmail={webContactEmail}
          webSlug={webSlug}
          isTransitionMode={isTransitionMode}
        />
      </div>
      <div
        className={`relative flex flex-col md:ml-75 ${
          activeTab === 'web' || activeTab === 'map'
            ? 'h-screen'
            : 'min-h-screen'
        }`}
      >
        {webIsPublished === false && (
          <AlertBanner
            content="Note: this web is currently work in progress and not fully published yet."
            type="info"
            colorScheme="rw"
          />
        )}
        <Header
          categories={categories}
          selectedCategories={selectedCategories}
          tags={tags}
          selectedTags={selectedTags}
          handleCategorySelection={handleCategorySelection}
          handleClearSearchTermValue={handleClearSearchTermValue}
          handleSearchTermChange={handleSearchTermChange}
          handleTagSelection={handleTagSelection}
          hasEvents={events?.length > 0}
          isGeoMappingEnabled={isGeoMappingEnabled}
          isMobile={isMobile}
          isWebMode={false}
          isTransitionMode={isTransitionMode}
          searchTerm={searchTerm}
          selectedWebName={webName}
          selectedWebSlug={webSlug}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {activeTab === 'web' &&
          (isWebEmpty ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-12 text-center">
              <div className="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-full">
                <HiOutlineShare className="h-8 w-8" />
              </div>
              {totalListingsCount === 0 ? (
                <>
                  <h2 className="text-xl font-semibold">
                    This web doesn't have any listings yet
                  </h2>
                  <p className="text-muted-foreground max-w-105 text-balance">
                    Once listings are added they'll appear here as an
                    interconnected web. Know a group that belongs here? Propose
                    it and help {webName} Resilience Web grow.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold">No listings to show</h2>
                  <p className="text-muted-foreground max-w-105">
                    No listings match your current filters or search. Try
                    clearing them, or propose a listing to the maintainers.
                  </p>
                </>
              )}
              <NextLink href={`${REMOTE_URL}/new-listing/${webSlug}`}>
                <Button
                  variant="default"
                  className="bg-primary hover:bg-primary/90"
                >
                  Propose new listing
                </Button>
              </NextLink>
            </div>
          ) : (
            <NetworkComponent
              data={filteredNetworkData}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              webId={webId}
            />
          ))}

        {activeTab === 'list' && (
          <MainList filteredItems={filteredItems} webSlug={webSlug} />
        )}
        {activeTab === 'map' && (
          <ListingsMap
            items={filteredItems}
            webSlug={webSlug}
            relatedWebs={relatedWebs}
          />
        )}
        {activeTab === 'events' && <Events items={events} webSlug={webSlug} />}

        {isTransitionMode && <LicenseTransition />}
        {!isTransitionMode && activeTab !== 'events' && <License />}
      </div>
    </>
  )
}

export default memo(Web)
