import { useMemo } from 'react'
import { useSession } from 'next-auth/react'
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
import LayoutContainer from '@components/admin/layout-container'
import { useCategories } from '@hooks/categories'
import { useTags } from '@hooks/tags'
import CategoriesHeader from '@components/admin/categories/header'
import CategoriesList from '@components/admin/categories/list'
import TagsHeader from '@components/admin/tags/header'
import TagsList from '@components/admin/tags/list'

const LoadingSpinner = () => (
  <LayoutContainer>
    <Center height="100%">
      <Spinner size="xl" />
    </Center>
  </LayoutContainer>
)

export default function Categories() {
  const { data: session, status: sessionStatus } = useSession()
  const { categories, isLoading: isLoadingCategories } = useCategories()
  const { tags, isLoading: isLoadingTags } = useTags()

  const orderedCategories = useMemo(() => {
    return categories?.sort((a, b) => a.label.localeCompare(b.label))
  }, [categories])

  if (sessionStatus === 'loading') {
    return <LoadingSpinner />
  }

  if (!session || !session.user.admin) return null

  return (
    <LayoutContainer>
      <Box
        px={{
          base: '4',
          md: '10',
        }}
        py={4}
        maxWidth="3xl"
        mx="auto"
      >
        <Tabs>
          <TabList>
            <Tab>Categories</Tab>
            <Tab>Tags</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Box mt={6}>
                <CategoriesHeader />
                {isLoadingCategories ? (
                  <LoadingSpinner />
                ) : (
                  <CategoriesList categories={orderedCategories} />
                )}
              </Box>
            </TabPanel>
            <TabPanel>
              <Box mt={6}>
                <TagsHeader />
                {isLoadingTags ? <LoadingSpinner /> : <TagsList tags={tags} />}
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </LayoutContainer>
  )
}
