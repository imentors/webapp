import { eq, and, inArray, sql } from 'drizzle-orm'
import { db } from '../../utils/drizzle'
import { notification } from '../../db/schema'
import { requireUserSession } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = session.user.id

  const body = await readBody<{ all?: boolean; ids?: string[] }>(event)
  const now = new Date()

  if (body?.all) {
    await db
      .update(notification)
      .set({ readAt: now, updatedAt: now })
      .where(and(eq(notification.userId, userId), sql`${notification.readAt} IS NULL`))
    return { success: true }
  }

  if (body?.ids && body.ids.length > 0) {
    await db
      .update(notification)
      .set({ readAt: now, updatedAt: now })
      .where(and(eq(notification.userId, userId), inArray(notification.id, body.ids)))
    return { success: true }
  }

  throw createError({ statusCode: 400, message: 'Invalid request' })
})
