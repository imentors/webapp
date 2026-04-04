<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Admin Sidebar -->
    <div class="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
        <img src="/logo.svg" alt="iMentorsPro Admin" class="h-14 w-auto object-contain" />
      </NuxtLink>

      <!-- Navigation -->
      <nav class="mt-8 px-4">
        <div class="space-y-2">
          <NuxtLink
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            :class="[
              'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
              $route.path === item.href
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            ]"
          >
            <Icon :name="item.icon" class="mr-3 h-5 w-5" />
            {{ item.name }}
          </NuxtLink>
        </div>
      </nav>

      <!-- Admin User Info -->
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <UAvatar
            :src="user?.avatar"
            :alt="user?.firstName"
            size="sm"
          />
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ user?.firstName }} {{ user?.lastName }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="pl-64">
      <!-- Top Header -->
      <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div class="px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ pageTitle }}
              </h1>
              <p v-if="pageDescription" class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {{ pageDescription }}
              </p>
            </div>
            
            <div class="flex items-center space-x-4">
              <!-- Notifications -->
              <UButton
                variant="ghost"
                icon="heroicons:bell"
                :badge="unreadCount"
                @click="notificationsOpen = true"
              />
              
              <!-- User Menu -->
              <UDropdownMenu :items="userMenuItems">
                <UButton
                  variant="ghost"
                  icon="heroicons:user-circle"
                  trailing-icon="heroicons:chevron-down"
                >
                  {{ user?.firstName }}
                </UButton>
              </UDropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="p-6">
        <slot />
      </main>
    </div>

    <!-- Notifications Modal -->
    <UModal v-model:open="notificationsOpen" title="Notifications">
      <template #body>
        <div v-if="notifications.length === 0" class="text-center py-12">
          <Icon name="heroicons:bell-slash" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500 dark:text-gray-400 font-medium">No notifications</p>
          <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">You're all caught up!</p>
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer"
            @click="onClickNotification(notification)"
          >
            <Icon
              :name="notification.icon || 'heroicons:information-circle'"
              :class="[
                'w-5 h-5 mt-0.5',
                notification.type === 'warning' ? 'text-yellow-500' : 
                notification.type === 'error' ? 'text-red-500' : 'text-teal-500'
              ]"
            />
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ notification.title }}
              </p>
              <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {{ notification.message }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-500 mt-2">
                {{ formatTime(notification.timestamp) }}
              </p>
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from '#app'
import { useNotifications } from '~/composables/useNotifications'
const { user, logout } = useAuth()

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: 'heroicons:home' },
  { name: 'Users', href: '/admin/users', icon: 'heroicons:users' },
  { name: 'Mentors', href: '/admin/mentors', icon: 'heroicons:academic-cap' },
  { name: 'Sessions', href: '/admin/sessions', icon: 'heroicons:calendar-days' },
  { name: 'Payments', href: '/admin/payments', icon: 'heroicons:credit-card' },
  { name: 'Payouts', href: '/admin/payouts', icon: 'heroicons:banknotes' },
  { name: 'Analytics', href: '/admin/analytics', icon: 'heroicons:chart-bar' },
  { name: 'Content', href: '/admin/content', icon: 'heroicons:document-text' },
]

const notificationsOpen = useState<boolean>('notifications-open', () => false)
const { notifications, unreadCount, fetchNotifications, markAllAsRead } = useNotifications()

onMounted(() => {
  fetchNotifications(20)
})

watch(() => notificationsOpen.value, (open) => {
  if (open) markAllAsRead()
})

const onClickNotification = (n: any) => {
  if (n?.actionUrl) navigateTo(n.actionUrl)
  notificationsOpen.value = false
}

const userMenuItems = [
  [{
    label: 'Sign out',
    icon: 'heroicons:arrow-right-on-rectangle',
    onSelect: () => logout()
  }]
]

const pageTitle = computed(() => {
  const route = useRoute()
  const path = route.path
  
  if (path === '/admin') return 'Dashboard'
  if (path.startsWith('/admin/users')) return 'User Management'
  if (path.startsWith('/admin/mentors')) return 'Mentor Management'
  if (path.startsWith('/admin/sessions')) return 'Session Management'
  if (path.startsWith('/admin/payments')) return 'Payment Management'
  if (path.startsWith('/admin/payouts')) return 'Mentor Payouts'
  if (path.startsWith('/admin/analytics')) return 'Analytics'
  if (path.startsWith('/admin/content')) return 'Content Management'
  if (path.startsWith('/admin/settings')) return 'Settings'
  
  return 'Admin Panel'
})

const pageDescription = computed(() => {
  const route = useRoute()
  const path = route.path
  
  if (path === '/admin') return 'Overview of platform metrics and recent activity'
  if (path.startsWith('/admin/users')) return 'Manage mentees and user accounts'
  if (path.startsWith('/admin/mentors')) return 'Manage mentor profiles and applications'
  if (path.startsWith('/admin/sessions')) return 'Monitor and manage mentoring sessions'
  if (path.startsWith('/admin/payments')) return 'Track payments and revenue'
  if (path.startsWith('/admin/payouts')) return 'Process mentor payouts manually'
  if (path.startsWith('/admin/analytics')) return 'Platform analytics and insights'
  if (path.startsWith('/admin/content')) return 'Manage categories, skills, and content'
  if (path.startsWith('/admin/settings')) return 'Platform configuration and settings'
  
  return ''
})

const formatTime = (timestamp: Date) => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}
</script>
