import { memo, useCallback } from 'react'
import { HiPlus } from 'react-icons/hi'
import { useToggle } from 'usehooks-ts'
import { useAppContext } from '@store/hooks'
import { Button } from '@components/ui/button'
import useCreateTag from '@hooks/tags/useCreateTag'
import { NewTagDialog } from './tag-dialog'

const Header = () => {
  const [isOpen, _toggle, setIsOpen] = useToggle()
  const { mutate: createTag } = useCreateTag()
  const { selectedWebId } = useAppContext()

  const handleSubmit = useCallback(
    (data) => {
      setIsOpen(false)
      createTag({
        ...data,
        webId: selectedWebId,
      })
    },
    [createTag, setIsOpen, selectedWebId],
  )

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
          New tag
        </Button>
      </div>
      <NewTagDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  )
}

export default memo(Header)
