import { memo } from 'react'
import { FaStar, FaRegStar } from 'react-icons/fa'
import { PiWarningCircleBold } from 'react-icons/pi'
import CategoryTag from '@components/category-tag'
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
import useFeatureListing from '@hooks/listings/useFeatureListing'

const TableContent = ({ goToEdit, goToProposedEdits, items, removeItem }) => {
  const { featureListing, unfeatureListing } = useFeatureListing()
  if (!items) return null

  return (
    <section className="w-full overflow-x-auto py-4">
      <div className="rounded-[10px] border border-solid">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead></TableHead>
              <TableHead>Info</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => {
              const isFeatured =
                item.featured && new Date(item.featured) > new Date()

              return (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <span>{item.title}</span>
                      <div className="flex flex-wrap gap-1">
                        {!item.image && (
                          <Badge variant="secondary">
                            <PiWarningCircleBold className="h-[18px] w-[18px]" />
                            No image
                          </Badge>
                        )}
                        {item.description.length < 250 && (
                          <Badge variant="secondary">
                            <PiWarningCircleBold className="h-[18px] w-[18px]" />
                            <span>Short description</span>
                          </Badge>
                        )}
                        {!item.location && (
                          <Badge variant="secondary">
                            <PiWarningCircleBold className="h-[18px] w-[18px]" />
                            <span>No location</span>
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.category && item.category.color ? (
                      <CategoryTag
                        className="text-xs"
                        colorHex={item.category.color}
                      >
                        {item.category.label}
                      </CategoryTag>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    {item.pending ? (
                      <div
                        className="group relative cursor-default"
                        title="This was submitted via the external form and needs to be reviewed. It is currently not published."
                      >
                        <span className="rounded-md bg-purple-100 px-2 py-1 text-base text-purple-800">
                          Pending
                        </span>
                      </div>
                    ) : null}
                  </TableCell>

                  <TableCell>
                    Created on{' '}
                    <b>
                      {Intl.DateTimeFormat('en-GB', {
                        dateStyle: 'long',
                      }).format(new Date(item.createdAt))}
                    </b>
                    <br />
                    Last updated on{' '}
                    <b>
                      {Intl.DateTimeFormat('en-GB', {
                        dateStyle: 'long',
                      }).format(new Date(item.updatedAt))}
                    </b>
                  </TableCell>

                  <TableCell>
                    <div
                      className="group relative"
                      title="Display this listing at the top of the web page for 7 days."
                    >
                      <button
                        className="rounded-full bg-gray-100 p-2 text-xl hover:bg-gray-200"
                        onClick={() => {
                          if (isFeatured) {
                            unfeatureListing(item.id)
                          } else {
                            featureListing(item.id)
                          }
                        }}
                      >
                        {isFeatured ? (
                          <FaStar className="text-green-500" />
                        ) : (
                          <FaRegStar />
                        )}
                      </button>
                    </div>
                  </TableCell>

                  <TableCell className="sticky right-0 w-[120px] bg-gray-100">
                    <div className="flex flex-col gap-2">
                      {item.edits?.length > 0 && (
                        <Button
                          variant="default"
                          onClick={() => goToProposedEdits(item)}
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          View suggested edit
                        </Button>
                      )}
                      <Button
                        variant="default"
                        onClick={() => goToEdit(item)}
                        size="sm"
                        className={
                          item.pending
                            ? 'bg-purple-600 hover:bg-purple-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }
                      >
                        {item.pending ? 'Review' : 'Edit'}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => removeItem(item.slug)}
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}

export default memo(TableContent)
