import { eq, desc, and, sql, gte, lte } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { mentorPayout, mentorEarning, mentorBankAccount, user } from '../../db/schema'
import { requireAdminAuth } from '../../utils/auth'

interface AdminPayoutsResponse {
    payouts: any[]
    summary: {
        totalPaidOut: number
        pendingPayouts: number
        processingPayouts: number
        failedPayouts: number
        mentorsWithBankAccounts: number
        mentorsPendingSetup: number
    }
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

export default defineEventHandler(async (event): Promise<AdminPayoutsResponse> => {
    await requireAdminAuth(event)

    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 20
    const status = query.status as string
    const search = query.search as string

    // Build where conditions
    const conditions = []
    if (status && status !== 'all') {
        conditions.push(eq(mentorPayout.status, status as any))
    }

    // Get total count
    const countQuery = db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(mentorPayout)
    
    if (conditions.length > 0) {
        countQuery.where(and(...conditions))
    }
    
    const countResult = await countQuery
    const total = countResult[0]?.count ?? 0

    // Fetch payouts with mentor details
    let payoutsQuery = db
        .select({
            id: mentorPayout.id,
            amount: mentorPayout.amount,
            currency: mentorPayout.currency,
            status: mentorPayout.status,
            stripeTransferId: mentorPayout.stripeTransferId,
            periodStart: mentorPayout.periodStart,
            periodEnd: mentorPayout.periodEnd,
            processedAt: mentorPayout.processedAt,
            failureReason: mentorPayout.failureReason,
            createdAt: mentorPayout.createdAt,
            mentorId: mentorPayout.mentorId,
            mentorName: user.name,
            mentorEmail: user.email,
        })
        .from(mentorPayout)
        .leftJoin(user, eq(mentorPayout.mentorId, user.id))
        .orderBy(desc(mentorPayout.createdAt))
        .limit(limit)
        .offset((page - 1) * limit)

    if (conditions.length > 0) {
        payoutsQuery = payoutsQuery.where(and(...conditions)) as any
    }

    const payouts = await payoutsQuery

    // Get earnings count for each payout
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

    // Get summary statistics
    const summaryResult = await db
        .select({
            totalPaidOut: sql<number>`COALESCE(SUM(CASE WHEN ${mentorPayout.status} = 'completed' THEN ${mentorPayout.amount} ELSE 0 END), 0)`.mapWith(Number),
            pendingPayouts: sql<number>`COALESCE(SUM(CASE WHEN ${mentorPayout.status} = 'pending' THEN ${mentorPayout.amount} ELSE 0 END), 0)`.mapWith(Number),
            processingPayouts: sql<number>`COALESCE(SUM(CASE WHEN ${mentorPayout.status} = 'processing' THEN ${mentorPayout.amount} ELSE 0 END), 0)`.mapWith(Number),
            failedPayouts: sql<number>`COALESCE(SUM(CASE WHEN ${mentorPayout.status} = 'failed' THEN ${mentorPayout.amount} ELSE 0 END), 0)`.mapWith(Number),
        })
        .from(mentorPayout)

    // Get mentor bank account stats
    const bankAccountStats = await db
        .select({
            total: sql<number>`count(*)`.mapWith(Number),
            verified: sql<number>`SUM(CASE WHEN ${mentorBankAccount.stripeConnectOnboarded} = true THEN 1 ELSE 0 END)`.mapWith(Number),
        })
        .from(mentorBankAccount)

    return {
        payouts: payoutsWithDetails,
        summary: {
            totalPaidOut: summaryResult[0]?.totalPaidOut ?? 0,
            pendingPayouts: summaryResult[0]?.pendingPayouts ?? 0,
            processingPayouts: summaryResult[0]?.processingPayouts ?? 0,
            failedPayouts: summaryResult[0]?.failedPayouts ?? 0,
            mentorsWithBankAccounts: bankAccountStats[0]?.verified ?? 0,
            mentorsPendingSetup: (bankAccountStats[0]?.total ?? 0) - (bankAccountStats[0]?.verified ?? 0),
        },
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    }
})
