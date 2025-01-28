import { memo, useCallback, useState } from 'react'
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
import useUpdateCategory from '@hooks/categories/useUpdateCategory'
import useDeleteCategory from '@hooks/categories/useDeleteCategory'
import { UpdateCategoryDialog } from '../header/category-dialog'

const columns = [
  {
    Header: 'Category label',
    accessor: 'label',
  },
  {
    Header: 'Number of listings',
    accessor: 'listings',
  },
  {
    Header: 'Color',
    accessor: 'color',
  },
]

const List = ({ categories }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { mutate: updateCategory } = useUpdateCategory()
  const { mutate: deleteCategory } = useDeleteCategory()

  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const selectedCategory = categories.find(
    (cat) => cat.id === selectedCategoryId,
  )

  const handleOpen = (categoryId) => {
    setSelectedCategoryId(categoryId)
    setIsOpen(true)
  }

  const handleClose = useCallback(() => setIsOpen(false), [])

  const handleSubmit = useCallback(
    (data) => {
      handleClose()
      updateCategory({
        ...data,
        id: selectedCategoryId,
      })
    },
    [handleClose, updateCategory, selectedCategoryId],
  )

  const handleDelete = useCallback(() => {
    handleClose()
    deleteCategory({ id: selectedCategoryId })
  }, [deleteCategory, handleClose, selectedCategoryId])

  if (!categories) {
    return null
  }

  return (
    <>
      <div className="mb-8 rounded-lg border bg-white">
        <Table>
          <TableHeader className="bg-gray-50">
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
            {categories.map((row) => (
              <TableRow key={row.id}>
                {columns.map((column, index) => {
                  const cell = row[column.accessor]

                  if (column.accessor === 'listings') {
                    return (
                      <TableCell key={index}>
                        <strong>{cell.length}</strong>
                      </TableCell>
                    )
                  }

                  if (column.accessor === 'color') {
                    return (
                      <TableCell key={index} className="w-[100px]">
                        <CategoryTag colorHex={cell}>{`#${cell}`}</CategoryTag>
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
                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpen(row.id)}
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
      <UpdateCategoryDialog
        category={selectedCategory}
        isOpen={isOpen}
        onClose={handleClose}
        onDelete={handleDelete}
        onSubmit={handleSubmit}
      />
    </>
  )
}

export default memo(List)
