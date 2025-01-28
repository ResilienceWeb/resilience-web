import { Editor } from '@tinymce/tinymce-react'
import { useFormContext } from 'react-hook-form'

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
    setValue(name, value, { shouldValidate: true })
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
          menubar: 'edit view insert format tools table tc help',
          toolbar: true,
          contextmenu: false,
          plugins:
            'media advlist autolink lists anchor link image code fullscreen table code emoticons help',
        }}
      />
    </>
  )
}

export default RichTextEditor
