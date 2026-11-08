import { memo, useState } from 'react'
import { HiPlus } from 'react-icons/hi'
import { Button } from '@components/ui/button'
import useCreateCategory from '@hooks/categories/useCreateCategory'
import { useAppContext } from '@store/hooks'
import { NewCategoryDialog } from './category-dialog'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { mutate: createCategory } = useCreateCategory()
  const { selectedWebId } = useAppContext()

  const handleSubmit = (data) => {
    setIsOpen(false)
    createCategory({
      ...data,
      webId: selectedWebId,
    })
  }

  return (
    <>
      <div className="mb-8 flex justify-end">
        <Button
          variant="default"
          size="default"
          onClick={() => setIsOpen(true)}
          className="gap-2"
        >
          <HiPlus className="h-5 w-5" />
          New category
        </Button>
      </div>
      <NewCategoryDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  )
}

export default memo(Header)
