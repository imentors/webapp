import { desc, sql } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { category, skill, mentorProfile, user } from '../../db/schema'
import { auth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })

  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Admin access required' })
  }

  try {
    // Use a subquery to count mentors - PostgreSQL doesn't allow set-returning functions in JOIN conditions
    // This counts mentors whose skills array contains any skill belonging to this category
    // Note: We reference "category"."id" explicitly to avoid ambiguous column reference
    const mentorCountSubquery = sql<number>`(
      SELECT COUNT(DISTINCT mp.id)::int
      FROM ${mentorProfile} mp
      INNER JOIN ${skill} s ON s.category_id = "category"."id"
      WHERE s.id::text = ANY(
        SELECT jsonb_array_elements_text(mp.skills::jsonb)
      )
    )`

    // Get all categories with mentor counts
    const categoriesWithCounts = await db
      .select({
        id: category.id,
        name: category.name,
        description: category.description,
        icon: category.icon,
        active: category.active,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        mentorCount: mentorCountSubquery,
      })
      .from(category)
      .orderBy(desc(category.createdAt))

    return {
      categories: categoriesWithCounts.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        active: cat.active,
        mentorCount: Number(cat.mentorCount || 0),
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt,
      }))
    }
  } catch (error: any) {
    console.error('[Admin Categories API] Error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch categories',
    })
  }
})
