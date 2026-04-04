import { eq, and } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { booking, availabilitySlot, mentorProfile, user } from '../../db/schema'
import { auth } from '../../utils/auth'
import { createPaymentIntent } from '../../utils/stripe'
import { notifyUser } from '../../utils/notifications'
import { createNewBookingMentorEmail, createNewBookingMenteeEmail } from '../../email-templates'

interface CreateBookingBody {
    mentorId: string
    date: string // YYYY-MM-DD
    time: string // HH:MM
    duration: number // minutes
    title: string
    description?: string
}

export default defineEventHandler(async (event) => {
    const session = await auth.api.getSession({ headers: event.headers })

    if (!session?.user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const menteeId = session.user.id
    const body = await readBody<CreateBookingBody>(event)

    // Validate required fields
    if (!body.mentorId || !body.date || !body.time || !body.duration || !body.title) {
        throw createError({
            statusCode: 400,
            message: 'Missing required fields: mentorId, date, time, duration, title'
        })
    }

    // Prevent booking yourself
    if (body.mentorId === menteeId) {
        throw createError({
            statusCode: 400,
            message: 'You cannot book a session with yourself'
        })
    }

    try {
        // Get mentor profile to calculate price
        const mentor = await db.query.mentorProfile.findFirst({
            where: eq(mentorProfile.userId, body.mentorId)
        })

        if (!mentor) {
            throw createError({ statusCode: 404, message: 'Mentor not found' })
        }

        // Calculate price based on hourly rate
        const hourlyRate = mentor.hourlyRate ? parseFloat(mentor.hourlyRate) : 0
        const price = Math.round((hourlyRate * body.duration) / 60 * 100) / 100

        // Parse scheduled date
        const scheduledDate = new Date(`${body.date}T${body.time}:00`)

        if (isNaN(scheduledDate.getTime())) {
            throw createError({ statusCode: 400, message: 'Invalid date or time format' })
        }

        // Check if date is in the future
        if (scheduledDate <= new Date()) {
            throw createError({ statusCode: 400, message: 'Cannot book a session in the past' })
        }

        // Check mentor availability for this time slot
        const dayOfWeek = scheduledDate.getDay()

        const daySlots = await db.query.availabilitySlot.findMany({
            where: and(
                eq(availabilitySlot.mentorId, body.mentorId),
                eq(availabilitySlot.dayOfWeek, dayOfWeek),
                eq(availabilitySlot.isAvailable, true)
            )
        })

        const isSlotAvailable = daySlots.some(slot => {
            const slotStart = parseInt(slot.startTime.replace(':', ''))
            const slotEnd = parseInt(slot.endTime.replace(':', ''))
            const requestTime = parseInt(body.time.replace(':', ''))

            // Calculate end time of the booking
            const [reqHours, reqMinutes] = body.time.split(':').map(Number)
            const bookingEndTimeDate = new Date()
            bookingEndTimeDate.setHours(reqHours, reqMinutes + body.duration)
            const bookingEnd = parseInt(`${String(bookingEndTimeDate.getHours()).padStart(2, '0')}${String(bookingEndTimeDate.getMinutes()).padStart(2, '0')}`)

            return requestTime >= slotStart && bookingEnd <= slotEnd
        })

        if (!isSlotAvailable) {
            throw createError({
                statusCode: 400,
                message: 'This time slot is not available'
            })
        }

        // Check for existing booking at this time
        const existingBooking = await db.query.booking.findFirst({
            where: and(
                eq(booking.mentorId, body.mentorId),
                eq(booking.scheduledDate, scheduledDate),
                eq(booking.status, 'confirmed')
            )
        })

        if (existingBooking) {
            throw createError({
                statusCode: 400,
                message: 'This time slot is already booked'
            })
        }

        // Create booking record (pending payment)
        const [newBooking] = await db
            .insert(booking)
            .values({
                mentorId: body.mentorId,
                menteeId,
                title: body.title,
                description: body.description || null,
                scheduledDate,
                duration: body.duration,
                status: 'pending',
                price: price.toString(),
                paymentStatus: 'pending',
            })
            .returning()

        // Create Stripe PaymentIntent
        const priceInCents = Math.round(price * 100)
        const paymentIntent = await createPaymentIntent({
            amount: priceInCents,
            mentorId: body.mentorId,
            menteeId,
            bookingId: newBooking.id,
            duration: body.duration,
        })

        if (!paymentIntent) {
            // If Stripe fails, still return booking with mock payment for development
            console.warn('[Bookings API] Stripe not configured, using mock payment')

            return {
                booking: {
                    id: newBooking.id,
                    mentorId: newBooking.mentorId,
                    menteeId: newBooking.menteeId,
                    title: newBooking.title,
                    description: newBooking.description,
                    scheduledDate: newBooking.scheduledDate,
                    duration: newBooking.duration,
                    status: newBooking.status,
                    price,
                },
                payment: {
                    clientSecret: `mock_secret_${newBooking.id}`,
                    paymentIntentId: `mock_pi_${newBooking.id}`,
                }
            }
        }

        // Update booking with payment intent ID
        await db
            .update(booking)
            .set({ stripePaymentIntentId: paymentIntent.id })
            .where(eq(booking.id, newBooking.id))

        // Get mentor and mentee details for notifications
        const mentorUser = await db.query.user.findFirst({
            where: eq(user.id, body.mentorId),
            columns: { name: true, email: true }
        })

        const menteeUser = await db.query.user.findFirst({
            where: eq(user.id, menteeId),
            columns: { name: true, email: true }
        })

        // Prepare booking details for notifications
        const bookingDetails = {
            mentorName: mentorUser?.name || 'Mentor',
            menteeName: menteeUser?.name || 'Mentee',
            sessionTitle: body.title,
            scheduledDate,
            duration: body.duration,
            price: price.toString(),
            bookingId: newBooking.id
        }

        // Prepare email content
        const mentorEmail = createNewBookingMentorEmail(bookingDetails)
        const menteeEmail = createNewBookingMenteeEmail(bookingDetails)

        // Send in-app and email notifications
        await Promise.all([
            notifyUser(body.mentorId, {
                inApp: {
                    userId: body.mentorId,
                    type: 'info',
                    title: 'New Booking Request',
                    message: `${menteeUser?.name || 'A mentee'} has requested a session: "${body.title}"`,
                    actionUrl: `/bookings?id=${newBooking.id}`
                },
                email: mentorEmail
            }),
            notifyUser(menteeId, {
                inApp: {
                    userId: menteeId,
                    type: 'info',
                    title: 'Booking Created',
                    message: `Your booking request "${body.title}" has been created. Please complete payment.`,
                    actionUrl: `/bookings?id=${newBooking.id}`
                },
                email: menteeEmail
            })
        ])

        return {
            booking: {
                id: newBooking.id,
                mentorId: newBooking.mentorId,
                menteeId: newBooking.menteeId,
                title: newBooking.title,
                description: newBooking.description,
                scheduledDate: newBooking.scheduledDate,
                duration: newBooking.duration,
                status: newBooking.status,
                price,
            },
            payment: {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
            }
        }
    } catch (error: any) {
        if (error.statusCode) throw error

        console.error('[Bookings API] Error creating booking:', error)
        throw createError({ statusCode: 500, message: 'Failed to create booking' })
    }
})
