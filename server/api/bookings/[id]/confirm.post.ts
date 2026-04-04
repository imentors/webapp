import { eq } from 'drizzle-orm'
import { db } from '../../../utils/drizzle'
import { booking, user } from '../../../db/schema'
import { auth } from '../../../utils/auth'
import { createJaaSMeeting, generateMeetingLink } from '../../../utils/meeting'
import { getPaymentIntent, isPaymentSuccessful } from '../../../utils/stripe'
import { notifyUser } from '../../../utils/notifications'
import { createBookingConfirmedMentorEmail, createBookingConfirmedMenteeEmail } from '../../../email-templates'

interface ConfirmBookingBody {
    paymentIntentId?: string
}

export default defineEventHandler(async (event) => {
    const session = await auth.api.getSession({ headers: event.headers })

    if (!session?.user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const bookingId = getRouterParam(event, 'id')
    const body = await readBody<ConfirmBookingBody>(event)

    if (!bookingId) {
        throw createError({ statusCode: 400, message: 'Booking ID is required' })
    }

    try {
        // Get the booking
        const bookingResult = await db
            .select({
                booking: booking,
            })
            .from(booking)
            .where(eq(booking.id, bookingId))
            .limit(1)

        if (bookingResult.length === 0) {
            throw createError({ statusCode: 404, message: 'Booking not found' })
        }

        const existingBooking = bookingResult[0].booking

        // Only the mentee who created the booking can confirm it
        if (existingBooking.menteeId !== session.user.id) {
            throw createError({
                statusCode: 403,
                message: 'Only the booking creator can confirm payment'
            })
        }

        // Check if already confirmed
        if (existingBooking.status === 'confirmed') {
            throw createError({ statusCode: 400, message: 'Booking is already confirmed' })
        }

        // Check if cancelled
        if (existingBooking.status === 'cancelled') {
            throw createError({ statusCode: 400, message: 'Cannot confirm a cancelled booking' })
        }

        // Verify payment status with Stripe
        const paymentIntentId = body.paymentIntentId || existingBooking.stripePaymentIntentId
        let paymentVerified = false

        if (paymentIntentId && !paymentIntentId.startsWith('mock_')) {
            const paymentIntent = await getPaymentIntent(paymentIntentId)
            if (paymentIntent && isPaymentSuccessful(paymentIntent)) {
                paymentVerified = true
            }
        } else {
            // Mock payment for development
            paymentVerified = true
        }

        if (!paymentVerified) {
            throw createError({
                statusCode: 400,
                message: 'Payment has not been completed'
            })
        }

        // Get mentor and mentee details for meeting creation
        const mentorUser = await db.query.user.findFirst({
            where: eq(user.id, existingBooking.mentorId),
            columns: { id: true, name: true, email: true, image: true }
        })

        const menteeUser = await db.query.user.findFirst({
            where: eq(user.id, existingBooking.menteeId),
            columns: { id: true, name: true, email: true, image: true }
        })

        // Generate meeting links using JaaS (with individual JWTs for each participant)
        let meetingLink: string
        let mentorMeetingLink: string | undefined
        let menteeMeetingLink: string | undefined

        const jaasMeeting = await createJaaSMeeting({
            title: existingBooking.title,
            startTime: existingBooking.scheduledDate,
            durationMinutes: existingBooking.duration,
            mentor: {
                id: existingBooking.mentorId,
                name: mentorUser?.name || 'Mentor',
                email: mentorUser?.email || undefined,
                avatar: mentorUser?.image || undefined,
            },
            mentee: {
                id: existingBooking.menteeId,
                name: menteeUser?.name || 'Mentee',
                email: menteeUser?.email || undefined,
                avatar: menteeUser?.image || undefined,
            },
        })

        if (jaasMeeting) {
            meetingLink = jaasMeeting.menteeMeetingLink // Default link stored in DB
            mentorMeetingLink = jaasMeeting.mentorMeetingLink
            menteeMeetingLink = jaasMeeting.menteeMeetingLink
        } else {
            // Fallback to simple meeting link
            meetingLink = await generateMeetingLink({
                title: existingBooking.title,
                startTime: existingBooking.scheduledDate,
                durationMinutes: existingBooking.duration,
            })
            mentorMeetingLink = meetingLink
            menteeMeetingLink = meetingLink
        }

        // Update booking status to confirmed
        const [updatedBooking] = await db
            .update(booking)
            .set({
                status: 'confirmed',
                paymentStatus: 'succeeded',
                meetingLink,
                confirmedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(booking.id, bookingId))
            .returning()

        // Prepare booking details for notifications (with individual links)
        const mentorBookingDetails = {
            mentorName: mentorUser?.name || 'Mentor',
            menteeName: menteeUser?.name || 'Mentee',
            sessionTitle: existingBooking.title,
            scheduledDate: existingBooking.scheduledDate,
            duration: existingBooking.duration,
            price: existingBooking.price?.toString() || '0',
            bookingId: bookingId,
            meetingLink: mentorMeetingLink
        }

        const menteeBookingDetails = {
            mentorName: mentorUser?.name || 'Mentor',
            menteeName: menteeUser?.name || 'Mentee',
            sessionTitle: existingBooking.title,
            scheduledDate: existingBooking.scheduledDate,
            duration: existingBooking.duration,
            price: existingBooking.price?.toString() || '0',
            bookingId: bookingId,
            meetingLink: menteeMeetingLink
        }

        // Prepare email content with individual meeting links
        const mentorEmailContent = createBookingConfirmedMentorEmail(mentorBookingDetails)
        const menteeEmailContent = createBookingConfirmedMenteeEmail(menteeBookingDetails)

        // Send in-app and email notifications
        await Promise.all([
            notifyUser(existingBooking.mentorId, {
                inApp: {
                    userId: existingBooking.mentorId,
                    type: 'info',
                    title: 'Session Confirmed',
                    message: `Your session "${existingBooking.title}" with ${menteeUser?.name || 'a mentee'} has been confirmed!`,
                    actionUrl: `/bookings?id=${bookingId}`
                },
                email: mentorEmailContent
            }),
            notifyUser(existingBooking.menteeId, {
                inApp: {
                    userId: existingBooking.menteeId,
                    type: 'info',
                    title: 'Payment Successful',
                    message: `Your booking "${existingBooking.title}" is confirmed! Check your email for the meeting link.`,
                    actionUrl: `/bookings?id=${bookingId}`
                },
                email: menteeEmailContent
            })
        ])

        return {
            success: true,
            booking: {
                id: updatedBooking.id,
                status: updatedBooking.status,
                meetingLink: updatedBooking.meetingLink,
                paymentStatus: updatedBooking.paymentStatus,
                confirmedAt: updatedBooking.confirmedAt,
            }
        }
    } catch (error: any) {
        if (error.statusCode) throw error

        console.error('[Bookings API] Error confirming booking:', error)
        throw createError({ statusCode: 500, message: 'Failed to confirm booking' })
    }
})
