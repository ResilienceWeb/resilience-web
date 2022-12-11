import { useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import {
  Box,
  Spinner,
  Center,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'

import LayoutContainer from '@components/admin/layout-container'
import { useCategories } from '@hooks/categories'
import { useTags } from '@hooks/tags'
import CategoriesHeader from '@components/admin/categories/header'
import CategoriesList from '@components/admin/categories/list'
import TagsHeader from '@components/admin/tags/header'
import TagsList from '@components/admin/tags/list'
import { useHasPermissionForCurrentWeb } from '@hooks/permissions'

const LoadingSpinner = () => (
  <LayoutContainer>
    <Center height="100%">
      <Spinner size="xl" />
    </Center>
  </LayoutContainer>
)

export default function Categories() {
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const { categories, isLoading: isLoadingCategories } = useCategories()
  const { tags, isLoading: isLoadingTags } = useTags()
  const hasPermissionForCurrentWeb = useHasPermissionForCurrentWeb()

  const orderedCategories = useMemo(() => {
    return categories?.sort((a, b) => a.label.localeCompare(b.label))
  }, [categories])

  if (sessionStatus === 'loading') {
    return <LoadingSpinner />
  }

  if (!session) {
    return (
      <LayoutContainer>
        <Alert status="warning">
          <AlertIcon />
          You don't have access to edit Categories & Tags for this site.
        </Alert>
      </LayoutContainer>
    )
  }

  if (!hasPermissionForCurrentWeb) {
    void router.push('/admin')
  }

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
