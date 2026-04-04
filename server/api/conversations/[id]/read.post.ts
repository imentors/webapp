import { eq, and } from 'drizzle-orm'
import { conversationParticipant } from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event)
    const userId = session.user.id
    const conversationId = getRouterParam(event, 'id')

    if (!conversationId) {
        throw createError({
            statusCode: 400,
            message: 'Conversation ID is required',
        })
    }

    // Update lastReadAt
    await db
        .update(conversationParticipant)
        .set({ lastReadAt: new Date() })
        .where(
            and(
                eq(conversationParticipant.conversationId, conversationId),
                eq(conversationParticipant.userId, userId)
            )
        )

    return { success: true }
})
