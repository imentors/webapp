import { db } from './drizzle'
import { notification, user, userPreferences } from '../db/schema'
import { sendEmail } from './email'
import { eq } from 'drizzle-orm'

type NotificationType = 'info' | 'warning' | 'error'

interface CreateNotificationOptions {
  userId: string
  type?: NotificationType
  title: string
  message: string
  icon?: string
  actionUrl?: string
}

interface SendNotificationEmailOptions {
  userId: string
  subject: string
  htmlContent: string
}

/**
 * Create an in-app notification for a user
 */
export async function createNotification(options: CreateNotificationOptions) {
  const { userId, type = 'info', title, message, icon, actionUrl } = options

  try {
    const [newNotification] = await db
      .insert(notification)
      .values({
        userId,
        type,
        title,
        message,
        icon: icon || getDefaultIcon(type),
        actionUrl,
      })
      .returning()

    return newNotification
  } catch (error) {
    console.error('[Notifications] Error creating notification:', error)
    throw error
  }
}

/**
 * Create an in-app notification for multiple users
 */
export async function createNotificationForUsers(
  userIds: string[],
  options: Omit<CreateNotificationOptions, 'userId'>
) {
  const { type = 'info', title, message, icon, actionUrl } = options

  try {
    const notifications = await db
      .insert(notification)
      .values(
        userIds.map((userId) => ({
          userId,
          type,
          title,
          message,
          icon: icon || getDefaultIcon(type),
          actionUrl,
        }))
      )
      .returning()

    return notifications
  } catch (error) {
    console.error('[Notifications] Error creating notifications for users:', error)
    throw error
  }
}

/**
 * Get user email and preferences for sending notifications
 */
export async function getUserEmailPreferences(userId: string) {
  try {
    const result = await db
      .select({
        email: user.email,
        name: user.name,
        emailNotifications: userPreferences.emailNotifications,
      })
      .from(user)
      .leftJoin(userPreferences, eq(user.id, userPreferences.userId))
      .where(eq(user.id, userId))
      .limit(1)

    if (result.length === 0) {
      return null
    }

    return {
      email: result[0].email,
      name: result[0].name,
      // Default to true if preferences not set
      emailNotifications: result[0].emailNotifications ?? true,
    }
  } catch (error) {
    console.error('[Notifications] Error fetching user email preferences:', error)
    return null
  }
}

/**
 * Send an email notification if user has email notifications enabled
 */
export async function sendNotificationEmail(options: SendNotificationEmailOptions) {
  const { userId, subject, htmlContent } = options

  try {
    const prefs = await getUserEmailPreferences(userId)

    if (!prefs) {
      console.warn(`[Notifications] User ${userId} not found, skipping email`)
      return false
    }

    if (!prefs.emailNotifications) {
      console.log(`[Notifications] User ${userId} has email notifications disabled`)
      return false
    }

    await sendEmail({
      to: prefs.email,
      subject,
      htmlContent,
    })

    return true
  } catch (error) {
    console.error('[Notifications] Error sending notification email:', error)
    return false
  }
}

/**
 * Create both in-app and email notification
 */
export async function notifyUser(
  userId: string,
  options: {
    inApp: CreateNotificationOptions
    email?: {
      subject: string
      htmlContent: string
    }
  }
) {
  const results = {
    inApp: false,
    email: false,
  }

  try {
    // Create in-app notification
    await createNotification({
      ...options.inApp,
      userId,
    })
    results.inApp = true
  } catch (error) {
    console.error('[Notifications] Failed to create in-app notification:', error)
  }

  // Send email notification if provided
  if (options.email) {
    try {
      results.email = await sendNotificationEmail({
        userId,
        subject: options.email.subject,
        htmlContent: options.email.htmlContent,
      })
    } catch (error) {
      console.error('[Notifications] Failed to send email notification:', error)
    }
  }

  return results
}

function getDefaultIcon(type: NotificationType): string {
  switch (type) {
    case 'error':
      return 'heroicons:exclamation-circle'
    case 'warning':
      return 'heroicons:exclamation-triangle'
    case 'info':
    default:
      return 'heroicons:information-circle'
  }
}
