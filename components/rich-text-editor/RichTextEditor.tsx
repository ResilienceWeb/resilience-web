import { useController, useFormContext } from 'react-hook-form'
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
  const { control } = useFormContext()
  // Subscribes to the field value as state. Reading it via getValues() during
  // render breaks with the React Compiler: getValues is not pure, so the
  // compiler caches its first result and the editor's value prop goes stale.
  const { field } = useController({ name, control })

  return (
    <>
      {label && (
        <label className="mb-1 block text-sm font-semibold">{label}</label>
      )}
      <Editor
        {...otherProps}
        apiKey={process.env.NEXT_PUBLIC_TINY_MCE_APIKEY}
        value={field.value ?? ''}
        onEditorChange={field.onChange}
        onBlur={field.onBlur}
        init={{
          height: 300,
          menubar: 'edit view insert format tc help',
          toolbar:
            'undo redo | link image | styles | bold italic underline | align | bullist numlist',
          contextmenu: false,
          paste_as_text: false,
          plugins:
            'media autolink lists link image preview fullscreen emoticons help',
        }}
      />
    </>
  )
}

export default RichTextEditor
