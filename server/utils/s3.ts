import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// Initialize S3 client with credentials
const s3Client = new S3Client({
  region: process.env.NUXT_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.NUXT_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NUXT_AWS_SECRET_ACCESS_KEY || '',
  },
  endpoint: process.env.AWS_ENDPOINT_URL,
  forcePathStyle: true,
  followRegionRedirects: true,
})

// Bucket name for storage
const BUCKET_NAME = process.env.NUXT_AWS_S3_BUCKET || 'imentor-uploads'

// URL construction based on bucket settings
const getS3Url = (key: string) => {
  const region = process.env.NUXT_AWS_REGION || 'us-east-1'
  const endpoint = process.env.AWS_ENDPOINT_URL

  if (endpoint) {
    // If using a custom endpoint (like MinIO or LocalStack)
    return `${endpoint.replace(/\/$/, '')}/${BUCKET_NAME}/${key}`
  }

  if (region === 'us-east-1') {
    return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`
  }

  return `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`
}

/**
 * Upload a file to S3
 * @param fileBuffer - The file buffer to upload
 * @param fileName - The name to use for the file in S3
 * @param contentType - The content type of the file
 * @returns The URL of the uploaded file
 */
export async function uploadFileToS3(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  // Create a unique file name to prevent collisions
  const uniqueFileName = `${Date.now()}-${fileName.replace(/\s+/g, '-')}`

  try {
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: uniqueFileName,
      Body: fileBuffer,
      ContentType: contentType,
    }

    await s3Client.send(new PutObjectCommand(uploadParams))
    
    return getS3Url(uniqueFileName)
  } catch (error: any) {
    console.error('Error uploading file to S3:', error)
    throw new Error(`Failed to upload file to S3: ${error.message}`)
  }
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase()
}

export function getContentType(extension: string): string {
  const contentTypes: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
  }
  return contentTypes[extension] || 'application/octet-stream'
}
