import { eq, desc, ilike, sql } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { skill, category, mentorProfile } from '../../db/schema'
import { auth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })

  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Admin access required' })
  }

  const query = getQuery(event)
  const search = (query.search as string) || ''

  try {
    // Use a subquery to count mentors - PostgreSQL doesn't allow set-returning functions in JOIN conditions
    const mentorCountSubquery = sql<number>`(
      SELECT COUNT(*)::int 
      FROM ${mentorProfile} 
      WHERE ${skill.id}::text = ANY(
        SELECT jsonb_array_elements_text(${mentorProfile.skills}::jsonb)
      )
    )`

    // Build base query
    let skillsQuery = db
      .select({
        id: skill.id,
        name: skill.name,
        categoryId: skill.categoryId,
        active: skill.active,
        createdAt: skill.createdAt,
        updatedAt: skill.updatedAt,
        categoryName: category.name,
        categoryIcon: category.icon,
        mentorCount: mentorCountSubquery,
      })
      .from(skill)
      .leftJoin(category, eq(skill.categoryId, category.id))

    // Apply search filter if provided (need to rebuild query)
    if (search) {
      skillsQuery = db
        .select({
          id: skill.id,
          name: skill.name,
          categoryId: skill.categoryId,
          active: skill.active,
          createdAt: skill.createdAt,
          updatedAt: skill.updatedAt,
          categoryName: category.name,
          categoryIcon: category.icon,
          mentorCount: mentorCountSubquery,
        })
        .from(skill)
        .leftJoin(category, eq(skill.categoryId, category.id))
        .where(ilike(skill.name, `%${search}%`))
    }

    const skillsData = await skillsQuery.orderBy(desc(skill.createdAt))

    return {
      skills: skillsData.map((s: any) => ({
        id: s.id,
        name: s.name,
        categoryId: s.categoryId,
        active: s.active,
        mentorCount: Number(s.mentorCount || 0),
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        category: s.categoryId ? {
          id: s.categoryId,
          name: s.categoryName,
          icon: s.categoryIcon
        } : null
      }))
    }
  } catch (error: any) {
    console.error('[Admin Skills API] Error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch skills',
    })
  }
})
