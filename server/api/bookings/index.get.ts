import { eq, and, or, desc, inArray } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { booking, user, mentorProfile } from '../../db/schema'
import { auth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
    const session = await auth.api.getSession({ headers: event.headers })

    if (!session?.user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const userId = session.user.id
    const query = getQuery(event)
    const status = query.status as string | undefined
    const role = query.role as 'mentor' | 'mentee' | undefined

    try {
        // Build where clause based on role
        let whereClause
        if (role === 'mentor') {
            whereClause = eq(booking.mentorId, userId)
        } else if (role === 'mentee') {
            whereClause = eq(booking.menteeId, userId)
        } else {
            // Get both mentor and mentee bookings
            whereClause = or(
                eq(booking.mentorId, userId),
                eq(booking.menteeId, userId)
            )
        }

        // Add status filter if provided
        if (status) {
            whereClause = and(whereClause, eq(booking.status, status as any))
        }

        // Need to join both mentor and mentee user tables
        const bookings = await db
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
                // Mentor info
                mentorName: user.name,
                mentorImage: user.image,
            })
            .from(booking)
            .leftJoin(user, eq(booking.mentorId, user.id))
            .where(whereClause!)
            .orderBy(desc(booking.scheduledDate))

        // Fetch mentee info separately for bookings where user is mentor
        const menteeIds = [...new Set(bookings.map(b => b.menteeId).filter(Boolean))]
        const mentees = menteeIds.length > 0 ? await db
            .select({
                id: user.id,
                name: user.name,
                image: user.image,
            })
            .from(user)
            .where(inArray(user.id, menteeIds))
            : []

        const menteeMap = new Map(mentees.map(m => [m.id, m]))

        // Parse and format bookings
        const formattedBookings = bookings.map(b => {
            const mentee = menteeMap.get(b.menteeId)
            return {
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
                mentor: b.mentorName ? {
                    id: b.mentorId,
                    name: b.mentorName,
                    image: b.mentorImage,
                } : null,
                mentee: mentee ? {
                    id: mentee.id,
                    name: mentee.name,
                    image: mentee.image,
                } : null,
            }
        })

        return { bookings: formattedBookings }
    } catch (error: any) {
        console.error('[Bookings API] Error fetching bookings:', error)
        throw createError({ statusCode: 500, message: 'Failed to fetch bookings' })
    }
})
