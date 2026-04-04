import { eq } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { booking, user, mentorProfile } from '../../db/schema'
import { auth } from '../../utils/auth'

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
        const result = await db
            .select({
                id: booking.id,
                mentorId: booking.mentorId,
                menteeId: booking.menteeId,
                title: booking.title,
                description: booking.description,
                scheduledDate: booking.scheduledDate,
                duration: booking.duration,
                status: booking.status,
                price: booking.price,
                meetingLink: booking.meetingLink,
                notes: booking.notes,
                paymentStatus: booking.paymentStatus,
                createdAt: booking.createdAt,
                confirmedAt: booking.confirmedAt,
                completedAt: booking.completedAt,
                cancelledAt: booking.cancelledAt,
                // Mentor info
                mentorName: user.name,
                mentorImage: user.image,
            })
            .from(booking)
            .leftJoin(user, eq(booking.mentorId, user.id))
            .where(eq(booking.id, bookingId))
            .limit(1)

        if (result.length === 0) {
            throw createError({ statusCode: 404, message: 'Booking not found' })
        }

        const b = result[0]
        const userId = session.user.id

        // Check if user is authorized to view this booking
        if (b.mentorId !== userId && b.menteeId !== userId) {
            throw createError({ statusCode: 403, message: 'Not authorized to view this booking' })
        }

        // Get mentor profile for additional details
        const mentorData = await db.query.mentorProfile.findFirst({
            where: eq(mentorProfile.userId, b.mentorId)
        })

        return {
            booking: {
                id: b.id,
                mentorId: b.mentorId,
                menteeId: b.menteeId,
                title: b.title,
                description: b.description,
                scheduledDate: b.scheduledDate,
                duration: b.duration,
                status: b.status,
                price: b.price ? parseFloat(b.price) : 0,
                meetingLink: b.meetingLink,
                notes: b.notes,
                paymentStatus: b.paymentStatus,
                createdAt: b.createdAt,
                confirmedAt: b.confirmedAt,
                completedAt: b.completedAt,
                cancelledAt: b.cancelledAt,
                mentor: b.mentorName ? {
                    id: b.mentorId,
                    name: b.mentorName,
                    image: b.mentorImage,
                    hourlyRate: mentorData?.hourlyRate ? parseFloat(mentorData.hourlyRate) : 0,
                    categories: mentorData?.categories ? JSON.parse(mentorData.categories) : [],
                } : null,
            }
        }
    } catch (error: any) {
        if (error.statusCode) throw error

        console.error('[Bookings API] Error fetching booking:', error)
        throw createError({ statusCode: 500, message: 'Failed to fetch booking' })
    }
})
