import { eq, and, sql } from 'drizzle-orm'
import { conversation, conversationParticipant, user } from '~~/server/db/schema'
import { z } from 'zod'

const createConversationSchema = z.object({
    recipientId: z.string(),
})

export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event)
    const userId = session.user.id
    const body = await readValidatedBody(event, createConversationSchema.parse)

    if (userId === body.recipientId) {
        throw createError({
            statusCode: 400,
            message: 'Cannot create conversation with yourself',
        })
    }

    // Check if recipient exists
    const [recipient] = await db
        .select()
        .from(user)
        .where(eq(user.id, body.recipientId))
        .limit(1)

    if (!recipient) {
        throw createError({
            statusCode: 404,
            message: 'Recipient not found',
        })
    }

    // Check if conversation already exists
    // We need to find a conversation where both users are participants
    const existingConversation = await db.execute(sql`
    SELECT c.id
    FROM ${conversation} c
    JOIN ${conversationParticipant} cp1 ON c.id = cp1.conversation_id
    JOIN ${conversationParticipant} cp2 ON c.id = cp2.conversation_id
    WHERE cp1.user_id = ${userId} AND cp2.user_id = ${body.recipientId}
    LIMIT 1
  `)

    if (existingConversation.length > 0) {
        // Return existing conversation ID
        // We should probably redirect or just return the ID so the frontend can navigate
        return { id: existingConversation[0].id, isNew: false }
    }

    // Create new conversation
    const [newConversation] = await db
        .insert(conversation)
        .values({})
        .returning()

    // Add participants
    await db.insert(conversationParticipant).values([
        {
            conversationId: newConversation.id,
            userId: userId,
            lastReadAt: new Date(),
        },
        {
            conversationId: newConversation.id,
            userId: body.recipientId,
            lastReadAt: new Date(0), // Never read
        },
    ])

    return { id: newConversation.id, isNew: true }
})
