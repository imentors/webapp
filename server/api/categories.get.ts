import { eq } from 'drizzle-orm'
import { db } from '../utils/drizzle'
import { category } from '../db/schema'

export default defineEventHandler(async () => {
  try {
    const categories = await db
      .select({
        id: category.id,
        name: category.name,
        description: category.description,
        icon: category.icon,
      })
      .from(category)
      .where(eq(category.active, true))
      .orderBy(category.name)

    return {
      categories
    }
  } catch (error: any) {
    console.error('[Categories API] Error fetching categories:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch categories',
    })
  }
})

