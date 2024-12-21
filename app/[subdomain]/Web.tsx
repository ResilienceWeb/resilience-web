'use client'
import { useCallback, useEffect, useState, useMemo, memo } from 'react'
import dynamic from 'next/dynamic'
import { Box } from '@chakra-ui/react'
import { useDebounce } from 'use-debounce'
import useLocalStorage from 'use-local-storage'
import {
  useQueryParams,
  ArrayParam,
  BooleanParam,
  withDefault,
} from 'use-query-params'
import Header from '@components/header'
import useIsMobile from '@hooks/application/useIsMobile'
import MainList from '@components/main-list'
import AlertBanner from '@components/alert-banner'
import {
  removeNonAlphaNumeric,
  sortStringsFunc,
  intersection,
  htmlTitle,
} from '@helpers/utils'
import useCategoriesPublic from '@hooks/categories/useCategoriesPublic'
import useSelectedWebSlug from '@hooks/application/useSelectedWebSlug'
import useTagsPublic from '@hooks/tags/useTagsPublic'
import type { Category } from '@prisma/client'

const NetworkComponent = dynamic(() => import('@components/network'), {
  ssr: false,
})
const Drawer = dynamic(() => import('@components/drawer'), {
  ssr: false,
})

export const CENTRAL_NODE_ID = 999

type Props = {
  data: {
    nodes: ListingNodeType[]
    edges: any[]
  }
  webName: string
  webDescription?: string
  webIsPublished: boolean
  isTransitionMode?: boolean
}

const Web = ({
  data,
  webName,
  webDescription = null,
  webIsPublished,
  isTransitionMode = false,
}: Props) => {
  const isMobile = useIsMobile()
  const [isWebModeDefault] = useLocalStorage('is-web-mode', undefined)
  const [isVolunteer, setIsVolunteer] = useState(false)
  const selectedWebSlug = useSelectedWebSlug()

  const [query, setQuery] = useQueryParams({
    categories: withDefault(ArrayParam, []),
    tags: withDefault(ArrayParam, []),
    web: withDefault(BooleanParam, isWebModeDefault),
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
      return {
        value: categoryLabel,
        label: categoryLabel,
        color: categories.find((c: Category) => c.label === categoryLabel)
          ?.color,
      }
    })
  }, [categories, query.categories])
  const selectedTags = useMemo(() => {
    return query.tags.map((tagLabel) => ({
      value: tagLabel,
      label: tagLabel,
      color: tags.find((t) => t.label === tagLabel)?.color,
    }))
  }, [tags, query.tags])

  const [selectedId, setSelectedId] = useState()

  const { categories: fetchedCategories } = useCategoriesPublic({
    webSlug: selectedWebSlug,
  })
  const { tags: fetchedTags } = useTagsPublic()

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
      fetchedTags.map((t) => ({
        value: t.label,
        label: t.label,
        // @ts-ignore
        color: t.color ?? '#2f2f30',
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

  const descriptiveNodes = useMemo(
    () =>
      data
        ? data.nodes
            .filter(
              (item) =>
                item.group === 'category' || item.group === 'central-node',
            )
            .filter(
              (item) =>
                item.id === CENTRAL_NODE_ID ||
                query.categories.length === 0 ||
                query.categories.some((l) => l === item.label),
            )
        : [],
    [data, query.categories],
  )

  const [filteredItems, filteredDescriptiveNodes] = useMemo(() => {
    if (!data) return []
    let results: any[] = data?.nodes
      .filter(
        (item) => item.group !== 'category' && item.group !== 'central-node',
      )
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
        return intersection([query.tags, itemTags]).length > 0
      })
    }

    if (searchTermValue) {
      results = results.filter((item) =>
        removeNonAlphaNumeric(item.label)
          .toLowerCase()
          .includes(searchTermValue.toLowerCase()),
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
            descriptiveNode.group === 'central-node',
        ),
    )

    return [results, filteredDescriptiveNodes]
  }, [
    data,
    descriptiveNodes,
    isVolunteer,
    query.categories,
    query.tags,
    searchTermValue,
  ])

  const filteredNetworkData = useMemo(
    () => ({
      edges: data?.edges,
      nodes: [...filteredItems, ...filteredDescriptiveNodes],
    }),
    [data?.edges, filteredItems, filteredDescriptiveNodes],
  )

  const handleSwitchChange = useCallback(
    (event) => {
      setSelectedId(null)
      setQuery({ web: !(event.target.value == 'true') })
    },
    [setQuery],
  )

  const handleVolunteerSwitchChange = useCallback(
    (event) => {
      setSelectedId(null)
      setIsVolunteer(event.target.checked)
    },
    [setIsVolunteer],
  )

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
          isTransitionMode={isTransitionMode}
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
          isWebMode={query.web}
          searchTerm={searchTerm}
          selectedWebName={webName}
        />
        {query.web && (
          <NetworkComponent
            data={filteredNetworkData}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
          />
        )}

        {!query.web && <MainList filteredItems={filteredItems} />}
      </Box>
    </>
  )
}

export default memo(Web)
