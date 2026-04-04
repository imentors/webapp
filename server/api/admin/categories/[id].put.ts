import { eq } from 'drizzle-orm'
import { db } from '../../../utils/drizzle'
import { category } from '../../../db/schema'
import { auth } from '../../../utils/auth'

interface UpdateCategoryBody {
  name?: string
  description?: string
  icon?: string
  active?: boolean
}

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })

  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Admin access required' })
  }

  const categoryId = getRouterParam(event, 'id')
  if (!categoryId) {
    throw createError({ statusCode: 400, message: 'Category ID is required' })
  }

  const body = await readBody<UpdateCategoryBody>(event)

  try {
    // Check if category exists
    const existingCategory = await db
      .select()
      .from(category)
      .where(eq(category.id, categoryId))
      .limit(1)

    if (existingCategory.length === 0) {
      throw createError({ statusCode: 404, message: 'Category not found' })
    }

    // If updating name, check for duplicates
    if (body.name && body.name.trim() !== existingCategory[0].name) {
      const duplicateCategory = await db
        .select()
        .from(category)
        .where(eq(category.name, body.name.trim()))
        .limit(1)

      if (duplicateCategory.length > 0) {
        throw createError({ statusCode: 409, message: 'Category with this name already exists' })
      }
    }

    // Prepare update data
    const updateData: Partial<typeof category.$inferInsert> = {}
    if (body.name !== undefined) updateData.name = body.name.trim()
    if (body.description !== undefined) updateData.description = body.description.trim()
    if (body.icon !== undefined) updateData.icon = body.icon
    if (body.active !== undefined) updateData.active = body.active

    // Update category
    const updatedCategory = await db
      .update(category)
      .set(updateData)
      .where(eq(category.id, categoryId))
      .returning()

    return {
      category: updatedCategory[0]
    }
  } catch (error: any) {
    console.error('[Admin Categories PUT API] Error:', error)
    
    // If it's a custom error, re-throw it
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Failed to update category',
    })
  }
})
