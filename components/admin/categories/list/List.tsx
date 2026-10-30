import { memo, useState } from 'react'
import { getIcon } from '@helpers/icons'
import CategoryTag from '@components/category-tag'
import { Button } from '@components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table'
import useDeleteCategory from '@hooks/categories/useDeleteCategory'
import useUpdateCategory from '@hooks/categories/useUpdateCategory'
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

/** The same size as a tag's icon in the tags table, but in the category's colour. */
const CategoryIcon = ({ category }) => {
  const Icon = getIcon(category.icon)?.icon
  if (!Icon) return null
  return (
    <Icon
      className="mr-2 h-5 w-5 shrink-0"
      style={{ color: `#${category.color}` }}
      aria-hidden="true"
    />
  )
}

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

  const handleClose = () => setIsOpen(false)

  const handleSubmit = (data) => {
    handleClose()
    updateCategory({
      ...data,
      id: selectedCategoryId,
    })
  }

  const handleDelete = () => {
    handleClose()
    deleteCategory({ id: selectedCategoryId })
  }

  if (!categories) {
    return null
  }

  return (
    <>
      <div className="mb-8 overflow-hidden rounded-lg border bg-white">
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
                        <strong>{row._count?.listings ?? 0}</strong>
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
                      <span className="flex items-center">
                        <CategoryIcon category={row} />
                        {cell}
                      </span>
                    </TableCell>
                  )
                })}
                <TableCell className="max-w-[80px] text-right">
                  <div className="flex flex-col gap-2">
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
