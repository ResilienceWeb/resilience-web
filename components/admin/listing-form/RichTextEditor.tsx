import { Editor } from '@tinymce/tinymce-react'
import { useField } from 'formik'

const RichTextEditor = (props) => {
  const { label, name, ...otherProps } = props
  const [field, _meta] = useField(name)
  const type = 'text'
  const handleEditorChange = (value) => {
    field.onChange({ target: { type, name, value } })
  }

  const handleBlur = () => {
    field.onBlur({ target: { name } })
  }

  return (
    <>
      {label && <label>{label}</label>}
      <Editor
        {...otherProps}
        apiKey={process.env.NEXT_PUBLIC_TINY_MCE_APIKEY}
        value={field.value}
        onEditorChange={handleEditorChange}
        onBlur={handleBlur}
        init={{
          height: 500,
          menubar: 'file edit view insert format tools table tc help',
          toolbar: true,
          plugins:
            'media advlist autolink lists link anchor image code fullscreen table paste code emoticons help',
        }}
      />
      {/* {meta.touched && meta.error ? (
        <div className="error">{meta.error}</div>
      ) : null} */}
    </>
  )
}

export default RichTextEditor

