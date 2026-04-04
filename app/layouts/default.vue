<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <AppHeader v-if="!isAuthPage" />
    <main :class="{ 'pt-16': !isAuthPage }">
      <slot />
    </main>
    <AppFooter v-if="!isAuthPage" />

    <!-- Notifications Modal (global) -->
    <UModal v-model:open="notificationsOpen" title="Notifications">
      <template #body>
        <div v-if="notifications.length === 0" class="text-center py-12">
          <Icon name="heroicons:bell-slash" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500 dark:text-gray-400 font-medium">No notifications</p>
          <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">You're all caught up!</p>
        </div>
        <div v-else class="space-y-4 max-h-96 overflow-y-auto">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            @click="onClickNotification(notification)"
          >
            <Icon
              :name="notification.icon || 'heroicons:information-circle'"
              :class="[
                'w-5 h-5 mt-0.5 flex-shrink-0',
                notification.type === 'warning' ? 'text-yellow-500' : 
                notification.type === 'error' ? 'text-red-500' : 'text-teal-500'
              ]"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ notification.title }}
              </p>
              <p class="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {{ notification.message }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-500 mt-2">
                {{ formatTimeAgo(notification.timestamp) }}
              </p>
            </div>
            <span 
              v-if="!notification.read" 
              class="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-2"
            ></span>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useNotifications } from '~/composables/useNotifications'

const route = useRoute()

const isAuthPage = computed(() => {
  return route.path.startsWith('/auth') || route.path === '/'
})

// Shared notifications state
const notificationsOpen = useState<boolean>('notifications-open', () => false)
const { notifications, fetchNotifications, markAllAsRead } = useNotifications()

// Fetch notifications on mount
onMounted(() => {
  if (!isAuthPage.value) {
    fetchNotifications(20)
  }
})

// Mark as read when modal opens
watch(() => notificationsOpen.value, (open) => {
  if (open) markAllAsRead()
})

const onClickNotification = (notification: any) => {
  if (notification?.actionUrl) {
    navigateTo(notification.actionUrl)
  }
  notificationsOpen.value = false
}

const formatTimeAgo = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else {
    return 'Just now'
  }
}

// Initialize auth on mount
onMounted(() => {
  if (process.client) {
    const { init } = useAuth()
    init()
  }
})
</script>
