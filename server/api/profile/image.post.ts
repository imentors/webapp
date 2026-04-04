import { readMultipartFormData, createError } from 'h3'
import { eq } from 'drizzle-orm'
import { uploadFileToS3, getFileExtension, getContentType } from '../../utils/s3'
import { auth } from '../../utils/auth'
import { db } from '../../utils/drizzle'
import { user } from '../../db/schema'

// Max upload size (bytes) - 5MB for profile images
const MAX_SIZE = 5 * 1024 * 1024

const ALLOWED_IMAGE_MIME = new Set([
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
        message: 'File too large (max 5MB)',
      })
    }

    // Validate content type - images only
    const contentType = filePart.type || getContentType(getFileExtension(filePart.filename || ''))
    if (!ALLOWED_IMAGE_MIME.has(contentType)) {
      throw createError({
        statusCode: 415,
        message: 'Unsupported file type. Please upload PNG, JPG, or WebP images only.',
      })
    }

    // Upload to S3 with a profile-images folder
    const folder = 'profile-images'
    const extension = getFileExtension(filePart.filename || 'image.jpg')
    const fileName = `${session.user.id}-${Date.now()}${extension}`
    const key = `${folder}/${fileName}`

    const url = await uploadFileToS3(filePart.data, key, contentType)

    // Update the user's image in the database
    await db
      .update(user)
      .set({
        image: url,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id))

    return {
      url,
      filename: fileName,
      contentType,
      size: filePart.data.length,
    }
  } catch (error: any) {
    console.error('Error in profile image upload handler:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to upload profile image',
    })
  }
})
