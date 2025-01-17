import { memo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@components/ui/dialog'
import CategoryForm from './category-form'

type props = {
  category: CategoryWithListings
  onSubmit: (id: any) => void
  isOpen: boolean
  onClose: () => void
  onDelete: (id: any) => void
}

const UpdateCategoryDialog: React.FC<props> = ({
  category,
  onSubmit,
  isOpen,
  onClose,
  onDelete,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update category</DialogTitle>
        </DialogHeader>
        <DialogDescription>Update the category details.</DialogDescription>
        <CategoryForm
          category={category}
          onDelete={onDelete}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}

export default memo(UpdateCategoryDialog)
