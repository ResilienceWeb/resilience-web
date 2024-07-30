// @ts-nocheck
import path from 'path'
import doSpace from '../lib/digitalocean'
import config from './config'

function generateUniqueId() {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 10)
  return `${timestamp}-${random}`
}

const uploadImage = async (
  image: File,
  oldImageKey?: string,
): Promise<string> => {
  const imageBuffer = Buffer.from(await image.arrayBuffer())
  const uniqueFileId = generateUniqueId()

  return new Promise((resolve, reject) => {
    if (image) {
      const params = {
        Bucket: `${config.bucketName}`,
        Body: imageBuffer,
        Key: uniqueFileId,
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
            imageUrl = `${config.digitalOceanSpaces}` + uniqueFileId
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
