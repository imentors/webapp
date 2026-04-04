import { readMultipartFormData, createError } from 'h3'
import { uploadFileToS3, getFileExtension, getContentType } from '../utils/s3'
import { auth } from '../utils/auth'

// Max upload size (bytes) - 10MB
const MAX_SIZE = 10 * 1024 * 1024

const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
])

export default defineEventHandler(async (event) => {
  // Check authentication
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session?.user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  try {
    const formData = await readMultipartFormData(event)
    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'No file uploaded',
      })
    }

    // Find the file part
    const filePart = formData.find(part => part.filename && part.data)
    if (!filePart || !filePart.data) {
      throw createError({
        statusCode: 400,
        message: 'Invalid file upload',
      })
    }

    // Validate size
    if (filePart.data.length > MAX_SIZE) {
      throw createError({
        statusCode: 413,
        message: 'File too large (max 10MB)',
      })
    }

    // Validate content type
    const contentType = filePart.type || getContentType(getFileExtension(filePart.filename || ''))
    if (!ALLOWED_MIME.has(contentType)) {
      throw createError({
        statusCode: 415,
        message: 'Unsupported file type. Please upload PDF, Word, or Image files.',
      })
    }

    // Upload to S3
    const folder = 'expertise-documents'
    const fileName = filePart.filename || `upload-${Date.now()}`
    const key = `${folder}/${fileName}`

    const url = await uploadFileToS3(filePart.data, key, contentType)

    return {
      url,
      filename: fileName,
      contentType,
      size: filePart.data.length,
    }
  } catch (error: any) {
    console.error('Error in upload handler:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to upload file',
    })
  }
})
