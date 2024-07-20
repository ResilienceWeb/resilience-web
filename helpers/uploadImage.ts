// @ts-nocheck

import fs from 'fs'
import path from 'path'
import type { File } from 'formidable'
import doSpace from '../lib/digitalocean'
import config from './config'

const uploadImage = async (
  image: File,
  oldImageKey?: string,
): Promise<string> => {
  const filePath = `./public/file/${image.name}`
  // const imageBuffer = Buffer.from(await image.arrayBuffer())

  return new Promise((resolve, reject) => {
    if (image) {
      const params: S3.PutRequestObject = {
        Bucket: `${config.bucketName}`,
        Body: fs.createReadStream(filePath),
        Key: path.basename(image.name),
        ContentType: image.type,
        ACL: 'public-read',
      }

      let imageUrl
      doSpace
        .upload(params, function (err, _data) {
          if (err) {
            console.error(err)
            reject(err)
          }
        })
        .on('build', (request) => {
          request.httpRequest.headers.Host = `${config.digitalOceanSpaces}`
          request.httpRequest.headers['Content-Length'] = image.size
          request.httpRequest.headers['Content-Type'] = image.type
          request.httpRequest.headers['x-amz-acl'] = 'public-read'
        })
        .send((err) => {
          if (err) {
            console.error(err)
            reject(err)
          } else {
            imageUrl = `${config.digitalOceanSpaces}` + image.name
            console.log('File uploaded successfully', imageUrl)
            resolve(imageUrl)

            if (oldImageKey) {
              // Delete previous image
              const deleteParams = {
                Bucket: `${config.bucketName}`,
                Key: path.basename(oldImageKey),
              }
              doSpace.deleteObject(deleteParams, function (err, data) {
                console.log(err, data)
              })
            }
          }
        })
    } else {
      resolve(null)
    }
  })
}

export default uploadImage
