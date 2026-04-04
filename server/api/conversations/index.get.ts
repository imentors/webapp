import { eq, desc, and, ne, sql } from 'drizzle-orm'
import { conversation, conversationParticipant, message, user } from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = session.user.id


  const userConversations = await db
    .select({
      id: conversation.id,
      updatedAt: conversation.updatedAt,
      lastReadAt: conversationParticipant.lastReadAt,
    })
    .from(conversation)
    .innerJoin(
      conversationParticipant,
      and(
        eq(conversation.id, conversationParticipant.conversationId),
        eq(conversationParticipant.userId, userId)
      )
    )
    .orderBy(desc(conversation.updatedAt))

  const result = await Promise.all(
    userConversations.map(async (conv) => {
      // Get other participant
      const [otherParticipant] = await db
        .select({
          id: user.id,
          name: user.name,
          image: user.image,
          role: user.role,
        })
        .from(conversationParticipant)
        .innerJoin(user, eq(conversationParticipant.userId, user.id))
        .where(
          and(
            eq(conversationParticipant.conversationId, conv.id),
            ne(conversationParticipant.userId, userId)
          )
        )
        .limit(1)

      // Get last message
      const [lastMessage] = await db
        .select({
          id: message.id,
          content: message.content,
          timestamp: message.createdAt,
          senderId: message.senderId,
        })
        .from(message)
        .where(eq(message.conversationId, conv.id))
        .orderBy(desc(message.createdAt))
        .limit(1)

      // Get unread count
      const [unreadCountResult] = await db
        .select({
          count: sql<number>`count(*)::int`,
        })
        .from(message)
        .where(
          and(
            eq(message.conversationId, conv.id),
            ne(message.senderId, userId),
            conv.lastReadAt ? sql`${message.createdAt} > ${conv.lastReadAt.toISOString()}` : sql`true`
          )
        )

      return {
        id: conv.id,
        updatedAt: conv.updatedAt,
        otherParticipant: otherParticipant || {
          id: 'deleted',
          name: 'Deleted User',
          image: null,
          role: 'mentee',
        },
        lastMessage: lastMessage || null,
        unreadCount: unreadCountResult?.count || 0,
      }
    })
  )

  return result
})
