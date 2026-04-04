export type NotificationType = 'info' | 'warning' | 'error'

export interface NotificationItem {
  id: string
  type: NotificationType
  icon: string
  title: string
  message: string
  timestamp: Date
  actionUrl?: string | null
}

export const useNotifications = () => {
  const notifications = useState<NotificationItem[]>('notifications-items', () => [])
  const unreadCount = useState<number>('notifications-unread-count', () => 0)
  const isLoading = useState<boolean>('notifications-loading', () => false)
  const error = useState<string | null>('notifications-error', () => null)

  const fetchNotifications = async (limit?: number) => {
    isLoading.value = true
    error.value = null
    try {
      const res = await $fetch<{
        notifications: Array<Omit<NotificationItem, 'timestamp'> & { timestamp: string }>
        unreadCount?: number
      }>('/api/notifications', {
        params: limit ? { limit } : undefined,
      })

      notifications.value = (res.notifications || []).map((n) => ({
        ...n,
        timestamp: new Date(n.timestamp),
      }))
      unreadCount.value = res.unreadCount ?? notifications.value.length
    } catch (e: any) {
      error.value = e?.data?.message || e?.message || 'Failed to fetch notifications'
    } finally {
      isLoading.value = false
    }
  }

  const markAllAsRead = async () => {
    try {
      await $fetch('/api/notifications/read', {
        method: 'POST',
        body: { all: true },
      })
      unreadCount.value = 0
    } catch (e: any) {
      // ignore for now; keep UX non-blocking
    }
  }

  return { notifications, unreadCount, isLoading, error, fetchNotifications, markAllAsRead }
}
