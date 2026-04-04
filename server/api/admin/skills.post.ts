import { eq } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { skill, category } from '../../db/schema'
import { auth } from '../../utils/auth'

interface CreateSkillBody {
  name: string
  categoryId?: string
}

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })

  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Admin access required' })
  }

  const body = await readBody<CreateSkillBody>(event)

  // Validate required fields
  if (!body.name?.trim()) {
    throw createError({ statusCode: 400, message: 'Skill name is required' })
  }

  try {
    // If categoryId provided, check if category exists
    if (body.categoryId) {
      const existingCategory = await db
        .select()
        .from(category)
        .where(eq(category.id, body.categoryId))
        .limit(1)

      if (existingCategory.length === 0) {
        throw createError({ statusCode: 400, message: 'Invalid category ID' })
      }
    }

    // Check if skill with same name already exists
    const existingSkill = await db
      .select()
      .from(skill)
      .where(eq(skill.name, body.name.trim()))
      .limit(1)

    if (existingSkill.length > 0) {
      throw createError({ statusCode: 409, message: 'Skill with this name already exists' })
    }

    // Create new skill
    const newSkill = await db
      .insert(skill)
      .values({
        name: body.name.trim(),
        categoryId: body.categoryId || null,
        active: true,
      })
      .returning()

    return {
      skill: newSkill[0]
    }
  } catch (error: any) {
    console.error('[Admin Skills POST API] Error:', error)
    
    // If it's a custom error, re-throw it
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Failed to create skill',
    })
  }
})
