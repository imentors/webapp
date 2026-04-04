import { eq, and, sql, desc } from 'drizzle-orm'
import { db } from '../../../utils/drizzle'
import { mentorEarning, mentorBankAccount, user, mentorProfile } from '../../../db/schema'
import { requireAdminAuth } from '../../../utils/auth'

interface PendingPayoutMentor {
    mentorId: string
    mentorName: string
    mentorEmail: string
    availableBalance: number
    pendingBalance: number
    earningsCount: number
    hasBankAccount: boolean
    isOnboarded: boolean
    bankName?: string
    last4?: string
    accountHolderName?: string
}

export default defineEventHandler(async (event): Promise<{ mentors: PendingPayoutMentor[] }> => {
    await requireAdminAuth(event)

    // Get all mentors with their earnings and bank account status
    const mentors = await db
        .select({
            id: user.id,
            name: user.name,
            email: user.email,
        })
        .from(user)
        .where(eq(user.role, 'mentor'))
        .orderBy(user.name)

    const result: PendingPayoutMentor[] = []

    for (const mentor of mentors) {
        // Get earnings summary
        const earningsSummary = await db
            .select({
                availableBalance: sql<number>`COALESCE(SUM(CASE WHEN ${mentorEarning.status} = 'available' THEN ${mentorEarning.netAmount} ELSE 0 END), 0)`.mapWith(Number),
                pendingBalance: sql<number>`COALESCE(SUM(CASE WHEN ${mentorEarning.status} = 'pending' THEN ${mentorEarning.netAmount} ELSE 0 END), 0)`.mapWith(Number),
                availableCount: sql<number>`COUNT(CASE WHEN ${mentorEarning.status} = 'available' THEN 1 END)`.mapWith(Number),
            })
            .from(mentorEarning)
            .where(eq(mentorEarning.mentorId, mentor.id))

        const bankAccount = await db.query.mentorBankAccount.findFirst({
            where: eq(mentorBankAccount.mentorId, mentor.id),
        })

        const availableBalance = earningsSummary[0]?.availableBalance ?? 0
        const pendingBalance = earningsSummary[0]?.pendingBalance ?? 0

        // Check if bank account is properly set up (has all required fields)
        const isOnboarded = !!(
            bankAccount &&
            bankAccount.accountHolderName &&
            bankAccount.bankName &&
            bankAccount.accountNumberLast4 &&
            bankAccount.status === 'verified'
        )

        // Only include mentors with any earnings or bank accounts set up
        if (availableBalance > 0 || pendingBalance > 0 || bankAccount) {
            result.push({
                mentorId: mentor.id,
                mentorName: mentor.name,
                mentorEmail: mentor.email,
                availableBalance,
                pendingBalance,
                earningsCount: earningsSummary[0]?.availableCount ?? 0,
                hasBankAccount: !!bankAccount,
                isOnboarded,
                bankName: bankAccount?.bankName ?? undefined,
                last4: bankAccount?.accountNumberLast4 ?? undefined,
                accountHolderName: bankAccount?.accountHolderName ?? undefined,
            })
        }
    }

    // Sort by available balance descending
    result.sort((a, b) => b.availableBalance - a.availableBalance)

    return { mentors: result }
})
