import { memo, useState } from 'react'
import { useToggle } from 'usehooks-ts'
import { isPickableTag, isSharedTag } from '@helpers/tags'
import DeleteConfirmationDialog from '@components/admin/delete-confirmation-dialog'
import TagIcon from '@components/tag-icon'
import { Badge } from '@components/ui/badge'
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
import useRemoveTagFromWeb from '@hooks/tags/useRemoveTagFromWeb'
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
  const [isRemoveDialogOpen, _toggleRemove, setIsRemoveDialogOpen] = useToggle()

  const { listings, isPending: isLoadingListings } = useListings()
  const { mutate: updateTag } = useUpdateTag()
  const { mutate: deleteTag } = useDeleteTag()
  const { mutate: addTagToListings } = useAddTagToListings()
  const { mutate: removeTagFromWeb } = useRemoveTagFromWeb()

  const [selectedTagId, setSelectedTagId] = useState(null)
  const selectedTag = tags.find((tag) => tag.id === selectedTagId)

  const handleOpenUpdateTagDialog = (tagId) => {
    setSelectedTagId(tagId)
    setIsUpdateTagDialogOpen(true)
  }

  const handleSubmit = (data) => {
    setIsUpdateTagDialogOpen(false)
    updateTag({
      ...data,
      id: selectedTagId,
    })
  }

  const handleDelete = () => {
    setIsUpdateTagDialogOpen(false)
    deleteTag({ id: selectedTagId })
  }

  const handleOpenRemoveDialog = (tagId) => {
    setSelectedTagId(tagId)
    setIsRemoveDialogOpen(true)
  }

  const handleRemoveFromWeb = () => {
    setIsRemoveDialogOpen(false)
    removeTagFromWeb({ tagId: selectedTagId })
  }

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
      <div className="overflow-hidden rounded-lg border">
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
                        <span className="font-bold">
                          {row._count?.listings ?? 0}
                        </span>
                        {isPickableTag(row) && (
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
                        )}
                      </TableCell>
                    )
                  }

                  return (
                    <TableCell key={index} className="max-w-[100px]">
                      <span className="flex items-center">
                        <TagIcon name={row.icon} />
                        {cell}
                        {isSharedTag(row) && (
                          <Badge variant="secondary" className="ml-2">
                            Shared
                          </Badge>
                        )}
                      </span>
                    </TableCell>
                  )
                })}
                <TableCell className="max-w-[80px] text-right">
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleOpenUpdateTagDialog(row.id)}
                      size="sm"
                      disabled={isSharedTag(row)}
                      title={
                        isSharedTag(row)
                          ? 'Shared tags are the same in every web, so they cannot be edited'
                          : undefined
                      }
                    >
                      Edit
                    </Button>
                    {isSharedTag(row) && (
                      <Button
                        variant="outline"
                        onClick={() => handleOpenRemoveDialog(row.id)}
                        size="sm"
                        className="whitespace-normal"
                      >
                        Remove from all listings in this web
                      </Button>
                    )}
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
      <DeleteConfirmationDialog
        isOpen={isRemoveDialogOpen}
        onClose={() => setIsRemoveDialogOpen(false)}
        handleRemove={handleRemoveFromWeb}
        titleLabel={`Remove "${selectedTag?.label}"`}
        description="This takes the shared tag off every listing in this web. Other webs keep it, and you can add it to listings again later."
        buttonLabel="Remove from all listings"
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
