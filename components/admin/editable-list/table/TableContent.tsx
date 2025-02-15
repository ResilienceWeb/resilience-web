import { memo } from 'react'
import { PiWarningCircleBold } from 'react-icons/pi'
import { FaStar, FaRegStar } from 'react-icons/fa'
import useFeatureListing from '@hooks/listings/useFeatureListing'
import { Button } from '@components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table'
import CategoryTag from '@components/category-tag'

const TableContent = ({ goToEdit, goToProposedEdits, items, removeItem }) => {
  const { featureListing, unfeatureListing } = useFeatureListing()
  if (!items) return null

  return (
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
          {items.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.title}</TableCell>
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
                <br />
                <div className="mt-2 flex flex-wrap gap-1">
                  {!item.image && (
                    <div className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-sm">
                      <PiWarningCircleBold className="h-[18px] w-[18px]" />
                      <span>No image</span>
                    </div>
                  )}
                  {!item.location && (
                    <div className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-sm">
                      <PiWarningCircleBold className="h-[18px] w-[18px]" />
                      <span>No location</span>
                    </div>
                  )}
                  {item.description.length < 50 && (
                    <div className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-sm">
                      <PiWarningCircleBold className="h-[18px] w-[18px]" />
                      <span>Short description</span>
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <div
                  className="group relative"
                  title="Display this listing at the top of the web page for 7 days."
                >
                  <button
                    className="rounded-full bg-gray-100 p-2 text-xl hover:bg-gray-200"
                    onClick={() => {
                      if (item.featured) {
                        unfeatureListing(item.id)
                      } else {
                        featureListing(item.id)
                      }
                    }}
                  >
                    {item.featured ? (
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
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default memo(TableContent)
