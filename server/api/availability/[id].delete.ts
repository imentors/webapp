import { eq, and } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { availabilitySlot } from '../../db/schema'
import { auth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  
  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, message: 'Slot ID is required' })
  }

  try {
    // Delete only if the slot belongs to the current user
    const result = await db
      .delete(availabilitySlot)
      .where(
        and(
          eq(availabilitySlot.id, id),
          eq(availabilitySlot.mentorId, session.user.id)
        )
      )
      .returning()

    if (result.length === 0) {
      throw createError({ statusCode: 404, message: 'Slot not found or not authorized' })
    }

    return { success: true }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[Availability API] Error deleting slot:', error)
    throw createError({ statusCode: 500, message: 'Failed to delete availability slot' })
  }
})
