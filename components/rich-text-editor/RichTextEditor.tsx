import { useController, useFormContext } from 'react-hook-form'
import { EMBED_PROVIDERS } from '@/lib/embed-providers.js'
import { Editor } from '@tinymce/tinymce-react'

// TinyMCE sandboxes every iframe in the editor except its own short list of
// hosts, which leaves out youtube-nocookie (what saved YouTube embeds become)
// and the map and SoundCloud players. A sandboxed player cannot run scripts
// and shows an error instead of the video. TinyMCE matches the bare host with
// any leading www. removed.
const SANDBOX_EXCLUSIONS = EMBED_PROVIDERS.map(({ hostname }) =>
  hostname.replace(/^www\./, ''),
)

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
          sandbox_iframes_exclusions: SANDBOX_EXCLUSIONS,
          plugins:
            'media autolink lists link image preview fullscreen emoticons help',
        }}
      />
    </>
  )
}

export default RichTextEditor
