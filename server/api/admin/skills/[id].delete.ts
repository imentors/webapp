import { eq } from 'drizzle-orm'
import { db } from '../../../utils/drizzle'
import { skill } from '../../../db/schema'
import { auth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })

  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Admin access required' })
  }

  const skillId = getRouterParam(event, 'id')
  if (!skillId) {
    throw createError({ statusCode: 400, message: 'Skill ID is required' })
  }

  try {
    // Check if skill exists
    const existingSkill = await db
      .select()
      .from(skill)
      .where(eq(skill.id, skillId))
      .limit(1)

    if (existingSkill.length === 0) {
      throw createError({ statusCode: 404, message: 'Skill not found' })
    }

    // Delete skill
    await db
      .delete(skill)
      .where(eq(skill.id, skillId))

    return {
      success: true,
      message: 'Skill deleted successfully'
    }
  } catch (error: any) {
    console.error('[Admin Skills DELETE API] Error:', error)
    
    // If it's a custom error, re-throw it
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Failed to delete skill',
    })
  }
})
