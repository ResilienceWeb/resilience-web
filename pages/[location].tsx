/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-mixed-spaces-and-tabs */
import dynamic from 'next/dynamic'
import { GetStaticProps, GetStaticPaths } from 'next'
import { useRouter } from 'next/router'
import {
    useCallback,
    useContext,
    useEffect,
    useState,
    useMemo,
    memo,
} from 'react'
import { Box } from '@chakra-ui/react'
import { useDebounce } from 'use-debounce'
import groupBy from 'lodash/groupBy'

import MainList from '@components/main-list'
import { REMOTE_URL } from '@helpers/config'
import { removeNonAlphaNumeric, sortStringsFunc } from '@helpers/utils'
import { useCategories } from '@hooks/categories'
import { AppContext } from '@store/AppContext'
import Layout from '@components/layout'

const NetworkComponent = dynamic(() => import('../components/network'), {
    ssr: false,
})
const Drawer = dynamic(() => import('@components/drawer'), {
    ssr: false,
})
const Header = dynamic(() => import('@components/header'), {
    ssr: false,
})

type INetwork = {
    selectNodes: (ids: string[]) => void
}

const City = ({ data }) => {
    const router = useRouter()
    if (router.isFallback) {
        return (
            <Layout>
                <h1>Please wait…</h1>
            </Layout>
        )
    }

    const { isMobile } = useContext(AppContext)

    const [isWebMode, setIsWebMode] = useState(undefined)
    const [isVolunteer, setIsVolunteer] = useState(false)

    const [searchTerm, setSearchTerm] = useState('')
    const [searchTermValue] = useDebounce(searchTerm, 500)
    const handleSearchTermChange = useCallback((event) => {
        setSearchTerm(event.target.value)
    }, [])
    const [selectedCategories, setSelectedCategories] = useState([])
    const [categories, setCategories] = useState({})

    const [selectedId, setSelectedId] = useState()
    const [network, setNetwork] = useState<INetwork>()

    const { categories: fetchedCategories } = useCategories()

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

    const handleCategorySelection = useCallback((value) => {
        setSelectedCategories(value)
    }, [])

    const filteredItems = useMemo(() => {
        let results = data.nodes
            .filter((item) => !item.isDescriptive)
            .sort(sortStringsFunc)

        if (isVolunteer) {
            results = results.filter((item) => item.seekingVolunteers)
        }

        if (selectedCategories.length > 0) {
            const categories = selectedCategories.map((c) => c.label)
            results = results.filter((item) =>
                categories.includes(item.category),
            )
        }

        if (searchTermValue) {
            results = results.filter((item) =>
                removeNonAlphaNumeric(item.title)
                    .toLowerCase()
                    .includes(searchTermValue.toLowerCase()),
            )
        }

        return results
    }, [data.nodes, isVolunteer, selectedCategories, searchTermValue])

    const descriptiveNodes = useMemo(
        () => data.nodes.filter((item) => item.isDescriptive),
        [data.nodes],
    )

    const filteredNetworkData = useMemo(
        () => ({
            edges: data.edges,
            nodes: [...filteredItems, ...descriptiveNodes],
        }),
        [data.edges, filteredItems, descriptiveNodes],
    )

    const selectNode = useCallback(
        (id) => {
            if (!network) return
            network.selectNodes([id])
            setSelectedId(id)
        },
        [network],
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
            setIsVolunteer(!(event.target.value == 'true'))
        },
        [setIsVolunteer],
    )

    return (
        <>
            {isWebMode && (
                <Drawer items={filteredItems} selectNode={selectNode} />
            )}
            <Box
                height="100vh"
                ml={isWebMode ? '18.75rem' : '0'}
                position="relative"
            >
                <Header
                    categories={categories}
                    handleCategorySelection={handleCategorySelection}
                    handleSearchTermChange={handleSearchTermChange}
                    handleSwitchChange={handleSwitchChange}
                    handleVolunteerSwitchChange={handleVolunteerSwitchChange}
                    isMobile={isMobile}
                    isWebMode={isWebMode}
                    isVolunteer={isVolunteer}
                    searchTerm={searchTerm}
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
                    <MainList
                        filteredItems={filteredItems}
                        isMobile={isMobile}
                    />
                )}
            </Box>
        </>
    )
}

const startsWithCapitalLetter = (word) =>
    word.charCodeAt(0) >= 65 && word.charCodeAt(0) <= 90

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const { listings } = await fetch(
        `${REMOTE_URL}/api/listings?location=${params.location}`,
    ).then((res) => res.json())

    const { location } = await fetch(
        `${REMOTE_URL}/api/locations/${params.location}`,
    ).then((res) => res.json())

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
        }) => {
            transformedData.nodes.push({
                id,
                label: title,
                title,
                category: category.label,
                description,
                image: image ?? '',
                website,
                facebook,
                twitter,
                instagram,
                email,
                seekingVolunteers,
                inactive,
                color: `#${category.color}`,
                slug,
            })
        },
    )

    let groupedByCategory = groupBy(transformedData.nodes, 'category')

    groupedByCategory = Object.fromEntries(
        Object.entries(groupedByCategory).filter(([key]) => {
            return (
                key.length > 0 &&
                key !== 'undefined' &&
                startsWithCapitalLetter(key)
            )
        }),
    )

    // Main node
    transformedData.nodes.push({
        id: 999,
        label: location.centralNodeLabel,
        color: '#fcba03',
        isDescriptive: true,
        font: {
            size: 46,
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
        })
        categoryIndex++

        // From main node to category node
        transformedData.edges.push({
            from: 999,
            to: categoryId,
            length: 2000,
        })

        // From category node to all subitems
        groupedByCategory[category].map((item) => {
            transformedData.edges.push({
                from: categoryId,
                to: item.id,
            })
        })
    }

    return {
        props: {
            data: transformedData,
        },
        revalidate: 5,
    }
}

export const getStaticPaths: GetStaticPaths = async () => {
    const response = await fetch(`${REMOTE_URL}/api/locations`)
    const data = await response.json()
    const { locations } = data
    const paths = locations.map((l) => `/${l.slug}`)

    return {
        paths,
        fallback: true,
    }
}

export default memo(City)
