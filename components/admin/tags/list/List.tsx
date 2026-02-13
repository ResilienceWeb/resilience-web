import { memo, useCallback, useState } from 'react'
import { useToggle } from 'usehooks-ts'
import { Button } from '@components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table'
import useListings from '@hooks/listings/useListings'
import useAddTagToListings from '@hooks/tags/useAddTagToListings'
import useDeleteTag from '@hooks/tags/useDeleteTag'
import useUpdateTag from '@hooks/tags/useUpdateTag'
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
  const [isUpdateTagDialogOpen, _toggleUpdate, setIsUpdateTagDialogOpen] =
    useToggle()
  const [isAddToListingsDialogOpen, _toggleAdd, setIsAddToListingsDialogOpen] =
    useToggle()

  const { listings, isPending: isLoadingListings } = useListings()
  const { mutate: updateTag } = useUpdateTag()
  const { mutate: deleteTag } = useDeleteTag()
  const { mutate: addTagToListings } = useAddTagToListings()

  const [selectedTagId, setSelectedTagId] = useState(null)
  const selectedTag = tags.find((tag) => tag.id === selectedTagId)

  const handleOpenUpdateTagDialog = (tagId) => {
    setSelectedTagId(tagId)
    setIsUpdateTagDialogOpen(true)
  }

  const handleSubmit = useCallback(
    (data) => {
      setIsUpdateTagDialogOpen(false)
      updateTag({
        ...data,
        id: selectedTagId,
      })
    },
    [setIsUpdateTagDialogOpen, updateTag, selectedTagId],
  )

  const handleDelete = useCallback(() => {
    setIsUpdateTagDialogOpen(false)
    deleteTag({ id: selectedTagId })
  }, [deleteTag, setIsUpdateTagDialogOpen, selectedTagId])

  const handleOpenAddTagToListingsDialog = (tagId) => {
    setSelectedTagId(tagId)
    setIsAddToListingsDialogOpen(true)
  }

  const handleAddTagToListingsSubmit = (addedListingIds, removedListingIds) => {
    setIsAddToListingsDialogOpen(false)
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
      <div className="rounded-lg border">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className="whitespace-nowrap">
                  {column.Header}
                </TableHead>
              ))}
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.map((row) => (
              <TableRow key={row.id}>
                {columns.map((column, index) => {
                  const cell = row[column.accessor]

                  if (column.accessor === 'listings') {
                    return (
                      <TableCell key={index}>
                        <span className="font-bold">{cell.length}</span>
                        <Button
                          onClick={() =>
                            handleOpenAddTagToListingsDialog(row.id)
                          }
                          variant="outline"
                          size="sm"
                          className="ml-2"
                        >
                          Add tag to listings
                        </Button>
                      </TableCell>
                    )
                  }

                  return (
                    <TableCell key={index} className="max-w-[100px]">
                      {cell}
                    </TableCell>
                  )
                })}
                <TableCell className="max-w-[80px] text-right">
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleOpenUpdateTagDialog(row.id)}
                      size="sm"
                    >
                      Edit
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <UpdateTagDialog
        tag={selectedTag}
        isOpen={isUpdateTagDialogOpen}
        onClose={() => setIsUpdateTagDialogOpen(false)}
        onDelete={handleDelete}
        onSubmit={handleSubmit}
      />
      {selectedTag && !isLoadingListings && isAddToListingsDialogOpen && (
        <AddTagToListingsDialog
          tag={selectedTag}
          listings={listings}
          onClose={() => setIsAddToListingsDialogOpen(false)}
          onSubmit={handleAddTagToListingsSubmit}
        />
      )}
    </>
  )
}

export default memo(List)
