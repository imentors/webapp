import { eq, desc, and } from 'drizzle-orm'
import { message, conversationParticipant } from '~~/server/db/schema'

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

    // Verify user is a participant
    const [participant] = await db
        .select()
        .from(conversationParticipant)
        .where(
            and(
                eq(conversationParticipant.conversationId, conversationId),
                eq(conversationParticipant.userId, userId)
            )
        )
        .limit(1)

    if (!participant) {
        throw createError({
            statusCode: 403,
            message: 'You are not a participant in this conversation',
        })
    }

    // Fetch messages
    const messages = await db
        .select()
        .from(message)
        .where(eq(message.conversationId, conversationId))
        .orderBy(desc(message.createdAt)) // Newest first
    // .limit(50) // Pagination can be added later

    // We return them sorted by time ascending for the UI usually, but fetching desc is better for pagination
    // Let's reverse them for the response so the UI gets them in chronological order
    return messages.reverse()
})
