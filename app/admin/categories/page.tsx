'use client'
import { useMemo } from 'react'
import {
  Box,
  Spinner,
  Center,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react'
import CategoriesHeader from '@components/admin/categories/header'
import CategoriesList from '@components/admin/categories/list'
import TagsHeader from '@components/admin/tags/header'
import TagsList from '@components/admin/tags/list'
import { useCategories } from '@hooks/categories'
import { useTags } from '@hooks/tags'

export default function Page() {
  const { tags, isPending: isTagsPending } = useTags()
  const { categories, isPending: isCategoriesPending } = useCategories()

  const orderedCategories = useMemo(() => {
    return categories?.sort((a, b) => a.label.localeCompare(b.label))
  }, [categories])

  if (isCategoriesPending) {
    return (
      <Center height="50vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  return (
    <Tabs colorScheme="rw">
      <TabList>
        <Tab>Categories</Tab>
        <Tab>Tags</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <Box mt={6}>
            <CategoriesHeader />
            <CategoriesList categories={orderedCategories} />
          </Box>
        </TabPanel>
        <TabPanel>
          <Box mt={6}>
            <TagsHeader />
            {isTagsPending ? <Spinner size="xl" /> : <TagsList tags={tags} />}
          </Box>
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}
