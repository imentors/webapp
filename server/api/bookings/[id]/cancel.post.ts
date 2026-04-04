import { eq } from 'drizzle-orm'
import { db } from '../../../utils/drizzle'
import { booking, user } from '../../../db/schema'
import { auth } from '../../../utils/auth'
import { notifyUser } from '../../../utils/notifications'
import { createBookingCancelledMentorEmail, createBookingCancelledMenteeEmail } from '../../../email-templates'

export default defineEventHandler(async (event) => {
    const session = await auth.api.getSession({ headers: event.headers })

    if (!session?.user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const bookingId = getRouterParam(event, 'id')

    if (!bookingId) {
        throw createError({ statusCode: 400, message: 'Booking ID is required' })
    }

    try {
        // Get the booking
        const existingBooking = await db.query.booking.findFirst({
            where: eq(booking.id, bookingId)
        })

        if (!existingBooking) {
            throw createError({ statusCode: 404, message: 'Booking not found' })
        }

        const userId = session.user.id

        // Either mentor or mentee can cancel, but only if PENDING
        if (existingBooking.mentorId !== userId && existingBooking.menteeId !== userId) {
            throw createError({
                statusCode: 403,
                message: 'Not authorized to cancel this booking'
            })
        }

        // CRITICAL: No cancellation allowed after confirmation (no refunds)
        if (existingBooking.status === 'confirmed') {
            throw createError({
                statusCode: 400,
                message: 'Cannot cancel a confirmed booking. No refunds are available after confirmation.'
            })
        }

        // Already cancelled
        if (existingBooking.status === 'cancelled') {
            throw createError({ statusCode: 400, message: 'Booking is already cancelled' })
        }

        // Already completed
        if (existingBooking.status === 'completed') {
            throw createError({ statusCode: 400, message: 'Cannot cancel a completed booking' })
        }

        // Cancel the booking
        const [updatedBooking] = await db
            .update(booking)
            .set({
                status: 'cancelled',
                cancelledAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(booking.id, bookingId))
            .returning()

        // Get mentor and mentee details for notifications
        const mentorUser = await db.query.user.findFirst({
            where: eq(user.id, existingBooking.mentorId),
            columns: { name: true, email: true }
        })

        const menteeUser = await db.query.user.findFirst({
            where: eq(user.id, existingBooking.menteeId),
            columns: { name: true, email: true }
        })

        const cancelledBy = userId === existingBooking.mentorId ? mentorUser : menteeUser
        const otherPartyId = userId === existingBooking.mentorId ? existingBooking.menteeId : existingBooking.mentorId

        // Prepare booking details for notifications
        const bookingDetails = {
            mentorName: mentorUser?.name || 'Mentor',
            menteeName: menteeUser?.name || 'Mentee',
            sessionTitle: existingBooking.title,
            scheduledDate: existingBooking.scheduledDate,
            duration: existingBooking.duration,
            price: existingBooking.price?.toString() || '0',
            bookingId: bookingId
        }

        const cancelledByRole: 'mentor' | 'mentee' = userId === existingBooking.mentorId ? 'mentor' : 'mentee'

        // Prepare email content
        const mentorEmail = createBookingCancelledMentorEmail(bookingDetails, cancelledByRole)
        const menteeEmail = createBookingCancelledMenteeEmail(bookingDetails, cancelledByRole)

        // Send in-app and email notifications
        await Promise.all([
            notifyUser(userId, {
                inApp: {
                    userId: userId,
                    type: 'warning',
                    title: 'Booking Cancelled',
                    message: `You cancelled "${existingBooking.title}"`,
                    actionUrl: `/bookings?id=${bookingId}`
                },
                email: cancelledByRole === 'mentor' ? mentorEmail : menteeEmail
            }),
            notifyUser(otherPartyId, {
                inApp: {
                    userId: otherPartyId,
                    type: 'warning',
                    title: 'Booking Cancelled',
                    message: `${cancelledBy?.name || 'The other party'} cancelled "${existingBooking.title}"`,
                    actionUrl: `/bookings?id=${bookingId}`
                },
                email: cancelledByRole === 'mentor' ? menteeEmail : mentorEmail
            })
        ])

        return {
            success: true,
            booking: {
                id: updatedBooking.id,
                status: updatedBooking.status,
                cancelledAt: updatedBooking.cancelledAt,
            },
            message: 'Booking cancelled successfully. Note: Confirmed bookings cannot be cancelled.'
        }
    } catch (error: any) {
        if (error.statusCode) throw error

        console.error('[Bookings API] Error cancelling booking:', error)
        throw createError({ statusCode: 500, message: 'Failed to cancel booking' })
    }
})
