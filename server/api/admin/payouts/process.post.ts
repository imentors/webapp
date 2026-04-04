import { eq, and, sql } from 'drizzle-orm'
import { db } from '../../../utils/drizzle'
import { mentorPayout, mentorEarning, mentorBankAccount, user } from '../../../db/schema'
import { requireAdminAuth } from '../../../utils/auth'
import { notifyUser } from '../../../utils/notifications'

interface ProcessPayoutBody {
    mentorId: string
    notes?: string
}

export default defineEventHandler(async (event) => {
    await requireAdminAuth(event)

    const body = await readBody<ProcessPayoutBody>(event)

    if (!body.mentorId) {
        throw createError({ statusCode: 400, message: 'Mentor ID is required' })
    }

    // Get mentor details
    const mentor = await db.query.user.findFirst({
        where: eq(user.id, body.mentorId),
    })

    if (!mentor) {
        throw createError({ statusCode: 404, message: 'Mentor not found' })
    }

    // Get mentor's bank account
    const bankAccount = await db.query.mentorBankAccount.findFirst({
        where: eq(mentorBankAccount.mentorId, body.mentorId),
    })

    // Check if bank account is properly set up
    const isOnboarded = !!(
        bankAccount &&
        bankAccount.accountHolderName &&
        bankAccount.bankName &&
        bankAccount.accountNumberLast4 &&
        bankAccount.status === 'verified'
    )

    if (!isOnboarded) {
        throw createError({
            statusCode: 400,
            message: 'Mentor has not completed bank account setup',
        })
    }

    // Get available earnings
    const availableEarnings = await db
        .select({
            id: mentorEarning.id,
            netAmount: mentorEarning.netAmount,
        })
        .from(mentorEarning)
        .where(
            and(
                eq(mentorEarning.mentorId, body.mentorId),
                eq(mentorEarning.status, 'available'),
                sql`${mentorEarning.payoutId} IS NULL`
            )
        )

    if (availableEarnings.length === 0) {
        throw createError({
            statusCode: 400,
            message: 'No available earnings to pay out',
        })
    }

    // Calculate total amount
    const totalAmount = availableEarnings.reduce(
        (sum, e) => sum + parseFloat(e.netAmount || '0'),
        0
    )

    if (totalAmount <= 0) {
        throw createError({
            statusCode: 400,
            message: 'No funds available for payout',
        })
    }

    // Create payout record
    const periodEnd = new Date()
    const periodStart = new Date()
    periodStart.setDate(periodStart.getDate() - 7)

    const [payoutRecord] = await db
        .insert(mentorPayout)
        .values({
            mentorId: body.mentorId,
            amount: totalAmount.toFixed(2),
            currency: 'usd',
            status: 'completed', // Mark as completed immediately for manual payouts
            bankAccountId: bankAccount!.id,
            periodStart,
            periodEnd,
            processedAt: new Date(),
            notes: body.notes || 'Manual payout by admin',
        })
        .returning()

    // Update earnings to mark as paid
    const earningIds = availableEarnings.map((e) => e.id)
    for (const earningId of earningIds) {
        await db
            .update(mentorEarning)
            .set({
                status: 'paid',
                payoutId: payoutRecord.id,
                updatedAt: new Date(),
            })
            .where(eq(mentorEarning.id, earningId))
    }

    // Notify mentor
    await notifyUser(body.mentorId, {
        inApp: {
            userId: body.mentorId,
            type: 'info',
            title: 'Payout Processed',
            message: `Your payout of $${totalAmount.toFixed(2)} has been processed. The funds will be transferred to your bank account.`,
            actionUrl: '/earnings',
        },
    })

    return {
        success: true,
        payout: {
            id: payoutRecord.id,
            amount: totalAmount,
            earningsCount: availableEarnings.length,
            bankDetails: {
                bankName: bankAccount!.bankName,
                last4: bankAccount!.accountNumberLast4,
                accountHolderName: bankAccount!.accountHolderName,
            },
        },
        message: `Successfully marked payout of $${totalAmount.toFixed(2)} as processed for ${mentor.name}. Please transfer the funds manually.`,
    }
})
