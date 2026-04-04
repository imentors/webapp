import { eq } from 'drizzle-orm'
import { db } from '../../../utils/drizzle'
import { skill, category } from '../../../db/schema'
import { auth } from '../../../utils/auth'

interface UpdateSkillBody {
  name?: string
  categoryId?: string
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

  const skillId = getRouterParam(event, 'id')
  if (!skillId) {
    throw createError({ statusCode: 400, message: 'Skill ID is required' })
  }

  const body = await readBody<UpdateSkillBody>(event)

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

    // If updating categoryId, check if category exists
    if (body.categoryId !== undefined && body.categoryId !== null) {
      const existingCategory = await db
        .select()
        .from(category)
        .where(eq(category.id, body.categoryId))
        .limit(1)

      if (existingCategory.length === 0) {
        throw createError({ statusCode: 400, message: 'Invalid category ID' })
      }
    }

    // If updating name, check for duplicates
    if (body.name && body.name.trim() !== existingSkill[0].name) {
      const duplicateSkill = await db
        .select()
        .from(skill)
        .where(eq(skill.name, body.name.trim()))
        .limit(1)

      if (duplicateSkill.length > 0) {
        throw createError({ statusCode: 409, message: 'Skill with this name already exists' })
      }
    }

    // Prepare update data
    const updateData: Partial<typeof skill.$inferInsert> = {}
    if (body.name !== undefined) updateData.name = body.name.trim()
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId
    if (body.active !== undefined) updateData.active = body.active

    // Update skill
    const updatedSkill = await db
      .update(skill)
      .set(updateData)
      .where(eq(skill.id, skillId))
      .returning()

    return {
      skill: updatedSkill[0]
    }
  } catch (error: any) {
    console.error('[Admin Skills PUT API] Error:', error)
    
    // If it's a custom error, re-throw it
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Failed to update skill',
    })
  }
})
