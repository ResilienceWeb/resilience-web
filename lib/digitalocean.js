import { S3 } from '@aws-sdk/client-s3'

/**
 * Digital Ocean Spaces Connection
 */
const s3Client = new S3({
  endpoint: 'https://ams3.digitaloceanspaces.com',
  credentials: {
    accessKeyId: process.env.DO_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.DO_AWS_SECRET_ACCESS_KEY,
  },
})

export default s3Client
