import { eq } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { availabilitySlot, user } from '../../db/schema'
import { auth } from '../../utils/auth'

interface SlotInput {
  dayOfWeek: number
  startTime: string
  endTime: string
  isAvailable?: boolean
}

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  
  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  // Verify user is a mentor
  if (session.user.role !== 'mentor') {
    throw createError({ statusCode: 403, message: 'Only mentors can set availability' })
  }

  const body = await readBody<SlotInput>(event)

  // Validate input
  if (body.dayOfWeek < 0 || body.dayOfWeek > 6) {
    throw createError({ statusCode: 400, message: 'Invalid day of week' })
  }

  if (!body.startTime || !body.endTime) {
    throw createError({ statusCode: 400, message: 'Start and end time are required' })
  }

  if (body.startTime >= body.endTime) {
    throw createError({ statusCode: 400, message: 'End time must be after start time' })
  }

  try {
    const [newSlot] = await db
      .insert(availabilitySlot)
      .values({
        mentorId: session.user.id,
        dayOfWeek: body.dayOfWeek,
        startTime: body.startTime,
        endTime: body.endTime,
        isAvailable: body.isAvailable ?? true,
      })
      .returning()

    return {
      slot: {
        id: newSlot.id,
        dayOfWeek: newSlot.dayOfWeek,
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
        isAvailable: newSlot.isAvailable,
      },
    }
  } catch (error: any) {
    console.error('[Availability API] Error creating slot:', error)
    throw createError({ statusCode: 500, message: 'Failed to create availability slot' })
  }
})
