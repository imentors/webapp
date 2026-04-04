import { eq } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { availabilitySlot } from '../../db/schema'
import { auth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  
  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  if (session.user.role !== 'mentor') {
    throw createError({ statusCode: 403, message: 'Only mentors can manage availability' })
  }

  try {
    await db
      .delete(availabilitySlot)
      .where(eq(availabilitySlot.mentorId, session.user.id))

    return { success: true }
  } catch (error: any) {
    console.error('[Availability API] Error clearing slots:', error)
    throw createError({ statusCode: 500, message: 'Failed to clear availability' })
  }
})
