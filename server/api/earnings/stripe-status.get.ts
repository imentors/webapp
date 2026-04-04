import { eq } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { mentorBankAccount } from '../../db/schema'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
    const session = await requireAuth(event)
    const userId = session.user.id

    const bankAccount = await db.query.mentorBankAccount.findFirst({
        where: eq(mentorBankAccount.mentorId, userId),
    })

    if (!bankAccount) {
        return {
            hasAccount: false,
            isOnboarded: false,
            canReceivePayouts: false,
            status: 'not_created',
        }
    }

    // Check if bank account has required info
    const isComplete = !!(
        bankAccount.accountHolderName &&
        bankAccount.bankName &&
        bankAccount.accountNumberLast4
    )

    return {
        hasAccount: true,
        isOnboarded: isComplete && bankAccount.status === 'verified',
        canReceivePayouts: isComplete && bankAccount.status === 'verified',
        status: bankAccount.status,
        bankName: bankAccount.bankName,
        last4: bankAccount.accountNumberLast4,
        accountHolderName: bankAccount.accountHolderName,
    }
})
