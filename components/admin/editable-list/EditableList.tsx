import { useRouter } from 'next/router'
import { useCallback, useState, useMemo, memo } from 'react'
import { Heading, Text, Box, Stack } from '@chakra-ui/react'

import DeleteConfirmationDialog from './delete-confirmation-dialog'
import { removeNonAlphaNumeric } from '@helpers/utils'
import Table from './table/Table'
import TableActions from './table/TableActions'

const EditableList = ({ deleteListing, isAdmin, items }) => {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [isDeleteConfirmationOpenWithId, setIsDeleteConfirmationOpenWithId] =
    useState()

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
  }, [items, searchTerm, selectedCategories])

  const goToEdit = useCallback(
    async (dataItem) => {
      await router.push(`/admin/${dataItem.slug}`)
    },
    [router],
  )

  const goToCreateListing = useCallback(async () => {
    await router.push('/admin/new-listing')
  }, [router])

  const openRemoveDialog = useCallback((id) => {
    setIsDeleteConfirmationOpenWithId(id)
  }, [])
  const closeRemoveDialog = useCallback(() => {
    setIsDeleteConfirmationOpenWithId(null)
  }, [])

  const handleRemove = useCallback(() => {
    deleteListing({ id: isDeleteConfirmationOpenWithId })
    closeRemoveDialog()
  }, [closeRemoveDialog, deleteListing, isDeleteConfirmationOpenWithId])

  const handleSearchTermChange = useCallback((event) => {
    setSearchTerm(event.target.value)
  }, [])

  const handleSelectedCategoriesChange = useCallback((value) => {
    setSelectedCategories(value)
  }, [])

  if (!filteredItems) return null

  return (
    <>
      <Stack
        spacing="5"
        direction={{
          base: 'column',
          md: 'row',
        }}
        justify="space-between"
        align={{
          base: 'flex-start',
          md: 'center',
        }}
      >
        <Box px={4}>
          <Heading>Listings</Heading>
          {isAdmin ? (
            <Text color={'gray.600'} fontSize="sm">
              There are {filteredItems.length} listings
            </Text>
          ) : (
            <Text color={'gray.600'} fontSize="sm">
              The list below only includes groups that you have edit access to.
              If you think you should be able to edit a group not included
              below, please get in touch at cambridgeresilienceweb@gmail.com
            </Text>
          )}
        </Box>
        <TableActions
          searchTerm={searchTerm}
          handleSearchTermChange={handleSearchTermChange}
          goToCreateListing={goToCreateListing}
          selectedCategories={selectedCategories}
          handleSelectedCategoriesChange={handleSelectedCategoriesChange}
        />
      </Stack>
      <Table
        goToEdit={goToEdit}
        removeItem={openRemoveDialog}
        items={filteredItems}
      />
      <DeleteConfirmationDialog
        isOpen={isDeleteConfirmationOpenWithId}
        onClose={closeRemoveDialog}
        handleRemove={handleRemove}
      />
    </>
  )
}

export default memo(EditableList)
