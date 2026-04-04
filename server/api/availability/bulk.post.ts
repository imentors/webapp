import { eq } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { availabilitySlot } from '../../db/schema'
import { auth } from '../../utils/auth'

interface SlotInput {
  dayOfWeek: number
  startTime: string
  endTime: string
  isAvailable?: boolean
}

interface BulkInput {
  slots: SlotInput[]
  replaceAll?: boolean // If true, delete all existing slots first
}

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  
  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  if (session.user.role !== 'mentor') {
    throw createError({ statusCode: 403, message: 'Only mentors can set availability' })
  }

  const body = await readBody<BulkInput>(event)

  if (!body.slots || !Array.isArray(body.slots)) {
    throw createError({ statusCode: 400, message: 'Slots array is required' })
  }

  // Validate all slots
  for (const slot of body.slots) {
    if (slot.dayOfWeek < 0 || slot.dayOfWeek > 6) {
      throw createError({ statusCode: 400, message: 'Invalid day of week' })
    }
    if (!slot.startTime || !slot.endTime) {
      throw createError({ statusCode: 400, message: 'Start and end time are required' })
    }
    if (slot.startTime >= slot.endTime) {
      throw createError({ statusCode: 400, message: 'End time must be after start time' })
    }
  }

  try {
    // If replaceAll, delete existing slots first
    if (body.replaceAll) {
      await db
        .delete(availabilitySlot)
        .where(eq(availabilitySlot.mentorId, session.user.id))
    }

    // Insert new slots
    if (body.slots.length > 0) {
      const newSlots = await db
        .insert(availabilitySlot)
        .values(
          body.slots.map(slot => ({
            mentorId: session.user.id,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isAvailable: slot.isAvailable ?? true,
          }))
        )
        .returning()

      return {
        slots: newSlots.map(slot => ({
          id: slot.id,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: slot.isAvailable,
        })),
      }
    }

    return { slots: [] }
  } catch (error: any) {
    console.error('[Availability API] Error bulk creating slots:', error)
    throw createError({ statusCode: 500, message: 'Failed to create availability slots' })
  }
})
