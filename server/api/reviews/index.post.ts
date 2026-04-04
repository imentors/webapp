import { eq, and } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { review, booking, mentorProfile, user } from '../../db/schema'
import { auth } from '../../utils/auth'
import { sql } from 'drizzle-orm'
import { notifyUser } from '../../utils/notifications'
import { createReviewReceivedEmail } from '../../email-templates'

export default defineEventHandler(async (event) => {
    const session = await auth.api.getSession({ headers: event.headers })

    if (!session?.user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const body = await readBody<{
        bookingId: string
        rating: number
        comment?: string
    }>(event)

    // Validate input
    if (!body.bookingId || !body.rating) {
        throw createError({ statusCode: 400, message: 'Booking ID and rating are required' })
    }

    if (body.rating < 1 || body.rating > 5) {
        throw createError({ statusCode: 400, message: 'Rating must be between 1 and 5' })
    }

    try {
        // Get the booking
        const existingBooking = await db.query.booking.findFirst({
            where: eq(booking.id, body.bookingId)
        })

        if (!existingBooking) {
            throw createError({ statusCode: 404, message: 'Booking not found' })
        }

        // Only the mentee can review (and only for completed bookings)
        if (existingBooking.menteeId !== session.user.id) {
            throw createError({ statusCode: 403, message: 'Only the mentee can review this session' })
        }

        if (existingBooking.status !== 'completed') {
            throw createError({ statusCode: 400, message: 'Can only review completed sessions' })
        }

        // Check if review already exists
        const existingReview = await db.query.review.findFirst({
            where: eq(review.bookingId, body.bookingId)
        })

        if (existingReview) {
            throw createError({ statusCode: 400, message: 'Review already exists for this booking' })
        }

        // Create the review
        const [newReview] = await db
            .insert(review)
            .values({
                bookingId: body.bookingId,
                mentorId: existingBooking.mentorId,
                menteeId: existingBooking.menteeId,
                rating: body.rating,
                comment: body.comment || null,
            })
            .returning()

        // Update mentor's average rating
        const mentorReviews = await db
            .select({
                rating: review.rating,
            })
            .from(review)
            .where(eq(review.mentorId, existingBooking.mentorId))

        if (mentorReviews.length > 0) {
            const averageRating = mentorReviews.reduce((sum, r) => sum + r.rating, 0) / mentorReviews.length
            const roundedRating = Math.round(averageRating * 100) / 100 // Round to 2 decimal places
            
            await db
                .update(mentorProfile)
                .set({
                    rating: sql`${roundedRating}::numeric(3,2)`,
                    updatedAt: new Date(),
                })
                .where(eq(mentorProfile.userId, existingBooking.mentorId))
        }

        // Get mentor and mentee names for notifications
        const mentorUser = await db.query.user.findFirst({
            where: eq(user.id, existingBooking.mentorId),
            columns: { name: true, email: true }
        })

        const menteeUser = await db.query.user.findFirst({
            where: eq(user.id, existingBooking.menteeId),
            columns: { name: true }
        })

        // Prepare email content
        const reviewEmail = createReviewReceivedEmail({
            mentorName: mentorUser?.name || 'Mentor',
            menteeName: menteeUser?.name || 'A mentee',
            sessionTitle: existingBooking.title,
            rating: body.rating,
            comment: body.comment
        })

        // Send in-app and email notification to mentor
        await notifyUser(existingBooking.mentorId, {
            inApp: {
                userId: existingBooking.mentorId,
                type: 'info',
                title: 'New Review Received',
                message: `${menteeUser?.name || 'A mentee'} left you a ${body.rating}-star review${body.comment ? `: "${body.comment.substring(0, 50)}${body.comment.length > 50 ? '...' : ''}"` : ''}`,
                actionUrl: '/profile'
            },
            email: reviewEmail
        })

        return {
            review: {
                id: newReview.id,
                bookingId: newReview.bookingId,
                mentorId: newReview.mentorId,
                menteeId: newReview.menteeId,
                rating: newReview.rating,
                comment: newReview.comment,
                createdAt: newReview.createdAt,
            }
        }
    } catch (error: any) {
        if (error.statusCode) throw error
        console.error('[Reviews API] Error creating review:', error)
        throw createError({ statusCode: 500, message: 'Failed to create review' })
    }
})

