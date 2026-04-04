import { eq, and, gte, lte, sql, desc } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { mentorEarning, mentorPayout, mentorBankAccount, booking, user } from '../../db/schema'
import { requireAuth } from '../../utils/auth'

interface EarningsSummary {
    totalEarnings: number
    availableBalance: number
    pendingBalance: number
    paidOutTotal: number
    thisMonthEarnings: number
    lastMonthEarnings: number
}

interface EarningsResponse {
    summary: EarningsSummary
    recentEarnings: any[]
    recentPayouts: any[]
    bankAccount: any | null
}

export default defineEventHandler(async (event): Promise<EarningsResponse> => {
    const session = await requireAuth(event)
    const userId = session.user.id

    // Get query parameters
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10

    // Get current month boundaries
    const now = new Date()
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Fetch earnings summary
    const earningsSummaryResult = await db
        .select({
            totalEarnings: sql<number>`COALESCE(SUM(${mentorEarning.netAmount}), 0)`.mapWith(Number),
            availableBalance: sql<number>`COALESCE(SUM(CASE WHEN ${mentorEarning.status} = 'available' THEN ${mentorEarning.netAmount} ELSE 0 END), 0)`.mapWith(Number),
            pendingBalance: sql<number>`COALESCE(SUM(CASE WHEN ${mentorEarning.status} = 'pending' THEN ${mentorEarning.netAmount} ELSE 0 END), 0)`.mapWith(Number),
            paidOutTotal: sql<number>`COALESCE(SUM(CASE WHEN ${mentorEarning.status} = 'paid' THEN ${mentorEarning.netAmount} ELSE 0 END), 0)`.mapWith(Number),
        })
        .from(mentorEarning)
        .where(eq(mentorEarning.mentorId, userId))

    // This month earnings
    const thisMonthResult = await db
        .select({
            amount: sql<number>`COALESCE(SUM(${mentorEarning.netAmount}), 0)`.mapWith(Number),
        })
        .from(mentorEarning)
        .where(
            and(
                eq(mentorEarning.mentorId, userId),
                gte(mentorEarning.createdAt, startOfThisMonth)
            )
        )

    // Last month earnings
    const lastMonthResult = await db
        .select({
            amount: sql<number>`COALESCE(SUM(${mentorEarning.netAmount}), 0)`.mapWith(Number),
        })
        .from(mentorEarning)
        .where(
            and(
                eq(mentorEarning.mentorId, userId),
                gte(mentorEarning.createdAt, startOfLastMonth),
                lte(mentorEarning.createdAt, endOfLastMonth)
            )
        )

    // Fetch recent earnings with booking details
    const recentEarnings = await db
        .select({
            id: mentorEarning.id,
            grossAmount: mentorEarning.grossAmount,
            platformFee: mentorEarning.platformFee,
            netAmount: mentorEarning.netAmount,
            status: mentorEarning.status,
            availableAt: mentorEarning.availableAt,
            createdAt: mentorEarning.createdAt,
            bookingTitle: booking.title,
            bookingDate: booking.scheduledDate,
            bookingDuration: booking.duration,
            menteeName: user.name,
        })
        .from(mentorEarning)
        .leftJoin(booking, eq(mentorEarning.bookingId, booking.id))
        .leftJoin(user, eq(booking.menteeId, user.id))
        .where(eq(mentorEarning.mentorId, userId))
        .orderBy(desc(mentorEarning.createdAt))
        .limit(limit)
        .offset((page - 1) * limit)

    // Fetch recent payouts
    const recentPayouts = await db
        .select({
            id: mentorPayout.id,
            amount: mentorPayout.amount,
            currency: mentorPayout.currency,
            status: mentorPayout.status,
            periodStart: mentorPayout.periodStart,
            periodEnd: mentorPayout.periodEnd,
            processedAt: mentorPayout.processedAt,
            failureReason: mentorPayout.failureReason,
            createdAt: mentorPayout.createdAt,
        })
        .from(mentorPayout)
        .where(eq(mentorPayout.mentorId, userId))
        .orderBy(desc(mentorPayout.createdAt))
        .limit(5)

    // Fetch bank account details
    const bankAccountResult = await db.query.mentorBankAccount.findFirst({
        where: eq(mentorBankAccount.mentorId, userId),
    })

    const summary: EarningsSummary = {
        totalEarnings: earningsSummaryResult[0]?.totalEarnings ?? 0,
        availableBalance: earningsSummaryResult[0]?.availableBalance ?? 0,
        pendingBalance: earningsSummaryResult[0]?.pendingBalance ?? 0,
        paidOutTotal: earningsSummaryResult[0]?.paidOutTotal ?? 0,
        thisMonthEarnings: thisMonthResult[0]?.amount ?? 0,
        lastMonthEarnings: lastMonthResult[0]?.amount ?? 0,
    }

    return {
        summary,
        recentEarnings,
        recentPayouts,
        bankAccount: bankAccountResult || null,
    }
})
