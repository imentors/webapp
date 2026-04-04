import { eq, desc, and, sql } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { notification } from '../../db/schema'
import { requireUserSession } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = session.user.id

  const query = getQuery(event)
  const limit = query.limit ? Math.max(1, Math.min(100, Number(query.limit))) : 20

  const rows = await db
    .select({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      icon: notification.icon,
      actionUrl: notification.actionUrl,
      timestamp: notification.createdAt,
      readAt: notification.readAt,
    })
    .from(notification)
    .where(eq(notification.userId, userId))
    .orderBy(desc(notification.createdAt))
    .limit(limit)

  const [unread] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notification)
    .where(and(
      eq(notification.userId, userId),
      sql`${notification.readAt} IS NULL`
    ))

  return {
    notifications: rows.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      icon: n.icon ?? null,
      actionUrl: n.actionUrl ?? null,
      timestamp: n.timestamp,
    })),
    unreadCount: unread?.count ?? 0,
  }
})
