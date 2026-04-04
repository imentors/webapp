import { eq } from 'drizzle-orm'
import { db } from '../../../utils/drizzle'
import { category, skill } from '../../../db/schema'
import { auth } from '../../../utils/auth'

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

    // Check if category has associated skills
    const categorySkills = await db
      .select()
      .from(skill)
      .where(eq(skill.categoryId, categoryId))
      .limit(1)

    if (categorySkills.length > 0) {
      throw createError({ 
        statusCode: 400, 
        message: 'Cannot delete category with associated skills. Please delete the skills first.' 
      })
    }

    // Delete category
    await db
      .delete(category)
      .where(eq(category.id, categoryId))

    return {
      success: true,
      message: 'Category deleted successfully'
    }
  } catch (error: any) {
    console.error('[Admin Categories DELETE API] Error:', error)
    
    // If it's a custom error, re-throw it
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Failed to delete category',
    })
  }
})
