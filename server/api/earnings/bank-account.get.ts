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

    return {
        bankAccount: bankAccount || null,
    }
})
