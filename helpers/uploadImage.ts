import path from 'path'
import sharp from 'sharp'
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import doSpace from '../lib/digitalocean'
import config from './config'

function generateUniqueId() {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 10)
  return `${timestamp}-${random}`
}

const uploadImage = async (
  image: File,
  oldImageKey?: string,
): Promise<string> => {
  const imageBuffer = Buffer.from(await image.arrayBuffer())
  const uniqueFileId = generateUniqueId()
  const fileName = `${uniqueFileId}-${image.name}`

  const compressedImage = await sharp(imageBuffer)
    .webp({ quality: 80 })
    .toBuffer()

  const putObjectCommand = new PutObjectCommand({
    Bucket: config.bucketName,
    Body: compressedImage,
    Key: fileName,
    ACL: 'public-read',
  })

  const response = await doSpace.send(putObjectCommand)
  console.log(response)

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

export default uploadImage
