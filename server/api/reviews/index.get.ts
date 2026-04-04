import { eq, sql, desc } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { review, user } from '../../db/schema'
import { auth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
    const session = await auth.api.getSession({ headers: event.headers })
    const query = getQuery(event)
    const mentorId = query.mentorId as string | undefined
    const bookingId = query.bookingId as string | undefined

    if (!session?.user && !mentorId && !bookingId) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }
    const limit = parseInt((query.limit as string) || '10')
    const offset = parseInt((query.offset as string) || '0')

    try {
        let whereClause

        if (bookingId) {
            // Get review for a specific booking
            whereClause = eq(review.bookingId, bookingId)
        } else if (mentorId) {
            // Get reviews for a specific mentor
            whereClause = eq(review.mentorId, mentorId)
        } else {
            throw createError({ statusCode: 400, message: 'Either mentorId or bookingId must be provided' })
        }

        const reviews = await db
            .select({
                id: review.id,
                bookingId: review.bookingId,
                mentorId: review.mentorId,
                menteeId: review.menteeId,
                rating: review.rating,
                comment: review.comment,
                createdAt: review.createdAt,
                // Mentee info
                menteeName: user.name,
                menteeImage: user.image,
            })
            .from(review)
            .leftJoin(user, eq(review.menteeId, user.id))
            .where(whereClause)
            .orderBy(desc(review.createdAt))
            .limit(limit)
            .offset(offset)

        // Get total count for pagination
        const totalCountResult = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(review)
            .where(whereClause)

        const totalCount = totalCountResult[0]?.count || 0

        return {
            reviews: reviews.map(r => ({
                id: r.id,
                bookingId: r.bookingId,
                mentorId: r.mentorId,
                menteeId: r.menteeId,
                rating: r.rating,
                comment: r.comment,
                createdAt: r.createdAt,
                mentee: r.menteeName ? {
                    id: r.menteeId,
                    name: r.menteeName,
                    image: r.menteeImage,
                } : null,
            })),
            total: totalCount,
            limit,
            offset,
        }
    } catch (error: any) {
        if (error.statusCode) throw error
        console.error('[Reviews API] Error fetching reviews:', error)
        throw createError({ statusCode: 500, message: 'Failed to fetch reviews' })
    }
})

