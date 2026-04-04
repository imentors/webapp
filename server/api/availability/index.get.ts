import { eq, and, or, gte } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { availabilitySlot, booking } from '../../db/schema'
import { auth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  const query = getQuery(event)
  const mentorId = (query.mentorId as string) || session?.user?.id

  if (!mentorId) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  try {
    const [slots, bookings] = await Promise.all([
      db
        .select()
        .from(availabilitySlot)
        .where(eq(availabilitySlot.mentorId, mentorId))
        .orderBy(availabilitySlot.dayOfWeek, availabilitySlot.startTime),

      db
        .select({
          id: booking.id,
          scheduledDate: booking.scheduledDate,
          duration: booking.duration,
          status: booking.status
        })
        .from(booking)
        .where(
          and(
            eq(booking.mentorId, mentorId),
            or(
              eq(booking.status, 'confirmed'),
              eq(booking.status, 'pending')
            ),
            gte(booking.scheduledDate, new Date()) // Only future bookings
          )
        )
    ])

    return {
      slots: slots.map(slot => ({
        id: slot.id,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: slot.isAvailable,
      })),
      bookings: bookings.map(b => ({
        id: b.id,
        scheduledDate: b.scheduledDate,
        duration: b.duration
      }))
    }
  } catch (error: any) {
    console.error('[Availability API] Error fetching slots:', error)
    throw createError({ statusCode: 500, message: 'Failed to fetch availability' })
  }
})
