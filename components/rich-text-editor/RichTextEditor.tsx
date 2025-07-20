import { useFormContext } from 'react-hook-form'
import { Editor } from '@tinymce/tinymce-react'

interface RichTextEditorProps {
  name: string
  label?: string
}

const RichTextEditor = ({
  name,
  label,
  ...otherProps
}: RichTextEditorProps) => {
  const { register, setValue, getValues } = useFormContext()

  register(name)

  const handleEditorChange = (value: string) => {
    setValue(name, value, { shouldDirty: true })
  }

  return (
    <>
      {label && (
        <label className="mb-1 block text-sm font-semibold">{label}</label>
      )}
      <Editor
        {...otherProps}
        apiKey={process.env.NEXT_PUBLIC_TINY_MCE_APIKEY}
        value={getValues(name)}
        onEditorChange={handleEditorChange}
        init={{
          height: 300,
          menubar: 'edit view insert format tc help',
          toolbar:
            'undo redo | link image | styles | bold italic underline | align | bullist numlist',
          contextmenu: false,
          plugins:
            'media autolink lists link image preview fullscreen emoticons help',
        }}
      />
    </>
  )
}

export default RichTextEditor
