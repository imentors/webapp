import { eq } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { category } from '../../db/schema'
import { auth } from '../../utils/auth'

interface CreateCategoryBody {
  name: string
  description: string
  icon?: string
}

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })

  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Admin access required' })
  }

  const body = await readBody<CreateCategoryBody>(event)

  // Validate required fields
  if (!body.name?.trim()) {
    throw createError({ statusCode: 400, message: 'Category name is required' })
  }

  if (!body.description?.trim()) {
    throw createError({ statusCode: 400, message: 'Category description is required' })
  }

  try {
    // Check if category with same name already exists
    const existingCategory = await db
      .select()
      .from(category)
      .where(eq(category.name, body.name.trim()))
      .limit(1)

    if (existingCategory.length > 0) {
      throw createError({ statusCode: 409, message: 'Category with this name already exists' })
    }

    // Create new category
    const newCategory = await db
      .insert(category)
      .values({
        name: body.name.trim(),
        description: body.description.trim(),
        icon: body.icon || 'heroicons:folder',
        active: true,
      })
      .returning()

    return {
      category: newCategory[0]
    }
  } catch (error: any) {
    console.error('[Admin Categories POST API] Error:', error)
    
    // If it's a custom error, re-throw it
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Failed to create category',
    })
  }
})
