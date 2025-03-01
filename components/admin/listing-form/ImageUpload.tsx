import { useRef, useState, memo } from 'react'
import Image from 'next/legacy/image'
import { useFormContext } from 'react-hook-form'
import { FiUploadCloud, FiImage } from 'react-icons/fi'
import { RiDeleteBin6Line } from 'react-icons/ri'
import optimizeImage from '@helpers/optimizeImage'
import { Button } from '@components/ui/button'
import {
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from '@components/ui/form'

interface ImageUploadProps {
  name: string
  helperText?: string
  isRequired?: boolean
}

const ImageUpload = ({
  name,
  helperText,
  isRequired = false,
}: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const { register, setValue, getValues } = useFormContext()

  const currentValue = getValues(name)
  const hasImageAlready = currentValue && !currentValue.name

  const handleFileInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    const optimizedBlob = await optimizeImage(file)
    const optimizedFile = new File([optimizedBlob], file.name, {
      type: file.type,
    })

    if (optimizedFile?.type.substring(0, 5) === 'image') {
      const reader = new FileReader()
      reader.readAsDataURL(optimizedFile)
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }

      setValue(name, optimizedFile, { shouldValidate: true, shouldDirty: true })
    } else {
      setPreview(null)
    }
  }

  const handleRemoveImage = () => {
    setPreview(null)
    setValue(name, null, { shouldValidate: true, shouldDirty: true })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <FormField
      name={name}
      render={() => (
        <FormItem className="my-4">
          <FormLabel className="font-semibold">
            {`Image${isRequired ? '*' : ''}`}
          </FormLabel>
          <FormDescription>
            Please ensure this is either a copyright-free image, you own the
            copyright of this image, or you have permission to use the image.
            {helperText && <span className="mt-2">{helperText}</span>}
          </FormDescription>
          <div className="mt-2">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={(e) => {
                register(name)
                fileInputRef.current = e
              }}
              onChange={handleFileInputChange}
            />

            {hasImageAlready || preview ? (
              <div className="relative rounded-lg border border-gray-200 bg-white p-4">
                <div className="relative mx-auto h-[250px] w-[250px]">
                  <Image
                    alt="Preview of image uploaded by user"
                    src={preview ?? currentValue}
                    layout="fill"
                    objectFit="contain"
                    unoptimized
                    className="rounded-md"
                  />
                </div>
                <div className="mt-4 flex justify-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef?.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <FiImage className="h-4 w-4" />
                    Change Image
                  </Button>
                  {preview && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveImage}
                      className="flex items-center gap-2"
                    >
                      <RiDeleteBin6Line className="h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef?.current?.click()}
                className="group relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center transition-all hover:border-blue-500 hover:bg-blue-50"
              >
                <div className="space-y-2">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 group-hover:bg-blue-100">
                    <FiUploadCloud className="h-6 w-6 text-gray-600 group-hover:text-blue-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-700">
                      Click to upload an image
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG up to 2MB (smaller images use less energy)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default memo(ImageUpload)
