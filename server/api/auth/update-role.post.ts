import { eq } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { user } from '../../db/schema'
import { auth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  // Get current session
  const session = await auth.api.getSession({ headers: event.headers })

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const body = await readBody<{ role: string }>(event)

  // Validate role
  if (!body.role || !['mentor', 'mentee'].includes(body.role)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid role. Must be "mentor" or "mentee".',
    })
  }

  // Only allow role update if user hasn't completed onboarding
  // This prevents users from changing their role after setup
  const existingUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  })

  if (!existingUser) {
    throw createError({
      statusCode: 404,
      message: 'User not found',
    })
  }

  if (existingUser.hasCompletedOnboarding) {
    throw createError({
      statusCode: 403,
      message: 'Cannot change role after completing onboarding',
    })
  }

  try {
    // Update the user's role
    await db
      .update(user)
      .set({
        role: body.role as 'mentor' | 'mentee',
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id))

    return {
      success: true,
      role: body.role,
    }
  } catch (error: any) {
    console.error('[Auth] Failed to update role:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to update role',
    })
  }
})
