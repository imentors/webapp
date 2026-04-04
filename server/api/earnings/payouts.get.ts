import { eq, desc, and, gte, lte, sql } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { mentorPayout, mentorEarning } from '../../db/schema'
import { requireAuth } from '../../utils/auth'

interface PayoutsResponse {
    payouts: any[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

export default defineEventHandler(async (event): Promise<PayoutsResponse> => {
    const session = await requireAuth(event)
    const userId = session.user.id

    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const status = query.status as string

    // Build where conditions
    const conditions = [eq(mentorPayout.mentorId, userId)]
    if (status && status !== 'all') {
        conditions.push(eq(mentorPayout.status, status as any))
    }

    // Count total
    const countResult = await db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(mentorPayout)
        .where(and(...conditions))

    const total = countResult[0]?.count ?? 0

    // Fetch payouts
    const payouts = await db
        .select()
        .from(mentorPayout)
        .where(and(...conditions))
        .orderBy(desc(mentorPayout.createdAt))
        .limit(limit)
        .offset((page - 1) * limit)

    // For each payout, get the earnings count
    const payoutsWithDetails = await Promise.all(
        payouts.map(async (payout) => {
            const earningsCount = await db
                .select({ count: sql<number>`count(*)`.mapWith(Number) })
                .from(mentorEarning)
                .where(eq(mentorEarning.payoutId, payout.id))

            return {
                ...payout,
                earningsCount: earningsCount[0]?.count ?? 0,
            }
        })
    )

    return {
        payouts: payoutsWithDetails,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    }
})
