import { eq } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { mentorBankAccount, user } from '../../db/schema'
import { requireAuth } from '../../utils/auth'

interface BankAccountInput {
    accountHolderName: string
    bankName: string
    accountNumber: string
}

export default defineEventHandler(async (event) => {
    const session = await requireAuth(event)
    const userId = session.user.id

    // Verify user is a mentor
    const userRecord = await db.query.user.findFirst({
        where: eq(user.id, userId),
    })

    if (!userRecord || userRecord.role !== 'mentor') {
        throw createError({
            statusCode: 403,
            message: 'Only mentors can set up bank accounts',
        })
    }

    const body = await readBody<BankAccountInput>(event)

    // Validate required fields
    if (!body.accountHolderName?.trim()) {
        throw createError({
            statusCode: 400,
            message: 'Account holder name is required',
        })
    }

    if (!body.bankName?.trim()) {
        throw createError({
            statusCode: 400,
            message: 'Bank name is required',
        })
    }

    if (!body.accountNumber?.trim()) {
        throw createError({
            statusCode: 400,
            message: 'Account number is required',
        })
    }

    // Validate account number (typically 4-17 digits)
    if (!/^\d{4,17}$/.test(body.accountNumber.trim())) {
        throw createError({
            statusCode: 400,
            message: 'Invalid account number. Must be 4-17 digits.',
        })
    }

    // Get last 4 digits for display
    const accountNumberLast4 = body.accountNumber.trim().slice(-4)

    // Check if bank account already exists
    const existingAccount = await db.query.mentorBankAccount.findFirst({
        where: eq(mentorBankAccount.mentorId, userId),
    })

    // Create or update bank account record
    if (existingAccount) {
        await db
            .update(mentorBankAccount)
            .set({
                accountHolderName: body.accountHolderName.trim(),
                bankName: body.bankName.trim(),
                accountNumberLast4,
                currency: 'usd',
                country: 'US',
                status: 'verified',
                updatedAt: new Date(),
            })
            .where(eq(mentorBankAccount.id, existingAccount.id))
    } else {
        await db.insert(mentorBankAccount).values({
            mentorId: userId,
            accountHolderName: body.accountHolderName.trim(),
            bankName: body.bankName.trim(),
            accountNumberLast4,
            currency: 'usd',
            country: 'US',
            status: 'verified',
        })
    }

    return {
        success: true,
        message: 'Bank account saved successfully. You will receive payouts to this account.',
    }
})
