import path from 'path'
import sharp from 'sharp'
import {
  supabaseAdmin,
  STORAGE_BUCKET,
  getPublicUrl,
} from '../lib/supabase-storage'
import deleteImage from './deleteImage'

function generateUniqueId() {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 10)
  return `${timestamp}-${random}`
}

type UploadOptions = {
  resize?: boolean
}

export default async function uploadImage(
  image: File,
  oldImageKey?: string,
  options: UploadOptions = { resize: true },
): Promise<string> {
  const imageBuffer = Buffer.from(await image.arrayBuffer())
  const uniqueFileId = generateUniqueId()
  const baseName = path.parse(image.name).name
  let fileName = `${uniqueFileId}-${baseName}.webp`

  if (process.env.NODE_ENV === 'development') {
    fileName = `dev-${fileName}`
  }

  let sharpInstance = sharp(imageBuffer)

  if (options.resize) {
    sharpInstance = sharpInstance.resize({
      width: 650,
      withoutEnlargement: true,
    })
  }

  const compressedImage = await sharpInstance.webp({ quality: 75 }).toBuffer()

  const { error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, compressedImage, {
      contentType: 'image/webp',
      upsert: false,
    })

  if (error) {
    console.error('[RW] Error uploading image', error)
    return
  }

  const imageUrl = getPublicUrl(fileName)

  if (oldImageKey) {
    await deleteImage(oldImageKey)
  }

  return imageUrl
}
