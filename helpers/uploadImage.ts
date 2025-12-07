import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import path from 'path'
import sharp from 'sharp'
import doSpace from '../lib/digitalocean'
import config from './config'

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

  const putObjectCommand = new PutObjectCommand({
    Bucket: config.bucketName,
    Body: compressedImage,
    Key: fileName,
    ACL: 'public-read',
    ContentType: 'image/webp',
    CacheControl: 'public, max-age=31536000, immutable',
  })

  const response = await doSpace.send(putObjectCommand)

  if (response['$metadata'].httpStatusCode === 200) {
    const imageUrl = `${config.digitalOceanSpaces}${fileName}`

    if (oldImageKey) {
      // Delete previous image
      const deleteObjectCommand = new DeleteObjectCommand({
        Bucket: config.bucketName,
        Key: path.basename(oldImageKey),
      })

      const deleteResponse = await doSpace.send(deleteObjectCommand)
      if (deleteResponse['$metadata'].httpStatusCode !== 204) {
        console.error('[RW] Error deleting old image', deleteResponse)
      }
    }

    return imageUrl
  } else {
    console.error('[RW] Error uploading image', response)
  }
}
