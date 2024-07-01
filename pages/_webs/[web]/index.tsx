import { useCallback, useEffect, useState, useMemo, memo } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { NextSeo } from 'next-seo'
import groupBy from 'lodash/groupBy'
import { Box, Center, Spinner } from '@chakra-ui/react'
import { useDebounce } from 'use-debounce'
import intersection from 'lodash/intersection'
import useLocalStorage from 'use-local-storage'
import { dehydrate, QueryClient } from '@tanstack/react-query'
import { useQueryParams, ArrayParam, withDefault } from 'use-query-params'

import type { GetStaticPaths, GetStaticProps } from 'next'
import type { ParsedUrlQuery } from 'querystring'

import Header from '@components/header'
import { selectMoreAccessibleColor } from '@helpers/colors'
import { useIsMobile } from '@hooks/application'
import { REMOTE_URL } from '@helpers/config'
import MainList from '@components/main-list'
import AlertBanner from '@components/alert-banner'
import { removeNonAlphaNumeric, sortStringsFunc } from '@helpers/utils'
import { useCategories } from '@hooks/categories'
import { fetchCategoriesHydrate } from '@hooks/categories/useCategories'
import { fetchTagsHydrate } from '@hooks/tags/useTags'
import { fetchWebsHydrate } from '@hooks/webs/useWebs'
import { useTags } from '@hooks/tags'

const NetworkComponent = dynamic(() => import('@components/network'), {
  ssr: false,
})
const Drawer = dynamic(() => import('@components/drawer'), {
  ssr: false,
})

interface PathProps extends ParsedUrlQuery {
  web: string
}

interface WebProps {
  data: {
    nodes: any[]
    edges: any[]
  }
}

type INetwork = {
  selectNodes: (ids: string[]) => void
}

const CENTRAL_NODE_ID = 999

const Web = ({ data, webName, webImage, webDescription, webIsPublished }) => {
  const router = useRouter()

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

  const [categories, setCategories] = useState({})
  const [tags, setTags] = useState([])

  const selectedCategories = useMemo(() => {
    return query.categories.map((categoryLabel) => ({
      value: categoryLabel,
      label: categoryLabel,
    }))
  }, [query.categories])
  const selectedTags = useMemo(() => {
    return query.tags.map((tagLabel) => ({
      value: tagLabel,
      label: tagLabel,
    }))
  }, [query.tags])

  const [selectedId, setSelectedId] = useState()
  const [_network, setNetwork] = useState<INetwork>()

  const { categories: fetchedCategories } = useCategories()
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

  if (router.isFallback) {
    return (
      <Center height="100vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  return (
    <>
      <NextSeo
        title={`${webName} | Resilience Web`}
        openGraph={{
          title: `${webName} | Resilience Web`,
          images: [{ url: webImage }],
        }}
      />
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

export const getStaticPaths: GetStaticPaths<PathProps> = async () => {
  const BASE_URL =
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
      ? 'https://resilienceweb.org.uk'
      : REMOTE_URL

  const response = await fetch(`${BASE_URL}/api/webs`)
  const responseJson = await response.json()
  const { data: webs } = responseJson
  const paths = webs.map((l) => `/${l.slug}`)

  return {
    paths: paths.map((path) => ({
      params: {
        web: path,
      },
    })),
    fallback: true,
  }
}

const startsWithCapitalLetter = (word) =>
  word.charCodeAt(0) >= 65 && word.charCodeAt(0) <= 90

export const getStaticProps: GetStaticProps<WebProps, PathProps> = async ({
  params,
}) => {
  if (!params) throw new Error('No path parameters found')
  const { web } = params

  const BASE_URL =
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
      ? 'https://resilienceweb.org.uk'
      : REMOTE_URL

  const { data: webs } = await fetch(`${BASE_URL}/api/webs`)
    .then((res) => res.json())
    .catch((e) =>
      console.error('Failed to fetch data from', `${BASE_URL}/api/webs`, e),
    )

  const paths = webs.map((l) => `${l.slug}`)
  if (!paths.includes(web)) {
    return { notFound: true, revalidate: 30 }
  }

  const { listings } = await fetch(`${BASE_URL}/api/listings?web=${web}`)
    .then((res) => res.json())
    .catch((e) =>
      console.error(
        'Failed to fetch data from',
        `${BASE_URL}/api/listings?web=${web}`,
        e,
      ),
    )

  const { web: webData } = await fetch(`${BASE_URL}/api/webs/${web}`)
    .then((res) => res.json())
    .catch((e) =>
      console.error(
        'Failed to fetch data from',
        `${BASE_URL}/api/webs/${web}`,
        e,
      ),
    )

  const transformedData = {
    nodes: [],
    edges: [],
  }

  listings
    ?.filter((l) => !l.pending && !l.inactive)
    ?.map(
      ({
        id,
        title,
        category,
        description,
        image,
        website,
        facebook,
        twitter,
        instagram,
        seekingVolunteers,
        featured,
        slug,
        tags,
        relations,
      }) => {
        const accessibleTextColor = selectMoreAccessibleColor(
          `#${category.color}`,
          '#3f3f40',
          '#fff',
        )
        transformedData.nodes.push({
          id,
          title,
          description,
          image: image ?? '',
          website,
          facebook,
          twitter,
          instagram,
          seekingVolunteers,
          featured,
          category: {
            color: `#${category.color}`,
            label: category.label,
          },
          slug,
          tags,
          // below are for vis-network node styling and data
          label: title,
          color: `#${category.color}`,
          font: {
            color: accessibleTextColor,
            size: 28,
          },
        })

        relations.map((relation) => {
          const newEdge = {
            from: id,
            to: relation.id,
            dashes: true,
            physics: false,
            smooth: {
              enabled: true,
              type: 'continuous',
              roundness: 0,
            },
          }
          if (
            !transformedData.edges.find(
              (e) => e.from === newEdge.to && e.to === newEdge.from,
            )
          ) {
            transformedData.edges.push(newEdge)
          }
        })
      },
    )

  let groupedByCategory = groupBy(
    transformedData.nodes,
    (n) => n.category.label,
  )

  groupedByCategory = Object.fromEntries(
    Object.entries(groupedByCategory).filter(([key]) => {
      return (
        key.length > 0 && key !== 'undefined' && startsWithCapitalLetter(key)
      )
    }),
  )

  // Main node
  transformedData.nodes.push({
    id: CENTRAL_NODE_ID,
    label: webData.title,
    color: '#fcba03',
    isDescriptive: true,
    font: {
      size: 56,
    },
    fixed: {
      x: true,
      y: true,
    },
  })

  let categoryIndex = 1
  for (const category in groupedByCategory) {
    const categoryId = categoryIndex * 1000
    transformedData.nodes.push({
      id: categoryId,
      label: category,
      color: '#c3c4c7',
      isDescriptive: true,
      shape: 'ellipse',
      mass: 3,
    })
    categoryIndex++

    // From main node to category node
    transformedData.edges.push({
      from: CENTRAL_NODE_ID,
      to: categoryId,
      width: 2,
      selectedWidth: 3,
      length: 600,
      smooth: {
        enabled: true,
        type: 'continuous',
        roundness: 0,
      },
    })

    // From category node to all subitems
    groupedByCategory[category].forEach((item) => {
      transformedData.edges.push({
        from: categoryId,
        to: item.id,
      })
    })
  }

  if (!transformedData) {
    return { notFound: true, revalidate: 30 }
  }

  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({
    queryKey: ['webs'],
    queryFn: () => fetchWebsHydrate({ published: true }),
  })
  await queryClient.prefetchQuery({
    queryKey: ['categories', { webSlug: webData.slug }],
    queryFn: () => fetchCategoriesHydrate({ webSlug: webData.slug }),
  })
  await queryClient.prefetchQuery({
    queryKey: ['tags', { webSlug: webData.slug }],
    queryFn: () => fetchTagsHydrate({ webSlug: webData.slug }),
  })

  return {
    props: {
      data: transformedData,
      webName: webData.title,
      webImage: webData.image,
      webDescription: webData.description,
      webIsPublished: webData.published,
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 30,
  }
}

export default memo(Web)
