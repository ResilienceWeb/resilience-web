import { useCallback, useEffect, useState, useMemo, memo } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { NextSeo } from 'next-seo'
import groupBy from 'lodash/groupBy'
import { Box, Center, Spinner } from '@chakra-ui/react'
import { useDebounce } from 'use-debounce'
import intersection from 'lodash/intersection'
import useLocalStorage from 'use-local-storage'

import type { GetStaticPaths, GetStaticProps } from 'next'
import type { ParsedUrlQuery } from 'querystring'

import { selectMoreAccessibleColor } from '@helpers/colors'
import { useAppContext } from '@store/hooks'
import { REMOTE_URL, PROTOCOL, REMOTE_HOSTNAME } from '@helpers/config'
import { encodeUriElements, decodeUriElements } from '@helpers/routes'
import MainList from '@components/main-list'
import { removeNonAlphaNumeric, sortStringsFunc } from '@helpers/utils'
import { useCategories } from '@hooks/categories'
import { useTags } from '@hooks/tags'

const NetworkComponent = dynamic(() => import('@components/network'), {
  ssr: false,
})
const Drawer = dynamic(() => import('@components/drawer'), {
  ssr: false,
})
const Header = dynamic(() => import('@components/header'), {
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

const Web = ({ data, selectedWebName }) => {
  const router = useRouter()

  const { isMobile } = useAppContext()
  const [isWebMode, setIsWebMode] = useLocalStorage('is-web-mode', undefined)
  const [isVolunteer, setIsVolunteer] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [searchTermValue] = useDebounce(searchTerm, 500)
  const handleSearchTermChange = useCallback(
    (event) => setSearchTerm(event.target.value),
    [],
  )
  const handleClearSearchTermValue = useCallback(() => setSearchTerm(''), [])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [categories, setCategories] = useState({})

  const [selectedTags, setSelectedTags] = useState([])
  const [tags, setTags] = useState([])

  const [selectedId, setSelectedId] = useState()
  const [_network, setNetwork] = useState<INetwork>()

  const { categories: fetchedCategories } = useCategories()
  const { tags: fetchedTags } = useTags()

  useEffect(() => {
    const tagsFromQueryParam = router.query.tags
    if (!tagsFromQueryParam) {
      return
    }

    const tagValuesArray = decodeUriElements(tagsFromQueryParam as string)
    const fullTagsFromQuery = tags.filter((t) =>
      tagValuesArray.includes(t.value),
    )
    setTimeout(() => setSelectedTags(fullTagsFromQuery), 1000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname, router.query.tags, tags])

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

  const handleCategorySelection = useCallback((value) => {
    setSelectedCategories(value)
  }, [])

  const [subdomain, setSubdomain] = useState<string>()

  useEffect(() => {
    const hostname = window.location.hostname
    if (!hostname.includes('.')) {
      return null
    }

    setSubdomain(hostname.split('.')[0])
  }, [])

  const handleTagSelection = useCallback(
    (value) => {
      const tagsLabels = value.map((t) => t.value)
      const uriEncodedTags = encodeUriElements(tagsLabels)
      void router.replace({
        pathname: `${PROTOCOL}://${subdomain}.${REMOTE_HOSTNAME}`,
        query: { tags: uriEncodedTags },
      })
      setSelectedTags(value)
    },
    [router, subdomain],
  )

  const filteredItems = useMemo(() => {
    if (!data) return []
    let results = data?.nodes
      .filter((item) => !item.isDescriptive && !item.inactive)
      .sort(sortStringsFunc)

    if (isVolunteer) {
      results = results.filter((item) => item.seekingVolunteers)
    }

    if (selectedCategories.length > 0) {
      const categories = selectedCategories.map((c) => c.label)
      results = results.filter((item) =>
        categories.includes(item.category.label),
      )
    }

    if (selectedTags.length > 0) {
      const tags = selectedTags.map((c) => c.label)
      results = results.filter((item) => {
        const itemTags = item.tags.map((c) => c.label)
        return intersection(tags, itemTags).length > 0
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
  }, [data, isVolunteer, selectedCategories, selectedTags, searchTermValue])

  const descriptiveNodes = useMemo(
    () =>
      data
        ? data.nodes
            .filter((item) => item.isDescriptive)
            .filter(
              (item) =>
                item.id === CENTRAL_NODE_ID ||
                selectedCategories.length === 0 ||
                selectedCategories.some(
                  (category) => category.label === item.label,
                ),
            )
        : [],
    [data, selectedCategories],
  )

  const filteredNetworkData = useMemo(
    () => ({
      edges: data?.edges,
      nodes: [...filteredItems, ...descriptiveNodes],
    }),
    [data?.edges, filteredItems, descriptiveNodes],
  )

  // const selectNode = useCallback(
  //     (id) => {
  //         if (!network) return
  //         network.selectNodes([id])
  //         setSelectedId(id)
  //     },
  //     [network],
  // )

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
        title={`${selectedWebName} | Resilience Web`}
        openGraph={{ title: `${selectedWebName} | Resilience Web` }}
      />
      {!isMobile && (
        <Drawer
          categories={categories}
          tags={tags}
          selectedTags={selectedTags}
          handleCategorySelection={handleCategorySelection}
          handleTagSelection={handleTagSelection}
          handleClearSearchTermValue={handleClearSearchTermValue}
          handleSearchTermChange={handleSearchTermChange}
          handleVolunteerSwitchChange={handleVolunteerSwitchChange}
          isVolunteer={isVolunteer}
          searchTerm={searchTerm}
        />
      )}
      <Box height="100vh" ml={isMobile ? '0' : '18.75rem'} position="relative">
        <Header
          categories={categories}
          handleCategorySelection={handleCategorySelection}
          handleClearSearchTermValue={handleClearSearchTermValue}
          handleSearchTermChange={handleSearchTermChange}
          handleSwitchChange={handleSwitchChange}
          handleTagSelection={handleTagSelection}
          isMobile={isMobile}
          isWebMode={isWebMode}
          searchTerm={searchTerm}
          tags={tags}
          selectedTags={selectedTags}
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
  const response = await fetch(`${REMOTE_URL}/api/webs`)
  const data = await response.json()
  const { webs } = data
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

  const { webs } = await fetch(`${REMOTE_URL}/api/webs`).then((res) =>
    res.json(),
  )

  const paths = webs.map((l) => `${l.slug}`)
  if (!paths.includes(web)) {
    return { notFound: true, revalidate: 30 }
  }

  const { listings } = await fetch(
    `${REMOTE_URL}/api/listings?web=${web}`,
  ).then((res) => res.json())

  const { web: webData } = await fetch(`${REMOTE_URL}/api/webs/${web}`).then(
    (res) => res.json(),
  )

  const transformedData = {
    nodes: [],
    edges: [],
  }

  listings?.map(
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
      email,
      seekingVolunteers,
      inactive,
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
        email,
        seekingVolunteers,
        inactive,
        category: {
          color: `#${category.color}`,
          label: category.label,
        },
        slug,
        tags,
        relations,
        // below are for vis-network node styling and data
        label: title,
        color: `#${category.color}`,
        font: {
          color: accessibleTextColor,
          size: 28,
        },
        opacity: inactive ? 0.4 : 1,
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

  return {
    props: {
      data: transformedData,
      selectedWebName: webData.title,
    },
    revalidate: 30,
  }
}

export default memo(Web)
