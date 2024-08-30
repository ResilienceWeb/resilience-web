'use client'
import { useCallback, useEffect, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Box } from '@chakra-ui/react'
import { useDebounce } from 'use-debounce'
import intersection from 'lodash/intersection'
import useLocalStorage from 'use-local-storage'
import { useQueryParams, ArrayParam, withDefault } from 'use-query-params'
import Header from '@components/header'
import { useIsMobile } from '@hooks/application'
import MainList from '@components/main-list'
import AlertBanner from '@components/alert-banner'
import { removeNonAlphaNumeric, sortStringsFunc } from '@helpers/utils'
import useCategoriesPublic from '@hooks/categories/useCategoriesPublic'
import { useTags } from '@hooks/tags'
import { Category } from '@prisma/client'

const NetworkComponent = dynamic(() => import('@components/network'), {
  ssr: false,
})
const Drawer = dynamic(() => import('@components/drawer'), {
  ssr: false,
})

type INetwork = {
  selectNodes: (ids: string[]) => void
}

export const CENTRAL_NODE_ID = 999

export default function Web({ data, webName, webDescription, webIsPublished }) {
  const isMobile = useIsMobile()
  const [isWebMode, setIsWebMode] = useLocalStorage('is-web-mode', undefined)
  const [isVolunteer, setIsVolunteer] = useState(false)

  const [query, setQuery] = useQueryParams({
    categories: withDefault(ArrayParam, []),
    tags: withDefault(ArrayParam, []),
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [searchTermValue] = useDebounce(searchTerm, 500)
  const handleSearchTermChange = useCallback(
    (event) => setSearchTerm(event.target.value),
    [],
  )
  const handleClearSearchTermValue = useCallback(() => setSearchTerm(''), [])

  const [categories, setCategories] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])

  const selectedCategories = useMemo(() => {
    return query.categories.map((categoryLabel) => {
      const categoryColor = categories.find(
        (c: Category) => c.label === categoryLabel,
      )?.color
      return {
        value: categoryLabel,
        label: categoryLabel,
        color: categoryColor,
      }
    })
  }, [categories, query.categories])
  const selectedTags = useMemo(() => {
    return query.tags.map((tagLabel) => ({
      value: tagLabel,
      label: tagLabel,
    }))
  }, [query.tags])

  const [selectedId, setSelectedId] = useState()
  const [_network, setNetwork] = useState<INetwork>()

  const { categories: fetchedCategories } = useCategoriesPublic()
  const { tags: fetchedTags } = useTags()

  useEffect(() => {
    if (!fetchedCategories) return

    setCategories(
      fetchedCategories.map((c) => ({
        value: c.label,
        label: c.label,
        color: `#${c.color}`,
      })),
    )
  }, [fetchedCategories])

  useEffect(() => {
    if (!fetchedTags) return

    setTags(
      fetchedTags.map((c) => ({
        value: c.label,
        label: c.label,
      })),
    )
  }, [fetchedTags])

  const handleCategorySelection = useCallback(
    (value) => {
      const categoryLabels = value.map((c) => c.label)
      setQuery({ categories: categoryLabels })
    },
    [setQuery],
  )

  const handleTagSelection = useCallback(
    (value) => {
      const tagsLabels = value.map((t) => t.value)
      setQuery({ tags: tagsLabels })
    },
    [setQuery],
  )

  const filteredItems = useMemo(() => {
    if (!data) return []
    let results = data?.nodes
      .filter((item) => !item.isDescriptive)
      .sort(sortStringsFunc)
      .sort((item) => {
        if (item.featured) {
          return -1
        } else {
          return 1
        }
      })

    if (isVolunteer) {
      results = results.filter((item) => item.seekingVolunteers)
    }

    if (query.categories.length > 0) {
      results = results.filter((item) =>
        query.categories.includes(item.category.label),
      )
    }

    if (query.tags.length > 0) {
      results = results.filter((item) => {
        const itemTags = item.tags.map((c) => c.label)
        return intersection(query.tags, itemTags).length > 0
      })
    }

    if (searchTermValue) {
      results = results.filter((item) =>
        removeNonAlphaNumeric(item.title)
          .toLowerCase()
          .includes(searchTermValue.toLowerCase()),
      )
    }

    return results
  }, [data, isVolunteer, query.categories, query.tags, searchTermValue])

  const descriptiveNodes = useMemo(
    () =>
      data
        ? data.nodes
            .filter((item) => item.isDescriptive)
            .filter(
              (item) =>
                item.id === CENTRAL_NODE_ID ||
                query.categories.length === 0 ||
                query.categories.some((l) => l === item.label),
            )
        : [],
    [data, query.categories],
  )

  const filteredNetworkData = useMemo(
    () => ({
      edges: data?.edges,
      nodes: [...filteredItems, ...descriptiveNodes],
    }),
    [data?.edges, filteredItems, descriptiveNodes],
  )

  const handleSwitchChange = useCallback(
    (event) => {
      setSelectedId(null)
      setIsWebMode(!(event.target.value == 'true'))
    },
    [setIsWebMode],
  )

  const handleVolunteerSwitchChange = useCallback(
    (event) => {
      setSelectedId(null)
      setIsVolunteer(event.target.checked)
    },
    [setIsVolunteer],
  )

  useEffect(() => {
    if (isMobile) {
      setIsWebMode(false)
    }
  }, [isMobile, setIsWebMode])

  return (
    <>
      {!isMobile && (
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
        />
      )}
      <Box
        height="100vh"
        ml={{ base: '0', md: '18.75rem' }}
        position="relative"
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
          handleSwitchChange={handleSwitchChange}
          handleTagSelection={handleTagSelection}
          isMobile={isMobile}
          isWebMode={isWebMode}
          searchTerm={searchTerm}
          selectedWebName={webName}
        />
        {isWebMode && (
          <NetworkComponent
            data={filteredNetworkData}
            selectedId={selectedId}
            setNetwork={setNetwork}
            setSelectedId={setSelectedId}
          />
        )}

        {!isWebMode && (
          <MainList filteredItems={filteredItems} isMobile={isMobile} />
        )}
      </Box>
    </>
  )
}
