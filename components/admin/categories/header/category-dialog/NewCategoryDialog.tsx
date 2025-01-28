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
  onSubmit: (id: any) => void
  isOpen: boolean
  onClose: () => void
}

const NewCategoryDialog: React.FC<props> = ({ onSubmit, isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new category</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Create a new category to organize your listings.
        </DialogDescription>
        <div className="pt-4">
          <CategoryForm onSubmit={onSubmit} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default memo(NewCategoryDialog)
