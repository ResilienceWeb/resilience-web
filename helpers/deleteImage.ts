import path from 'path'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import doSpace from '../lib/digitalocean'
import config from './config'

export default async function deleteImage(imageKey: string): Promise<void> {
  const deleteObjectCommand = new DeleteObjectCommand({
    Bucket: config.bucketName,
    Key: path.basename(imageKey),
  })

  const deleteResponse = await doSpace.send(deleteObjectCommand)
  if (deleteResponse['$metadata'].httpStatusCode !== 204) {
    console.error('[RW] Error deleting old image', deleteResponse)
  }
}
