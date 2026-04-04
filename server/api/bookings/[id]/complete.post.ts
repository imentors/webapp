import { eq, sql } from 'drizzle-orm'
import { db } from '../../../utils/drizzle'
import { booking, mentorProfile, user, mentorEarning } from '../../../db/schema'
import { auth } from '../../../utils/auth'
import { notifyUser } from '../../../utils/notifications'
import { createSessionCompletedMentorEmail, createSessionCompletedMenteeEmail } from '../../../email-templates'
import { calculateEarnings } from '../../../utils/stripe'

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

        // Either the mentor or the mentee can mark a session as complete
        if (existingBooking.mentorId !== session.user.id && existingBooking.menteeId !== session.user.id) {
            throw createError({
                statusCode: 403,
                message: 'Only the participants of this session can mark it as complete'
            })
        }

        // Must be confirmed to complete
        if (existingBooking.status !== 'confirmed') {
            throw createError({
                statusCode: 400,
                message: 'Can only complete confirmed bookings'
            })
        }

        // Determine who is completing the session
        const isMentor = existingBooking.mentorId === session.user.id

        // Update booking to completed
        const [updatedBooking] = await db
            .update(booking)
            .set({
                status: 'completed',
                completedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(booking.id, bookingId))
            .returning()

        // Increment mentor's total sessions
        await db
            .update(mentorProfile)
            .set({
                totalSessions: sql`COALESCE(${mentorProfile.totalSessions}, 0) + 1`,
                updatedAt: new Date(),
            })
            .where(eq(mentorProfile.userId, existingBooking.mentorId))

        // Check if earning record exists (created by webhook) or create one
        const existingEarning = await db.query.mentorEarning.findFirst({
            where: eq(mentorEarning.bookingId, bookingId)
        })

        if (existingEarning) {
            // Update existing earning status to 'available' for payout
            await db
                .update(mentorEarning)
                .set({
                    status: 'available',
                    availableAt: new Date(),
                    updatedAt: new Date(),
                })
                .where(eq(mentorEarning.bookingId, bookingId))
        } else {
            // Create earning record if it doesn't exist (e.g., mock payments, webhook missed)
            const bookingPrice = parseFloat(existingBooking.price || '0')
            const earnings = calculateEarnings(bookingPrice)
            
            await db.insert(mentorEarning).values({
                mentorId: existingBooking.mentorId,
                bookingId: bookingId,
                grossAmount: earnings.grossAmount.toFixed(2),
                platformFee: earnings.platformFee.toFixed(2),
                netAmount: earnings.netAmount.toFixed(2),
                status: 'available',
                availableAt: new Date(),
            })
        }

        // Get mentor and mentee details for notifications
        const mentorUser = await db.query.user.findFirst({
            where: eq(user.id, existingBooking.mentorId),
            columns: { name: true, email: true }
        })

        const menteeUser = await db.query.user.findFirst({
            where: eq(user.id, existingBooking.menteeId),
            columns: { name: true, email: true }
        })

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

        // Prepare email content
        const mentorEmail = createSessionCompletedMentorEmail(bookingDetails)
        const menteeEmail = createSessionCompletedMenteeEmail(bookingDetails)

        // Send in-app and email notifications
        await Promise.all([
            notifyUser(existingBooking.mentorId, {
                inApp: {
                    userId: existingBooking.mentorId,
                    type: 'info',
                    title: 'Session Completed',
                    message: isMentor 
                        ? `You marked "${existingBooking.title}" as completed. Great work!`
                        : `${menteeUser?.name || 'The mentee'} marked "${existingBooking.title}" as completed.`,
                    actionUrl: `/bookings?id=${bookingId}`
                },
                email: mentorEmail
            }),
            notifyUser(existingBooking.menteeId, {
                inApp: {
                    userId: existingBooking.menteeId,
                    type: 'info',
                    title: 'Session Completed',
                    message: isMentor
                        ? `Your session "${existingBooking.title}" is complete. Please leave a review!`
                        : `You marked "${existingBooking.title}" as complete. Please leave a review!`,
                    actionUrl: `/bookings?id=${bookingId}`
                },
                email: menteeEmail
            })
        ])

        return {
            success: true,
            booking: {
                id: updatedBooking.id,
                status: updatedBooking.status,
                completedAt: updatedBooking.completedAt,
            }
        }
    } catch (error: any) {
        if (error.statusCode) throw error

        console.error('[Bookings API] Error completing booking:', error)
        throw createError({ statusCode: 500, message: 'Failed to complete booking' })
    }
})
