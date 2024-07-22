import { useRouter } from 'next/navigation'
import NextLink from 'next/link'
import { useCallback, useState, useMemo, memo } from 'react'
import { Heading, Text, Box, Center, Link } from '@chakra-ui/react'

import DeleteConfirmationDialog from './delete-confirmation-dialog'
import { removeNonAlphaNumeric } from '@helpers/utils'
import Table from './table/Table'
import TableActions from './table/TableActions'
import { usePermissions } from '@hooks/permissions'
import { useAppContext } from '@store/hooks'
import { useWebs } from '@hooks/webs'
import { PROTOCOL, REMOTE_HOSTNAME } from '@helpers/config'

const EditableList = ({ deleteListing, isAdmin, items }) => {
  const router = useRouter()
  const { permissions } = usePermissions()
  const { webs } = useWebs()
  const { selectedWebId, selectedWebSlug } = useAppContext()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<Array<any>>([])
  const [
    isDeleteConfirmationOpenWithSlug,
    setIsDeleteConfirmationOpenWithSlug,
  ] = useState<any>()

  const filteredItems = useMemo(() => {
    if (!items) return []

    let results = items.filter((item) =>
      removeNonAlphaNumeric(item.title)
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
    )

    if (selectedCategories.length > 0) {
      const categories = selectedCategories.map((c) => c.label)
      results = results.filter((item) =>
        categories.includes(item.category.label),
      )
    }

    return results
      .sort((a, b) => a.title.localeCompare(b.title))
      .sort((a, b) => b.pending - a.pending)
  }, [items, searchTerm, selectedCategories])

  const goToEdit = useCallback(
    (dataItem) => {
      router.push(`/admin/${dataItem.slug}`)
    },
    [router],
  )

  const goToCreateListing = useCallback(() => {
    router.push('/admin/new-listing')
  }, [router])

  const openRemoveDialog = useCallback((slug) => {
    setIsDeleteConfirmationOpenWithSlug(slug)
  }, [])
  const closeRemoveDialog = useCallback(() => {
    setIsDeleteConfirmationOpenWithSlug(null)
  }, [])

  const handleRemove = useCallback(() => {
    deleteListing({
      slug: isDeleteConfirmationOpenWithSlug,
      webId: selectedWebId,
    })
    closeRemoveDialog()
  }, [
    closeRemoveDialog,
    deleteListing,
    isDeleteConfirmationOpenWithSlug,
    selectedWebId,
  ])

  const handleSearchTermChange = useCallback((event) => {
    setSearchTerm(event.target.value)
  }, [])

  const handleSelectedCategoriesChange = useCallback((value) => {
    setSelectedCategories(value)
  }, [])

  const explanatoryText = useMemo(() => {
    if (isAdmin) {
      return 'You are an admin. You can see all the listings on each web, as well as invite people, or edit categories or tags on each web.'
    }

    const selectedWebName = webs?.find((s) => s.id === selectedWebId)?.title

    if (permissions?.webIds?.includes(selectedWebId)) {
      return `You have access to edit any listing or add new listings on the ${selectedWebName} Resilience Web.`
    }

    return null
  }, [isAdmin, permissions?.webIds, selectedWebId, webs])

  if (!filteredItems) {
    return null
  }

  return (
    <>
      <Box mb="1rem">
        <Heading>Listings</Heading>
        <Text color={'gray.600'} fontSize="sm" maxW="500px">
          {explanatoryText}
        </Text>
        <Text color={'gray.600'} fontSize="sm" maxW="500px" mt="1rem">
          This web is publicly accessible at{' '}
          <Link
            href={`${PROTOCOL}://${selectedWebSlug}.${REMOTE_HOSTNAME}`}
            target="_blank"
            fontWeight={600}
            color="rw.900"
          >
            {`${selectedWebSlug}.${REMOTE_HOSTNAME}`}
          </Link>
        </Text>
      </Box>
      <TableActions
        searchTerm={searchTerm}
        handleSearchTermChange={handleSearchTermChange}
        goToCreateListing={goToCreateListing}
        handleSelectedCategoriesChange={handleSelectedCategoriesChange}
      />
      {filteredItems.length > 0 ? (
        <Table
          goToEdit={goToEdit}
          removeItem={openRemoveDialog}
          items={filteredItems}
        />
      ) : (
        <Center my="3rem">
          <Text fontWeight="700">
            No listings yet. Why not{' '}
            <Link as={NextLink} href="/admin/new-listing" color="rw.900">
              start adding
            </Link>
            .
          </Text>
        </Center>
      )}
      <DeleteConfirmationDialog
        isOpen={isDeleteConfirmationOpenWithSlug}
        onClose={closeRemoveDialog}
        handleRemove={handleRemove}
      />
    </>
  )
}

export default memo(EditableList)
