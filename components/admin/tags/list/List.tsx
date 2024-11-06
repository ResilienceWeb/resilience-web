import {
  TableContainer,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Stack,
  Button,
  useDisclosure,
} from '@chakra-ui/react'
import { memo, useCallback, useState } from 'react'

import useUpdateTag from '@hooks/tags/useUpdateTag'
import useDeleteTag from '@hooks/tags/useDeleteTag'
import useAddTagToListings from '@hooks/tags/useAddTagToListings'
import useListings from '@hooks/listings/useListings'
import { UpdateTagDialog } from '../header/tag-dialog'
import AddTagToListingsDialog from './add-to-listings-dialog'

const columns = [
  {
    Header: 'Tag label',
    accessor: 'label',
  },
  {
    Header: 'Number of listings',
    accessor: 'listings',
  },
]

const List = ({ tags }) => {
  const {
    isOpen: isUpdateTagDialogOpen,
    onOpen: onUpdateTagDialogOpen,
    onClose: onUpdateTagDialogClose,
  } = useDisclosure()
  const {
    isOpen: isAddToListingsDialogOpen,
    onOpen: onAddToListingsDialogOpen,
    onClose: onAddToListingsDialogClose,
  } = useDisclosure()
  const { listings, isPending: isLoadingListings } = useListings()
  const { mutate: updateTag } = useUpdateTag()
  const { mutate: deleteTag } = useDeleteTag()
  const { mutate: addTagToListings } = useAddTagToListings()

  const [selectedTagId, setSelectedTagId] = useState(null)
  const selectedTag = tags.find((tag) => tag.id === selectedTagId)

  const handleOpenUpdateTagDialog = (tagId) => {
    setSelectedTagId(tagId)
    onUpdateTagDialogOpen()
  }

  const handleSubmit = useCallback(
    (data) => {
      onUpdateTagDialogClose()
      updateTag({
        ...data,
        id: selectedTagId,
      })
    },
    [onUpdateTagDialogClose, updateTag, selectedTagId],
  )

  const handleDelete = useCallback(() => {
    onUpdateTagDialogClose()
    deleteTag({ id: selectedTagId })
  }, [deleteTag, onUpdateTagDialogClose, selectedTagId])

  const handleOpenAddTagToListingsDialog = (tagId) => {
    setSelectedTagId(tagId)
    onAddToListingsDialogOpen()
  }

  const handleAddTagToListingsSubmit = (addedListingIds, removedListingIds) => {
    onAddToListingsDialogClose()
    addTagToListings({
      tagId: selectedTagId,
      addedListingIds,
      removedListingIds,
    })
  }

  if (!tags) {
    return null
  }

  return (
    <>
      <TableContainer borderRadius="10px" borderStyle="solid" borderWidth="1px">
        <Table fontSize="sm" background="#ffffff">
          <Thead bg="gray.50">
            <Tr>
              {columns.map((column, index) => (
                <Th whiteSpace="nowrap" scope="col" key={index}>
                  {column.Header}
                </Th>
              ))}
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {tags.map((row) => (
              <Tr key={row.id}>
                {columns.map((column, index) => {
                  const cell = row[column.accessor]

                  if (column.accessor === 'listings') {
                    return (
                      <Td key={index}>
                        <strong>{cell.length}</strong>
                        <Button
                          onClick={() =>
                            handleOpenAddTagToListingsDialog(row.id)
                          }
                          variant="outline"
                          size="sm"
                          ml="0.5rem"
                        >
                          Add tag to listings
                        </Button>
                      </Td>
                    )
                  }

                  return (
                    <Td key={index} maxWidth="100px">
                      {cell}
                    </Td>
                  )
                })}
                <Td textAlign="right" maxWidth="80px">
                  <Stack direction="column" spacing={2}>
                    <Button
                      colorScheme="blue"
                      onClick={() => handleOpenUpdateTagDialog(row.id)}
                      size="sm"
                    >
                      Edit
                    </Button>
                  </Stack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <UpdateTagDialog
        tag={selectedTag}
        isOpen={isUpdateTagDialogOpen}
        onClose={onUpdateTagDialogClose}
        onDelete={handleDelete}
        onSubmit={handleSubmit}
      />
      {selectedTag && !isLoadingListings && isAddToListingsDialogOpen && (
        <AddTagToListingsDialog
          tag={selectedTag}
          listings={listings}
          onClose={onAddToListingsDialogClose}
          onSubmit={handleAddTagToListingsSubmit}
        />
      )}
    </>
  )
}

export default memo(List)
