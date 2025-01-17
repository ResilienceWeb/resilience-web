import { useRef, useState, memo } from 'react'
import Image from 'next/legacy/image'
import { useFormContext } from 'react-hook-form'
import optimizeImage from '@helpers/optimizeImage'

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
  const {
    register,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext()

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

      setValue(name, optimizedFile, { shouldValidate: true })
    } else {
      setPreview(null)
    }
  }

  return (
    <div className="my-4">
      <label className="mb-1 block text-sm font-semibold" htmlFor={name}>
        {`Image${isRequired ? '*' : ''}`}
      </label>
      <p className="mb-2 text-sm text-gray-600">
        Please ensure this is either a copyright-free image, you own the
        copyright of this image, or you have permission to use the image.
      </p>
      {helperText && <p className="mb-6 text-sm text-gray-600">{helperText}</p>}
      <div className="relative flex items-center justify-center">
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
          <div className="relative h-[200px] w-[200px]">
            <Image
              alt="Preview of image uploaded by user"
              src={preview ?? currentValue}
              layout="fill"
              objectFit="contain"
              unoptimized
            />
          </div>
        ) : (
          <div
            className="mt-1 w-full cursor-pointer rounded-md border-2 border-dashed border-gray-300 p-6 text-center"
            onClick={() => fileInputRef?.current?.click()}
          >
            <div className="space-y-1">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex items-baseline text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer text-blue-600 hover:text-blue-500"
                >
                  <span>Upload an image</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {(preview || currentValue) && (
          <button
            type="button"
            className="absolute rounded bg-blue-600 px-3 py-1 text-sm text-white opacity-80 hover:bg-blue-700"
            onClick={() => fileInputRef.current?.click()}
          >
            Replace image
          </button>
        )}
      </div>
      {errors[name] && (
        <p className="mt-2 text-sm text-red-600">Please upload an image</p>
      )}
    </div>
  )
}

export default memo(ImageUpload)
