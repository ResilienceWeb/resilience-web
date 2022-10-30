import { useRouter } from 'next/router'
import { useCallback, useState, useMemo, memo } from 'react'
import { Heading, Text, Box, Stack } from '@chakra-ui/react'

import DeleteConfirmationDialog from './delete-confirmation-dialog'
import { removeNonAlphaNumeric } from '@helpers/utils'
import Table from './table/Table'
import TableActions from './table/TableActions'
import { usePermissions } from '@hooks/permissions'
import { useAppContext } from '@store/hooks'
import { useSites } from '@hooks/sites'

const EditableList = ({ deleteListing, isAdmin, items }) => {
  const router = useRouter()
  const { permissions } = usePermissions()
  const { sites } = useSites()
  const { selectedLocationId } = useAppContext()
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

  const explanatoryText = useMemo(() => {
    if (isAdmin) {
      return 'You are an admin. You can see all the listings on each site, as well as invite people, or edit categories or tags on each site.'
    }

    const selectedSiteName = sites.find(
      (s) => s.id === selectedLocationId,
    ).title
    if (permissions.siteIds.includes(selectedLocationId)) {
      return `You have access to edit any listing on the ${selectedSiteName} site.`
    }

    return 'You have access to edit the listings below. If you think you should be able to edit a group not included below, please get in touch at cambridgeresilienceweb@gmail.com.'
  }, [isAdmin, permissions.siteIds, selectedLocationId, sites])

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
          <Text color={'gray.600'} fontSize="sm">
            {explanatoryText}
          </Text>
        </Box>
        <TableActions
          searchTerm={searchTerm}
          handleSearchTermChange={handleSearchTermChange}
          goToCreateListing={goToCreateListing}
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
